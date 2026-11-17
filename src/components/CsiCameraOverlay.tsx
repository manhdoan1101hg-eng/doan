import React, { useRef, useEffect, useState } from 'react';
import { Camera, Maximize2, Minimize2, Eye, EyeOff, Crosshair } from 'lucide-react';
import { VisionDetection } from '../types/jetbot';

interface CsiCameraOverlayProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  detections: VisionDetection[];
  cameraFps: number;
}

export function CsiCameraOverlay({ canvasRef, detections, cameraFps }: CsiCameraOverlayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAiBoxes, setShowAiBoxes] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div
      className={`fixed top-4 right-4 z-40 transition-all duration-200 select-none ${
        isMinimized
          ? 'w-auto'
          : isExpanded
          ? 'w-[480px] md:w-[620px]'
          : 'w-64 md:w-80'
      }`}
    >
      <div className="bg-[#10141dc0] border border-[#2a3449] rounded-xl overflow-hidden shadow-2xl backdrop-blur-none">
        {/* Header bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#0c0f17] border-b border-[#1f2738]">
          <div className="flex items-center gap-2">
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-200 tracking-wide">
              CSI Camera Feed
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300">
              1280x720@{cameraFps}fps
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowAiBoxes(!showAiBoxes)}
              title="Toggle AI Object Detection"
              className={`p-1 rounded text-xs transition-colors ${
                showAiBoxes ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {showAiBoxes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded text-slate-400 hover:text-white transition-colors"
              title={isExpanded ? 'Thu nhỏ' : 'Phóng to'}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Video Canvas Container */}
        {!isMinimized && (
          <div className="relative aspect-video bg-black overflow-hidden group">
            {/* The canvas rendered by secondary WebGL target */}
            <canvas
              ref={canvasRef}
              className="w-full h-full object-cover block"
              width={480}
              height={270}
            />

            {/* Crosshair Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <Crosshair className="w-6 h-6 text-white/20 stroke-[1.5]" />
              <div className="absolute top-1/2 left-4 right-4 h-[1px] bg-cyan-500/20" />
            </div>

            {/* AI Bounding Boxes */}
            {showAiBoxes &&
              detections.map((det) => (
                <div
                  key={det.id}
                  className="absolute border border-emerald-400 bg-emerald-500/10 transition-all duration-75 pointer-events-none"
                  style={{
                    left: `${det.box.x * 100}%`,
                    top: `${det.box.y * 100}%`,
                    width: `${det.box.width * 100}%`,
                    height: `${det.box.height * 100}%`,
                  }}
                >
                  <div className="absolute -top-5 left-0 px-1 py-0.2 bg-emerald-950/90 border border-emerald-500/50 text-[10px] font-mono text-emerald-300 whitespace-nowrap">
                    {det.label} {det.confidence}% · {det.distanceMeters}m
                  </div>
                </div>
              ))}

            {/* Bottom Telemetry Overlay */}
            <div className="absolute bottom-1 left-2 right-2 flex justify-between text-[10px] font-mono text-cyan-400/80 pointer-events-none">
              <span>FOV: 78° · CSI-2 RAW10</span>
              <span>DETECT: {detections.length} OBJ</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
