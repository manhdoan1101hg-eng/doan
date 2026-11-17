import React, { useMemo } from 'react';
import { AeroParameters, AeroForces } from '../types/jetbot';
import { AerodynamicsEngine } from '../simulation/aerodynamicsEngine';
import { Activity } from 'lucide-react';

interface AeroPolarChartProps {
  params: AeroParameters;
  forces: AeroForces;
}

export function AeroPolarChart({ params, forces }: AeroPolarChartProps) {
  // Generate polar curve points
  const points = useMemo(() => {
    return AerodynamicsEngine.generatePolarCurve(params);
  }, [params.airfoil, params.wingCamber, params.flapDeflection, params.wingSpan, params.wingChord]);

  const width = 280;
  const height = 170;
  const padding = { top: 20, right: 30, bottom: 25, left: 35 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  // Scales
  const alphaMin = -15;
  const alphaMax = 35;
  const clMin = -0.8;
  const clMax = 2.0;

  const mapX = (alpha: number) => padding.left + ((alpha - alphaMin) / (alphaMax - alphaMin)) * plotW;
  const mapY = (cl: number) => padding.top + ((clMax - cl) / (clMax - clMin)) * plotH;

  // Build SVG path for C_L vs Alpha
  const clPathD = points.reduce((acc, pt, i) => {
    const x = mapX(pt.alpha);
    const y = mapY(pt.cl);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Build SVG path for C_D vs Alpha (scaled so 0 to 0.8 fits well)
  const cdPathD = points.reduce((acc, pt, i) => {
    const x = mapX(pt.alpha);
    const y = mapY(pt.cd * 2.0); // scale factor for overlay
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Current operating point
  const currentPtX = mapX(params.angleOfAttack);
  const currentPtY = mapY(forces.liftCoeff);

  return (
    <div className="bg-[#0c1018e6] border border-[#232e42] rounded-xl p-2.5 shadow-xl select-none">
      <div className="flex items-center justify-between mb-1.5 px-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Đường đặc tính khí động học Polar (C_L / C_D)</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-0.5 bg-emerald-400 inline-block" /> C_L ({forces.liftCoeff.toFixed(2)})
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <span className="w-2 h-0.5 bg-rose-400 inline-block" /> C_D ({forces.dragCoeff.toFixed(3)})
          </span>
        </div>
      </div>

      <svg width={width} height={height} className="overflow-visible block mx-auto">
        {/* Grid lines */}
        {[-10, 0, 10, 20, 30].map((a) => (
          <line
            key={`grid-x-${a}`}
            x1={mapX(a)}
            y1={padding.top}
            x2={mapX(a)}
            y2={height - padding.bottom}
            stroke="#1b2434"
            strokeDasharray="2,2"
          />
        ))}

        {[-0.5, 0, 0.5, 1.0, 1.5].map((clVal) => (
          <line
            key={`grid-y-${clVal}`}
            x1={padding.left}
            y1={mapY(clVal)}
            x2={width - padding.right}
            y2={mapY(clVal)}
            stroke="#1b2434"
            strokeDasharray="2,2"
          />
        ))}

        {/* Zero axes */}
        <line
          x1={mapX(alphaMin)}
          y1={mapY(0)}
          x2={mapX(alphaMax)}
          y2={mapY(0)}
          stroke="#334155"
          strokeWidth="1.5"
        />
        <line
          x1={mapX(0)}
          y1={padding.top}
          x2={mapX(0)}
          y2={height - padding.bottom}
          stroke="#334155"
          strokeWidth="1.5"
        />

        {/* Stall Boundary Line at 15 deg */}
        <line
          x1={mapX(15)}
          y1={padding.top}
          x2={mapX(15)}
          y2={height - padding.bottom}
          stroke="#e74c3c"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
        <text
          x={mapX(15) + 3}
          y={padding.top + 10}
          fill="#e74c3c"
          fontSize="8"
          fontFamily="monospace"
        >
          STALL
        </text>

        {/* C_D curve (red) */}
        <path d={cdPathD} fill="none" stroke="#ff4757" strokeWidth="1.5" strokeOpacity="0.8" />

        {/* C_L curve (green) */}
        <path d={clPathD} fill="none" stroke="#2ed573" strokeWidth="2.0" />

        {/* Current Operating Point Dot */}
        <circle
          cx={currentPtX}
          cy={currentPtY}
          r="4.5"
          fill="#00d2d3"
          stroke="#ffffff"
          strokeWidth="1.5"
          className="animate-pulse"
        />

        {/* Axis labels */}
        <text
          x={width - padding.right}
          y={height - 6}
          fill="#94a3b8"
          fontSize="9"
          textAnchor="end"
          fontFamily="monospace"
        >
          α (Góc tấn °)
        </text>
        <text
          x={padding.left - 6}
          y={padding.top - 6}
          fill="#94a3b8"
          fontSize="9"
          textAnchor="start"
          fontFamily="monospace"
        >
          C_L
        </text>

        {/* Numerical ticks */}
        {[-10, 0, 10, 20, 30].map((a) => (
          <text
            key={`tick-x-${a}`}
            x={mapX(a)}
            y={height - padding.bottom + 12}
            fill="#64748b"
            fontSize="8"
            textAnchor="middle"
            fontFamily="monospace"
          >
            {a}°
          </text>
        ))}

        {[-0.5, 0, 0.5, 1.0, 1.5].map((clVal) => (
          <text
            key={`tick-y-${clVal}`}
            x={padding.left - 6}
            y={mapY(clVal) + 3}
            fill="#64748b"
            fontSize="8"
            textAnchor="end"
            fontFamily="monospace"
          >
            {clVal.toFixed(1)}
          </text>
        ))}
      </svg>
    </div>
  );
}
