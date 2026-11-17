import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ThreeCanvas } from './components/ThreeCanvas';
import { BottomControlDock } from './components/BottomControlDock';
import { CsiCameraOverlay } from './components/CsiCameraOverlay';
import { LidarRadarOverlay } from './components/LidarRadarOverlay';
import { WindTunnelHUD } from './components/WindTunnelHUD';
import { AeroPolarChart } from './components/AeroPolarChart';
import { RosTerminalModal } from './components/RosTerminalModal';
import { RealPhotoCompareModal } from './components/RealPhotoCompareModal';
import { PartInspectorModal } from './components/PartInspectorModal';
import { ROBOT_PARTS } from './data/robotPartsData';
import { soundSynth } from './simulation/audioSynth';
import { AerodynamicsEngine } from './simulation/aerodynamicsEngine';
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
} from './types/jetbot';
import { BatteryCharging, Wifi, ShieldAlert, Cpu, ChevronRight, ChevronLeft, Camera, Eye, EyeOff, Sparkles } from 'lucide-react';

const INITIAL_KINEMATICS: JetBotKinematics = {
  x: 0,
  z: 0,
  yaw: 0,
  linearVelocity: 0,
  angularVelocity: 0,
  leftMotorSpeed: 0,
  rightMotorSpeed: 0,
  leftWheelAngle: 0,
  rightWheelAngle: 0,
  casterAngle: 0,
  isMoving: false,
};

const INITIAL_CONFIG: JetBotConfig = {
  linearSpeedScale: 0.5,
  angularSpeedScale: 1.0,
  wheelBase: 0.14,
  wheelRadius: 0.0325,
  maxLinearSpeed: 0.75,
  maxAngularSpeed: 2.8,
  tm1637Value: '2026',
  buttonPressed: false,
  lidarEnabled: true,
  cameraEnabled: true,
  explodedProgress: 0,
  soundEnabled: true,
};

const INITIAL_AERO_PARAMS: AeroParameters = {
  airspeed: 25.0, // 25 m/s (~90 km/h)
  angleOfAttack: 6.0, // 6 degrees normal cruise AoA
  airDensity: 1.225, // ISA sea level kg/m^3
  altitude: 0,
  wingSpan: 0.64, // 0.64 meters
  wingChord: 0.16, // 0.16 meters
  airfoil: 'naca2412',
  wingCamber: 2.0,
  flapDeflection: 0,
  horizontalTailArea: 0.024,
  tailMomentArm: 0.22,
  elevatorDeflection: 0,
  rudderDeflection: 0,
  showStreamlines: true,
  showForceVectors: true,
  showPressureSurface: true,
  streamlineSpeed: 1.0,
};

