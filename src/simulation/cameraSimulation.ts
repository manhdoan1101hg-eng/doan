import * as THREE from 'three';

export interface CameraSimInstance {
  camera: THREE.PerspectiveCamera;
  renderTarget: THREE.WebGLRenderTarget;
  updatePosition: (robotX: number, robotZ: number, robotYaw: number) => void;
  render: (renderer: THREE.WebGLRenderer, scene: THREE.Scene) => void;
  dispose: () => void;
}

/**
 * Creates secondary camera for JetBot CSI onboard camera simulation
 * tf: x = 0.10, y = 0.08, z = 0.08
 */
export function createCsiCameraSim(width = 480, height = 270): CameraSimInstance {
  const camera = new THREE.PerspectiveCamera(78, width / height, 0.05, 20);

  const renderTarget = new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    colorSpace: THREE.SRGBColorSpace,
  });

  const updatePosition = (robotX: number, robotZ: number, robotYaw: number) => {
    // Camera mount offset in robot coordinates (x forward, y up)
    const forwardOffset = 0.10;
    const heightOffset = 0.085;

    const camX = robotX + Math.sin(robotYaw) * forwardOffset;
    const camZ = robotZ + Math.cos(robotYaw) * forwardOffset;

    camera.position.set(camX, heightOffset, camZ);

    // Look slightly downward ahead of robot
    const lookAheadX = camX + Math.sin(robotYaw) * 1.5;
    const lookAheadZ = camZ + Math.cos(robotYaw) * 1.5;
    camera.lookAt(lookAheadX, heightOffset - 0.15, lookAheadZ);
  };

  const render = (renderer: THREE.WebGLRenderer, scene: THREE.Scene) => {
    const prevTarget = renderer.getRenderTarget();
    renderer.setRenderTarget(renderTarget);
    renderer.render(scene, camera);
    renderer.setRenderTarget(prevTarget);
  };

  const dispose = () => {
    renderTarget.dispose();
  };

  return {
    camera,
    renderTarget,
    updatePosition,
    render,
    dispose,
  };
}
