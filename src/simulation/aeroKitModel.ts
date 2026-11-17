import * as THREE from 'three';
import { AeroParameters, AeroForces } from '../types/jetbot';

export interface AeroKitComponents {
  root: THREE.Group;
  wingPivotGroup: THREE.Group;
  leftAileron: THREE.Mesh;
  rightAileron: THREE.Mesh;
  horizontalStabilizer: THREE.Group;
  elevator: THREE.Mesh;
  verticalFin: THREE.Group;
  rudder: THREE.Mesh;
  pitotTube: THREE.Group;
  jetTurbineLeft: THREE.Mesh;
  jetTurbineRight: THREE.Mesh;

  // Force vector visualization arrows
  forceVectorGroup: THREE.Group;
  liftArrow: THREE.ArrowHelper;
  dragArrow: THREE.ArrowHelper;
  resultantArrow: THREE.ArrowHelper;
  momentRing: THREE.Mesh;

  updateAeroPose: (params: AeroParameters, forces: AeroForces) => void;
  setVisible: (visible: boolean) => void;
}

/**
 * Creates 3D Aerodynamic Kit with carbon fiber wings, movable control surfaces,
 * tail stabilizers, pitot tube, and 3D force vectors
 */
export function createAeroKitModel(): AeroKitComponents {
  const root = new THREE.Group();
  root.name = 'JetBox_AeroKit';

  // Materials
  const matCarbonFiber = new THREE.MeshStandardMaterial({
    color: 0x1a1c22,
    roughness: 0.35,
    metalness: 0.8,
  });

  const matAeroAccent = new THREE.MeshStandardMaterial({
    color: 0x00d2d3, // Cyan aerodynamic accent trim
    roughness: 0.25,
    metalness: 0.7,
  });

  const matChrome = new THREE.MeshStandardMaterial({
    color: 0xdfe4ea,
    roughness: 0.1,
    metalness: 0.95,
  });

  const matControlSurface = new THREE.MeshStandardMaterial({
    color: 0x2f3542,
    roughness: 0.4,
    metalness: 0.6,
  });

  // 1. MAIN WING ASSEMBLY (Pivoting with Angle of Attack)
  const wingPivotGroup = new THREE.Group();
  wingPivotGroup.position.set(0, 0.12, 0); // Positioned above JetBox chassis
  root.add(wingPivotGroup);

  // Carbon Wing mount pylon
  const pylonGeo = new THREE.BoxGeometry(0.02, 0.04, 0.06);
  const pylon = new THREE.Mesh(pylonGeo, matCarbonFiber);
  pylon.position.set(0, -0.02, 0);
  wingPivotGroup.add(pylon);

  // Procedural NACA Airfoil Wing Profile using ExtrudeGeometry
  const wingShape = new THREE.Shape();
  // Airfoil curve from leading edge (0,0) to trailing edge (chord, 0)
  const chordLength = 0.16;
  const maxThickness = 0.022;

  wingShape.moveTo(0, 0);
  // Upper surface (convex suction side)
  wingShape.bezierCurveTo(
    -chordLength * 0.05, maxThickness * 0.8,
    chordLength * 0.3, maxThickness,
    chordLength * 0.75, 0.002
  );
  // Trailing edge
  wingShape.lineTo(chordLength * 0.75, -0.002);
  // Lower surface (pressure side)
  wingShape.bezierCurveTo(
    chordLength * 0.3, -maxThickness * 0.2,
    -chordLength * 0.02, -maxThickness * 0.1,
    0, 0
  );

  const halfSpan = 0.32; // Default half wingspan = 0.32m (total 0.64m)
  const wingExtrudeSettings = {
    steps: 1,
    depth: halfSpan,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.004,
    bevelSegments: 3,
  };

  // Left wing half
  const leftWingGeo = new THREE.ExtrudeGeometry(wingShape, wingExtrudeSettings);
  leftWingGeo.rotateY(Math.PI / 2);
  leftWingGeo.translate(0, 0, -chordLength * 0.25); // Center on 25% aerodynamic center
  const leftWing = new THREE.Mesh(leftWingGeo, matCarbonFiber);
  leftWing.castShadow = true;
  wingPivotGroup.add(leftWing);

  // Right wing half
  const rightWingGeo = new THREE.ExtrudeGeometry(wingShape, wingExtrudeSettings);
  rightWingGeo.rotateY(-Math.PI / 2);
  rightWingGeo.translate(0, 0, -chordLength * 0.25);
  const rightWing = new THREE.Mesh(rightWingGeo, matCarbonFiber);
  rightWing.castShadow = true;
  wingPivotGroup.add(rightWing);

  // Wingtip Endplates / Winglets
  const wingletGeo = new THREE.BoxGeometry(0.004, 0.06, 0.18);
  const leftWinglet = new THREE.Mesh(wingletGeo, matAeroAccent);
  leftWinglet.position.set(-halfSpan - 0.004, 0.02, 0);
  wingPivotGroup.add(leftWinglet);

  const rightWinglet = new THREE.Mesh(wingletGeo, matAeroAccent);
  rightWinglet.position.set(halfSpan + 0.004, 0.02, 0);
  wingPivotGroup.add(rightWinglet);

  // Trailing Edge Ailerons / Flaps (Hinged)
  const aileronGeo = new THREE.BoxGeometry(0.24, 0.004, 0.035);
  const leftAileron = new THREE.Mesh(aileronGeo, matControlSurface);
  leftAileron.position.set(-halfSpan * 0.55, 0, -chordLength * 0.55);
  wingPivotGroup.add(leftAileron);

  const rightAileron = new THREE.Mesh(aileronGeo, matControlSurface);
  rightAileron.position.set(halfSpan * 0.55, 0, -chordLength * 0.55);
  wingPivotGroup.add(rightAileron);

  // 2. EMPENNAGE / TAIL ASSEMBLY
  const tailGroup = new THREE.Group();
  tailGroup.position.set(0, 0.10, -0.20); // Mounted on rear tail boom
  root.add(tailGroup);

  // Tail Boom Standoffs
  const boomGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.16, 8);
  boomGeo.rotateX(Math.PI / 2);
  const boom = new THREE.Mesh(boomGeo, matCarbonFiber);
  boom.position.set(0, 0, 0.08);
  tailGroup.add(boom);

  // Vertical Fin
  const verticalFin = new THREE.Group();
  const finGeo = new THREE.BoxGeometry(0.004, 0.09, 0.09);
  const finMesh = new THREE.Mesh(finGeo, matCarbonFiber);
  finMesh.position.set(0, 0.045, 0);
  verticalFin.add(finMesh);

  // Rudder
  const rudderGeo = new THREE.BoxGeometry(0.003, 0.085, 0.03);
  const rudder = new THREE.Mesh(rudderGeo, matAeroAccent);
  rudder.position.set(0, 0.045, -0.05);
  verticalFin.add(rudder);
  tailGroup.add(verticalFin);

  // Horizontal Stabilizer
  const horizontalStabilizer = new THREE.Group();
  horizontalStabilizer.position.set(0, 0.085, 0); // T-Tail mounted at top of fin

  const horizStabGeo = new THREE.BoxGeometry(0.26, 0.004, 0.07);
  const horizStabMesh = new THREE.Mesh(horizStabGeo, matCarbonFiber);
  horizontalStabilizer.add(horizStabMesh);

  // Elevator
  const elevatorGeo = new THREE.BoxGeometry(0.24, 0.003, 0.025);
  const elevator = new THREE.Mesh(elevatorGeo, matControlSurface);
  elevator.position.set(0, 0, -0.045);
  horizontalStabilizer.add(elevator);
  tailGroup.add(horizontalStabilizer);

  // 3. PITOT-STATIC AIRSPEED TUBE
  const pitotTube = new THREE.Group();
  pitotTube.position.set(0, 0.09, 0.16); // Mounted forward into clean air
  const pitotShaftGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.08, 8);
  pitotShaftGeo.rotateX(Math.PI / 2);
  const pitotShaft = new THREE.Mesh(pitotShaftGeo, matChrome);
  pitotTube.add(pitotShaft);

  const pitotTipGeo = new THREE.ConeGeometry(0.003, 0.012, 8);
  pitotTipGeo.rotateX(Math.PI / 2);
  const pitotTip = new THREE.Mesh(pitotTipGeo, matChrome);
  pitotTip.position.set(0, 0, 0.045);
  pitotTube.add(pitotTip);
  root.add(pitotTube);

  // 4. JET PROPULSION TURBINE NACELLES
  const turbineGeo = new THREE.CylinderGeometry(0.016, 0.014, 0.07, 16);
  turbineGeo.rotateX(Math.PI / 2);
  const matTurbine = new THREE.MeshStandardMaterial({
    color: 0x1e272e,
    metalness: 0.9,
    roughness: 0.2,
  });

  const jetTurbineLeft = new THREE.Mesh(turbineGeo, matTurbine);
  jetTurbineLeft.position.set(-0.09, 0.08, -0.06);
  root.add(jetTurbineLeft);

  const jetTurbineRight = new THREE.Mesh(turbineGeo, matTurbine);
  jetTurbineRight.position.set(0.09, 0.08, -0.06);
  root.add(jetTurbineRight);

  // 5. 3D FORCE VECTOR VISUALIZATION ARROWS
  const forceVectorGroup = new THREE.Group();
  forceVectorGroup.position.set(0, 0.14, 0); // Anchored at Aerodynamic Center
  root.add(forceVectorGroup);

  // Lift Vector: Green arrow pointing upwards (+Y)
  const liftDir = new THREE.Vector3(0, 1, 0);
  const liftArrow = new THREE.ArrowHelper(liftDir, new THREE.Vector3(0, 0, 0), 0.2, 0x2ed573, 0.04, 0.02);
  forceVectorGroup.add(liftArrow);

  // Drag Vector: Red arrow pointing backward (-Z)
  const dragDir = new THREE.Vector3(0, 0, -1);
  const dragArrow = new THREE.ArrowHelper(dragDir, new THREE.Vector3(0, 0, 0), 0.15, 0xff4757, 0.04, 0.02);
  forceVectorGroup.add(dragArrow);

  // Resultant Aerodynamic Force Vector: Cyan arrow
  const resDir = new THREE.Vector3(0, 1, -0.3).normalize();
  const resultantArrow = new THREE.ArrowHelper(resDir, new THREE.Vector3(0, 0, 0), 0.25, 0x00d2d3, 0.04, 0.02);
  forceVectorGroup.add(resultantArrow);

  // Pitching Moment Torus Ring
  const momentRingGeo = new THREE.TorusGeometry(0.04, 0.003, 8, 24, Math.PI * 1.5);
  momentRingGeo.rotateY(Math.PI / 2);
  const matMoment = new THREE.MeshBasicMaterial({
    color: 0xa55eea,
    transparent: true,
    opacity: 0.85,
  });
  const momentRing = new THREE.Mesh(momentRingGeo, matMoment);
  momentRing.position.set(0, 0, 0);
  forceVectorGroup.add(momentRing);

  // Pose and force vector updater
  const updateAeroPose = (params: AeroParameters, forces: AeroForces) => {
    // 1. Physical wing tilt corresponding to angle of attack alpha
    const alphaRad = (params.angleOfAttack * Math.PI) / 180;
    wingPivotGroup.rotation.x = -alphaRad;

    // 2. Flap & Aileron deflections
    const flapRad = (params.flapDeflection * Math.PI) / 180;
    leftAileron.rotation.x = flapRad * 0.7;
    rightAileron.rotation.x = flapRad * 0.7;

    // 3. Elevator deflection on horizontal stabilizer
    const elevRad = (params.elevatorDeflection * Math.PI) / 180;
    elevator.rotation.x = -elevRad;

    // 4. Rudder deflection on vertical fin
    const rudRad = (params.rudderDeflection * Math.PI) / 180;
    rudder.rotation.y = -rudRad;

    // 5. Update Force Vectors
    forceVectorGroup.visible = params.showForceVectors;
    if (params.showForceVectors) {
      // Scale lengths proportional to force in Newtons
      // Normalize with max scale for aesthetics
      const liftMag = Math.max(0.02, Math.min(0.8, Math.abs(forces.liftForceN) * 0.02));
      const dragMag = Math.max(0.02, Math.min(0.6, Math.abs(forces.dragForceN) * 0.02));

      // Lift arrow orientation (perpendicular to relative wind)
      const liftSign = forces.liftForceN >= 0 ? 1 : -1;
      liftArrow.setLength(liftMag, 0.04, 0.02);
      liftArrow.setDirection(new THREE.Vector3(0, liftSign, 0));

      // Drag arrow orientation (parallel to relative wind)
      dragArrow.setLength(dragMag, 0.04, 0.02);
      dragArrow.setDirection(new THREE.Vector3(0, 0, -1));

      // Resultant vector: L + D
      const resVector = new THREE.Vector3(0, forces.liftForceN, -forces.dragForceN);
      const resLength = Math.max(0.03, Math.min(0.9, resVector.length() * 0.02));
      if (resVector.lengthSq() > 0.0001) {
        resVector.normalize();
        resultantArrow.setDirection(resVector);
        resultantArrow.setLength(resLength, 0.05, 0.025);
      }

      // Moment ring scale & rotation direction
      const momentSign = forces.pitchingMomentNm >= 0 ? 1 : -1;
      momentRing.rotation.x = momentSign > 0 ? 0 : Math.PI;
      const momentScale = Math.max(0.5, Math.min(2.0, Math.abs(forces.pitchingMomentNm) * 5.0 + 0.5));
      momentRing.scale.set(momentScale, momentScale, momentScale);
    }
  };

  const setVisible = (visible: boolean) => {
    root.visible = visible;
  };

  return {
    root,
    wingPivotGroup,
    leftAileron,
    rightAileron,
    horizontalStabilizer,
    elevator,
    verticalFin,
    rudder,
    pitotTube,
    jetTurbineLeft,
    jetTurbineRight,
    forceVectorGroup,
    liftArrow,
    dragArrow,
    resultantArrow,
    momentRing,
    updateAeroPose,
    setVisible,
  };
}
