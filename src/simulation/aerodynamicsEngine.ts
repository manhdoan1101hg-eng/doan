import { AeroParameters, AeroForces, AirfoilType } from '../types/jetbot';

/**
 * Advanced Aerodynamics Physics Engine for JetBox
 * Implements finite wing lifting line theory, induced drag, Kirchhoff stall modeling,
 * tailplane longitudinal stability, pitching/yawing/rolling moments, and Reynolds effects.
 */

// Viscosity of standard air at 15°C (Pa*s)
const AIR_DYNAMIC_VISCOSITY = 1.81e-5;
const SPEED_OF_SOUND = 340.29; // m/s

export class AerodynamicsEngine {
  /**
   * Air density based on barometric formula: rho(h) = rho0 * exp(-h / H)
   */
  public static calculateAirDensityAtAltitude(altitudeMeters: number, seaLevelDensity = 1.225): number {
    const scaleHeight = 8500; // meters
    return seaLevelDensity * Math.exp(-altitudeMeters / scaleHeight);
  }

  /**
   * Zero-lift angle and pitching moment coefficient per airfoil
   */
  private static getAirfoilBaseProperties(airfoil: AirfoilType, customCamberPercent: number) {
    let alpha0Deg = 0;
    let cm0 = 0;
    let cd0 = 0.025; // base profile drag
    let clMaxBase = 1.35;

    switch (airfoil) {
      case 'naca0012':
        alpha0Deg = 0;
        cm0 = 0;
        cd0 = 0.022;
        clMaxBase = 1.30;
        break;
      case 'naca2412':
        alpha0Deg = -2.1;
        cm0 = -0.045;
        cd0 = 0.026;
        clMaxBase = 1.45;
        break;
      case 'clark_y':
        alpha0Deg = -3.8;
        cm0 = -0.082;
        cd0 = 0.032;
        clMaxBase = 1.60;
        break;
      case 'supercritical':
        alpha0Deg = -2.6;
        cm0 = -0.065;
        cd0 = 0.020;
        clMaxBase = 1.50;
        break;
    }

    // Adjust for custom camber addition
    alpha0Deg -= customCamberPercent * 1.0;
    cm0 -= customCamberPercent * 0.02;
    clMaxBase += customCamberPercent * 0.08;

    return { alpha0Deg, cm0, cd0, clMaxBase };
  }

