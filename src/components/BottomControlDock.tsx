import React, { useState } from 'react';
import {
  Gamepad2,
  Cpu,
  Layers,
  Terminal,
  Volume2,
  VolumeX,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Wind,
  Sliders,
  Camera,
  Radio,
  EyeOff,
} from 'lucide-react';
import {
  DriveMode,
  CameraViewMode,
  JetBotKinematics,
  JetBotConfig,
  AeroParameters,
  AeroForces,
  SimulationDomain,
  AirfoilType,
} from '../types/jetbot';

interface BottomControlDockProps {
  kinematics: JetBotKinematics;
  config: JetBotConfig;
  driveMode: DriveMode;
  cameraView: CameraViewMode;
  isMuted: boolean;
  onSetDriveMode: (mode: DriveMode) => void;
  onSetCameraView: (view: CameraViewMode) => void;
  onUpdateConfig: (partial: Partial<JetBotConfig>) => void;
  onResetRobot: () => void;
  onPressBreadboardButton: () => void;
  onToggleMute: () => void;
  onOpenRosModal: () => void;
  onOpenPhotoCompare?: () => void;
  onToggleHidePanels?: () => void;
  onSelectPart?: (partId: string) => void;
  onManualDrive: (left: number, right: number) => void;

  // Aerodynamics props
  aeroParams: AeroParameters;
  aeroForces: AeroForces;
  onUpdateAeroParams: (partial: Partial<AeroParameters>) => void;
  domain: SimulationDomain;
  onSetDomain: (domain: SimulationDomain) => void;
}

