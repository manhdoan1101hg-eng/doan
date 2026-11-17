import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createJetBotModel, JetBotModelComponents } from '../simulation/jetbotModel';
import { createAeroKitModel, AeroKitComponents } from '../simulation/aeroKitModel';
import { createStreamlinesSimulation, StreamlinesInstance } from '../simulation/streamlinesSimulation';
import { AerodynamicsEngine } from '../simulation/aerodynamicsEngine';
import { PhysicsArena } from '../simulation/physicsArena';
import { createCsiCameraSim, CameraSimInstance } from '../simulation/cameraSimulation';
import { soundSynth } from '../simulation/audioSynth';
import {
  JetBotKinematics,
  JetBotConfig,
  DriveMode,
  CameraViewMode,
  LidarData,
  VisionDetection,
  AeroParameters,
  AeroForces,
  SimulationDomain,
} from '../types/jetbot';

interface ThreeCanvasProps {
  kinematics: JetBotKinematics;
  config: JetBotConfig;
  driveMode: DriveMode;
  cameraView: CameraViewMode;
  onUpdateKinematics: (newKinematics: JetBotKinematics) => void;
  onUpdateLidarData: (data: LidarData) => void;
  onUpdateDetections: (detections: VisionDetection[]) => void;
  csiCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  onObstacleCollision: (speed: number) => void;

  // Aerodynamics props
  aeroParams: AeroParameters;
  domain: SimulationDomain;
  onUpdateAeroForces: (forces: AeroForces) => void;

  // Interactive Part Inspection props
  onSelectPart?: (partId: string) => void;
  selectedPartId?: string | null;
  onHoverPart?: (partId: string | null, mousePos: { x: number; y: number } | null) => void;
}