export default function App() {
  const [kinematics, setKinematics] = useState<JetBotKinematics>(INITIAL_KINEMATICS);
  const [config, setConfig] = useState<JetBotConfig>(INITIAL_CONFIG);
  const [driveMode, setDriveMode] = useState<DriveMode>('manual');
  const [cameraView, setCameraView] = useState<CameraViewMode>('orbit');
  const [isMuted, setIsMuted] = useState(false);
  const [isRosModalOpen, setIsRosModalOpen] = useState(false);
  const [isPhotoCompareOpen, setIsPhotoCompareOpen] = useState(false);
  const [photoCompareInitialIndex, setPhotoCompareInitialIndex] = useState<number | undefined>(undefined);
  const [isPanelsHidden, setIsPanelsHidden] = useState(false);

  // Part inspection state
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [hoveredPart, setHoveredPart] = useState<{
    id: string;
    name: string;
    category: string;
    pos: { x: number; y: number };
  } | null>(null);

  // Domain state: default to ground robotics mode
  const [domain, setDomain] = useState<SimulationDomain>('robotics_ground');
  const [aeroParams, setAeroParams] = useState<AeroParameters>(INITIAL_AERO_PARAMS);
  const [aeroForces, setAeroForces] = useState<AeroForces>(() =>
    AerodynamicsEngine.compute(INITIAL_AERO_PARAMS)
  );
  const [showPolarChart, setShowPolarChart] = useState(true);

  // Sensor state
  const [lidarData, setLidarData] = useState<LidarData>({
    ranges: [],
    points: [],
    rpm: 600,
    closestDistance: 5.0,
    closestAngle: 0,
  });
  const [detections, setDetections] = useState<VisionDetection[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Secondary canvas ref for CSI camera PiP
  const csiCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Continuous keyboard input state
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  }, []);

  const handlePressBreadboardButton = useCallback(() => {
    soundSynth.playButtonClick();
    showToast('Ngắt GPIO 18: Nút bấm trên Breadboard đã được kích hoạt!');
    setConfig((prev) => ({
      ...prev,
      buttonPressed: true,
      tm1637Value: prev.tm1637Value === '2026' ? 'PUSH' : '2026',
    }));
  }, [showToast]);

  const handlePartAction = useCallback((actionType: string) => {
    soundSynth.playButtonClick();
    if (actionType === 'toggle_lidar') {
      setConfig((prev) => {
        const next = !prev.lidarEnabled;
        showToast(next ? 'Đã bật quay cảm biến RPLiDAR A1 (600 RPM / 10 Hz)' : 'Đã tạm dừng quay RPLiDAR A1');
        return { ...prev, lidarEnabled: next };
      });
    } else if (actionType === 'camera_fpv') {
      setCameraView('csi_fpv');
      showToast('Đã chuyển sang góc nhìn camera FPV (Góc nhìn thứ nhất)');
    } else if (actionType === 'press_button') {
      handlePressBreadboardButton();
    } else if (actionType === 'toggle_tm1637') {
      setConfig((prev) => {
        const sequence = ['2026', '192.', '168.', '0.45', 'PUSH'];
        const currentIdx = sequence.indexOf(prev.tm1637Value);
        const nextVal = sequence[(currentIdx + 1) % sequence.length];
        showToast(`Màn hình TM1637 hiển thị: "${nextVal}"`);
        return { ...prev, tm1637Value: nextVal };
      });
    } else if (actionType === 'test_wheels') {
      showToast('Đang chạy thử nghiệm quay bánh xe vi sai...');
      setKinematics((prev) => ({
        ...prev,
        leftMotorSpeed: 0.65,
        rightMotorSpeed: 0.65,
      }));
      setTimeout(() => {
        setKinematics((prev) => ({
          ...prev,
          leftMotorSpeed: 0,
          rightMotorSpeed: 0,
        }));
      }, 1500);
    }
  }, [showToast, handlePressBreadboardButton]);

  const handleManualDrive = useCallback((left: number, right: number) => {
    setDriveMode('manual');
    setKinematics((prev) => ({
      ...prev,
      leftMotorSpeed: left,
      rightMotorSpeed: right,
    }));
  }, []);

  const handleResetRobot = useCallback(() => {
    setKinematics({
      ...INITIAL_KINEMATICS,
      x: 0,
      z: 0,
      yaw: 0,
    });
    showToast('Đã đặt lại JetBot về vị trí xuất phát.');
  }, [showToast]);

  const handleToggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundSynth.setMuted(nextMuted);
    if (!nextMuted) {
      soundSynth.enable();
    }
  }, [isMuted]);

  const handleUpdateAeroParams = useCallback((partial: Partial<AeroParameters>) => {
    setAeroParams((prev) => {
      const updated = { ...prev, ...partial };
      const calculatedForces = AerodynamicsEngine.compute(updated);
      setAeroForces(calculatedForces);
      return updated;
    });
  }, []);

  const togglePanels = useCallback(() => {
    setIsPanelsHidden((prev) => {
      const next = !prev;
      showToast(next ? 'Đã ẩn các bảng thông tin (Nhấn W để hiển thị lại)' : 'Đã hiển thị các bảng thông tin');
      return next;
    });
  }, [showToast]);

  // Keyboard controls listener
  useEffect(() => {
    const updateMotorFromKeys = () => {
      if (driveMode !== 'manual' || domain === 'wind_tunnel') return;

      const keys = keysPressedRef.current;
      let left = 0;
      let right = 0;

      const forward = keys['ArrowUp'];
      const backward = keys['KeyS'] || keys['ArrowDown'];
      const turnLeft = keys['KeyA'] || keys['ArrowLeft'];
      const turnRight = keys['KeyD'] || keys['ArrowRight'];

      if (forward && !backward) {
        if (turnLeft) {
          left = 0.3;
          right = 0.8;
        } else if (turnRight) {
          left = 0.8;
          right = 0.3;
        } else {
          left = 0.8;
          right = 0.8;
        }
      } else if (backward && !forward) {
        if (turnLeft) {
          left = -0.3;
          right = -0.7;
        } else if (turnRight) {
          left = -0.7;
          right = -0.3;
        } else {
          left = -0.7;
          right = -0.7;
        }
      } else if (turnLeft && !turnRight) {
        left = -0.55;
        right = 0.55;
      } else if (turnRight && !turnLeft) {
        left = 0.55;
        right = -0.55;
      }

      setKinematics((prev) => ({
        ...prev,
        leftMotorSpeed: left,
        rightMotorSpeed: right,
      }));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      // Shortcut W (or w) to toggle hiding all information panels
      if (e.code === 'KeyW' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        togglePanels();
        return;
      }

      keysPressedRef.current[e.code] = true;

      if (e.code === 'Space') {
        e.preventDefault();
        handleManualDrive(0, 0);
      } else if (e.code === 'KeyR') {
        handleResetRobot();
      } else if (e.code === 'KeyM') {
        handleToggleMute();
      }

      // Hotkeys for Pitch / Angle of Attack adjust
      if (e.code === 'BracketRight') {
        handleUpdateAeroParams({ angleOfAttack: Math.min(30, aeroParams.angleOfAttack + 1) });
      } else if (e.code === 'BracketLeft') {
        handleUpdateAeroParams({ angleOfAttack: Math.max(-12, aeroParams.angleOfAttack - 1) });
      }

      updateMotorFromKeys();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      keysPressedRef.current[e.code] = false;
      updateMotorFromKeys();
    };

    const handleBlur = () => {
      keysPressedRef.current = {};
      updateMotorFromKeys();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [driveMode, domain, aeroParams.angleOfAttack, handleManualDrive, handleResetRobot, handleToggleMute, handleUpdateAeroParams]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0d14] font-sans select-none text-slate-100">
      {/* 1. Main 3D WebGL Viewport */}
      <ThreeCanvas
        kinematics={kinematics}
        config={config}
        driveMode={driveMode}
        cameraView={cameraView}
        onUpdateKinematics={setKinematics}
        onUpdateLidarData={setLidarData}
        onUpdateDetections={setDetections}
        csiCanvasRef={csiCanvasRef}
        onObstacleCollision={(speed) => {
          if (speed > 0.15 && domain === 'robotics_ground') {
            showToast('Cảnh báo va chạm vật cản!');
          }
        }}
        aeroParams={aeroParams}
        domain={domain}
        onUpdateAeroForces={setAeroForces}
        onSelectPart={(partId) => setSelectedPartId(partId)}
        selectedPartId={selectedPartId}
        onHoverPart={(partId, mousePos) => {
          if (partId && mousePos && ROBOT_PARTS[partId]) {
            setHoveredPart({
              id: partId,
              name: ROBOT_PARTS[partId].name,
              category: ROBOT_PARTS[partId].category,
              pos: mousePos,
            });
          } else {
            setHoveredPart(null);
          }
        }}
      />

      {/* 3D Part Interactive Hover Tooltip */}
      {hoveredPart && !selectedPartId && (
        <div
          className="fixed pointer-events-none z-50 px-3 py-1.5 rounded-xl bg-[#090d18ee] border border-cyan-400/70 text-xs shadow-2xl backdrop-blur-md -translate-x-1/2 -translate-y-12 animate-in fade-in duration-100 flex items-center gap-2"
          style={{
            left: `${hoveredPart.pos.x}px`,
            top: `${hoveredPart.pos.y}px`,
          }}
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
          <span className="font-bold text-white tracking-wide">{hoveredPart.name}</span>
          <span className="text-[10px] text-cyan-300 font-mono">[{hoveredPart.category}]</span>
          <span className="text-[10px] text-amber-300 font-medium">Nhấp để xem thông số</span>
        </div>
      )}

      {/* 2. Top-Center Spec Badge */}
      {!isPanelsHidden && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-30 hidden md:block">
          <div className="px-4 py-1.5 rounded-full bg-[#0e131ee0] border border-[#253044] shadow-xl flex items-center gap-3 text-xs font-mono">
            {domain === 'robotics_ground' ? (
              <>
                <span className="flex items-center gap-1.5 font-bold text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  JETBOT ROS 3D
                </span>
                <span className="text-slate-500">|</span>
                <span className="flex items-center gap-1 text-rose-300 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping inline-block" />
                  RPLiDAR A1: 600 RPM (ĐANG QUAY 360°)
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-cyan-300">CSI 720p@30fps</span>
                <span className="text-slate-500">|</span>
                <span className="text-indigo-300">Jetson Nano 4GB</span>
                <span className="text-slate-500">|</span>
                <span className="text-amber-300 flex items-center gap-1 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Click bộ phận để xem chi tiết</span>
                </span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1.5 font-bold text-cyan-300">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  JETBOX AERODYNAMICS LAB
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-emerald-400">L: {aeroForces.liftForceN.toFixed(1)}N</span>
                <span className="text-rose-400">D: {aeroForces.dragForceN.toFixed(2)}N</span>
                <span className="text-cyan-400 font-bold">L/D: {aeroForces.liftToDragRatio.toFixed(1)}</span>
              </>
            )}
            <span className="text-slate-500">|</span>
            <button
              onClick={() => setIsPhotoCompareOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold transition-all"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Đối chiếu 5 ảnh thật</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Left Aero CFD HUD (in wind tunnel mode) */}
      {!isPanelsHidden && domain === 'wind_tunnel' && (
        <WindTunnelHUD
          params={aeroParams}
          forces={aeroForces}
          domain={domain}
          onUpdateParams={handleUpdateAeroParams}
          onSetDomain={setDomain}
        />
      )}

      {/* 4. Right Side: CSI Camera & Polar Diagram & Radar */}
      {!isPanelsHidden && (
        <div className="fixed top-4 right-4 z-40 flex flex-col items-end gap-2.5">
          {/* CSI Camera PiP (show in ground mode or toggleable) */}
          {domain === 'robotics_ground' ? (
            <CsiCameraOverlay
              canvasRef={csiCanvasRef}
              detections={detections}
              cameraFps={30}
            />
          ) : (
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1 bg-[#10141dc0] p-1 rounded-lg border border-[#2a3449]">
                <button
                  onClick={() => setShowPolarChart(!showPolarChart)}
                  className="text-xs px-2.5 py-1 rounded bg-[#1c2438] hover:bg-[#28354f] text-cyan-300 font-medium flex items-center gap-1"
                >
                  {showPolarChart ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                  <span>{showPolarChart ? 'Ẩn đồ thị Polar' : 'Hiện đồ thị Polar'}</span>
                </button>
              </div>

              {/* Scientific Polar Curve Diagram */}
              {showPolarChart && (
                <AeroPolarChart params={aeroParams} forces={aeroForces} />
              )}
            </div>
          )}

          {/* 2D LiDAR Radar Overlay (in ground mode) */}
          {domain === 'robotics_ground' && (
            <div className="mt-1">
              <LidarRadarOverlay
                lidarData={lidarData}
                closestDistance={lidarData.closestDistance}
              />
            </div>
          )}
        </div>
      )}

      {/* 5. Unified Bottom Control Dock */}
      {!isPanelsHidden && (
        <BottomControlDock
          kinematics={kinematics}
          config={config}
          driveMode={driveMode}
          cameraView={cameraView}
          isMuted={isMuted}
          onSetDriveMode={setDriveMode}
          onSetCameraView={setCameraView}
          onUpdateConfig={(partial) => setConfig((prev) => ({ ...prev, ...partial }))}
          onResetRobot={handleResetRobot}
          onPressBreadboardButton={handlePressBreadboardButton}
          onToggleMute={handleToggleMute}
          onOpenRosModal={() => setIsRosModalOpen(true)}
          onOpenPhotoCompare={() => setIsPhotoCompareOpen(true)}
          onToggleHidePanels={togglePanels}
          onSelectPart={setSelectedPartId}
          onManualDrive={handleManualDrive}
          aeroParams={aeroParams}
          aeroForces={aeroForces}
          onUpdateAeroParams={handleUpdateAeroParams}
          domain={domain}
          onSetDomain={setDomain}
        />
      )}

      {/* Floating Zen Mode / Unhide Button when panels are hidden */}
      {isPanelsHidden && (
        <div className="fixed top-4 right-4 z-40 animate-in fade-in duration-200">
          <button
            onClick={togglePanels}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#0e131ee6] hover:bg-[#182030] border border-cyan-500/40 text-xs font-semibold text-cyan-300 shadow-2xl transition-all cursor-pointer group"
            title="Nhấn phím W hoặc click để hiện lại toàn bộ bảng thông tin"
          >
            <Eye className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>
              Nhấn <kbd className="px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-700 text-cyan-200 font-mono font-bold text-[11px] shadow-sm">W</kbd> để hiện lại bảng thông tin
            </span>
          </button>
        </div>
      )}

      {/* 6. Notification Toast */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-slate-900/95 border border-cyan-500/50 text-cyan-200 text-xs font-medium shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top duration-200">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 7. ROS Terminal & Code Inspector Modal */}
      <RosTerminalModal
        isOpen={isRosModalOpen}
        onClose={() => setIsRosModalOpen(false)}
        currentCmdVel={{
          linear: kinematics.linearVelocity,
          angular: kinematics.angularVelocity,
        }}
        closestObstacleDist={lidarData.closestDistance}
        onExecuteRosCommand={(cmd) => {
          if (cmd.includes('peripheral_control')) {
            setConfig((prev) => ({ ...prev, tm1637Value: '2026' }));
            showToast('LED 7 đoạn TM1637 đã hiển thị số 2026.');
          }
        }}
      />

      {/* 8. Real Photos Side-by-Side Comparison Modal */}
      <RealPhotoCompareModal
        isOpen={isPhotoCompareOpen}
        onClose={() => setIsPhotoCompareOpen(false)}
        initialPhotoIndex={photoCompareInitialIndex}
      />

      {/* 9. Interactive 3D Part Inspector Modal */}
      <PartInspectorModal
        part={selectedPartId ? ROBOT_PARTS[selectedPartId] || null : null}
        onClose={() => setSelectedPartId(null)}
        onOpenPhotoIndex={(idx) => {
          setPhotoCompareInitialIndex(idx);
          setIsPhotoCompareOpen(true);
        }}
        onActionTrigger={handlePartAction}
        lidarEnabled={config.lidarEnabled}
      />
    </div>
  );
}
