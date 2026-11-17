import React, { useState } from 'react';
import {
  X,
  Camera,
  Cpu,
  Layers,
  Terminal,
  Radio,
  Zap,
  CheckCircle2,
  ExternalLink,
  Sliders,
  Sparkles,
  Info,
} from 'lucide-react';
import { RobotPartInfo } from '../types/jetbot';

interface PartInspectorModalProps {
  part: RobotPartInfo | null;
  onClose: () => void;
  onOpenPhotoIndex?: (index: number) => void;
  onActionTrigger?: (actionType: string) => void;
  lidarEnabled?: boolean;
}

export function PartInspectorModal({
  part,
  onClose,
  onOpenPhotoIndex,
  onActionTrigger,
  lidarEnabled = true,
}: PartInspectorModalProps) {
  const [activeTab, setActiveTab] = useState<'specs' | 'ros' | 'real_photo' | 'features'>('specs');

  if (!part) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-[#0d121c] border border-[#232f46] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100"
        style={{
          boxShadow: `0 0 35px -5px ${part.highlightColor}33`,
        }}
      >
        {/* Header with Part Accent Glow */}
        <div className="relative px-5 py-4 border-b border-[#1c273a] bg-gradient-to-r from-[#111724] to-[#151f32] flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-md shrink-0 mt-0.5"
              style={{
                backgroundColor: `${part.highlightColor}20`,
                color: part.highlightColor,
                border: `1.5px solid ${part.highlightColor}60`,
              }}
            >
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md tracking-wider"
                  style={{
                    backgroundColor: `${part.highlightColor}25`,
                    color: part.highlightColor,
                    border: `1px solid ${part.highlightColor}40`,
                  }}
                >
                  {part.category}
                </span>
                <span className="text-[11px] font-mono text-slate-400">ID: {part.id}</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5 leading-snug">{part.name}</h2>
              <p className="text-xs text-slate-400 font-mono">{part.englishName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#192336] hover:bg-[#223049] text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 py-2 border-b border-[#1a2436] bg-[#0c101a] text-xs">
          <button
            onClick={() => setActiveTab('specs')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'specs'
                ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Thông số kỹ thuật</span>
          </button>

          <button
            onClick={() => setActiveTab('ros')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'ros'
                ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Giao tiếp ROS</span>
          </button>

          <button
            onClick={() => setActiveTab('real_photo')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'real_photo'
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Đối chiếu 5 ảnh thật</span>
          </button>

          <button
            onClick={() => setActiveTab('features')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'features'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Đặc điểm nổi bật</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* General Description */}
          <div className="p-3.5 rounded-xl bg-[#121824] border border-[#1e2a3f] text-slate-300 leading-relaxed">
            <div className="flex items-center gap-1.5 font-semibold text-slate-200 mb-1 text-xs">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>Chức năng trong robot JetBot ROS:</span>
            </div>
            {part.description}
          </div>

          {/* 1. SPECS TAB */}
          {activeTab === 'specs' && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Chi tiết thông số kỹ thuật (Hardware Specs):</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {part.specs.map((item, index) => (
                  <div
                    key={index}
                    className="p-2.5 rounded-lg bg-[#141b29] border border-[#202c42] flex flex-col justify-between"
                  >
                    <span className="text-[11px] text-slate-400 font-medium">{item.label}</span>
                    <span className="text-xs font-mono font-semibold text-cyan-300 mt-1">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. ROS TOPIC TAB */}
          {activeTab === 'ros' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#101520] border border-[#202c42] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">ROS Topic:</span>
                  <span className="font-mono text-cyan-300 font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                    {part.rosTopic || 'N/A'}
                  </span>
                </div>
                {part.rosMessageType && (
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Message Type:</span>
                    <span className="font-mono text-emerald-300">{part.rosMessageType}</span>
                  </div>
                )}
              </div>

              {/* Sample ROS Command */}
              <div className="p-3 rounded-xl bg-[#090d14] border border-[#1e283b] space-y-1.5 font-mono text-[11px]">
                <div className="text-slate-400 text-[10px]"># Lệnh kiểm tra dữ liệu ROS qua Terminal:</div>
                <div className="text-emerald-400 bg-black/40 px-2 py-1.5 rounded border border-[#223049] select-all">
                  rostopic echo {part.rosTopic?.split(' ')[0] || '/jetbot'}
                </div>
                <div className="text-slate-400 text-[10px] mt-2"># Lệnh kiểm tra tần số Publish (Hz):</div>
                <div className="text-cyan-400 bg-black/40 px-2 py-1.5 rounded border border-[#223049] select-all">
                  rostopic hz {part.rosTopic?.split(' ')[0] || '/jetbot'}
                </div>
              </div>
            </div>
          )}

          {/* 3. REAL PHOTO COMPARISON TAB */}
          {activeTab === 'real_photo' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[#0e1724] border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Đối chiếu nhận dạng trên ảnh thực tế:</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Ảnh số {part.photoIndex + 1} / 5
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">{part.realPhotoEvidence}</p>
                {onOpenPhotoIndex && (
                  <button
                    onClick={() => onOpenPhotoIndex(part.photoIndex)}
                    className="mt-2 w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Mở ảnh chụp thực tế số {part.photoIndex + 1} (Phóng to so sánh)</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 4. KEY FEATURES TAB */}
          {activeTab === 'features' && (
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-200 text-xs mb-1">Các đặc điểm nổi trội:</h3>
              <div className="space-y-1.5">
                {part.keyFeatures.map((feat, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-[#141a27] border border-[#222e44] flex items-center gap-2.5"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                    <span className="text-slate-200">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Quick Action Triggers */}
        <div className="px-5 py-3 border-t border-[#1b2537] bg-[#090d15] flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {part.id === 'rplidar_a1' && onActionTrigger && (
              <button
                onClick={() => onActionTrigger('toggle_lidar')}
                className="px-3 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/50 text-rose-300 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5 text-rose-400" />
                <span>{lidarEnabled ? 'Dừng quay LiDAR' : 'Kích hoạt quay 600 RPM'}</span>
              </button>
            )}

            {part.id === 'csi_camera' && onActionTrigger && (
              <button
                onClick={() => onActionTrigger('camera_fpv')}
                className="px-3 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/50 text-cyan-300 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                <span>Góc nhìn Camera CSI FPV</span>
              </button>
            )}

            {part.id === 'breadboard_module' && onActionTrigger && (
              <button
                onClick={() => onActionTrigger('press_button')}
                className="px-3 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/50 text-rose-300 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-rose-400" />
                <span>Kích hoạt nút bấm GPIO 18</span>
              </button>
            )}

            {part.id === 'tm1637_display' && onActionTrigger && (
              <button
                onClick={() => onActionTrigger('toggle_tm1637')}
                className="px-3 py-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 text-amber-300 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Đổi hiển thị TM1637</span>
              </button>
            )}

            {part.id === 'blue_wheels' && onActionTrigger && (
              <button
                onClick={() => onActionTrigger('test_wheels')}
                className="px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 text-blue-300 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-blue-400" />
                <span>Chạy thử động cơ bánh xe</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onOpenPhotoIndex && (
              <button
                onClick={() => onOpenPhotoIndex(part.photoIndex)}
                className="px-3 py-1.5 rounded-lg bg-[#141b28] hover:bg-[#1e283b] border border-[#28354c] text-emerald-300 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Xem ảnh thật #{part.photoIndex + 1}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-[#1d273a] hover:bg-[#28354f] text-slate-200 font-medium text-xs transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
