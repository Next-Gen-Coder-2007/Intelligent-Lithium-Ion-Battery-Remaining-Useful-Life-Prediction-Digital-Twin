import React, { useMemo } from 'react';
import { Flame, ShieldAlert, Zap, Cpu, Gauge } from 'lucide-react';

export default function BatteryCellHologram({ state }) {
  const {
    soc_pct = 85,
    soh_pct = 92.5,
    cell_temperature_c = 28.5,
    terminal_voltage_v = 3.85,
    current_load_a = 1.5,
    internal_resistance_total_ohm = 0.085,
    degradation_mechanisms = {},
    health_status = 'Optimal (Healthy)',
    status_color = 'emerald',
    is_charging = false
  } = state || {};

  // Thermal color gradient computation
  const thermalColor = useMemo(() => {
    if (cell_temperature_c < 30) return { main: '#00F0FF', glow: 'rgba(0, 240, 255, 0.4)', text: 'text-cyan-400' };
    if (cell_temperature_c < 38) return { main: '#10B981', glow: 'rgba(16, 185, 129, 0.4)', text: 'text-emerald-400' };
    if (cell_temperature_c < 45) return { main: '#F59E0B', glow: 'rgba(245, 158, 11, 0.5)', text: 'text-amber-400' };
    return { main: '#EF4444', glow: 'rgba(239, 68, 68, 0.7)', text: 'text-rose-400' };
  }, [cell_temperature_c]);

  // SEI growth percentage
  const seiPct = degradation_mechanisms.sei_layer_growth_pct || 42;
  const lamPct = degradation_mechanisms.active_material_loss_pct || 35;
  const platingPct = degradation_mechanisms.plating_knee_stress_pct || 23;

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between relative overflow-hidden">
      
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none"></div>

      {/* Top Header */}
      <div className="flex items-center justify-between z-10 mb-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Cpu className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
              18650 Cell Digital Twin Core
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">LiCoO2 / NMC Physical Model</p>
          </div>
        </div>

        <div className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border flex items-center gap-1.5 ${
          status_color === 'emerald'
            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
            : status_color === 'cyan'
            ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-400'
            : status_color === 'amber'
            ? 'bg-amber-950/60 border-amber-500/40 text-amber-400'
            : 'bg-rose-950/60 border-rose-500/40 text-rose-400'
        }`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse"></span>
          <span>{health_status}</span>
        </div>
      </div>

      {/* Center 3D/2D Battery Holographic Visualizer */}
      <div className="relative flex items-center justify-center py-4 z-10">
        
        {/* SVG Holographic Battery Shell */}
        <div className="relative w-full max-w-[320px] h-[220px] flex items-center justify-center">
          
          <svg viewBox="0 0 340 220" className="w-full h-full drop-shadow-2xl">
            <defs>
              {/* Thermal Core Gradient */}
              <linearGradient id="thermalCore" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0B132B" stopOpacity="0.9" />
                <stop offset="30%" stopColor={thermalColor.main} stopOpacity="0.4" />
                <stop offset="70%" stopColor={thermalColor.main} stopOpacity="0.6" />
                <stop offset="100%" stopColor="#0B132B" stopOpacity="0.9" />
              </linearGradient>

              {/* SEI Film Pattern */}
              <linearGradient id="seiGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#B45309" stopOpacity="0.3" />
              </linearGradient>

              {/* Glowing Filter */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Outer Hologram Cylinder Shell */}
            <rect
              x="50"
              y="35"
              width="230"
              height="150"
              rx="16"
              fill="rgba(15, 23, 42, 0.7)"
              stroke="rgba(0, 240, 255, 0.4)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Positive Terminal Cap (Right) */}
            <path
              d="M 280 80 Q 295 80 295 110 Q 295 140 280 140 Z"
              fill="rgba(0, 240, 255, 0.3)"
              stroke="#00F0FF"
              strokeWidth="2"
            />
            <rect x="295" y="95" width="12" height="30" rx="3" fill="#00F0FF" opacity="0.8" />

            {/* Negative Terminal Base (Left) */}
            <rect x="42" y="55" width="8" height="110" rx="2" fill="rgba(100, 116, 139, 0.6)" stroke="#64748B" strokeWidth="1.5" />

            {/* Internal Active Material Core (Jelly Roll Cross-Section) */}
            <rect
              x="65"
              y="50"
              width="200"
              height="120"
              rx="8"
              fill="url(#thermalCore)"
              stroke={thermalColor.main}
              strokeWidth="1.5"
              filter="url(#glow)"
            />

            {/* Cathode Layer (+) */}
            <rect x="75" y="60" width="180" height="24" rx="4" fill="rgba(59, 130, 246, 0.25)" stroke="#3B82F6" strokeWidth="1" />
            <text x="85" y="76" fill="#93C5FD" fontSize="10" fontFamily="monospace" fontWeight="bold">
              CATHODE (+) NMC Layer
            </text>

            {/* Solid Electrolyte Interphase (SEI) Barrier */}
            <rect
              x="75"
              y="94"
              width="180"
              height="14"
              rx="2"
              fill="url(#seiGradient)"
              stroke="#F59E0B"
              strokeWidth="1"
            />
            <text x="85" y="105" fill="#FDE68A" fontSize="9" fontFamily="monospace">
              SEI FILM & ELECTROLYTE ({seiPct}%)
            </text>

            {/* Anode Layer (-) */}
            <rect x="75" y="118" width="180" height="24" rx="4" fill="rgba(16, 185, 129, 0.2)" stroke="#10B981" strokeWidth="1" />
            <text x="85" y="134" fill="#6EE7B7" fontSize="10" fontFamily="monospace" fontWeight="bold">
              ANODE (-) Graphite Layer
            </text>

            {/* Animated Lithium-Ion Particles (Li+) */}
            <g className="animate-pulse">
              <circle cx="110" cy="101" r="3.5" fill="#00F0FF" filter="url(#glow)" />
              <circle cx="160" cy="101" r="3.5" fill="#00F0FF" filter="url(#glow)" />
              <circle cx="210" cy="101" r="3.5" fill="#00F0FF" filter="url(#glow)" />
            </g>

            {/* Real-Time Voltage & Current Annotations */}
            <text x="165" y="158" textAnchor="middle" fill="#E2E8F0" fontSize="12" fontFamily="monospace" fontWeight="bold">
              {terminal_voltage_v.toFixed(3)} V | {current_load_a.toFixed(2)} A
            </text>

            {/* Current Flow Direction Indicator */}
            <text x="165" y="195" textAnchor="middle" fill={thermalColor.main} fontSize="10" fontFamily="monospace">
              {is_charging ? '◀◀ FAST CHARGING FLUX (Li+ Inflow)' : '▶▶ LOAD DISCHARGING (Li+ Outflow)'}
            </text>
          </svg>
        </div>
      </div>

      {/* Bottom Telemetry Health Bar & Physical Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 z-10 mt-2 pt-3 border-t border-slate-800/80">
        
        {/* State of Health */}
        <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800 flex flex-col">
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <Gauge className="w-3 h-3 text-cyan-400" /> SOH (Capacity)
          </span>
          <span className="text-sm font-bold font-mono text-white mt-1">
            {soh_pct.toFixed(1)}%
          </span>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                soh_pct >= 85 ? 'bg-emerald-400' : soh_pct >= 75 ? 'bg-cyan-400' : 'bg-amber-400'
              }`}
              style={{ width: `${Math.min(100, soh_pct)}%` }}
            />
          </div>
        </div>

        {/* State of Charge */}
        <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800 flex flex-col">
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> SOC (Stored)
          </span>
          <span className="text-sm font-bold font-mono text-white mt-1">
            {soc_pct.toFixed(1)}%
          </span>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-400 transition-all duration-500"
              style={{ width: `${Math.min(100, soc_pct)}%` }}
            />
          </div>
        </div>

        {/* Core Temperature */}
        <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800 flex flex-col">
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <Flame className={`w-3 h-3 ${thermalColor.text}`} /> Core Temp
          </span>
          <span className={`text-sm font-bold font-mono mt-1 ${thermalColor.text}`}>
            {cell_temperature_c.toFixed(1)}°C
          </span>
          <span className="text-[9px] text-slate-500 font-mono mt-1">
            {cell_temperature_c > 40 ? 'High Thermal' : 'Thermal Nominal'}
          </span>
        </div>

        {/* Internal Impedance */}
        <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800 flex flex-col">
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-purple-400" /> Impedance R_int
          </span>
          <span className="text-sm font-bold font-mono text-purple-300 mt-1">
            {(internal_resistance_total_ohm * 1000).toFixed(1)} mΩ
          </span>
          <span className="text-[9px] text-slate-500 font-mono mt-1">
            Re + Rct combined
          </span>
        </div>

      </div>

    </div>
  );
}
