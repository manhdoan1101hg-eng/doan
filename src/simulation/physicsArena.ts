import * as THREE from 'three';
import {
  createArenaFloorTexture,
  createCautionStripesTexture,
} from './proceduralTextures';
import {
  JetBotKinematics,
  JetBotConfig,
  LidarData,
  LidarScanPoint,
  VisionDetection,
} from '../types/jetbot';

export interface ArenaObstacle {
  id: string;
  type: 'box' | 'cylinder' | 'cone';
  x: number;
  z: number;
  radius: number;
  width?: number;
  depth?: number;
  mesh: THREE.Object3D;
  label: string;
}

export class PhysicsArena {
  public scene: THREE.Scene;
  public arenaSize = 9.0; // 9m x 9m arena
  public obstacles: ArenaObstacle[] = [];
  public lidarPointCloudMesh: THREE.Points;
  public lidarPointsGeo: THREE.BufferGeometry;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.buildArenaEnvironment();
    this.buildObstacles();

    // Setup visual LiDAR point cloud in 3D
    const numPoints = 180;
    const positions = new Float32Array(numPoints * 3);
    const colors = new Float32Array(numPoints * 3);

    for (let i = 0; i < numPoints; i++) {
      positions[i * 3 + 1] = 0.18; // lidar height
      colors[i * 3] = 1.0; // Red / Cyan laser points
      colors[i * 3 + 1] = 0.2;
      colors[i * 3 + 2] = 0.2;
    }

