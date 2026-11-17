import * as THREE from 'three';
import {
  createTM1637Texture,
  createTireTreadTexture,
  createJetsonNanoTexture,
  createWaveshareBoardTexture,
  createRplidarTopTexture,
  createCameraRibbonTexture,
} from './proceduralTextures';

export interface JetBotModelComponents {
  root: THREE.Group;
  leftWheel: THREE.Group;
  rightWheel: THREE.Group;
  casterAssembly: THREE.Group;
  lidarRotor: THREE.Group;
  lidarDriveBelt: THREE.Mesh;
  lidarLaserBeam: THREE.Mesh;
  coolingFan: THREE.Group;
  breadboardButton: THREE.Mesh;
  tm1637Updater: (text: string) => void;
  updateExplodedView: (progress: number) => void;
  contactShadow: THREE.Mesh;
  cameraGroup: THREE.Group;
  antennaLeft: THREE.Group;
  antennaRight: THREE.Group;
  partRoots: Record<string, THREE.Object3D>;
}

/**
 * Creates the ultra-realistic 3D procedural model of JetBot ROS Robot
 * Meticulously calibrated and cross-referenced against the 5 real user photos:
 * 1. Metallic emerald green anodized circular baseplate with wheel cutouts
 * 2. High-gloss chrome royal blue multi-spoke sports car wheel rims with knobby all-terrain tires
 * 3. Dual black WiFi dipole antennas with brass RP-SMA nuts in a V-spread
 * 4. Front green anodized camera bracket with knurled thumbscrew hinge
 * 5. Tall arching white FFC CSI ribbon cable with blue connector tip & printed specs
 * 6. Authentic RPLiDAR A1 with side DC motor, visible rubber drive belt, and "RPLIDAR" logo cap
 * 7. NVIDIA Jetson Nano with finned black heatsink & active 40mm fan with red/black wires
 * 8. Stamped galvanized steel swivel caster wheel under chassis
 * 9. Arching rainbow GPIO jumper wire harness
 */