export function BottomControlDock({
  kinematics,
  config,
  driveMode,
  cameraView,
  isMuted,
  onSetDriveMode,
  onSetCameraView,
  onUpdateConfig,
  onResetRobot,
  onPressBreadboardButton,
  onToggleMute,
  onOpenRosModal,
  onOpenPhotoCompare,
  onToggleHidePanels,
  onSelectPart,
  onManualDrive,
  aeroParams,
  aeroForces,
  onUpdateAeroParams,
  domain,
  onSetDomain,
}: BottomControlDockProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'aero' | 'drive' | 'ai' | 'exploded' | 'hardware'>('drive');

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-[960px] px-3 select-none">
      {/* Collapse / Expand Toggle Button */}
      <div className="flex justify-center mb-1">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#141a26] hover:bg-[#1f283a] border border-[#2c374d] text-xs font-medium text-slate-300 shadow-lg transition-all"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Mở bảng điều khiển JetBox CFD & Robot</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Thu gọn (Zen View)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Bottom Dock Card */}
      {!isCollapsed && (
        <div className="bg-[#0f131dae] border border-[#242e42] rounded-2xl shadow-2xl overflow-hidden backdrop-blur-none transition-all">
          {/* Top Bar: Tabs & Quick Action Toggles */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-[#1c2436] bg-[#0b0e17]">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                onClick={() => {
                  setActiveTab('aero');
                  onSetDomain('wind_tunnel');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'aero'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Wind className="w-3.5 h-3.5" />
                <span>Khí động học (Aero CFD)</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('drive');
                  onSetDomain('robotics_ground');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'drive'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Điều khiển (Teleop)</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('ai');
                  onSetDomain('robotics_ground');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'ai'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tự hành AI</span>
              </button>

              <button
                onClick={() => setActiveTab('exploded')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'exploded'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Phân rã linh kiện</span>
              </button>

              <button
                onClick={() => setActiveTab('hardware')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'hardware'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Phần cứng & TM1637</span>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {onOpenPhotoCompare && (
                <button
                  onClick={onOpenPhotoCompare}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 transition-colors"
                  title="Đối chiếu 5 ảnh thực tế của người dùng"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ảnh thật (5 ảnh)</span>
                </button>
              )}

              <button
                onClick={onOpenRosModal}
                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 transition-colors"
                title="Mở Terminal ROS và Xem Mã Nguồn"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ROS Code</span>
              </button>

              <button
                onClick={() => onUpdateConfig({ lidarEnabled: !config.lidarEnabled })}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg transition-colors ${
                  config.lidarEnabled
                    ? 'bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-rose-300'
                    : 'bg-[#182030] text-slate-400 hover:text-white'
                }`}
                title="Bật/Tắt quay cảm biến RPLiDAR A1"
              >
                <Radio className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">{config.lidarEnabled ? 'LiDAR 600 RPM' : 'LiDAR: TẮT'}</span>
              </button>

              <button
                onClick={onToggleMute}
                className="p-1.5 rounded-lg bg-[#182030] hover:bg-[#232e44] text-slate-300 transition-colors"
                title={isMuted ? 'Bật âm thanh mô phỏng' : 'Tắt âm thanh'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-500" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
              </button>

              <button
                onClick={onResetRobot}
                className="p-1.5 rounded-lg bg-[#182030] hover:bg-[#232e44] text-slate-300 transition-colors"
                title="Đặt lại vị trí Robot (Phím R)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {onToggleHidePanels && (
                <button
                  onClick={onToggleHidePanels}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-[#182030] hover:bg-cyan-950 border border-slate-700/60 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
                  title="Ẩn toàn bộ các bảng thông tin để xem mô phỏng 3D rộng (Phím tắt W)"
                >
                  <EyeOff className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Ẩn bảng</span>
                  <kbd className="px-1 py-0.2 rounded bg-slate-800 border border-slate-600 text-[10px] font-mono text-cyan-300">W</kbd>
                </button>
              )}
            </div>
          </div>

          {/* Tab Content Panes */}
          <div className="p-3">
            {/* 1. AERODYNAMICS CFD LAB TAB */}
            {activeTab === 'aero' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {/* Col 1: Angle of Attack & Airspeed */}
                <div className="p-2.5 rounded-xl bg-[#131926] border border-[#222e42] space-y-2">
                  <div className="font-semibold text-slate-200 flex items-center justify-between">
                    <span>1. Góc tấn & Tốc độ</span>
                    <span className="font-mono text-cyan-400 font-bold">{aeroParams.angleOfAttack.toFixed(1)}°</span>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Góc tấn (AoA α):</span>
                      <span className="font-mono text-cyan-300">{aeroParams.angleOfAttack}°</span>
                    </div>
                    <input
                      type="range"
                      min="-12"
                      max="30"
                      step="0.5"
                      value={aeroParams.angleOfAttack}
                      onChange={(e) => onUpdateAeroParams({ angleOfAttack: parseFloat(e.target.value) })}
                      className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-[#1f283c] rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                      <span>-12° (Bổ nhào)</span>
                      <span className="text-amber-400">15° Stall</span>
                      <span>+30°</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Tốc độ dòng khí (v):</span>
                      <span className="font-mono text-cyan-300">
                        {aeroParams.airspeed.toFixed(0)} m/s ({(aeroParams.airspeed * 3.6).toFixed(0)} km/h)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      step="1"
                      value={aeroParams.airspeed}
                      onChange={(e) => onUpdateAeroParams({ airspeed: parseFloat(e.target.value) })}
                      className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-[#1f283c] rounded-lg"
                    />
                  </div>

                  <div className="flex gap-1 pt-1">
                    {[10, 25, 45].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => onUpdateAeroParams({ airspeed: spd })}
                        className={`flex-1 py-0.5 rounded text-[10px] font-mono transition-colors ${
                          aeroParams.airspeed === spd
                            ? 'bg-cyan-600 text-white font-bold'
                            : 'bg-[#1a2336] text-slate-400 hover:text-white'
                        }`}
                      >
                        {spd}m/s
                      </button>
                    ))}
                  </div>
                </div>

                {/* Col 2: Air Density & Altitude */}
                <div className="p-2.5 rounded-xl bg-[#131926] border border-[#222e42] space-y-2">
                  <div className="font-semibold text-slate-200 flex items-center justify-between">
                    <span>2. Mật độ không khí</span>
                    <span className="font-mono text-emerald-400 font-bold">{aeroParams.airDensity.toFixed(3)}</span>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Mật độ khí (ρ):</span>
                      <span className="font-mono text-emerald-300">{aeroParams.airDensity.toFixed(3)} kg/m³</span>
                    </div>
                    <input
                      type="range"
                      min="0.80"
                      max="1.45"
                      step="0.01"
                      value={aeroParams.airDensity}
                      onChange={(e) => onUpdateAeroParams({ airDensity: parseFloat(e.target.value) })}
                      className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-[#1f283c] rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                      <span>0.8 (Loãng)</span>
                      <span className="text-emerald-400">1.225 (ISA)</span>
                      <span>1.45 (Đặc)</span>
                    </div>
                  </div>

                  {/* Flap Deflection */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Góc lệch cánh tà Flap (δ_f):</span>
                      <span className="font-mono text-emerald-300">{aeroParams.flapDeflection}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="35"
                      step="1"
                      value={aeroParams.flapDeflection}
                      onChange={(e) => onUpdateAeroParams({ flapDeflection: parseFloat(e.target.value) })}
                      className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-[#1f283c] rounded-lg"
                    />
                  </div>

                  <div className="text-[10px] text-slate-400 pt-1 leading-snug">
                    Áp suất động: <span className="text-white font-mono">{aeroForces.dynamicPressure.toFixed(0)} Pa</span>
                  </div>
                </div>

                {/* Col 3: Wing Geometry & Airfoil Shape */}
                <div className="p-2.5 rounded-xl bg-[#131926] border border-[#222e42] space-y-2">
                  <div className="font-semibold text-slate-200 flex items-center justify-between">
                    <span>3. Hình dạng cánh</span>
                    <span className="font-mono text-indigo-400 font-bold uppercase">{aeroParams.airfoil.replace('naca', '')}</span>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Biên dạng khí động (Airfoil):</label>
                    <select
                      value={aeroParams.airfoil}
                      onChange={(e) => onUpdateAeroParams({ airfoil: e.target.value as AirfoilType })}
                      className="w-full px-2 py-1 rounded bg-[#1c2438] border border-[#29364e] text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                    >
                      <option value="naca0012">NACA 0012 (Đối xứng)</option>
                      <option value="naca2412">NACA 2412 (Độ cong 2%)</option>
                      <option value="clark_y">Clark-Y (Lực nâng lớn)</option>
                      <option value="supercritical">Siêu tới hạn (Giảm cản)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Sải cánh (b):</span>
                      <span className="font-mono text-indigo-300">{aeroParams.wingSpan.toFixed(2)}m</span>
                    </div>
                    <input
                      type="range"
                      min="0.35"
                      max="1.1"
                      step="0.05"
                      value={aeroParams.wingSpan}
                      onChange={(e) => onUpdateAeroParams({ wingSpan: parseFloat(e.target.value) })}
                      className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-[#1f283c] rounded-lg"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Dây cung cánh (c):</span>
                      <span className="font-mono text-indigo-300">{aeroParams.wingChord.toFixed(2)}m</span>
                    </div>
                    <input
                      type="range"
                      min="0.08"
                      max="0.24"
                      step="0.01"
                      value={aeroParams.wingChord}
                      onChange={(e) => onUpdateAeroParams({ wingChord: parseFloat(e.target.value) })}
                      className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-[#1f283c] rounded-lg"
                    />
                  </div>
                </div>

                {/* Col 4: Tailplane & Moment Controls */}
                <div className="p-2.5 rounded-xl bg-[#131926] border border-[#222e42] space-y-2">
                  <div className="font-semibold text-slate-200 flex items-center justify-between">
                    <span>4. Cánh đuôi & Mô-men</span>
                    <span className="font-mono text-purple-400 font-bold">
                      {aeroForces.pitchingMomentNm.toFixed(2)} N·m
                    </span>
                  </div>

                  {/* Elevator Deflection */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Lái độ cao Elevator (δ_e):</span>
                      <span className="font-mono text-purple-300">{aeroParams.elevatorDeflection}°</span>
                    </div>
                    <input
                      type="range"
                      min="-20"
                      max="20"
                      step="1"
                      value={aeroParams.elevatorDeflection}
                      onChange={(e) => onUpdateAeroParams({ elevatorDeflection: parseFloat(e.target.value) })}
                      className="w-full accent-purple-500 cursor-pointer h-1.5 bg-[#1f283c] rounded-lg"
                    />
                  </div>

                  {/* Rudder Deflection */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Lái hướng Rudder (δ_r):</span>
                      <span className="font-mono text-purple-300">{aeroParams.rudderDeflection}°</span>
                    </div>
                    <input
                      type="range"
                      min="-20"
                      max="20"
                      step="1"
                      value={aeroParams.rudderDeflection}
                      onChange={(e) => onUpdateAeroParams({ rudderDeflection: parseFloat(e.target.value) })}
                      className="w-full accent-purple-500 cursor-pointer h-1.5 bg-[#1f283c] rounded-lg"
                    />
                  </div>

                  <div className="pt-1 flex items-center justify-between">
                    <button
                      onClick={() => onUpdateAeroParams({ elevatorDeflection: 0, rudderDeflection: 0 })}
                      className="px-2 py-0.5 rounded bg-[#1c2438] hover:bg-[#28354f] text-slate-300 text-[10px]"
                    >
                      Cân bằng Trim
                    </button>
                    <span className="text-[10px] text-slate-400 font-mono">
                      AR: {((aeroParams.wingSpan ** 2) / (aeroParams.wingSpan * aeroParams.wingChord)).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. TELEOP DRIVE TAB */}
            {activeTab === 'drive' && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* On-screen D-Pad / Buttons */}
                <div className="flex items-center gap-4">
                  <div className="grid grid-cols-3 gap-1.5 w-32">
                    <div />
                    <button
                      onMouseDown={() => onManualDrive(0.8, 0.8)}
                      onMouseUp={() => onManualDrive(0, 0)}
                      onTouchStart={() => onManualDrive(0.8, 0.8)}
                      onTouchEnd={() => onManualDrive(0, 0)}
                      className="h-9 rounded-lg bg-[#1c2438] hover:bg-cyan-600 active:bg-cyan-700 text-white font-bold flex items-center justify-center transition-colors shadow"
                    >
                      ▲
                    </button>
                    <div />
                    <button
                      onMouseDown={() => onManualDrive(-0.6, 0.6)}
                      onMouseUp={() => onManualDrive(0, 0)}
                      onTouchStart={() => onManualDrive(-0.6, 0.6)}
                      onTouchEnd={() => onManualDrive(0, 0)}
                      className="h-9 rounded-lg bg-[#1c2438] hover:bg-cyan-600 active:bg-cyan-700 text-white font-bold flex items-center justify-center transition-colors shadow"
                    >
                      ◀
                    </button>
                    <button
                      onClick={() => onManualDrive(0, 0)}
                      className="h-9 rounded-lg bg-rose-600/80 hover:bg-rose-500 active:bg-rose-700 text-white text-[11px] font-bold flex items-center justify-center transition-colors shadow"
                      title="Phanh khẩn cấp"
                    >
                      STOP
                    </button>
                    <button
                      onMouseDown={() => onManualDrive(0.6, -0.6)}
                      onMouseUp={() => onManualDrive(0, 0)}
                      onTouchStart={() => onManualDrive(0.6, -0.6)}
                      onTouchEnd={() => onManualDrive(0, 0)}
                      className="h-9 rounded-lg bg-[#1c2438] hover:bg-cyan-600 active:bg-cyan-700 text-white font-bold flex items-center justify-center transition-colors shadow"
                    >
                      ▶
                    </button>
                    <div />
                    <button
                      onMouseDown={() => onManualDrive(-0.7, -0.7)}
                      onMouseUp={() => onManualDrive(0, 0)}
                      onTouchStart={() => onManualDrive(-0.7, -0.7)}
                      onTouchEnd={() => onManualDrive(0, 0)}
                      className="h-9 rounded-lg bg-[#1c2438] hover:bg-cyan-600 active:bg-cyan-700 text-white font-bold flex items-center justify-center transition-colors shadow"
                    >
                      ▼
                    </button>
                    <div />
                  </div>

                  <div className="text-xs text-slate-400 space-y-1 hidden md:block">
                    <div className="font-medium text-slate-300">Phím tắt bàn phím:</div>
                    <div><span className="font-mono text-amber-300 font-bold bg-amber-950/60 px-1 rounded border border-amber-800">W</span> : Ẩn / Hiện bảng thông tin</div>
                    <div><span className="font-mono text-cyan-400 font-semibold">↑</span> : Tiến · <span className="font-mono text-cyan-400 font-semibold">S / ↓</span> : Lùi</div>
                    <div><span className="font-mono text-cyan-400 font-semibold">A / ◀ / D / ▶</span> : Xoay vi sai</div>
                    <div><span className="font-mono text-rose-400 font-semibold">Space</span> : Dừng xe · <span className="font-mono text-slate-300 font-semibold">R</span> : Reset</div>
                  </div>
                </div>

                {/* Motor Gauges & Speed Scale */}
                <div className="flex-1 max-w-sm space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Hệ số tốc độ (linear_speed_scale):</span>
                    <span className="font-mono text-cyan-400 font-semibold">{config.linearSpeedScale.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={config.linearSpeedScale}
                    onChange={(e) => onUpdateConfig({ linearSpeedScale: parseFloat(e.target.value) })}
                    className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-[#1f283c] rounded-lg"
                  />

                  {/* Dual Motor Output Status */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2 rounded-lg bg-[#141b28] border border-[#222e42]">
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Motor Trái (PCA PWM 0):</span>
                        <span className="font-mono text-emerald-400 font-semibold">
                          {(kinematics.leftMotorSpeed * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[#1e2738] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-75"
                          style={{ width: `${Math.abs(kinematics.leftMotorSpeed) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-[#141b28] border border-[#222e42]">
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Motor Phải (PCA PWM 5):</span>
                        <span className="font-mono text-emerald-400 font-semibold">
                          {(kinematics.rightMotorSpeed * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[#1e2738] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-75"
                          style={{ width: `${Math.abs(kinematics.rightMotorSpeed) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Camera View Mode Selector */}
                <div className="flex flex-col gap-1.5 border-t sm:border-t-0 sm:border-l border-[#1f283c] sm:pl-4">
                  <span className="text-[11px] text-slate-400 font-medium">Góc nhìn 3D:</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'orbit', label: 'Tự do 360°' },
                      { id: 'chase', label: 'Bám đuôi' },
                      { id: 'csi_fpv', label: 'CSI FPV' },
                      { id: 'top_down', label: 'Toàn cảnh' },
                    ].map((v) => (
                      <button
                        key={v.id}
                        onClick={() => onSetCameraView(v.id as CameraViewMode)}
                        className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                          cameraView === v.id
                            ? 'bg-cyan-600 text-white font-semibold'
                            : 'bg-[#151c2a] text-slate-400 hover:text-white'
                        }`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. AUTONOMOUS AI MODES */}
            {activeTab === 'ai' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => onSetDriveMode('manual')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    driveMode === 'manual'
                      ? 'bg-cyan-950/60 border-cyan-500/80 text-white'
                      : 'bg-[#141b28] border-[#222e42] text-slate-300 hover:bg-[#1a2336]'
                  }`}
                >
                  <div className="font-semibold text-xs flex items-center justify-between">
                    <span>Điều khiển thủ công</span>
                    {driveMode === 'manual' && <span className="text-[10px] text-cyan-400 font-mono">ACTIVE</span>}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Sử dụng bàn phím WASD hoặc D-Pad để di chuyển vi sai hoàn toàn chủ động.
                  </p>
                </button>

                <button
                  onClick={() => onSetDriveMode('lidar_avoidance')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    driveMode === 'lidar_avoidance'
                      ? 'bg-emerald-950/60 border-emerald-500/80 text-white'
                      : 'bg-[#141b28] border-[#222e42] text-slate-300 hover:bg-[#1a2336]'
                  }`}
                >
                  <div className="font-semibold text-xs flex items-center justify-between">
                    <span>LiDAR Tránh vật cản (SLAM)</span>
                    {driveMode === 'lidar_avoidance' && <span className="text-[10px] text-emerald-400 font-mono">ACTIVE</span>}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    RPLiDAR quét 360°, tính toán khoảng cách an toàn và tự động bẻ lái tránh va chạm.
                  </p>
                </button>

                <button
                  onClick={() => onSetDriveMode('line_follower')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    driveMode === 'line_follower'
                      ? 'bg-amber-950/60 border-amber-500/80 text-white'
                      : 'bg-[#141b28] border-[#222e42] text-slate-300 hover:bg-[#1a2336]'
                  }`}
                >
                  <div className="font-semibold text-xs flex items-center justify-between">
                    <span>Camera Bám vạch làn đường</span>
                    {driveMode === 'line_follower' && <span className="text-[10px] text-amber-400 font-mono">ACTIVE</span>}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Camera CSI phát hiện quỹ đạo đường đua tròn trên sàn arena và tự giữ làn.
                  </p>
                </button>
              </div>
            )}

            {/* 4. EXPLODED VIEW */}
            {activeTab === 'exploded' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-200">Mức độ phân rã linh kiện (Exploded View):</span>
                    <p className="text-[11px] text-slate-400">
                      Tách rời các tầng: RPLiDAR → Jetson Nano → Waveshare Board → Động cơ & Khung gầm
                    </p>
                  </div>
                  <span className="font-mono text-cyan-400 font-bold text-sm">
                    {(config.explodedProgress * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">Lắp ráp (0%)</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={config.explodedProgress}
                    onChange={(e) => onUpdateConfig({ explodedProgress: parseFloat(e.target.value) })}
                    className="flex-1 accent-cyan-500 cursor-pointer h-2 bg-[#1f283c] rounded-lg"
                  />
                  <span className="text-xs text-cyan-400 font-medium">Tách tầng (100%)</span>
                </div>

                {/* Hardware Spec Badges (Clickable to inspect) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                  <button
                    onClick={() => onSelectPart && onSelectPart('rplidar_a1')}
                    className="p-2 rounded bg-[#131926] hover:bg-[#1a2336] border border-[#212c3f] hover:border-cyan-500/50 text-left transition-colors cursor-pointer group"
                  >
                    <div className="text-cyan-400 font-semibold flex items-center justify-between">
                      <span>Tầng 1: RPLiDAR</span>
                      <span className="text-[9px] text-slate-500 group-hover:text-cyan-300">Xem ↗</span>
                    </div>
                    <div className="text-slate-400 text-[10px]">360° Laser A1/A2, 10Hz</div>
                  </button>
                  <button
                    onClick={() => onSelectPart && onSelectPart('jetson_nano')}
                    className="p-2 rounded bg-[#131926] hover:bg-[#1a2336] border border-[#212c3f] hover:border-emerald-500/50 text-left transition-colors cursor-pointer group"
                  >
                    <div className="text-emerald-400 font-semibold flex items-center justify-between">
                      <span>Tầng 2: Jetson Nano</span>
                      <span className="text-[9px] text-slate-500 group-hover:text-emerald-300">Xem ↗</span>
                    </div>
                    <div className="text-slate-400 text-[10px]">CPU A57, 128 GPU CUDA</div>
                  </button>
                  <button
                    onClick={() => onSelectPart && onSelectPart('waveshare_board')}
                    className="p-2 rounded bg-[#131926] hover:bg-[#1a2336] border border-[#212c3f] hover:border-indigo-500/50 text-left transition-colors cursor-pointer group"
                  >
                    <div className="text-indigo-400 font-semibold flex items-center justify-between">
                      <span>Tầng 3: Waveshare ROS</span>
                      <span className="text-[9px] text-slate-500 group-hover:text-indigo-300">Xem ↗</span>
                    </div>
                    <div className="text-slate-400 text-[10px]">PCA9685 I2C + 3S 18650</div>
                  </button>
                  <button
                    onClick={() => onSelectPart && onSelectPart('csi_camera')}
                    className="p-2 rounded bg-[#131926] hover:bg-[#1a2336] border border-[#212c3f] hover:border-amber-500/50 text-left transition-colors cursor-pointer group"
                  >
                    <div className="text-amber-400 font-semibold flex items-center justify-between">
                      <span>Tầng 4: CSI & Khung</span>
                      <span className="text-[9px] text-slate-500 group-hover:text-amber-300">Xem ↗</span>
                    </div>
                    <div className="text-slate-400 text-[10px]">Sony IMX219 + Khung nhôm</div>
                  </button>
                </div>
              </div>
            )}

            {/* 5. HARDWARE / TM1637 */}
            {activeTab === 'hardware' && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                {/* TM1637 7-Segment Value Config */}
                <div className="space-y-1.5 flex-1 w-full">
                  <div className="flex justify-between text-slate-300">
                    <span className="font-semibold">Màn hình LED 7 đoạn TM1637 (GPIO 23, 24):</span>
                    <span className="font-mono text-rose-400 font-bold">{config.tm1637Value}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={4}
                      value={config.tm1637Value}
                      onChange={(e) => onUpdateConfig({ tm1637Value: e.target.value.toUpperCase() })}
                      className="w-24 px-2.5 py-1.5 rounded-lg bg-[#141b28] border border-[#222e42] text-rose-400 font-mono font-bold text-center tracking-widest focus:outline-none focus:border-rose-500"
                    />
                    <div className="flex gap-1.5">
                      {['2026', '192.', 'JETB', '0.45'].map((preset) => (
                        <button
                          key={preset}
                          onClick={() => onUpdateConfig({ tm1637Value: preset })}
                          className="px-2 py-1 rounded bg-[#1c2438] hover:bg-[#28354f] text-slate-300 font-mono text-[11px]"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Breadboard Push Button Trigger */}
                <div className="space-y-1 sm:border-l border-[#1f283c] sm:pl-4 w-full sm:w-auto">
                  <span className="text-slate-300 font-semibold block">Nút bấm Breadboard (GPIO 18):</span>
                  <button
                    onClick={onPressBreadboardButton}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-rose-900/30 transition-all"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-white shadow" />
                    <span>Nhấn nút GPIO 18 (Interrupt)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
