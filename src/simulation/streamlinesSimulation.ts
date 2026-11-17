import * as THREE from 'three';
import { AeroParameters, AeroForces } from '../types/jetbot';

export interface StreamlinesInstance {
  group: THREE.Group;
  update: (dt: number, params: AeroParameters, forces: AeroForces) => void;
  setVisible: (visible: boolean) => void;
  dispose: () => void;
}

/**
 * Procedural 3D Wind Tunnel Flow Streamlines & Smoke Visualization
 * Displays air velocity streamlines, pressure color coding, wingtip vortices, and stall separation
 */
export function createStreamlinesSimulation(): StreamlinesInstance {
  const group = new THREE.Group();
  group.name = 'WindTunnelStreamlines';

  // Number of particles / streamline nodes
  const particleCount = 280;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  // Store individual particle seeds and offsets
  const seeds: Array<{
    startX: number;
    startY: number;
    z: number;
    speedMult: number;
    streamlineRow: number;
  }> = [];

  for (let i = 0; i < particleCount; i++) {
    // Distribute particles across wind tunnel inlet
    const row = Math.floor(i / 28);
    const col = i % 28;
    const startX = (col / 27 - 0.5) * 0.75; // spanwise spread
    const startY = 0.04 + (row / 10) * 0.18; // vertical spread
    const z = (Math.random() - 0.5) * 1.6; // random initial Z along wind tunnel

    seeds.push({
      startX,
      startY,
      z,
      speedMult: 0.85 + Math.random() * 0.3,
      streamlineRow: row,
    });

    positions[i * 3] = startX;
    positions[i * 3 + 1] = startY;
    positions[i * 3 + 2] = z;

    // Default cyan
    colors[i * 3] = 0.0;
    colors[i * 3 + 1] = 0.85;
    colors[i * 3 + 2] = 0.95;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Particle texture canvas (soft circular smoke puff)
  const pCanvas = document.createElement('canvas');
  pCanvas.width = 32;
  pCanvas.height = 32;
  const pCtx = pCanvas.getContext('2d')!;
  const grad = pCtx.createRadialGradient(16, 16, 2, 16, 16, 16);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.4, 'rgba(0, 210, 211, 0.7)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  pCtx.fillStyle = grad;
  pCtx.fillRect(0, 0, 32, 32);

  const pTex = new THREE.CanvasTexture(pCanvas);
  const material = new THREE.PointsMaterial({
    size: 0.04,
    map: pTex,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const pointsMesh = new THREE.Points(geometry, material);
  group.add(pointsMesh);

  // Wind Tunnel Enclosure Frame (Translucent high-tech test section)
  const tunnelGeo = new THREE.CylinderGeometry(0.55, 0.55, 1.8, 32, 1, true);
  tunnelGeo.rotateX(Math.PI / 2);
  const matTunnel = new THREE.MeshBasicMaterial({
    color: 0x1e3799,
    transparent: true,
    opacity: 0.06,
    side: THREE.BackSide,
    wireframe: true,
  });
  const tunnelMesh = new THREE.Mesh(tunnelGeo, matTunnel);
  tunnelMesh.position.set(0, 0.14, 0);
  group.add(tunnelMesh);

  // Airflow direction inlet nozzle ring
  const nozzleRingGeo = new THREE.TorusGeometry(0.55, 0.008, 8, 32);
  const matRing = new THREE.MeshBasicMaterial({ color: 0x00d2d3, transparent: true, opacity: 0.35 });
  const nozzleRing = new THREE.Mesh(nozzleRingGeo, matRing);
  nozzleRing.position.set(0, 0.14, 0.9);
  group.add(nozzleRing);

  const outletRing = new THREE.Mesh(nozzleRingGeo, matRing);
  outletRing.position.set(0, 0.14, -0.9);
  group.add(outletRing);

  const update = (dt: number, params: AeroParameters, forces: AeroForces) => {
    if (!params.showStreamlines) {
      group.visible = false;
      return;
    }
    group.visible = true;

    const posAttr = geometry.attributes.position as THREE.BufferAttribute;
    const colAttr = geometry.attributes.color as THREE.BufferAttribute;

    const flowVelocity = Math.max(0.2, params.airspeed * 0.15 * params.streamlineSpeed);
    const alphaRad = (params.angleOfAttack * Math.PI) / 180;
    const isStalled = forces.isStalled;
    const stallProg = forces.stallProgress;

    const tunnelInletZ = 0.9;
    const tunnelOutletZ = -0.9;

    for (let i = 0; i < particleCount; i++) {
      const s = seeds[i];
      // Particles flow from +Z (front) to -Z (back)
      s.z -= flowVelocity * s.speedMult * dt;

      // Wrap around wind tunnel loop
      if (s.z < tunnelOutletZ) {
        s.z = tunnelInletZ + (Math.random() * 0.2);
      }

      let curX = s.startX;
      let curY = s.startY;
      const curZ = s.z;

      // Aerodynamic Flow Deflection over JetBox Wing (around Z = 0)
      const distToWing = Math.hypot(curX, curZ);
      const isNearWing = Math.abs(curZ) < 0.22 && Math.abs(curX) < params.wingSpan * 0.55;

      if (isNearWing) {
        // Upwash ahead of wing, downwash behind wing
        if (curZ > 0) {
          // Upwash: air rises slightly as it approaches leading edge
          curY += Math.sin(alphaRad) * 0.05 * (1 - curZ / 0.22);
        } else {
          // Downwash: air is pushed downward by lift reaction: -downwash
          curY -= Math.sin(alphaRad) * 0.08 * (1 - Math.abs(curZ) / 0.22);
        }

        // Camber deflection: contour over the top wing surface
        if (s.startY > 0.12) {
          curY += 0.03 * Math.cos((curZ / 0.22) * Math.PI * 0.5);
        }

        // Stall Wake Turbulence: flow breaks into chaotic vortices
        if (isStalled && curZ < 0) {
          const turb = Math.sin(i * 13 + s.z * 25) * stallProg * 0.04;
          curY += turb;
          curX += Math.cos(i * 7 + s.z * 20) * stallProg * 0.03;
        }

        // Wingtip Vortex: swirl particles near the wingtips
        const tipDist = Math.abs(Math.abs(curX) - params.wingSpan * 0.5);
        if (tipDist < 0.06 && curZ < 0) {
          const vortexAngle = curZ * 20;
          const sign = curX > 0 ? 1 : -1;
          curY += Math.sin(vortexAngle) * 0.02;
          curX += Math.cos(vortexAngle) * 0.02 * sign;
        }
      }

      posAttr.setXYZ(i, curX, curY, curZ);

      // Color coding based on local air pressure / velocity
      // Upper suction side (low pressure / high speed) = Bright Cyan / Blue
      // Lower stagnation side (high pressure) = Warm Yellow / Red
      // Stalled separated flow = Crimson / Magenta
      if (isStalled && isNearWing && curZ < 0) {
        // Red / Magenta turbulent stall wake
        colAttr.setXYZ(i, 1.0, 0.15, 0.4);
      } else if (curY > 0.12 && isNearWing) {
        // Low pressure suction zone
        colAttr.setXYZ(i, 0.0, 0.85, 1.0);
      } else if (curY <= 0.12 && isNearWing) {
        // High pressure compression zone
        colAttr.setXYZ(i, 1.0, 0.7, 0.2);
      } else {
        // Ambient freestream color
        colAttr.setXYZ(i, 0.2, 0.6, 0.9);
      }
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  };

  const setVisible = (visible: boolean) => {
    group.visible = visible;
  };

  const dispose = () => {
    geometry.dispose();
    material.dispose();
    pTex.dispose();
  };

  return {
    group,
    update,
    setVisible,
    dispose,
  };
}
