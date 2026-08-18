import React, { useState, useMemo } from 'react';
import { 
  Flame, 
  ShieldAlert, 
  Zap, 
  Cpu, 
  Gauge, 
  Layers, 
  Eye, 
  Crosshair, 
  Radio,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function BatteryCellHologram({ state }) {
  const [viewMode, setViewMode] = useState('xray'); // 'xray' | 'thermal' | 'flux'

  const {
    cycle_index = 15,
    soc_pct = 85,
    soh_pct = 92.5,
    cell_temperature_c = 28.5,
    terminal_voltage_v = 3.85,
    open_circuit_voltage_v = 3.89,
    current_load_a = 1.5,
    electrolyte_resistance_re_ohm = 0.052,
    charge_transfer_resistance_rct_ohm = 0.068,
    internal_resistance_total_ohm = 0.120,
    degradation_mechanisms = {},
    health_status = 'Optimal (Healthy)',
    status_color = 'emerald',
    is_charging = false
  } = state || {};

  // Thermal color gradient computation
  const thermalTheme = useMemo(() => {
    if (cell_temperature_c < 30) {
      return { 
        coreStop1: '#0284C7', 
        coreStop2: '#00F0FF', 
        glow: 'rgba(0, 240, 255, 0.4)', 
        border: '#00F0FF',
        badge: 'text-cyan-400 bg-cyan-950/80 border-cyan-500/40',
        label: 'NOMINAL THERMAL (COOL)'
      };
    }
    if (cell_temperature_c < 38) {
      return { 
        coreStop1: '#059669', 
        coreStop2: '#10B981', 
        glow: 'rgba(16, 185, 129, 0.4)', 
        border: '#10B981',
        badge: 'text-emerald-400 bg-emerald-950/80 border-emerald-500/40',
        label: 'OPTIMAL OPERATING RANGE'
      };
    }
    if (cell_temperature_c < 45) {
      return { 
        coreStop1: '#D97706', 
        coreStop2: '#F59E0B', 
        glow: 'rgba(245, 158, 11, 0.5)', 
        border: '#F59E0B',
        badge: 'text-amber-400 bg-amber-950/80 border-amber-500/40',
        label: 'ELEVATED THERMAL STRESS'
      };
    }
    return { 
      coreStop1: '#DC2626', 
      coreStop2: '#EF4444', 
      glow: 'rgba(239, 68, 68, 0.7)', 
      border: '#EF4444',
      badge: 'text-rose-400 bg-rose-950/80 border-rose-500/40',
      label: 'CRITICAL THERMAL OVERHEAT'
    };
  }, [cell_temperature_c]);

  const seiPct = degradation_mechanisms.sei_layer_growth_pct || 45;
  const lamPct = degradation_mechanisms.active_material_loss_pct || 35;
  const platingPct = degradation_mechanisms.plating_knee_stress_pct || 20;

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between relative overflow-hidden shadow-2xl">
      
      {/* Background Cyber Grid & Glow Ambient */}
      <div className="absolute inset-0 cyber-grid opacity-35 pointer-events-none"></div>
      <div 
        className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: thermalTheme.border }}
      />

      {/* Top Header & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 z-10 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-mono font-bold tracking-wider text-white uppercase">
                18650 Digital Twin Visualizer
              </h3>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                CYCLE {cycle_index}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Coupled Electrochemical-Thermal Jelly Roll
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('xray')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all ${
              viewMode === 'xray'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            X-Ray Internal
          </button>
          <button
            onClick={() => setViewMode('thermal')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all ${
              viewMode === 'thermal'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            FLIR Thermal
          </button>
          <button
            onClick={() => setViewMode('flux')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all ${
              viewMode === 'flux'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Li+ Ion Flux
          </button>
        </div>
      </div>

      {/* Main Holographic Canvas / SVG Core */}
      <div className="relative flex items-center justify-center py-2 z-10">
        
        <div className="relative w-full max-w-[380px] h-[250px]">
          
          <svg viewBox="0 0 400 250" className="w-full h-full drop-shadow-2xl">
            <defs>
              {/* Dynamic Thermal Heatmap Gradient */}
              <linearGradient id="flirGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0B132B" stopOpacity="0.9" />
                <stop offset="35%" stopColor={thermalTheme.coreStop1} stopOpacity="0.65" />
                <stop offset="70%" stopColor={thermalTheme.coreStop2} stopOpacity="0.85" />
                <stop offset="100%" stopColor="#0B132B" stopOpacity="0.9" />
              </linearGradient>

              {/* SEI Degradation Layer Pattern */}
              <linearGradient id="seiPattern" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#D97706" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#B45309" stopOpacity="0.9" />
              </linearGradient>

              {/* Glow Filter */}
              <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Outer Holographic Cell Can (Steel Shell) */}
            <rect
              x="55"
              y="35"
              width="275"
              height="170"
              rx="20"
              fill="rgba(15, 23, 42, 0.85)"
              stroke="rgba(0, 240, 255, 0.45)"
              strokeWidth="2"
              strokeDasharray={viewMode === 'xray' ? "6 4" : "none"}
            />

            {/* Cathode Terminal Cap (+) with Current Interrupt Ring */}
            <path
              d="M 330 85 Q 352 85 352 120 Q 352 155 330 155 Z"
              fill="rgba(0, 240, 255, 0.25)"
              stroke="#00F0FF"
              strokeWidth="2"
            />
            <rect x="352" y="102" width="14" height="36" rx="4" fill="#00F0FF" opacity="0.9" filter="url(#neonGlow)" />
            <text x="368" y="124" fill="#E2E8F0" fontSize="10" fontFamily="monospace" fontWeight="bold">
              (+)
            </text>

            {/* Anode Base Terminal (-) */}
            <rect x="42" y="55" width="13" height="130" rx="3" fill="rgba(100, 116, 139, 0.7)" stroke="#64748B" strokeWidth="2" />
            <text x="32" y="124" fill="#94A3B8" fontSize="10" fontFamily="monospace" fontWeight="bold">
              (-)
            </text>

            {/* Jelly Roll Active Core Container */}
            <rect
              x="72"
              y="50"
              width="242"
              height="140"
              rx="12"
              fill={viewMode === 'thermal' ? "url(#flirGradient)" : "rgba(10, 18, 35, 0.9)"}
              stroke={viewMode === 'thermal' ? thermalTheme.border : "rgba(255, 255, 255, 0.15)"}
              strokeWidth="1.5"
            />

            {/* View 1: X-Ray Physical Layers */}
            {viewMode === 'xray' && (
              <>
                {/* Cathode Layer */}
                <rect x="84" y="60" width="218" height="26" rx="6" fill="rgba(59, 130, 246, 0.25)" stroke="#3B82F6" strokeWidth="1.2" />
                <text x="94" y="77" fill="#93C5FD" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  CATHODE: Li(NiCoMn)O2 Active Layer
                </text>

                {/* Porous Polyethylene Separator & SEI Layer */}
                <rect x="84" y="94" width="218" height="20" rx="4" fill="url(#seiPattern)" stroke="#F59E0B" strokeWidth="1.2" />
                <text x="94" y="108" fill="#FEF3C7" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
                  SEI LAYER ({seiPct}% Thickened) & Electrolyte
                </text>

                {/* Anode Layer */}
                <rect x="84" y="122" width="218" height="26" rx="6" fill="rgba(16, 185, 129, 0.22)" stroke="#10B981" strokeWidth="1.2" />
                <text x="94" y="139" fill="#6EE7B7" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  ANODE: Mesoporous Graphite Intercalation
                </text>
              </>
            )}

            {/* View 2: Thermal FLIR View */}
            {viewMode === 'thermal' && (
              <>
                {/* Core Convection Heat Isolines */}
                <ellipse cx="193" cy="120" rx="90" ry="45" fill="none" stroke={thermalTheme.border} strokeWidth="1.5" strokeDasharray="5 3" opacity="0.6" />
                <ellipse cx="193" cy="120" rx="55" ry="28" fill="none" stroke={thermalTheme.border} strokeWidth="2" opacity="0.85" filter="url(#neonGlow)" />
                <text x="193" y="116" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontFamily="monospace" fontWeight="bold" filter="url(#neonGlow)">
                  CORE T: {cell_temperature_c.toFixed(1)} °C
                </text>
                <text x="193" y="134" textAnchor="middle" fill={thermalTheme.border} fontSize="10" fontFamily="monospace">
                  ΔT: +{(cell_temperature_c - 24.0).toFixed(1)}°C Joule Heat Rise
                </text>
              </>
            )}

            {/* View 3: Lithium Ion Flux Transport Particles */}
            {viewMode === 'flux' && (
              <>
                <rect x="84" y="60" width="218" height="120" rx="8" fill="rgba(15, 23, 42, 0.6)" stroke="#8B5CF6" strokeWidth="1.5" />
                {/* Animated Lithium-Ion Particles */}
                {[95, 130, 165, 200, 235, 270].map((cx, idx) => (
                  <g key={idx} className="animate-pulse">
                    <circle cx={cx} cy="80" r="4.5" fill="#00F0FF" filter="url(#neonGlow)" />
                    <text x={cx} y="83" textAnchor="middle" fill="#060911" fontSize="7" fontWeight="bold">Li+</text>
                    
                    <circle cx={cx + 12} cy="115" r="4.5" fill="#10B981" filter="url(#neonGlow)" />
                    <text x={cx + 12} y="118" textAnchor="middle" fill="#060911" fontSize="7" fontWeight="bold">Li+</text>
                    
                    <circle cx={cx} cy="150" r="4.5" fill="#F59E0B" filter="url(#neonGlow)" />
                    <text x={cx} y="153" textAnchor="middle" fill="#060911" fontSize="7" fontWeight="bold">Li+</text>
                  </g>
                ))}
              </>
            )}

            {/* Live Operational HUD Telemetry Footer */}
            <text x="193" y="172" textAnchor="middle" fill="#F8FAFC" fontSize="12" fontFamily="monospace" fontWeight="bold">
              {terminal_voltage_v.toFixed(3)} V • {Math.abs(current_load_a).toFixed(2)} A • {(internal_resistance_total_ohm * 1000).toFixed(1)} mΩ
            </text>

            <text x="193" y="222" textAnchor="middle" fill={thermalTheme.border} fontSize="10.5" fontFamily="monospace" fontWeight="bold">
              {is_charging 
                ? '⚡ MULTI-STAGE CC-CV FAST CHARGING FLUX (4.20V CUTOFF)' 
                : '🔋 DYNAMIC LOAD CURRENT DISCHARGING (ACTIVE TRANSPORT)'}
            </text>
          </svg>

        </div>

      </div>

      {/* 4 Bottom High-Precision Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 z-10 mt-3 pt-3 border-t border-slate-800/80">
        
        {/* SOH Metric Card */}
        <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 flex flex-col justify-between shadow-inner">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
            <span>CAPACITY SOH</span>
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="my-1">
            <span className="text-lg font-bold font-mono text-white">{soh_pct.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                soh_pct >= 85 ? 'bg-emerald-400' : soh_pct >= 75 ? 'bg-cyan-400' : 'bg-amber-400'
              }`}
              style={{ width: `${Math.min(100, soh_pct)}%` }}
            />
          </div>
        </div>

        {/* SOC Metric Card */}
        <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 flex flex-col justify-between shadow-inner">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
            <span>STORED SOC</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="my-1">
            <span className="text-lg font-bold font-mono text-white">{soc_pct.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-400 transition-all duration-700"
              style={{ width: `${Math.min(100, soc_pct)}%` }}
            />
          </div>
        </div>

        {/* Core Temperature */}
        <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 flex flex-col justify-between shadow-inner">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
            <span>CORE TEMP</span>
            <Flame className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="my-1">
            <span className={`text-lg font-bold font-mono ${cell_temperature_c > 38 ? 'text-amber-400' : 'text-cyan-400'}`}>
              {cell_temperature_c.toFixed(1)}°C
            </span>
          </div>
          <span className="text-[9px] text-slate-500 font-mono truncate">
            {thermalTheme.label}
          </span>
        </div>

        {/* Internal Impedance */}
        <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 flex flex-col justify-between shadow-inner">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
            <span>IMPEDANCE</span>
            <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="my-1">
            <span className="text-lg font-bold font-mono text-purple-300">
              {(internal_resistance_total_ohm * 1000).toFixed(1)} mΩ
            </span>
          </div>
          <span className="text-[9px] text-slate-500 font-mono truncate">
            Re: {(electrolyte_resistance_re_ohm * 1000).toFixed(0)} | Rct: {(charge_transfer_resistance_rct_ohm * 1000).toFixed(0)}mΩ
          </span>
        </div>

      </div>

    </div>
  );
}
