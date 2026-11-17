import React from 'react';
import { Wind, Gauge, Compass, AlertTriangle, ArrowUp, ArrowRight, RotateCw, Eye } from 'lucide-react';
import { AeroParameters, AeroForces, SimulationDomain } from '../types/jetbot';

interface WindTunnelHUDProps {
  params: AeroParameters;
  forces: AeroForces;
  domain: SimulationDomain;
  onUpdateParams: (partial: Partial<AeroParameters>) => void;
  onSetDomain: (domain: SimulationDomain) => void;
}

export function WindTunnelHUD({
  params,
  forces,
  domain,
  onUpdateParams,
  onSetDomain,
}: WindTunnelHUDProps) {
  const isStalled = forces.isStalled;

  return (
    <div className="fixed top-4 left-4 z-40 flex flex-col gap-2 select-none max-w-sm">
      {/* Main Aero Telemetry Card */}
      <div className="bg-[#0e131ee0] border border-[#232e42] rounded-xl p-3 shadow-2xl backdrop-blur-none text-slate-200">
        {/* Title bar */}
        <div className="flex items-center justify-between pb-2 border-b border-[#1d273a] mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Wind className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-wide uppercase">
                Khí động lực học JetBox CFD
              </div>
              <div className="text-[10px] text-slate-400">
                NACA Airfoil · 3D Finite Wing · 6-DOF Moments
              </div>
            </div>
          </div>

          {/* Stall indicator badge */}
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
              isStalled
                ? 'bg-rose-950 border border-rose-600 text-rose-300 animate-pulse'
                : 'bg-emerald-950/80 border border-emerald-700/60 text-emerald-300'
            }`}
          >
            {isStalled ? (
              <>
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                <span>STALL THẤẤT TỐC</span>
              </>
            ) : (
              <span>DÒNG BÁM ĐỀU</span>
            )}
          </div>
        </div>

        {/* Primary Force & Moment Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Lift Force */}
          <div className="p-2 rounded-lg bg-[#141b29] border border-[#222e42]">
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-0.5">
              <span className="flex items-center gap-1">
                <ArrowUp className="w-3 h-3 text-emerald-400" /> Lực nâng (Lift)
              </span>
              <span className="font-mono text-emerald-400 font-semibold">C_L={forces.liftCoeff.toFixed(2)}</span>
            </div>
            <div className="text-base font-bold font-mono text-white">
              {forces.liftForceN.toFixed(2)} <span className="text-xs font-normal text-slate-400">N</span>
            </div>
          </div>

          {/* Drag Force */}
          <div className="p-2 rounded-lg bg-[#141b29] border border-[#222e42]">
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-0.5">
              <span className="flex items-center gap-1">
                <ArrowRight className="w-3 h-3 text-rose-400" /> Lực cản (Drag)
              </span>
              <span className="font-mono text-rose-400 font-semibold">C_D={forces.dragCoeff.toFixed(3)}</span>
            </div>
            <div className="text-base font-bold font-mono text-white">
              {forces.dragForceN.toFixed(2)} <span className="text-xs font-normal text-slate-400">N</span>
            </div>
          </div>

          {/* Pitching Moment */}
          <div className="p-2 rounded-lg bg-[#141b29] border border-[#222e42]">
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-0.5">
              <span className="flex items-center gap-1">
                <RotateCw className="w-3 h-3 text-purple-400" /> M-xoắn (Pitch)
              </span>
              <span className="font-mono text-purple-400 font-semibold">C_M={forces.momentCoeff.toFixed(3)}</span>
            </div>
            <div className="text-base font-bold font-mono text-white">
              {forces.pitchingMomentNm.toFixed(3)} <span className="text-xs font-normal text-slate-400">N·m</span>
            </div>
          </div>

          {/* L/D Aerodynamic Efficiency */}
          <div className="p-2 rounded-lg bg-[#141b29] border border-[#222e42]">
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-0.5">
              <span className="flex items-center gap-1">
                <Gauge className="w-3 h-3 text-cyan-400" /> Hiệu suất L/D
              </span>
              <span className="font-mono text-cyan-400 font-semibold">q={forces.dynamicPressure.toFixed(0)}Pa</span>
            </div>
            <div className="text-base font-bold font-mono text-white">
              {forces.liftToDragRatio.toFixed(1)} <span className="text-xs font-normal text-slate-400">ratio</span>
            </div>
          </div>
        </div>

        {/* Secondary Parameters row */}
        <div className="mt-2 pt-2 border-t border-[#1d273a] flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Re: {Math.round(forces.reynoldsNumber).toLocaleString()}</span>
          <span>Mach: {forces.machNumber.toFixed(3)}</span>
          <span>ρ: {params.airDensity.toFixed(3)} kg/m³</span>
        </div>

        {/* View toggles */}
        <div className="mt-2.5 pt-2 border-t border-[#1d273a] flex items-center justify-between gap-1 text-[11px]">
          <button
            onClick={() => onUpdateParams({ showStreamlines: !params.showStreamlines })}
            className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${
              params.showStreamlines
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-[#182030] text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Đường dòng</span>
          </button>

          <button
            onClick={() => onUpdateParams({ showForceVectors: !params.showForceVectors })}
            className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${
              params.showForceVectors
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-[#182030] text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3 h-3" />
            <span>Vector lực</span>
          </button>

          {/* Mode Switch: Ground Robotics vs Wind Tunnel */}
          <div className="flex bg-[#131924] p-0.5 rounded-lg border border-[#222e40]">
            <button
              onClick={() => onSetDomain('wind_tunnel')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                domain === 'wind_tunnel'
                  ? 'bg-cyan-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hầm gió
            </button>
            <button
              onClick={() => onSetDomain('robotics_ground')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                domain === 'robotics_ground'
                  ? 'bg-cyan-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mặt đất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
