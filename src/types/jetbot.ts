export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface MotorSpeeds {
  left: number;   // -1.0 to 1.0
  right: number;  // -1.0 to 1.0
}

export interface JetBotKinematics {
  x: number;
  z: number;
  yaw: number;           // radians
  linearVelocity: number; // m/s
  angularVelocity: number; // rad/s
  leftMotorSpeed: number;
  rightMotorSpeed: number;
  leftWheelAngle: number;
  rightWheelAngle: number;
  casterAngle: number;
  isMoving: boolean;
}

export interface LidarScanPoint {
  angle: number;      // radians (0 to 2*PI)
  distance: number;   // meters (0.15 to 12.0)
  intensity: number;  // 0 to 255
  x: number;          // relative x in robot frame
  z: number;          // relative z in robot frame
}

export interface LidarData {
  ranges: number[];      // 360 distance samples (meters)
  points: LidarScanPoint[];
  rpm: number;           // ~600 RPM (10 Hz)
  closestDistance: number;
  closestAngle: number;
}

export interface VisionDetection {
  id: string;
  label: string;
  confidence: number;
  box: { x: number; y: number; width: number; height: number }; // normalized 0..1
  distanceMeters: number;
}

export type DriveMode = 'manual' | 'lidar_avoidance' | 'line_follower' | 'circle_patrol';

export type CameraViewMode = 'orbit' | 'chase' | 'csi_fpv' | 'top_down';

export interface JetBotConfig {
  linearSpeedScale: number;  // default 0.5 (from launch file)
  angularSpeedScale: number; // default 1.0 (from launch file)
  wheelBase: number;         // distance between wheels ~0.14m
  wheelRadius: number;       // wheel radius ~0.032m
  maxLinearSpeed: number;    // ~0.8 m/s
  maxAngularSpeed: number;   // ~3.0 rad/s
  tm1637Value: string;       // e.g. "2026", "192.", "168.", "0.45"
  buttonPressed: boolean;
  lidarEnabled: boolean;
  cameraEnabled: boolean;
  explodedProgress: number;  // 0.0 to 1.0
  soundEnabled: boolean;
}

export type SimulationDomain = 'robotics_ground' | 'wind_tunnel' | 'aero_flight';

export type AirfoilType = 'naca0012' | 'naca2412' | 'clark_y' | 'supercritical';

export interface AeroParameters {
  airspeed: number;            // m/s (0 to 60 m/s)
  angleOfAttack: number;       // degrees (-15° to +35°)
  airDensity: number;          // kg/m^3 (0.8 to 1.5, default 1.225)
  altitude: number;            // meters (0 to 4000m)
  
  // Wing Geometry
  wingSpan: number;            // meters (e.g. 0.45m to 1.2m)
  wingChord: number;           // meters (e.g. 0.10m to 0.25m)
  airfoil: AirfoilType;        // profile
  wingCamber: number;          // % camber (0% to 6%)
  flapDeflection: number;      // degrees (0° to 40°)
  
  // Tailplane & Fin Geometry
  horizontalTailArea: number;  // m^2
  tailMomentArm: number;       // meters
  elevatorDeflection: number;  // degrees (-25° to +25°)
  rudderDeflection: number;    // degrees (-25° to +25°)

  // Visualization options
  showStreamlines: boolean;
  showForceVectors: boolean;
  showPressureSurface: boolean;
  streamlineSpeed: number;
}

export interface AeroForces {
  dynamicPressure: number;     // q = 0.5 * rho * v^2 (Pascals)
  liftCoeff: number;           // C_L
  dragCoeff: number;           // C_D
  parasiteDragCoeff: number;   // C_D0
  inducedDragCoeff: number;    // C_Di
  momentCoeff: number;         // C_M (pitching moment coefficient)
  liftForceN: number;          // Newtons (L)
  dragForceN: number;          // Newtons (D)
  pitchingMomentNm: number;    // N*m (M_pitch)
  yawingMomentNm: number;      // N*m (M_yaw)
  rollingMomentNm: number;     // N*m (M_roll)
  liftToDragRatio: number;     // L/D efficiency
  isStalled: boolean;          // true if alpha > stallAngle
  stallProgress: number;       // 0 (attached) to 1 (fully separated)
  reynoldsNumber: number;      // Re
  machNumber: number;          // M
}

export type RobotPartCategory =
  | 'Cảm biến'
  | 'Xử lý & Tính toán'
  | 'Truyền động & Cơ khí'
  | 'Nguồn & Mở rộng'
  | 'Khung gầm & Cấu trúc';

export interface RobotPartInfo {
  id: string;
  name: string;
  englishName: string;
  category: RobotPartCategory;
  description: string;
  specs: { label: string; value: string }[];
  rosTopic?: string;
  rosMessageType?: string;
  realPhotoEvidence: string;
  photoIndex: number; // 0 to 4 corresponding to user's 5 photos
  highlightColor: string;
  keyFeatures: string[];
}