    this.lidarPointsGeo = new THREE.BufferGeometry();
    this.lidarPointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.lidarPointsGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    this.lidarPointCloudMesh = new THREE.Points(this.lidarPointsGeo, pMat);
    this.scene.add(this.lidarPointCloudMesh);
  }

  private buildArenaEnvironment() {
    const floorTexture = createArenaFloorTexture();
    const floorGeo = new THREE.PlaneGeometry(this.arenaSize, this.arenaSize);
    floorGeo.rotateX(-Math.PI / 2);

    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.45,
      metalness: 0.3,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Perimeter Caution Barriers
    const wallHeight = 0.25;
    const wallThick = 0.12;
    const cautionTex = createCautionStripesTexture();

    const matBarrier = new THREE.MeshStandardMaterial({
      map: cautionTex,
      roughness: 0.4,
      metalness: 0.2,
    });

    const createWall = (w: number, d: number, x: number, z: number) => {
      const geo = new THREE.BoxGeometry(w, wallHeight, d);
      const mesh = new THREE.Mesh(geo, matBarrier);
      mesh.position.set(x, wallHeight * 0.5, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);
    };

    const half = this.arenaSize * 0.5;
    createWall(this.arenaSize, wallThick, 0, -half); // North
    createWall(this.arenaSize, wallThick, 0, half);  // South
    createWall(wallThick, this.arenaSize, -half, 0); // West
    createWall(wallThick, this.arenaSize, half, 0);  // East
  }

  private buildObstacles() {
    // 1. Traffic Cones
    const conePositions = [
      { x: -1.8, z: 1.5 },
      { x: 1.8, z: -1.2 },
      { x: -1.5, z: -1.8 },
      { x: 1.2, z: 2.0 },
    ];

    const coneGeo = new THREE.ConeGeometry(0.12, 0.32, 16);
    const coneBaseGeo = new THREE.BoxGeometry(0.24, 0.02, 0.24);

    const matConeOrange = new THREE.MeshStandardMaterial({
      color: 0xff5e00,
      roughness: 0.3,
    });
    const matConeWhiteStripe = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
    });

    conePositions.forEach((pos, idx) => {
      const coneGroup = new THREE.Group();
      coneGroup.position.set(pos.x, 0, pos.z);

      const base = new THREE.Mesh(coneBaseGeo, matConeOrange);
      base.position.y = 0.01;
      base.castShadow = true;
      coneGroup.add(base);

      const cone = new THREE.Mesh(coneGeo, matConeOrange);
      cone.position.y = 0.16;
      cone.castShadow = true;
      coneGroup.add(cone);

      // White reflective tape ring
      const stripeGeo = new THREE.CylinderGeometry(0.075, 0.09, 0.06, 16);
      const stripe = new THREE.Mesh(stripeGeo, matConeWhiteStripe);
      stripe.position.y = 0.16;
      coneGroup.add(stripe);

      this.scene.add(coneGroup);

      this.obstacles.push({
        id: `cone-${idx}`,
        type: 'cone',
        x: pos.x,
        z: pos.z,
        radius: 0.14,
        mesh: coneGroup,
        label: 'Traffic Cone',
      });
    });

    // 2. Wooden Storage Crates / Obstacle Blocks
    const cratePositions = [
      { x: -2.4, z: -0.6, w: 0.5, d: 0.5, h: 0.4 },
      { x: 2.2, z: 0.5, w: 0.6, d: 0.4, h: 0.35 },
      { x: 0.0, z: -2.8, w: 0.8, d: 0.4, h: 0.3 },
    ];

    const matWoodCrate = new THREE.MeshStandardMaterial({
      color: 0xcd853f,
      roughness: 0.7,
      metalness: 0.05,
    });

    cratePositions.forEach((c, idx) => {
      const geo = new THREE.BoxGeometry(c.w, c.h, c.d);
      const crateMesh = new THREE.Mesh(geo, matWoodCrate);
      crateMesh.position.set(c.x, c.h * 0.5, c.z);
      crateMesh.castShadow = true;
      crateMesh.receiveShadow = true;
      this.scene.add(crateMesh);

      this.obstacles.push({
        id: `crate-${idx}`,
        type: 'box',
        x: c.x,
        z: c.z,
        radius: Math.hypot(c.w, c.d) * 0.5,
        width: c.w,
        depth: c.d,
        mesh: crateMesh,
        label: 'Obstacle Box',
      });
    });

    // 3. Testing Pillar / Cylinder
    const pillarGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.6, 24);
    const matPillar = new THREE.MeshStandardMaterial({
      color: 0x4b6584,
      metalness: 0.7,
      roughness: 0.3,
    });

    const pillarPositions = [
      { x: 0.0, z: 2.6 },
      { x: -2.5, z: 2.2 },
    ];

    pillarPositions.forEach((p, idx) => {
      const pillar = new THREE.Mesh(pillarGeo, matPillar);
      pillar.position.set(p.x, 0.3, p.z);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      this.scene.add(pillar);

      this.obstacles.push({
        id: `pillar-${idx}`,
        type: 'cylinder',
        x: p.x,
        z: p.z,
        radius: 0.22,
        mesh: pillar,
        label: 'Lab Pillar',
      });
    });
  }

  /**
   * Update JetBot Differential Kinematics & Collisions
   */
  public updateKinematics(
    kinematics: JetBotKinematics,
    config: JetBotConfig,
    dt: number,
    onCollision?: (impactSpeed: number) => void
  ): JetBotKinematics {
    const leftSpeed = kinematics.leftMotorSpeed;
    const rightSpeed = kinematics.rightMotorSpeed;

    // Linear and angular velocity in robot coordinates
    // Based on jetbot_bringup.launch parameters:
    // linear_speed_scale = 0.5, angular_speed_scale = 1.0
    const forwardRatio = (leftSpeed + rightSpeed) * 0.5;
    const turnRatio = (rightSpeed - leftSpeed); // positive = turn left

    const targetLinVel = forwardRatio * config.maxLinearSpeed * config.linearSpeedScale;
    const targetAngVel = (turnRatio / config.wheelBase) * config.maxAngularSpeed * config.angularSpeedScale;

    // Smooth inertia
    kinematics.linearVelocity = THREE.MathUtils.damp(kinematics.linearVelocity, targetLinVel, 10, dt);
    kinematics.angularVelocity = THREE.MathUtils.damp(kinematics.angularVelocity, targetAngVel, 12, dt);

    // Update yaw
    kinematics.yaw += kinematics.angularVelocity * dt;

    // Update position: In Three.js, robot faces +Z when yaw=0
    const dx = Math.sin(kinematics.yaw) * kinematics.linearVelocity * dt;
    const dz = Math.cos(kinematics.yaw) * kinematics.linearVelocity * dt;

    let nextX = kinematics.x + dx;
    let nextZ = kinematics.z + dz;

    // Wheel rotation angles (rolling along ground)
    const dLeftRot = (leftSpeed * config.maxLinearSpeed * dt) / config.wheelRadius;
    const dRightRot = (rightSpeed * config.maxLinearSpeed * dt) / config.wheelRadius;
    kinematics.leftWheelAngle += dLeftRot;
    kinematics.rightWheelAngle += dRightRot;

    // Caster angle follows movement
    if (Math.abs(kinematics.linearVelocity) > 0.01) {
      kinematics.casterAngle = -kinematics.yaw;
    }

    // Collision Detection (JetBot radius ~0.11m)
    const botRadius = 0.11;
    const boundaryLimit = this.arenaSize * 0.5 - 0.12 - botRadius;

    // Boundary walls collision
    let collided = false;
    if (nextX > boundaryLimit) {
      nextX = boundaryLimit;
      collided = true;
    } else if (nextX < -boundaryLimit) {
      nextX = -boundaryLimit;
      collided = true;
    }

    if (nextZ > boundaryLimit) {
      nextZ = boundaryLimit;
      collided = true;
    } else if (nextZ < -boundaryLimit) {
      nextZ = -boundaryLimit;
      collided = true;
    }

    // Obstacles collision
    for (const obs of this.obstacles) {
      const dist = Math.hypot(nextX - obs.x, nextZ - obs.z);
      const minDist = botRadius + obs.radius;
      if (dist < minDist) {
        collided = true;
        const angle = Math.atan2(nextZ - obs.z, nextX - obs.x);
        nextX = obs.x + Math.cos(angle) * minDist;
        nextZ = obs.z + Math.sin(angle) * minDist;
      }
    }

    if (collided && onCollision) {
      onCollision(Math.abs(kinematics.linearVelocity));
      kinematics.linearVelocity *= 0.2; // absorb impact
    }

    kinematics.x = nextX;
    kinematics.z = nextZ;
    kinematics.isMoving = Math.abs(kinematics.linearVelocity) > 0.01 || Math.abs(kinematics.angularVelocity) > 0.01;

    return kinematics;
  }

  /**
   * Raycast 2D RPLiDAR scan around 360 degrees
   */
  public generateLidarScan(kinematics: JetBotKinematics): LidarData {
    const numRays = 180; // 2-degree step for high performance 60fps
    const maxRange = 6.0;
    const ranges: number[] = new Array(numRays);
    const points: LidarScanPoint[] = [];

    const positionsAttr = this.lidarPointsGeo.attributes.position as THREE.BufferAttribute;
    const colorsAttr = this.lidarPointsGeo.attributes.color as THREE.BufferAttribute;

    const posX = kinematics.x;
    const posZ = kinematics.z;
    const robotYaw = kinematics.yaw;

    let closestDistance = maxRange;
    let closestAngle = 0;

    const halfArena = this.arenaSize * 0.5 - 0.12;

    for (let i = 0; i < numRays; i++) {
      const relAngle = (i / numRays) * Math.PI * 2;
      const worldAngle = robotYaw + relAngle;
      const dirX = Math.sin(worldAngle);
      const dirZ = Math.cos(worldAngle);

      let hitDist = maxRange;

      // 1. Check arena boundary walls
      if (dirX > 0) {
        const d = (halfArena - posX) / dirX;
        if (d > 0 && d < hitDist) hitDist = d;
      } else if (dirX < 0) {
        const d = (-halfArena - posX) / dirX;
        if (d > 0 && d < hitDist) hitDist = d;
      }

      if (dirZ > 0) {
        const d = (halfArena - posZ) / dirZ;
        if (d > 0 && d < hitDist) hitDist = d;
      } else if (dirZ < 0) {
        const d = (-halfArena - posZ) / dirZ;
        if (d > 0 && d < hitDist) hitDist = d;
      }

      // 2. Check circular/bounding obstacle intersection
      for (const obs of this.obstacles) {
        // Circle ray intersection
        const toObsX = obs.x - posX;
        const toObsZ = obs.z - posZ;

        // Project onto ray direction
        const proj = toObsX * dirX + toObsZ * dirZ;
        if (proj > 0) {
          const perpDistSq = (toObsX * toObsX + toObsZ * toObsZ) - (proj * proj);
          const radSq = obs.radius * obs.radius;
          if (perpDistSq < radSq) {
            const chordHalf = Math.sqrt(radSq - perpDistSq);
            const distCandidate = proj - chordHalf;
            if (distCandidate > 0 && distCandidate < hitDist) {
              hitDist = distCandidate;
            }
          }
        }
      }

      ranges[i] = hitDist;

      if (hitDist < closestDistance) {
        closestDistance = hitDist;
        closestAngle = relAngle;
      }

      // World hit coordinates for 3D point cloud
      const hitX = posX + dirX * hitDist;
      const hitZ = posZ + dirZ * hitDist;

      positionsAttr.setXYZ(i, hitX, 0.18, hitZ);

      // Warning color (red for < 0.6m, cyan/green for far)
      if (hitDist < 0.6) {
        colorsAttr.setXYZ(i, 1.0, 0.1, 0.1);
      } else if (hitDist < 1.5) {
        colorsAttr.setXYZ(i, 1.0, 0.8, 0.1);
      } else {
        colorsAttr.setXYZ(i, 0.1, 0.9, 0.8);
      }

      points.push({
        angle: relAngle,
        distance: hitDist,
        intensity: Math.floor(Math.max(50, 255 - hitDist * 40)),
        x: Math.sin(relAngle) * hitDist,
        z: Math.cos(relAngle) * hitDist,
      });
    }

    positionsAttr.needsUpdate = true;
    colorsAttr.needsUpdate = true;

    return {
      ranges,
      points,
      rpm: 600,
      closestDistance,
      closestAngle,
    };
  }

  /**
   * Simulated CSI camera vision detections
   */
  public getCameraDetections(kinematics: JetBotKinematics): VisionDetection[] {
    const detections: VisionDetection[] = [];
    const camFov = Math.PI * 0.45; // ~80 degree FOV

    for (const obs of this.obstacles) {
      const dx = obs.x - kinematics.x;
      const dz = obs.z - kinematics.z;
      const dist = Math.hypot(dx, dz);

      if (dist < 4.0 && dist > 0.2) {
        // Angle relative to robot heading
        const angleToObs = Math.atan2(dx, dz);
        let angleDiff = angleToObs - kinematics.yaw;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        if (Math.abs(angleDiff) < camFov * 0.5) {
          // Inside camera frustum!
          const screenX = 0.5 + (angleDiff / (camFov * 0.5)) * 0.45;
          const apparentSize = Math.min(0.6, Math.max(0.08, 0.4 / dist));

          detections.push({
            id: obs.id,
            label: obs.label,
            confidence: Math.min(99, Math.floor(95 - dist * 8 + Math.random() * 4)),
            box: {
              x: Math.max(0.05, screenX - apparentSize * 0.5),
              y: 0.5 - apparentSize * 0.3,
              width: apparentSize,
              height: apparentSize * 1.2,
            },
            distanceMeters: Number(dist.toFixed(2)),
          });
        }
      }
    }

    return detections;
  }
}