export function createJetBotModel(): JetBotModelComponents {
  const root = new THREE.Group();
  root.name = 'JetBot_RealCalibrated';

  // Sub-groups for exploded view animation
  const groupChassis = new THREE.Group();
  const groupWaveshare = new THREE.Group();
  const groupJetsonNano = new THREE.Group();
  const groupMidDeck = new THREE.Group();
  const groupLidar = new THREE.Group();
  const groupCamera = new THREE.Group();
  const groupPeripherals = new THREE.Group();
  const groupWheels = new THREE.Group();

  root.add(groupChassis);
  root.add(groupWaveshare);
  root.add(groupJetsonNano);
  root.add(groupMidDeck);
  root.add(groupLidar);
  root.add(groupCamera);
  root.add(groupPeripherals);
  root.add(groupWheels);

  // Textures
  const tireBumpMap = createTireTreadTexture();
  const jetsonTexture = createJetsonNanoTexture();
  const waveshareTexture = createWaveshareBoardTexture();
  const rplidarTopTexture = createRplidarTopTexture();
  const cameraRibbonTexture = createCameraRibbonTexture();

  // Part Roots Registry for interactive inspection & highlighting
  const partRoots: Record<string, THREE.Object3D> = {};
  const tagPart = (obj: THREE.Object3D, partId: string) => {
    obj.userData.partId = partId;
    if (!partRoots[partId]) {
      partRoots[partId] = obj;
    }
    obj.traverse((child) => {
      child.userData.partId = partId;
    });
  };

  // Materials meticulously calibrated against the 5 real user photos:
  // 1. Emerald Green Anodized Aluminum (exact chassis & camera mount color)
  const matGreenAnodized = new THREE.MeshStandardMaterial({
    color: 0x22a84d,
    metalness: 0.88,
    roughness: 0.22,
  });

  // 2. Chrome Royal Blue Metallic (electric blue wheel rims - Photo 1 & 4)
  const matChromeRoyalBlue = new THREE.MeshStandardMaterial({
    color: 0x0058f5,
    metalness: 0.98,
    roughness: 0.08,
  });

  // 3. Brass Standoffs, Nuts & Couplers (Photo 1, 3, 5)
  const matBrass = new THREE.MeshStandardMaterial({
    color: 0xdfb43b,
    metalness: 0.94,
    roughness: 0.22,
  });

  // 4. Matte Black Heatsink & Components
  const matBlackPlastic = new THREE.MeshStandardMaterial({
    color: 0x18181c,
    roughness: 0.45,
    metalness: 0.4,
  });

  const matHeatsinkBlack = new THREE.MeshStandardMaterial({
    color: 0x0d0d10,
    metalness: 0.92,
    roughness: 0.2,
  });

  // 5. All-terrain Black Rubber Tire with aggressive tread
  const matRubberTire = new THREE.MeshStandardMaterial({
    color: 0x161618,
    roughness: 0.85,
    metalness: 0.06,
    bumpMap: tireBumpMap,
    bumpScale: 0.07,
  });

  // Polished Chrome / Galvanized Steel (screws, caster, ports)
  const matChromeSteel = new THREE.MeshStandardMaterial({
    color: 0xdfe4ea,
    metalness: 0.95,
    roughness: 0.15,
  });

  // Dimensions
  const wheelRadius = 0.033; // 66mm diameter wheel
  const wheelWidth = 0.026;
  const wheelBase = 0.145; // ~145mm between left and right wheels
  const groundOffset = wheelRadius;

  // ----------------------------------------------------
  // 1. CHASSIS BASEPLATE (CIRCULAR WITH RECTANGULAR WHEEL CUTOUTS)
  // Exactly matching Photo 1, 2, 3, 4, 5
  // ----------------------------------------------------
  const chassisShape = new THREE.Shape();
  const radius = 0.112; // 224mm outer diameter
  const cutoutHalfWidth = 0.038;
  const cutoutInset = 0.062;

  // Draw custom circular profile with left/right wheel notches
  chassisShape.absarc(0, 0, radius, 0, Math.PI * 2, false);

  // Wheel cutout holes
  const leftHole = new THREE.Path();
  leftHole.moveTo(-cutoutInset - 0.03, -cutoutHalfWidth);
  leftHole.lineTo(-cutoutInset + 0.005, -cutoutHalfWidth);
  leftHole.lineTo(-cutoutInset + 0.005, cutoutHalfWidth);
  leftHole.lineTo(-cutoutInset - 0.03, cutoutHalfWidth);
  leftHole.closePath();
  chassisShape.holes.push(leftHole);

  const rightHole = new THREE.Path();
  rightHole.moveTo(cutoutInset + 0.03, -cutoutHalfWidth);
  rightHole.lineTo(cutoutInset - 0.005, -cutoutHalfWidth);
  rightHole.lineTo(cutoutInset - 0.005, cutoutHalfWidth);
  rightHole.lineTo(cutoutInset + 0.03, cutoutHalfWidth);
  rightHole.closePath();
  chassisShape.holes.push(rightHole);

  const extrudeSettings = {
    depth: 0.0025,
    bevelEnabled: true,
    bevelThickness: 0.0006,
    bevelSize: 0.0006,
    bevelSegments: 2,
  };

  const chassisGeo = new THREE.ExtrudeGeometry(chassisShape, extrudeSettings);
  chassisGeo.rotateX(Math.PI / 2);
  const chassisMesh = new THREE.Mesh(chassisGeo, matGreenAnodized);
  chassisMesh.position.set(0, groundOffset + 0.005, 0);
  chassisMesh.castShadow = true;
  chassisMesh.receiveShadow = true;
  tagPart(chassisMesh, 'chassis_base');
  groupChassis.add(chassisMesh);

  // Silver button-head screws on chassis surface (seen clearly in Photo 3)
  const screwGeo = new THREE.CylinderGeometry(0.0025, 0.0025, 0.0015, 8);
  const screwPositions = [
    [0.03, 0.065], [-0.03, 0.065],
    [0.05, -0.06], [-0.05, -0.06],
    [0.0, 0.09], [0.0, -0.09],
  ];
  screwPositions.forEach(([x, z]) => {
    const s = new THREE.Mesh(screwGeo, matChromeSteel);
    s.position.set(x, groundOffset + 0.006, z);
    tagPart(s, 'chassis_base');
    groupChassis.add(s);
  });

  // 4 Brass Hexagonal Standoffs supporting Layer 1
  const standoffGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.045, 6);
  const standoffPos = [
    [-0.045, -0.05], [0.045, -0.05],
    [-0.045, 0.05],  [0.045, 0.05],
  ];
  standoffPos.forEach(([x, z]) => {
    const post = new THREE.Mesh(standoffGeo, matBrass);
    post.position.set(x, groundOffset + 0.0275, z);
    post.castShadow = true;
    tagPart(post, 'chassis_base');
    groupChassis.add(post);
  });

  // Under-chassis DC Gearmotors (Yellow TT motors) & Brass Couplers
  const motorGeo = new THREE.BoxGeometry(0.022, 0.022, 0.042);
  const matMotorYellow = new THREE.MeshStandardMaterial({ color: 0xf1c40f, roughness: 0.4 });

  const leftMotor = new THREE.Mesh(motorGeo, matMotorYellow);
  leftMotor.position.set(-wheelBase * 0.5 + 0.022, groundOffset, 0);
  leftMotor.castShadow = true;
  tagPart(leftMotor, 'tt_motors');
  groupChassis.add(leftMotor);

  const rightMotor = new THREE.Mesh(motorGeo, matMotorYellow);
  rightMotor.position.set(wheelBase * 0.5 - 0.022, groundOffset, 0);
  rightMotor.castShadow = true;
  tagPart(rightMotor, 'tt_motors');
  groupChassis.add(rightMotor);

  // Brass Motor Couplers (connecting TT motor shaft to blue wheel rim)
  const couplerGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.015, 12);
  couplerGeo.rotateZ(Math.PI / 2);
  const leftCoupler = new THREE.Mesh(couplerGeo, matBrass);
  leftCoupler.position.set(-wheelBase * 0.5 + 0.01, groundOffset, 0);
  tagPart(leftCoupler, 'tt_motors');
  groupChassis.add(leftCoupler);

  const rightCoupler = new THREE.Mesh(couplerGeo, matBrass);
  rightCoupler.position.set(wheelBase * 0.5 - 0.01, groundOffset, 0);
  tagPart(rightCoupler, 'tt_motors');
  groupChassis.add(rightCoupler);

  // Under-chassis Black Battery Casing (3S 18650 holder)
  const battCaseGeo = new THREE.BoxGeometry(0.065, 0.026, 0.076);
  const battCase = new THREE.Mesh(battCaseGeo, matBlackPlastic);
  battCase.position.set(0, groundOffset - 0.005, -0.01);
  tagPart(battCase, 'waveshare_board');
  groupChassis.add(battCase);

  // Under-chassis Stamped Steel Swivel Caster Assembly (as seen in Photo 2 & 5)
  const casterAssembly = new THREE.Group();
  casterAssembly.position.set(0, groundOffset - 0.014, -0.078);

  const casterForkGeo = new THREE.BoxGeometry(0.024, 0.016, 0.028);
  const casterFork = new THREE.Mesh(casterForkGeo, matChromeSteel);
  casterFork.position.y = -0.002;
  casterAssembly.add(casterFork);

  const rollerWheelGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.012, 16);
  rollerWheelGeo.rotateZ(Math.PI / 2);
  const matRollerWheel = new THREE.MeshStandardMaterial({ color: 0x474747, roughness: 0.5 });
  const rollerWheel = new THREE.Mesh(rollerWheelGeo, matRollerWheel);
  rollerWheel.position.set(0, -0.01, 0);
  rollerWheel.castShadow = true;
  casterAssembly.add(rollerWheel);
  tagPart(casterAssembly, 'caster_wheel');
  groupChassis.add(casterAssembly);

  // ----------------------------------------------------
  // 2. CHROME ROYAL BLUE WHEELS (12-SPOKE SPORTS CAR RIMS)
  // Distinctive electric blue chrome finish seen in Photo 1, 4
  // ----------------------------------------------------
  const createBlueChromeWheel = () => {
    const wheelGroup = new THREE.Group();

    // Black Rubber All-Terrain Outer Tire
    const tireGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 24);
    tireGeo.rotateZ(Math.PI / 2);
    const tireMesh = new THREE.Mesh(tireGeo, matRubberTire);
    tireMesh.castShadow = true;
    wheelGroup.add(tireMesh);

    // Deep-Dish Rim Cylinder
    const rimOuterGeo = new THREE.CylinderGeometry(wheelRadius * 0.76, wheelRadius * 0.76, wheelWidth * 0.98, 24);
    rimOuterGeo.rotateZ(Math.PI / 2);
    const rimOuter = new THREE.Mesh(rimOuterGeo, matChromeRoyalBlue);
    wheelGroup.add(rimOuter);

    // Center Hub with silver bolt
    const hubGeo = new THREE.CylinderGeometry(0.008, 0.008, wheelWidth * 1.05, 16);
    hubGeo.rotateZ(Math.PI / 2);
    const hub = new THREE.Mesh(hubGeo, matChromeRoyalBlue);
    wheelGroup.add(hub);

    const centerBolt = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, wheelWidth * 1.08, 8), matChromeSteel);
    centerBolt.rotation.z = Math.PI / 2;
    wheelGroup.add(centerBolt);

    // 12 Radial Turbine Spokes (seen in Image 1 & 4)
    const numSpokes = 12;
    const spokeGeo = new THREE.BoxGeometry(0.0015, wheelRadius * 0.55, 0.003);
    for (let i = 0; i < numSpokes; i++) {
      const angle = (i / numSpokes) * Math.PI * 2;
      const spoke = new THREE.Mesh(spokeGeo, matChromeRoyalBlue);
      spoke.position.set(
        wheelWidth * 0.48, // outer face of rim
        Math.cos(angle) * wheelRadius * 0.42,
        Math.sin(angle) * wheelRadius * 0.42
      );
      spoke.rotation.x = -angle;
      wheelGroup.add(spoke);
    }

    return wheelGroup;
  };

  const leftWheel = createBlueChromeWheel();
  leftWheel.position.set(-wheelBase * 0.5, groundOffset, 0);
  tagPart(leftWheel, 'blue_wheels');
  groupWheels.add(leftWheel);

  const rightWheel = createBlueChromeWheel();
  rightWheel.position.set(wheelBase * 0.5, groundOffset, 0);
  rightWheel.rotation.y = Math.PI; // Face outwards
  tagPart(rightWheel, 'blue_wheels');
  groupWheels.add(rightWheel);

  // ----------------------------------------------------
  // 3. DUAL BLACK WIFI DIPOLE ANTENNAS WITH BRASS NUTS
  // As visible in Photo 1, 3, 4, 5
  // ----------------------------------------------------
  const createAntenna = () => {
    const antGroup = new THREE.Group();

    // Gold brass hex bulkhead nut
    const nutGeo = new THREE.CylinderGeometry(0.0045, 0.0045, 0.004, 6);
    const nut = new THREE.Mesh(nutGeo, matBrass);
    antGroup.add(nut);

    // Black knuckle hinge base
    const baseGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.02, 12);
    const base = new THREE.Mesh(baseGeo, matBlackPlastic);
    base.position.y = 0.01;
    antGroup.add(base);

    // Tall tapered antenna mast
    const mastGeo = new THREE.CylinderGeometry(0.002, 0.0035, 0.13, 12);
    const mast = new THREE.Mesh(mastGeo, matBlackPlastic);
    mast.position.y = 0.08;
    antGroup.add(mast);

    return antGroup;
  };

  // Left Antenna
  const antennaLeft = createAntenna();
  antennaLeft.position.set(-0.065, groundOffset + 0.006, -0.065);
  antennaLeft.rotation.z = -0.22; // Outward angle (V-shape)
  antennaLeft.rotation.x = 0.12;
  tagPart(antennaLeft, 'wifi_antennas');
  groupChassis.add(antennaLeft);

  // Right Antenna
  const antennaRight = createAntenna();
  antennaRight.position.set(0.065, groundOffset + 0.006, -0.065);
  antennaRight.rotation.z = 0.22; // Outward angle (V-shape)
  antennaRight.rotation.x = 0.12;
  tagPart(antennaRight, 'wifi_antennas');
  groupChassis.add(antennaRight);

  // Thin black coaxial pigtail cables running through chassis (seen in Photo 3)
  const coaxCurveLeft = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-0.065, groundOffset + 0.004, -0.065),
    new THREE.Vector3(-0.035, groundOffset + 0.015, -0.04),
    new THREE.Vector3(-0.015, groundOffset + 0.045, -0.02)
  );
  const coaxLeft = new THREE.Mesh(new THREE.TubeGeometry(coaxCurveLeft, 12, 0.0007, 4, false), matBlackPlastic);
  tagPart(coaxLeft, 'wifi_antennas');
  groupChassis.add(coaxLeft);

  const coaxCurveRight = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0.065, groundOffset + 0.004, -0.065),
    new THREE.Vector3(0.035, groundOffset + 0.015, -0.04),
    new THREE.Vector3(0.015, groundOffset + 0.045, -0.02)
  );
  const coaxRight = new THREE.Mesh(new THREE.TubeGeometry(coaxCurveRight, 12, 0.0007, 4, false), matBlackPlastic);
  tagPart(coaxRight, 'wifi_antennas');
  groupChassis.add(coaxRight);

  // ----------------------------------------------------
  // 4. WAVESHARE ROS ROBOT CONTROLLER BOARD (LAYER 1)
  // Matte black PCB, white ws logo, power switch, barrel jack
  // ----------------------------------------------------
  const wsBoardY = groundOffset + 0.035;
  const wsPcbGeo = new THREE.BoxGeometry(0.10, 0.002, 0.14);
  const matWsPcb = new THREE.MeshStandardMaterial({
    color: 0x14171a,
    roughness: 0.4,
    metalness: 0.5,
    map: waveshareTexture,
  });
  const wsBoard = new THREE.Mesh(wsPcbGeo, matWsPcb);
  wsBoard.position.set(0, wsBoardY, -0.005);
  wsBoard.castShadow = true;
  tagPart(wsBoard, 'waveshare_board');
  groupWaveshare.add(wsBoard);

  // DC Barrel Power Jack at rear-left corner (5.5mm jack in Photo 4 & 5)
  const barrelJackGeo = new THREE.BoxGeometry(0.009, 0.011, 0.014);
  const barrelJack = new THREE.Mesh(barrelJackGeo, matBlackPlastic);
  barrelJack.position.set(0.038, wsBoardY + 0.006, -0.065);
  tagPart(barrelJack, 'waveshare_board');
  groupWaveshare.add(barrelJack);

  // Slide Power Switch on side edge (Photo 4)
  const powerSwitchGeo = new THREE.BoxGeometry(0.006, 0.006, 0.012);
  const powerSwitch = new THREE.Mesh(powerSwitchGeo, matHeatsinkBlack);
  powerSwitch.position.set(-0.048, wsBoardY + 0.004, -0.035);
  tagPart(powerSwitch, 'waveshare_board');
  groupWaveshare.add(powerSwitch);

  const switchActuator = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.005, 0.004), matChromeSteel);
  switchActuator.position.set(-0.051, wsBoardY + 0.006, -0.035);
  tagPart(switchActuator, 'waveshare_board');
  groupWaveshare.add(switchActuator);

  // White JST-XH 4-pin Header on board edge (Photo 4)
  const jstHeaderGeo = new THREE.BoxGeometry(0.008, 0.007, 0.014);
  const matWhitePlastic = new THREE.MeshStandardMaterial({ color: 0xf5f6fa, roughness: 0.3 });
  const jstHeader = new THREE.Mesh(jstHeaderGeo, matWhitePlastic);
  jstHeader.position.set(-0.048, wsBoardY + 0.005, -0.01);
  tagPart(jstHeader, 'waveshare_board');
  groupWaveshare.add(jstHeader);

  // Small Reset & User Push Buttons (Photo 4 & 5)
  const microBtnGeo = new THREE.BoxGeometry(0.004, 0.003, 0.004);
  const btn1 = new THREE.Mesh(microBtnGeo, matChromeSteel);
  btn1.position.set(-0.042, wsBoardY + 0.002, 0.02);
  tagPart(btn1, 'waveshare_board');
  groupWaveshare.add(btn1);

  const btn2 = new THREE.Mesh(microBtnGeo, matChromeSteel);
  btn2.position.set(-0.042, wsBoardY + 0.002, 0.035);
  tagPart(btn2, 'waveshare_board');
  groupWaveshare.add(btn2);

  // ----------------------------------------------------
  // 5. NVIDIA JETSON NANO DEVELOPER KIT & ACTIVE 40MM FAN (LAYER 2)
  // Exactly matching Photo 1, 2, 4, 5
  // ----------------------------------------------------
  const jetsonY = wsBoardY + 0.022;
  const nanoPcbGeo = new THREE.BoxGeometry(0.10, 0.002, 0.08);
  const matJetsonPcb = new THREE.MeshStandardMaterial({
    color: 0x112217,
    roughness: 0.45,
    metalness: 0.4,
    map: jetsonTexture,
  });
  const jetsonBoard = new THREE.Mesh(nanoPcbGeo, matJetsonPcb);
  jetsonBoard.position.set(0, jetsonY, 0.01);
  jetsonBoard.castShadow = true;
  tagPart(jetsonBoard, 'jetson_nano');
  groupJetsonNano.add(jetsonBoard);

  // 40-Pin Dual-Row GPIO Header
  const gpioBaseGeo = new THREE.BoxGeometry(0.05, 0.006, 0.005);
  const gpioBase = new THREE.Mesh(gpioBaseGeo, matHeatsinkBlack);
  gpioBase.position.set(-0.02, jetsonY + 0.004, -0.025);
  tagPart(gpioBase, 'jetson_nano');
  groupJetsonNano.add(gpioBase);

  // Finned Black Aluminum Heatsink
  const heatsinkBaseGeo = new THREE.BoxGeometry(0.056, 0.012, 0.048);
  const heatsinkMesh = new THREE.Mesh(heatsinkBaseGeo, matHeatsinkBlack);
  heatsinkMesh.position.set(0, jetsonY + 0.008, 0.01);
  heatsinkMesh.castShadow = true;
  tagPart(heatsinkMesh, 'cooling_fan');
  groupJetsonNano.add(heatsinkMesh);

  // Heatsink fins
  const finGeo = new THREE.BoxGeometry(0.0014, 0.006, 0.046);
  for (let i = -7; i <= 7; i++) {
    const fin = new THREE.Mesh(finGeo, matHeatsinkBlack);
    fin.position.set(i * 0.0035, jetsonY + 0.017, 0.01);
    tagPart(fin, 'cooling_fan');
    groupJetsonNano.add(fin);
  }

  // Active 40x40mm Black Square Cooling Fan (Photo 1, 2, 4)
  const coolingFan = new THREE.Group();
  coolingFan.position.set(0, jetsonY + 0.023, 0.01);

  const fanFrameGeo = new THREE.BoxGeometry(0.04, 0.01, 0.04);
  const fanFrame = new THREE.Mesh(fanFrameGeo, matBlackPlastic);
  coolingFan.add(fanFrame);

  // Circular fan duct cutout inside frame
  const fanDuctGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.011, 24);
  const fanDuct = new THREE.Mesh(fanDuctGeo, matHeatsinkBlack);
  coolingFan.add(fanDuct);

  // 4 Corner Mounting Screws on Fan
  const fanScrewGeo = new THREE.CylinderGeometry(0.0015, 0.0015, 0.011, 8);
  [[-0.016, -0.016], [0.016, -0.016], [-0.016, 0.016], [0.016, 0.016]].forEach(([fx, fz]) => {
    const fs = new THREE.Mesh(fanScrewGeo, matChromeSteel);
    fs.position.set(fx, 0, fz);
    coolingFan.add(fs);
  });

  // Fan Hub & 7 Curved Blades
  const fanHubGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.006, 16);
  const fanHub = new THREE.Mesh(fanHubGeo, matBlackPlastic);
  coolingFan.add(fanHub);

  const bladeGeo = new THREE.BoxGeometry(0.0012, 0.004, 0.012);
  for (let b = 0; b < 7; b++) {
    const bMesh = new THREE.Mesh(bladeGeo, matBlackPlastic);
    bMesh.rotation.y = (b / 7) * Math.PI * 2;
    bMesh.position.set(Math.cos(bMesh.rotation.y) * 0.011, 0, Math.sin(bMesh.rotation.y) * 0.011);
    coolingFan.add(bMesh);
  }
  tagPart(coolingFan, 'cooling_fan');
  groupJetsonNano.add(coolingFan);

  // Twisted Red & Black Fan Power Wires (as clearly seen in Photo 1)
  const wireCurveRed = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0.018, jetsonY + 0.023, 0.01),
    new THREE.Vector3(0.03, jetsonY + 0.018, 0.025),
    new THREE.Vector3(0.025, jetsonY + 0.005, 0.035)
  );
  const fanWireRed = new THREE.Mesh(
    new THREE.TubeGeometry(wireCurveRed, 12, 0.0006, 4, false),
    new THREE.MeshStandardMaterial({ color: 0xff3838, roughness: 0.5 })
  );
  tagPart(fanWireRed, 'cooling_fan');
  groupJetsonNano.add(fanWireRed);

  const wireCurveBlack = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0.018, jetsonY + 0.021, 0.01),
    new THREE.Vector3(0.028, jetsonY + 0.016, 0.025),
    new THREE.Vector3(0.025, jetsonY + 0.003, 0.035)
  );
  const fanWireBlack = new THREE.Mesh(
    new THREE.TubeGeometry(wireCurveBlack, 12, 0.0006, 4, false),
    matBlackPlastic
  );
  tagPart(fanWireBlack, 'cooling_fan');
  groupJetsonNano.add(fanWireBlack);

  // Rear I/O Port Stack (4x USB 3.0, HDMI, RJ45 Gigabit Ethernet)
  // 4x USB 3.0 Type A ports (2 stacked pairs with blue plastic tongues - Photo 4)
  const usbPairGeo = new THREE.BoxGeometry(0.015, 0.016, 0.015);
  const usb1 = new THREE.Mesh(usbPairGeo, matChromeSteel);
  usb1.position.set(0.012, jetsonY + 0.009, 0.04);
  tagPart(usb1, 'jetson_nano');
  groupJetsonNano.add(usb1);

  const usb2 = new THREE.Mesh(usbPairGeo, matChromeSteel);
  usb2.position.set(-0.008, jetsonY + 0.009, 0.04);
  tagPart(usb2, 'jetson_nano');
  groupJetsonNano.add(usb2);

  // Blue plastic inserts inside USB ports
  const usbTongueGeo = new THREE.BoxGeometry(0.012, 0.002, 0.006);
  const matUsbBlue = new THREE.MeshStandardMaterial({ color: 0x0984e3 });
  const tongue1 = new THREE.Mesh(usbTongueGeo, matUsbBlue);
  tongue1.position.set(0.012, jetsonY + 0.006, 0.046);
  tagPart(tongue1, 'jetson_nano');
  groupJetsonNano.add(tongue1);

  // RJ45 Gigabit Ethernet Jack with metal shielding (Photo 4)
  const rj45Geo = new THREE.BoxGeometry(0.016, 0.014, 0.016);
  const rj45 = new THREE.Mesh(rj45Geo, matChromeSteel);
  rj45.position.set(0.035, jetsonY + 0.008, 0.04);
  tagPart(rj45, 'jetson_nano');
  groupJetsonNano.add(rj45);

  // HDMI & DisplayPort ports
  const hdmiGeo = new THREE.BoxGeometry(0.015, 0.008, 0.012);
  const hdmi = new THREE.Mesh(hdmiGeo, matChromeSteel);
  hdmi.position.set(-0.028, jetsonY + 0.005, 0.04);
  tagPart(hdmi, 'jetson_nano');
  groupJetsonNano.add(hdmi);

  // ----------------------------------------------------
  // 6. MID-DECK STANDOFF PLATE & AUTHENTIC RPLIDAR A1 (LAYERS 3 & 4)
  // Exactly matching Photo 2, 3, 4, 5:
  // Visible DC motor, exposed rubber drive belt, "RPLIDAR" logo cap
  // ----------------------------------------------------
  const midDeckY = jetsonY + 0.034;
  const midDeckGeo = new THREE.BoxGeometry(0.09, 0.003, 0.11);
  const matMidDeck = new THREE.MeshStandardMaterial({
    color: 0x1f242d,
    roughness: 0.35,
    metalness: 0.6,
  });
  const midDeckPlate = new THREE.Mesh(midDeckGeo, matMidDeck);
  midDeckPlate.position.set(0, midDeckY, 0);
  midDeckPlate.castShadow = true;
  tagPart(midDeckPlate, 'chassis_base');
  groupMidDeck.add(midDeckPlate);

  // 4 Brass Standoffs holding Mid-Deck Plate
  const midStandoffGeo = new THREE.CylinderGeometry(0.0025, 0.0025, 0.032, 6);
  [[-0.038, -0.045], [0.038, -0.045], [-0.038, 0.045], [0.038, 0.045]].forEach(([sx, sz]) => {
    const sp = new THREE.Mesh(midStandoffGeo, matBrass);
    sp.position.set(sx, midDeckY - 0.016, sz);
    tagPart(sp, 'chassis_base');
    groupMidDeck.add(sp);
  });

  // RPLiDAR A1 Teardrop/Triangular Stator Base (Photo 3)
  const lidarBaseY = midDeckY + 0.018;
  const lidarStatorGeo = new THREE.CylinderGeometry(0.044, 0.046, 0.016, 32);
  const lidarStator = new THREE.Mesh(lidarStatorGeo, matBlackPlastic);
  lidarStator.position.set(0, lidarBaseY, 0.012);
  lidarStator.castShadow = true;
  tagPart(lidarStator, 'rplidar_a1');
  groupLidar.add(lidarStator);

  // Teardrop extension for drive motor (seen in Photo 3)
  const teardropGeo = new THREE.BoxGeometry(0.034, 0.015, 0.038);
  const teardrop = new THREE.Mesh(teardropGeo, matBlackPlastic);
  teardrop.position.set(0, lidarBaseY, -0.024);
  tagPart(teardrop, 'rplidar_a1');
  groupLidar.add(teardrop);

  // Silver Cylindrical Drive Motor (clearly visible in Photo 4 & 5)
  const motorCanGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.022, 16);
  const lidarMotorCan = new THREE.Mesh(motorCanGeo, matChromeSteel);
  lidarMotorCan.position.set(0, lidarBaseY, -0.03);
  tagPart(lidarMotorCan, 'lidar_belt_motor');
  groupLidar.add(lidarMotorCan);

  // Motor drive pulley
  const motorPulleyGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.006, 12);
  const motorPulley = new THREE.Mesh(motorPulleyGeo, matBrass);
  motorPulley.position.set(0, lidarBaseY + 0.012, -0.03);
  tagPart(motorPulley, 'lidar_belt_motor');
  groupLidar.add(motorPulley);

  // Exposed Black Rubber Drive Belt (dây curoa cao su - Photo 3)
  const beltCurve = new THREE.Shape();
  beltCurve.moveTo(-0.036, 0.012);
  beltCurve.lineTo(-0.006, -0.03);
  beltCurve.absarc(0, -0.03, 0.006, Math.PI, 0, false);
  beltCurve.lineTo(0.036, 0.012);
  beltCurve.absarc(0, 0.012, 0.036, 0, Math.PI, false);

  const beltGeo = new THREE.TorusGeometry(0.028, 0.0018, 6, 24);
  beltGeo.rotateX(Math.PI / 2);
  const matDriveBelt = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
  const lidarDriveBelt = new THREE.Mesh(beltGeo, matDriveBelt);
  lidarDriveBelt.position.set(0, lidarBaseY + 0.012, -0.006);
  tagPart(lidarDriveBelt, 'lidar_belt_motor');
  groupLidar.add(lidarDriveBelt);

  // RPLiDAR Rotating Turret Rotor (Turret Rotor)
  const lidarRotor = new THREE.Group();
  lidarRotor.position.set(0, lidarBaseY + 0.018, 0.012);

  const rotorCylinderGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.022, 32);
  const rotorCylinder = new THREE.Mesh(rotorCylinderGeo, matBlackPlastic);
  rotorCylinder.castShadow = true;
  lidarRotor.add(rotorCylinder);

  // Top Cap with authentic "RPLIDAR" logo texture (Photo 3)
  const capGeo = new THREE.CircleGeometry(0.0418, 32);
  capGeo.rotateX(-Math.PI / 2);
  const matRplidarCap = new THREE.MeshStandardMaterial({
    map: rplidarTopTexture,
    roughness: 0.35,
    metalness: 0.2,
  });
  const topCap = new THREE.Mesh(capGeo, matRplidarCap);
  topCap.position.y = 0.0112;
  lidarRotor.add(topCap);

  // Optical laser emitter slit (Red laser lens)
  const lensGeo = new THREE.BoxGeometry(0.012, 0.008, 0.004);
  const matLaserLens = new THREE.MeshStandardMaterial({
    color: 0xff1e1e,
    emissive: 0xff0000,
    emissiveIntensity: 0.95,
  });
  const emitterLens = new THREE.Mesh(lensGeo, matLaserLens);
  emitterLens.position.set(0, 0, 0.041);
  lidarRotor.add(emitterLens);

  // Optical receiver slit (Dark glass)
  const receiverLens = new THREE.Mesh(lensGeo, matHeatsinkBlack);
  receiverLens.position.set(0, 0, -0.041);
  lidarRotor.add(receiverLens);

  tagPart(lidarRotor, 'rplidar_a1');
  groupLidar.add(lidarRotor);

  // Visual 360° LiDAR scanning disc
  const laserBeamGeo = new THREE.RingGeometry(0.045, 4.5, 64);
  laserBeamGeo.rotateX(-Math.PI / 2);
  const matLaserDisc = new THREE.MeshBasicMaterial({
    color: 0xff2222,
    transparent: true,
    opacity: 0.16,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const lidarLaserBeam = new THREE.Mesh(laserBeamGeo, matLaserDisc);
  lidarLaserBeam.position.set(0, lidarBaseY + 0.018, 0.012);
  groupLidar.add(lidarLaserBeam);

  // ----------------------------------------------------
  // 7. FRONT CSI CAMERA & GREEN ANODIZED BRACKET (PHOTO 2 & 4)
  // Exactly matching the custom green bracket, thumbscrew hinge,
  // and looping white FFC ribbon cable!
  // ----------------------------------------------------
  const cameraGroup = new THREE.Group();
  cameraGroup.position.set(0, groundOffset + 0.007, 0.092); // Front of green chassis

  // Green Anodized Aluminum Bracket Base (bolted to chassis)
  const camBaseGeo = new THREE.BoxGeometry(0.038, 0.002, 0.024);
  const camBase = new THREE.Mesh(camBaseGeo, matGreenAnodized);
  camBase.position.set(0, 0.001, 0);
  tagPart(camBase, 'csi_camera');
  cameraGroup.add(camBase);

  // 2 Silver Screws securing bracket to green chassis
  const camScrew1 = new THREE.Mesh(screwGeo, matChromeSteel);
  camScrew1.position.set(-0.012, 0.0025, 0);
  tagPart(camScrew1, 'csi_camera');
  cameraGroup.add(camScrew1);
  const camScrew2 = new THREE.Mesh(screwGeo, matChromeSteel);
  camScrew2.position.set(0.012, 0.0025, 0);
  tagPart(camScrew2, 'csi_camera');
  cameraGroup.add(camScrew2);

  // Rising Angled Bracket Arm (stylized green aluminum arm)
  const camArmGeo = new THREE.BoxGeometry(0.028, 0.048, 0.003);
  const camArm = new THREE.Mesh(camArmGeo, matGreenAnodized);
  camArm.position.set(0, 0.024, 0.006);
  camArm.rotation.x = -0.15; // Angled forward
  tagPart(camArm, 'csi_camera');
  cameraGroup.add(camArm);

  // Top Swivel Hinge Fork with Knurled Silver Thumbscrew (Photo 2)
  const hingeForkGeo = new THREE.BoxGeometry(0.032, 0.012, 0.012);
  const hingeFork = new THREE.Mesh(hingeForkGeo, matGreenAnodized);
  hingeFork.position.set(0, 0.048, 0.01);
  tagPart(hingeFork, 'csi_camera');
  cameraGroup.add(hingeFork);

  // Knurled thumbscrew on the side of the hinge (seen in Photo 2)
  const thumbScrewGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.006, 12);
  thumbScrewGeo.rotateZ(Math.PI / 2);
  const thumbScrew = new THREE.Mesh(thumbScrewGeo, matChromeSteel);
  thumbScrew.position.set(0.018, 0.048, 0.01);
  tagPart(thumbScrew, 'csi_camera');
  cameraGroup.add(thumbScrew);

  // Camera Tilt Head (Hinged IMX219 sensor board)
  const camHead = new THREE.Group();
  camHead.position.set(0, 0.048, 0.012);
  camHead.rotation.x = 0.08; // slightly pointed downward for road vision

  // Black Camera PCB
  const camPcb = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.025, 0.002), matBlackPlastic);
  camHead.add(camPcb);

  // Camera Lens Barrel & Glass
  const lensBarrelGeo = new THREE.CylinderGeometry(0.0065, 0.0075, 0.012, 24);
  lensBarrelGeo.rotateX(Math.PI / 2);
  const lensBarrel = new THREE.Mesh(lensBarrelGeo, matHeatsinkBlack);
  lensBarrel.position.set(0, 0, 0.007);
  camHead.add(lensBarrel);

  const glassGeo = new THREE.SphereGeometry(0.005, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const matOpticalGlass = new THREE.MeshPhysicalMaterial({
    color: 0x0abde3,
    transmission: 0.92,
    roughness: 0.05,
    ior: 1.52,
    transparent: true,
  });
  const glassLens = new THREE.Mesh(glassGeo, matOpticalGlass);
  glassLens.position.set(0, 0, 0.013);
  glassLens.rotation.x = Math.PI / 2;
  camHead.add(glassLens);
  tagPart(camHead, 'csi_camera');
  cameraGroup.add(camHead);

  // Tall Arching White FFC Ribbon Cable (Photo 2 & 4)
  // Looping up in a graceful curve from the camera connector back down into Jetson CSI port!
  const ribbonCurve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, 0.052, 0.01),   // camera connector
    new THREE.Vector3(0, 0.11, 0.015),   // high loop top
    new THREE.Vector3(0, 0.09, -0.045),  // curving back
    new THREE.Vector3(0, jetsonY + 0.005, -0.015) // Jetson CSI connector
  );

  const ribbonGeo = new THREE.TubeGeometry(ribbonCurve, 32, 0.008, 2, false);
  const matCameraRibbon = new THREE.MeshStandardMaterial({
    map: cameraRibbonTexture,
    roughness: 0.4,
    side: THREE.DoubleSide,
  });
  const ribbonCable = new THREE.Mesh(ribbonGeo, matCameraRibbon);
  tagPart(ribbonCable, 'camera_ribbon');
  cameraGroup.add(ribbonCable);

  groupCamera.add(cameraGroup);

  // ----------------------------------------------------
  // 8. RAINBOW GPIO JUMPER WIRE BUNDLE & BREADBOARD (PHOTO 1)
  // The high arching rainbow jumper wires seen in Photo 1!
  // ----------------------------------------------------
  const wireColors = [0xff793f, 0xf1c40f, 0x2ed573, 0x1e90ff, 0x9b59b6, 0xe74c3c];
  for (let w = 0; w < 6; w++) {
    const spreadX = (w - 2.5) * 0.006;
    const peakH = 0.075 + (w % 3) * 0.015;
    const curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-0.025 + spreadX, jetsonY + 0.006, -0.025), // GPIO header
      new THREE.Vector3(-0.03 + spreadX * 1.5, jetsonY + peakH, -0.04), // High arch
      new THREE.Vector3(0.025 + spreadX, jetsonY + peakH * 0.9, -0.05),
      new THREE.Vector3(0.03 + spreadX, jetsonY + 0.015, -0.03) // breadboard / sensor
    );
    const wireMesh = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 16, 0.0007, 4, false),
      new THREE.MeshStandardMaterial({ color: wireColors[w % wireColors.length], roughness: 0.5 })
    );
    tagPart(wireMesh, 'rainbow_wires');
    groupPeripherals.add(wireMesh);
  }

  // Mini Breadboard & Tactile Button on Expansion Area
  const breadboardGeo = new THREE.BoxGeometry(0.04, 0.008, 0.032);
  const matBreadboard = new THREE.MeshStandardMaterial({ color: 0xf8f9fa, roughness: 0.6 });
  const breadboard = new THREE.Mesh(breadboardGeo, matBreadboard);
  breadboard.position.set(0.032, wsBoardY + 0.008, -0.035);
  tagPart(breadboard, 'breadboard_module');
  groupPeripherals.add(breadboard);

  // Clickable Red Tactile Button
  const btnBase = new THREE.Mesh(new THREE.BoxGeometry(0.007, 0.004, 0.007), matChromeSteel);
  btnBase.position.set(0.032, wsBoardY + 0.014, -0.035);
  tagPart(btnBase, 'breadboard_module');
  groupPeripherals.add(btnBase);

  const breadboardButton = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0025, 0.0025, 0.004, 12),
    new THREE.MeshStandardMaterial({ color: 0xff3838, roughness: 0.3 })
  );
  breadboardButton.position.set(0.032, wsBoardY + 0.017, -0.035);
  tagPart(breadboardButton, 'breadboard_module');
  groupPeripherals.add(breadboardButton);

  // TM1637 7-Segment Display Module
  const { texture: tm1637Tex, updateText: updateTM1637Text } = createTM1637Texture('2026');
  const tm1637PcbGeo = new THREE.BoxGeometry(0.042, 0.022, 0.002);
  const tm1637Pcb = new THREE.Mesh(tm1637PcbGeo, matBlackPlastic);
  tm1637Pcb.position.set(-0.065, groundOffset + 0.065, 0.02);
  tm1637Pcb.rotation.y = -Math.PI / 2;
  tagPart(tm1637Pcb, 'tm1637_display');
  groupPeripherals.add(tm1637Pcb);

  const tm1637Screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.038, 0.016),
    new THREE.MeshBasicMaterial({ map: tm1637Tex })
  );
  tm1637Screen.position.set(-0.0665, groundOffset + 0.065, 0.02);
  tm1637Screen.rotation.y = -Math.PI / 2;
  tagPart(tm1637Screen, 'tm1637_display');
  groupPeripherals.add(tm1637Screen);

  // ----------------------------------------------------
  // 9. SOFT RADIAL CONTACT SHADOW PLANE
  // ----------------------------------------------------
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 128;
  shadowCanvas.height = 128;
  const sCtx = shadowCanvas.getContext('2d')!;
  const grad = sCtx.createRadialGradient(64, 64, 10, 64, 64, 62);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
  grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  sCtx.fillStyle = grad;
  sCtx.fillRect(0, 0, 128, 128);

  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  const contactShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.26, 0.28).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
      opacity: 0.8,
      polygonOffset: true,
      polygonOffsetFactor: -1,
    })
  );
  contactShadow.position.set(0, 0.001, 0);
  root.add(contactShadow);

  // ----------------------------------------------------
  // EXPLODED VIEW INTERPOLATION
  // ----------------------------------------------------
  const updateExplodedView = (progress: number) => {
    groupLidar.position.y = progress * 0.14;
    groupMidDeck.position.y = progress * 0.095;
    groupJetsonNano.position.y = progress * 0.06;
    groupWaveshare.position.y = progress * 0.03;
    groupPeripherals.position.y = progress * 0.07;
    groupCamera.position.z = progress * 0.05;
    groupCamera.position.y = progress * 0.02;

    leftWheel.position.x = -wheelBase * 0.5 - progress * 0.045;
    rightWheel.position.x = wheelBase * 0.5 + progress * 0.045;
  };

  return {
    root,
    leftWheel,
    rightWheel,
    casterAssembly,
    lidarRotor,
    lidarDriveBelt,
    lidarLaserBeam,
    coolingFan,
    breadboardButton,
    tm1637Updater: updateTM1637Text,
    updateExplodedView,
    contactShadow,
    cameraGroup,
    antennaLeft,
    antennaRight,
    partRoots,
  };
}