  /**
   * Main aerodynamic evaluation
   */
  public static compute(params: AeroParameters): AeroForces {
    const v = Math.max(0, params.airspeed);
    const alphaDeg = params.angleOfAttack;
    const alphaRad = (alphaDeg * Math.PI) / 180;
    const rho = params.airDensity;

    // Wing geometry
    const b = Math.max(0.2, params.wingSpan);
    const c = Math.max(0.05, params.wingChord);
    const S = b * c; // Wing area (m^2)
    const AR = (b * b) / S; // Aspect ratio
    const oswald_e = 0.85; // Oswald wing efficiency factor

    // Dynamic Pressure: q = 0.5 * rho * v^2
    const q = 0.5 * rho * v * v;

    // Airfoil characteristics
    const { alpha0Deg, cm0, cd0, clMaxBase } = this.getAirfoilBaseProperties(
      params.airfoil,
      params.wingCamber
    );

    // Flap effect: increase lift & camber
    const flapRad = (params.flapDeflection * Math.PI) / 180;
    const deltaClFlap = 0.032 * params.flapDeflection;
    const deltaCdFlap = 0.0016 * params.flapDeflection + 0.00008 * (params.flapDeflection ** 2);

    // 3D Wing Lift Slope (Helmbold / Polhamus equation)
    // a = a0 / (1 + a0 / (pi * AR)) where a0 = 2*pi per radian (~0.11 per degree)
    const a0_perRad = 2 * Math.PI;
    const liftSlope_perRad = a0_perRad / (1 + (2 / AR));
    const liftSlope_perDeg = (liftSlope_perRad * Math.PI) / 180;

    // Stall mechanics (Kirchhoff separation model)
    const alphaStallDeg = 15.0 + (params.flapDeflection > 10 ? -2.0 : 0);
    const alpha0Rad = (alpha0Deg * Math.PI) / 180;
    const effectiveAlphaDeg = alphaDeg - alpha0Deg;

    let cl = 0;
    let isStalled = false;
    let stallProgress = 0;

    if (Math.abs(effectiveAlphaDeg) < alphaStallDeg) {
      // Linear attached flow region
      cl = liftSlope_perDeg * effectiveAlphaDeg + deltaClFlap;
      stallProgress = Math.max(0, (Math.abs(effectiveAlphaDeg) - 10) / (alphaStallDeg - 10)) * 0.3;
    } else {
      // Stall region with progressive flow separation
      isStalled = true;
      const overStall = Math.abs(effectiveAlphaDeg) - alphaStallDeg;
      stallProgress = Math.min(1.0, 0.3 + overStall / 10.0);

      const sign = effectiveAlphaDeg >= 0 ? 1 : -1;
      const clPeak = (clMaxBase + deltaClFlap) * sign;

      // Post-stall lift decay with flat-plate crossflow 2*sin(alpha)*cos(alpha)
      const postStallCl = 2 * Math.sin(alphaRad) * Math.cos(alphaRad);
      cl = clPeak * (1 - stallProgress) + postStallCl * stallProgress;
    }

    // Induced Drag: C_Di = C_L^2 / (pi * e * AR)
    const cdi = (cl * cl) / (Math.PI * oswald_e * AR);

    // Parasite and Separation Drag
    const cdParasite = cd0 + deltaCdFlap;
    let cdSeparation = 0;
    if (isStalled) {
      // High separation drag beyond stall: 1.8 * sin^2(alpha)
      cdSeparation = 1.8 * Math.pow(Math.sin(alphaRad), 2) * stallProgress;
    }

    const cd = cdParasite + cdi + cdSeparation;

    // Pitching Moment (Longitudinal stability with Horizontal Tail)
    // Horizontal tail calculation
    const St = Math.max(0.01, params.horizontalTailArea);
    const lt = Math.max(0.1, params.tailMomentArm);
    const Vh = (St * lt) / (S * c); // Tail volume coefficient

    // Downwash angle from wing: epsilon = 2 * C_L / (pi * AR)
    const downwashRad = (2 * cl) / (Math.PI * AR);
    const downwashDeg = (downwashRad * 180) / Math.PI;

    // Tail lift with elevator deflection
    const tailAlphaDeg = alphaDeg - downwashDeg - 1.5; // -1.5 deg incidence
    const tailLiftSlope = 0.07; // ~0.07 per deg for flat tailplane
    const elevatorEffectiveness = 0.55;
    const clTail = tailLiftSlope * (tailAlphaDeg + elevatorEffectiveness * params.elevatorDeflection);

    // Wing moment about AC + CG offset effect + tail stabilizer restoring moment
    // Assume CG is at 0.28c (static margin ~3%)
    const xCg = 0.28;
    const xAc = 0.25;
    const cmWing = cm0 + cl * (xCg - xAc) - 0.05 * (params.flapDeflection / 40);
    const cmTail = -Vh * clTail;
    const cmTotal = cmWing + cmTail;

    // Force calculations
    const liftForceN = q * S * cl;
    const dragForceN = q * S * cd;
    const pitchingMomentNm = q * S * c * cmTotal;

    // Yawing moment from vertical fin & rudder (Directional stability)
    const rudderRad = (params.rudderDeflection * Math.PI) / 180;
    const yawingMomentNm = -q * St * lt * 0.45 * Math.sin(rudderRad);

    // Rolling moment (subtle aileron / dihedral effect)
    const rollingMomentNm = q * S * b * 0.015 * Math.sin(alphaRad);

    // Lift to Drag ratio (aerodynamic efficiency)
    const liftToDragRatio = cd > 0.0001 ? liftForceN / dragForceN : 0;

    // Reynolds and Mach numbers
    const reynoldsNumber = (rho * v * c) / AIR_DYNAMIC_VISCOSITY;
    const machNumber = v / SPEED_OF_SOUND;

    return {
      dynamicPressure: q,
      liftCoeff: cl,
      dragCoeff: cd,
      parasiteDragCoeff: cdParasite,
      inducedDragCoeff: cdi,
      momentCoeff: cmTotal,
      liftForceN,
      dragForceN,
      pitchingMomentNm,
      yawingMomentNm,
      rollingMomentNm,
      liftToDragRatio,
      isStalled,
      stallProgress,
      reynoldsNumber,
      machNumber,
    };
  }

  /**
   * Generates polar curve coordinates for plotting C_L vs Alpha and C_D vs Alpha
   */
  public static generatePolarCurve(params: AeroParameters): Array<{ alpha: number; cl: number; cd: number }> {
    const points: Array<{ alpha: number; cl: number; cd: number }> = [];
    for (let a = -15; a <= 35; a += 1.0) {
      const res = this.compute({
        ...params,
        angleOfAttack: a,
        airspeed: 25.0, // test baseline airspeed for dimensionless coeffs
      });
      points.push({
        alpha: a,
        cl: res.liftCoeff,
        cd: res.dragCoeff,
      });
    }
    return points;
  }
}
