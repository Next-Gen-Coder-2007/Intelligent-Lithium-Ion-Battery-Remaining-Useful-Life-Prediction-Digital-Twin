import React from 'react';
import { Gauge, Zap, Thermometer, ShieldAlert } from 'lucide-react';

export default function BatteryCellHologram({ state }) {
  const {
    cycle_index = 15,
    soc_pct = 85,
    soh_pct = 92.5,
    cell_temperature_c = 28.5,
    terminal_voltage_v = 3.85,
    current_load_a = 1.5,
    internal_resistance_total_ohm = 0.120,
    health_status = 'Optimal (Healthy)',
    status_color = 'emerald',
    is_charging = false,
    degradation_mechanisms = {}
  } = state || {};

  const seiPct = degradation_mechanisms.sei_layer_growth_pct || 45;

  return (
    <div className="card-clean p-5 flex flex-col justify-between h-full">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1b222d]">
        <div>
          <h3 className="text-xs font-semibold text-white tracking-wide">
            18650 Cell Physical State
          </h3>
          <p className="text-[11px] text-slate-400">
            NMC / Graphite Electrochemical Model
          </p>
        </div>
        <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
          status_color === 'emerald'
            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
            : status_color === 'cyan'
            ? 'bg-blue-950/40 text-blue-400 border-blue-800/60'
            : status_color === 'amber'
            ? 'bg-amber-950/40 text-amber-400 border-amber-800/60'
            : 'bg-rose-950/40 text-rose-400 border-rose-800/60'
        }`}>
          {health_status}
        </span>
      </div>

      {/* Clean Technical Cell Schematic */}
      <div className="py-5 flex items-center justify-center">
        <div className="w-full max-w-[320px]">
          <svg viewBox="0 0 320 180" className="w-full h-auto">
            {/* Outer Can */}
            <rect x="40" y="25" width="230" height="130" rx="10" fill="#0d1117" stroke="#2a3649" strokeWidth="1.5" />
            
            {/* Positive Terminal Cap */}
            <rect x="270" y="70" width="12" height="40" rx="2" fill="#3b82f6" opacity="0.85" />
            
            {/* Negative Base */}
            <rect x="34" y="45" width="6" height="90" rx="1.5" fill="#475569" />

            {/* Internal Layers */}
            {/* Cathode */}
            <rect x="55" y="40" width="200" height="26" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <text x="65" y="57" fill="#94a3b8" fontSize="10" fontFamily="sans-serif" fontWeight="500">
              Cathode (+) Li(NiCoMn)O2
            </text>

            {/* Separator / SEI */}
            <rect x="55" y="74" width="200" height="22" rx="3" fill="#182234" stroke="#2563eb" strokeWidth="1" strokeDasharray="3 3" />
            <text x="65" y="89" fill="#60a5fa" fontSize="9.5" fontFamily="sans-serif">
              Separator & SEI Layer ({seiPct}% Growth)
            </text>

            {/* Anode */}
            <rect x="55" y="104" width="200" height="26" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <text x="65" y="121" fill="#94a3b8" fontSize="10" fontFamily="sans-serif" fontWeight="500">
              Anode (-) Mesoporous Graphite
            </text>

            {/* Sub-label */}
            <text x="155" y="146" textAnchor="middle" fill="#64748b" fontSize="9.5" fontFamily="monospace">
              {terminal_voltage_v.toFixed(3)} V • {Math.abs(current_load_a).toFixed(2)} A • {is_charging ? 'Charging' : 'Discharging'}
            </text>
          </svg>
        </div>
      </div>

      {/* Clean 4-Metric Grid */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#1b222d]">
        <div className="bg-[#121824] p-2.5 rounded-lg border border-[#1e2738]">
          <span className="text-[10px] text-slate-400 block">State of Health (SOH)</span>
          <span className="text-base font-semibold text-white font-mono mt-0.5 block">
            {soh_pct.toFixed(1)}%
          </span>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full ${soh_pct >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
              style={{ width: `${Math.min(100, soh_pct)}%` }} 
            />
          </div>
        </div>

        <div className="bg-[#121824] p-2.5 rounded-lg border border-[#1e2738]">
          <span className="text-[10px] text-slate-400 block">State of Charge (SOC)</span>
          <span className="text-base font-semibold text-white font-mono mt-0.5 block">
            {soc_pct.toFixed(1)}%
          </span>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full" 
              style={{ width: `${Math.min(100, soc_pct)}%` }} 
            />
          </div>
        </div>

        <div className="bg-[#121824] p-2.5 rounded-lg border border-[#1e2738]">
          <span className="text-[10px] text-slate-400 block">Core Temperature</span>
          <span className="text-base font-semibold text-white font-mono mt-0.5 block">
            {cell_temperature_c.toFixed(1)}°C
          </span>
          <span className="text-[9px] text-slate-500 block mt-0.5">
            {cell_temperature_c > 40 ? 'High' : 'Normal'}
          </span>
        </div>

        <div className="bg-[#121824] p-2.5 rounded-lg border border-[#1e2738]">
          <span className="text-[10px] text-slate-400 block">Internal Resistance</span>
          <span className="text-base font-semibold text-white font-mono mt-0.5 block">
            {(internal_resistance_total_ohm * 1000).toFixed(1)} mΩ
          </span>
          <span className="text-[9px] text-slate-500 block mt-0.5">
            Re + Rct combined
          </span>
        </div>
      </div>

    </div>
  );
}