export function ThreeCanvas({
  kinematics,
  config,
  driveMode,
  cameraView,
  onUpdateKinematics,
  onUpdateLidarData,
  onUpdateDetections,
  csiCanvasRef,
  onObstacleCollision,
  aeroParams,
  domain,
  onUpdateAeroForces,
  onSelectPart,
  selectedPartId,
  onHoverPart,
}: ThreeCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // References to keep mutable state accessible in the 60fps render loop
  const kinematicsRef = useRef<JetBotKinematics>(kinematics);
  kinematicsRef.current = kinematics;

  const configRef = useRef<JetBotConfig>(config);
  configRef.current = config;

  const driveModeRef = useRef<DriveMode>(driveMode);
  driveModeRef.current = driveMode;

  const cameraViewRef = useRef<CameraViewMode>(cameraView);
  cameraViewRef.current = cameraView;

  const aeroParamsRef = useRef<AeroParameters>(aeroParams);
  aeroParamsRef.current = aeroParams;

  const domainRef = useRef<SimulationDomain>(domain);
  domainRef.current = domain;

  const selectedPartIdRef = useRef<string | null>(selectedPartId || null);
  selectedPartIdRef.current = selectedPartId || null;

  const onSelectPartRef = useRef(onSelectPart);
  onSelectPartRef.current = onSelectPart;

  const onHoverPartRef = useRef(onHoverPart);
  onHoverPartRef.current = onHoverPart;

  // Storing model components
  const jetbotComponentsRef = useRef<JetBotModelComponents | null>(null);
  const aeroKitRef = useRef<AeroKitComponents | null>(null);
  const streamlinesRef = useRef<StreamlinesInstance | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Detect software WebGL as per Three.js skill
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    // 2. Setup Three.js Scene & Color Pipeline
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e1118);
    scene.fog = new THREE.FogExp2(0x0e1118, 0.04);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.05, 50);
    camera.position.set(0.65, 0.5, 0.85);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Studio Environment Reflection (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 4. Studio Lighting Rig
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.2);
    keyLight.position.set(3, 5, 2);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 2048;
      keyLight.shadow.mapSize.height = 2048;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 15;
      const d = 4.5;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0x74b9ff, 0x2d3436, 1.2);
    scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight(0x00d2d3, 1.0);
    rimLight.position.set(-3, 3, -4);
    scene.add(rimLight);

    // 5. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.minDistance = 0.2;
    controls.maxDistance = 12;
    controls.target.set(0, 0.12, 0);

    // 6. Build High-Tech Arena & Obstacles
    const arena = new PhysicsArena(scene);

    // 7. Build High-Fidelity JetBot Model (Pure real robot without airplane wings)
    const jetbotModel = createJetBotModel();
    scene.add(jetbotModel.root);
    jetbotComponentsRef.current = jetbotModel;

    // 8. Aerodynamic Aero Kit (kept standalone/hidden as user requested no wings)
    const aeroKit = createAeroKitModel();
    aeroKit.setVisible(false); // Remove wings and rear tail
    aeroKitRef.current = aeroKit;

    // 9. 3D Wind Tunnel Streamlines
    const streamlines = createStreamlinesSimulation();
    streamlines.setVisible(false);
    scene.add(streamlines.group);
    streamlinesRef.current = streamlines;

    // Wind Tunnel precision aerodynamic sting mount support
    const stingMountGeo = new THREE.CylinderGeometry(0.008, 0.012, 0.25, 12);
    const matSting = new THREE.MeshStandardMaterial({ color: 0x4b6584, metalness: 0.9, roughness: 0.2 });
    const stingMount = new THREE.Mesh(stingMountGeo, matSting);
    stingMount.position.set(0, 0.08, -0.16);
    scene.add(stingMount);

    // 10. CSI Secondary Camera Simulation
    const csiSim: CameraSimInstance = createCsiCameraSim(480, 270);

    // Scratch math helpers
    const _scratchVecTarget = new THREE.Vector3();
    const _scratchVecCamPos = new THREE.Vector3();
    const _clock = new THREE.Clock();

    let frameId = 0;
    let autonomousTimer = 0;
    let autonomousTurnDir = 1;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    // 11. 3D Cybernetic Highlight Box for Selected Component
    const highlightBox = new THREE.BoxHelper(new THREE.Mesh(), 0x00f0ff);
    highlightBox.visible = false;
    const highlightMat = highlightBox.material as THREE.LineBasicMaterial;
    highlightMat.linewidth = 2;
    highlightMat.transparent = true;
    highlightMat.depthTest = false;
    scene.add(highlightBox);

    // 12. Interactive Raycaster for clicking & inspecting parts
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const getIntersectedPartId = (e: MouseEvent): string | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(jetbotModel.root.children, true);
      for (const hit of intersects) {
        let cur: THREE.Object3D | null = hit.object;
        while (cur && cur !== jetbotModel.root) {
          if (cur.userData && cur.userData.partId) {
            return cur.userData.partId;
          }
          cur = cur.parent;
        }
      }
      return null;
    };

    const handlePointerDown = (e: MouseEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: MouseEvent) => {
      const dx = e.clientX - pointerDownPos.x;
      const dy = e.clientY - pointerDownPos.y;
      // Allow slight jitter (e.g. up to 7px) to detect pure clicks vs camera orbiting
      if (Math.hypot(dx, dy) < 7) {
        const partId = getIntersectedPartId(e);
        if (partId && onSelectPartRef.current) {
          onSelectPartRef.current(partId);
        }
      }
    };

    const handlePointerMove = (e: MouseEvent) => {
      const partId = getIntersectedPartId(e);
      renderer.domElement.style.cursor = partId ? 'pointer' : 'default';
      if (onHoverPartRef.current) {
        if (partId) {
          onHoverPartRef.current(partId, { x: e.clientX, y: e.clientY });
        } else {
          onHoverPartRef.current(null, null);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);

    // Main 60fps Animation Loop
    function tick() {
      const rawDt = _clock.getDelta();
      const dt = Math.min(rawDt, 0.05);
      const curKin = kinematicsRef.current;
      const curCfg = configRef.current;
      const curMode = driveModeRef.current;
      const curCamView = cameraViewRef.current;
      const curAero = aeroParamsRef.current;
      const curDomain = domainRef.current;

      // 1. Calculate Aerodynamic Forces & Moments
      const forces = AerodynamicsEngine.compute(curAero);
      onUpdateAeroForces(forces);

      // 2. Update 3D Aerodynamic Aero Kit Pose (Wing tilt, flaps, rudder, elevator, force arrows)
      aeroKit.updateAeroPose(curAero, forces);

      // 3. Update Wind Tunnel Streamlines
      if (curDomain === 'wind_tunnel') {
        streamlines.setVisible(curAero.showStreamlines);
        streamlines.update(dt, curAero, forces);
        stingMount.visible = true;

        // In wind tunnel mode, JetBox is mounted on the sting balance
        jetbotModel.root.position.set(0, 0.14, 0);
        jetbotModel.root.rotation.y = 0;
      } else {
        streamlines.setVisible(false);
        stingMount.visible = false;

        // 4. Autonomous Ground Behaviors (if in ground robotics mode)
        if (curMode === 'lidar_avoidance') {
          autonomousTimer += dt;
          const frontObstacleDist = arena.generateLidarScan(curKin).closestDistance;
          if (frontObstacleDist < 0.85) {
            curKin.leftMotorSpeed = -0.4 * autonomousTurnDir;
            curKin.rightMotorSpeed = 0.4 * autonomousTurnDir;
          } else {
            curKin.leftMotorSpeed = 0.6;
            curKin.rightMotorSpeed = 0.6;
            if (autonomousTimer > 4.0) {
              autonomousTimer = 0;
              autonomousTurnDir = Math.random() > 0.5 ? 1 : -1;
            }
          }
        } else if (curMode === 'line_follower') {
          const currentDistFromOrigin = Math.hypot(curKin.x, curKin.z);
          const targetRadius = 2.5;
          const err = currentDistFromOrigin - targetRadius;
          const baseSpeed = 0.5;
          const steer = err * 1.8;
          curKin.leftMotorSpeed = baseSpeed + steer;
          curKin.rightMotorSpeed = baseSpeed - steer;
        } else if (curMode === 'circle_patrol') {
          curKin.leftMotorSpeed = 0.5;
          curKin.rightMotorSpeed = 0.25;
        }

        // Update ground kinematics & collisions
        const updatedKinematics = arena.updateKinematics(curKin, curCfg, dt, (speed) => {
          soundSynth.playCollisionSound(speed);
          onObstacleCollision(speed);
        });

        jetbotModel.root.position.set(updatedKinematics.x, 0, updatedKinematics.z);
        jetbotModel.root.rotation.y = updatedKinematics.yaw;
      }

      // Rotate wheels & animate components
      jetbotModel.leftWheel.rotation.x = curKin.leftWheelAngle;
      jetbotModel.rightWheel.rotation.x = curKin.rightWheelAngle;

      // 4. Spin RPLiDAR 360 Turret continuously (10 Hz = 600 RPM)
      if (curCfg.lidarEnabled) {
        jetbotModel.lidarRotor.rotation.y += 62.8 * dt; // 600 RPM continuous spin
        jetbotModel.lidarLaserBeam.visible = true;
      } else {
        jetbotModel.lidarLaserBeam.visible = false;
      }

      jetbotModel.coolingFan.rotation.y += 35 * dt;
      jetbotModel.tm1637Updater(curCfg.tm1637Value);
      jetbotModel.updateExplodedView(curCfg.explodedProgress);

      // Audio engine update
      soundSynth.updateMotorAudio(curKin.leftMotorSpeed, curKin.rightMotorSpeed);
      soundSynth.updateLidarAudio(curCfg.lidarEnabled);

      // LiDAR scan update
      const lidarScanData = arena.generateLidarScan(curKin);
      onUpdateLidarData(lidarScanData);

      // Camera views
      if (curCamView === 'orbit') {
        controls.enabled = true;
        if (curDomain === 'wind_tunnel') {
          controls.target.set(0, 0.14, 0);
        } else {
          controls.target.set(curKin.x, 0.1, curKin.z);
        }
        controls.update();
      } else if (curCamView === 'chase') {
        controls.enabled = false;
        const chaseDist = 0.65;
        const chaseHeight = 0.38;
        const targetX = curDomain === 'wind_tunnel' ? 0 : curKin.x;
        const targetZ = curDomain === 'wind_tunnel' ? 0 : curKin.z;
        const targetYaw = curDomain === 'wind_tunnel' ? 0 : curKin.yaw;

        _scratchVecCamPos.set(
          targetX - Math.sin(targetYaw) * chaseDist,
          chaseHeight,
          targetZ - Math.cos(targetYaw) * chaseDist
        );
        camera.position.lerp(_scratchVecCamPos, 1 - Math.exp(-8 * dt));

        _scratchVecTarget.set(
          targetX + Math.sin(targetYaw) * 0.4,
          0.14,
          targetZ + Math.cos(targetYaw) * 0.4
        );
        camera.lookAt(_scratchVecTarget);
      } else if (curCamView === 'csi_fpv') {
        controls.enabled = false;
        const targetX = curDomain === 'wind_tunnel' ? 0 : curKin.x;
        const targetZ = curDomain === 'wind_tunnel' ? 0 : curKin.z;
        const targetYaw = curDomain === 'wind_tunnel' ? 0 : curKin.yaw;
        const fwd = 0.10;
        const h = curDomain === 'wind_tunnel' ? 0.22 : 0.088;
        const eyeX = targetX + Math.sin(targetYaw) * fwd;
        const eyeZ = targetZ + Math.cos(targetYaw) * fwd;
        camera.position.set(eyeX, h, eyeZ);

        _scratchVecTarget.set(
          eyeX + Math.sin(targetYaw) * 1.5,
          h - 0.1,
          eyeZ + Math.cos(targetYaw) * 1.5
        );
        camera.lookAt(_scratchVecTarget);
      } else if (curCamView === 'top_down') {
        controls.enabled = false;
        const targetX = curDomain === 'wind_tunnel' ? 0 : curKin.x;
        const targetZ = curDomain === 'wind_tunnel' ? 0 : curKin.z;
        _scratchVecCamPos.set(targetX, 4.5, targetZ + 0.01);
        camera.position.lerp(_scratchVecCamPos, 1 - Math.exp(-5 * dt));
        camera.lookAt(targetX, 0.1, targetZ);
      }

      // Render main viewport
      renderer.render(scene, camera);

      // Render CSI camera PiP
      if (csiCanvasRef.current) {
        const posX = curDomain === 'wind_tunnel' ? 0 : curKin.x;
        const posZ = curDomain === 'wind_tunnel' ? 0 : curKin.z;
        const posYaw = curDomain === 'wind_tunnel' ? 0 : curKin.yaw;
        csiSim.updatePosition(posX, posZ, posYaw);
        csiSim.render(renderer, scene);

        const targetCanvas = csiCanvasRef.current;
        const ctx2d = targetCanvas.getContext('2d');
        if (ctx2d) {
          const w = csiSim.renderTarget.width;
          const h = csiSim.renderTarget.height;
          const pixelBuffer = new Uint8Array(w * h * 4);
          renderer.readRenderTargetPixels(csiSim.renderTarget, 0, 0, w, h, pixelBuffer);

          const imgData = ctx2d.createImageData(w, h);
          for (let y = 0; y < h; y++) {
            const srcRow = (h - 1 - y) * w * 4;
            const dstRow = y * w * 4;
            for (let x = 0; x < w * 4; x++) {
              imgData.data[dstRow + x] = pixelBuffer[srcRow + x];
            }
          }
          ctx2d.putImageData(imgData, 0, 0);
        }

        const visionDets = arena.getCameraDetections(curKin);
        onUpdateDetections(visionDets);
      }

      // Update Highlight Box for currently selected part
      const activePartId = selectedPartIdRef.current;
      if (activePartId && jetbotModel.partRoots[activePartId]) {
        const targetObj = jetbotModel.partRoots[activePartId];
        highlightBox.setFromObject(targetObj);
        highlightBox.visible = true;
        const pulse = 0.65 + 0.35 * Math.sin(_clock.getElapsedTime() * 7);
        highlightMat.opacity = pulse;
      } else {
        highlightBox.visible = false;
      }

      onUpdateKinematics({ ...curKin });

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    tick();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      highlightBox.dispose();
      controls.dispose();
      csiSim.dispose();
      streamlines.dispose();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full relative" />;
}
