import React, { useRef, useEffect } from 'react';
import { Radio } from 'lucide-react';
import { LidarData } from '../types/jetbot';

interface LidarRadarOverlayProps {
  lidarData: LidarData;
  closestDistance: number;
}

export function LidarRadarOverlay({ lidarData, closestDistance }: LidarRadarOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const maxRange = 5.0; // 5 meters scale
    const scale = (center - 10) / maxRange;

    // Clear background
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, size, size);

    // Range rings (1m, 2m, 3m, 4m)
    ctx.strokeStyle = '#1a2638';
    ctx.lineWidth = 1;
    for (let r = 1; r <= 4; r++) {
      ctx.beginPath();
      ctx.arc(center, center, r * scale, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#3a4b68';
      ctx.font = '9px monospace';
      ctx.fillText(`${r}m`, center + 3, center - r * scale + 10);
    }

    // Coordinate crosshairs
    ctx.strokeStyle = '#1f2e44';
    ctx.beginPath();
    ctx.moveTo(center, 5);
    ctx.lineTo(center, size - 5);
    ctx.moveTo(5, center);
    ctx.lineTo(size - 5, center);
    ctx.stroke();

    // Robot footprint indicator in center
    ctx.fillStyle = '#00d2d3';
    ctx.beginPath();
    ctx.arc(center, center, 4, 0, Math.PI * 2);
    ctx.fill();

    // Heading nose indicator
    ctx.strokeStyle = '#2ed573';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineTo(center, center - 12);
    ctx.stroke();

    // Plot LiDAR range scan points
    if (lidarData && lidarData.ranges) {
      const numPoints = lidarData.ranges.length;
      ctx.fillStyle = '#ff4757';

      for (let i = 0; i < numPoints; i++) {
        const d = lidarData.ranges[i];
        if (d >= maxRange) continue;

        // Angle in radians (relative to robot)
        const angle = (i / numPoints) * Math.PI * 2;
        // In screen coordinates: 0 is forward (up)
        const x = center + Math.sin(angle) * d * scale;
        const y = center - Math.cos(angle) * d * scale;

        ctx.fillStyle = d < 0.6 ? '#ff3838' : d < 1.5 ? '#f1c40f' : '#2ed573';
        ctx.fillRect(x - 1, y - 1, 2.5, 2.5);
      }
    }
  }, [lidarData]);

  const isWarning = closestDistance < 0.6;

  return (
    <div className="fixed top-4 left-4 z-40 select-none">
      <div className="bg-[#10141dc0] border border-[#2a3449] rounded-xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#0c0f17] border-b border-[#1f2738]">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-xs font-semibold text-slate-200">RPLiDAR A1/A2</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">600 RPM</span>
        </div>

        <div className="p-2 relative flex flex-col items-center">
          <canvas ref={canvasRef} width={150} height={150} className="rounded-lg block" />

          {/* Closest obstacle badge */}
          <div
            className={`mt-2 w-full px-2 py-1 rounded text-center font-mono text-[11px] font-semibold border ${
              isWarning
                ? 'bg-rose-950/80 border-rose-600 text-rose-300'
                : 'bg-[#182030] border-[#29354a] text-slate-300'
            }`}
          >
            Vật cản gần nhất: {closestDistance.toFixed(2)}m
          </div>
        </div>
      </div>
    </div>
  );
}
