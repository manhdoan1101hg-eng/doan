import * as THREE from 'three';

/**
 * Procedural texture generators ensuring zero external 404 image requests
 * Color textures are explicitly set to THREE.SRGBColorSpace
 */

/**
 * Dynamic 7-segment TM1637 display texture
 */
export function createTM1637Texture(text: string): { texture: THREE.CanvasTexture; updateText: (newVal: string) => void } {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  function draw(val: string) {
    ctx.fillStyle = '#0a0a0d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = 'bold 74px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#2a0505';
    ctx.fillText('8888', canvas.width / 2, canvas.height / 2 + 6);

    ctx.fillStyle = '#ff1a1a';
    ctx.shadowColor = '#ff3333';
    ctx.shadowBlur = 12;

    const formatted = val.slice(0, 4).padStart(4, ' ');
    ctx.fillText(formatted, canvas.width / 2, canvas.height / 2 + 6);

    ctx.shadowBlur = 0;
  }

  draw(text);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  return {
    texture,
    updateText: (newVal: string) => {
      draw(newVal);
      texture.needsUpdate = true;
    },
  };
}

/**
 * Authentic RPLiDAR A1 circular top cover texture matching real photo (Image 3)
 * Featuring central debossed ring, "RPLIDAR" logo, and 3 screw holes
 */
export function createRplidarTopTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dark matte texture
  ctx.fillStyle = '#1c1c1f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Concentric circle bevel grooves
  ctx.strokeStyle = '#121214';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(256, 256, 240, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#2b2b30';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(256, 256, 170, 0, Math.PI * 2);
  ctx.stroke();

  // Central embossed / debossed circle
  ctx.fillStyle = '#222226';
  ctx.beginPath();
  ctx.arc(256, 256, 168, 0, Math.PI * 2);
  ctx.fill();

  // "RPLIDAR" Text Logo (seen clearly in Image 3)
  ctx.save();
  ctx.translate(256, 256);
  ctx.rotate(-Math.PI / 2); // Oriented as seen in real photo
  ctx.fillStyle = '#3e3e44';
  ctx.font = '900 48px "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '6px';
  ctx.fillText('RPLIDAR', 0, 0);
  ctx.restore();

  // 3 Screws in equilateral triangle around outer edge
  const screwAngles = [0.5, 2.6, 4.7];
  screwAngles.forEach((a) => {
    const sx = 256 + Math.cos(a) * 195;
    const sy = 256 + Math.sin(a) * 195;

    // Screw head recess
    ctx.fillStyle = '#0a0a0c';
    ctx.beginPath();
    ctx.arc(sx, sy, 16, 0, Math.PI * 2);
    ctx.fill();

    // Screw center
    ctx.fillStyle = '#222228';
    ctx.beginPath();
    ctx.arc(sx, sy, 8, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Camera FFC Ribbon Cable Texture (White cable with printed specifications & blue tip)
 * Exactly matching Image 2 & Image 4: "AWM 20706 105C 60V VW-1"
 */
export function createCameraRibbonTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Clean glossy white flexible ribbon
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Thin parallel conductor copper track lines
  ctx.strokeStyle = '#e9ecef';
  ctx.lineWidth = 1;
  for (let x = 6; x < canvas.width; x += 8) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  // Blue reinforcement stiffener tab at connector end
  ctx.fillStyle = '#0984e3';
  ctx.fillRect(0, 0, canvas.width, 40);

  // Standard printed cable markings
  ctx.fillStyle = '#636e72';
  ctx.font = 'bold 13px monospace';
  ctx.save();
  ctx.translate(64, 256);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.fillText('AWM 20706 105C 60V VW-1', 0, -8);
  ctx.fillText('E318208 FFC-CSI 15PIN', 0, 16);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * All-terrain knobby rubber tire tread pattern (matching user photos)
 */
export function createTireTreadTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#252525';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Deep rectangular knobby lugs
  ctx.fillStyle = '#0d0d0d';
  for (let y = 0; y < canvas.height; y += 32) {
    // Left blocks
    ctx.fillRect(16, y + 4, 96, 20);
    // Right blocks staggered
    ctx.fillRect(144, y + 20, 96, 20);
    // Center sipes
    ctx.fillRect(116, y + 8, 24, 6);
    ctx.fillRect(116, y + 24, 24, 6);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 10);
  return texture;
}

/**
 * Jetson Nano carrier board PCB texture
 */
export function createJetsonNanoTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dark matte green/black PCB
  ctx.fillStyle = '#112217';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Micro traces
  ctx.strokeStyle = '#1e3d29';
  ctx.lineWidth = 1.5;
  for (let i = 20; i < canvas.width; i += 24) {
    ctx.beginPath();
    ctx.moveTo(i, 20);
    ctx.lineTo(i + 40, 160);
    ctx.lineTo(i + 40, 360);
    ctx.lineTo(i + 10, 480);
    ctx.stroke();
  }

  // White silkscreen labels
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('NVIDIA Jetson Nano Developer Kit', 24, 48);

  ctx.font = 'bold 15px monospace';
  ctx.fillStyle = '#a5d6a7';
  ctx.fillText('40-PIN EXPANSION HEADER (I2C/GPIO/PWM)', 24, 80);
  ctx.fillText('CSI-2 CAMERA INTERFACE [FPC]', 24, 110);
  ctx.fillText('QUAD-CORE ARM A57 · 128-CORE MAXWELL', 24, 460);

  // Gold connector strip
  ctx.fillStyle = '#d4af37';
  for (let x = 30; x < 480; x += 12) {
    ctx.fillRect(x, 480, 8, 30);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Waveshare Robot Expansion Board PCB texture matching photos (matte black, white ws logo)
 */
export function createWaveshareBoardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#14171a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Waveshare stylized logo as visible in Photo 4
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 32px sans-serif';
  ctx.fillText('ws', 32, 64);
  ctx.font = '16px sans-serif';
  ctx.fillText('Waveshare', 74, 60);

  ctx.fillStyle = '#a0aab2';
  ctx.font = '14px monospace';
  ctx.fillText('JetBot ROS Expansion Board', 32, 95);
  ctx.fillText('PCA9685 I2C 16-Ch PWM Motor Driver', 32, 120);
  ctx.fillText('DC 12.6V 3S Li-ion Battery Input', 32, 145);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Arena floor metric grid with race/tracking lines
 */
export function createArenaFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#161922';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#222838';
  ctx.lineWidth = 4;
  for (let x = 0; x <= canvas.width; x += 128) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += 128) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  ctx.strokeStyle = '#3867d6';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(512, 512, 380, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#f1c40f';
  ctx.lineWidth = 8;
  ctx.setLineDash([30, 20]);
  ctx.beginPath();
  ctx.arc(512, 512, 320, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

/**
 * Caution barrier texture
 */
export function createCautionStripesTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f39c12';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#1e272e';
  for (let i = -128; i < 256; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 32, 0);
    ctx.lineTo(i - 32 + 128, 128);
    ctx.lineTo(i - 64 + 128, 128);
    ctx.closePath();
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 1);
  return texture;
}
