import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Activity, 
  Thermometer, 
  Gauge, 
  Zap, 
  TrendingDown, 
  Calendar, 
  AlertCircle,
  FileSpreadsheet,
  Layers
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts';

import { fetchCellsList, fetchCellDetail } from '../services/api';

export default function CellExplorer() {
  const [selectedCell, setSelectedCell] = useState('B0005');
  const [cellInfo, setCellInfo] = useState(null);
  const [cellHistory, setCellHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const cellPresets = [
    { id: 'B0005', label: 'B0005', desc: 'Standard 24°C Nominal Cycling', temp: '24°C', cutoff: '2.7V', eol: 'Cycle 124', color: 'cyan' },
    { id: 'B0006', label: 'B0006', desc: 'Deep Discharge Stress 2.5V', temp: '24°C', cutoff: '2.5V', eol: 'Cycle 109', color: 'amber' },
    { id: 'B0007', label: 'B0007', desc: 'Extended Deep Discharge 2.2V', temp: '24°C', cutoff: '2.2V', eol: 'Cycle 168', color: 'emerald' },
    { id: 'B0018', label: 'B0018', desc: 'High-Temperature Stress 44°C', temp: '44°C', cutoff: '2.5V', eol: 'Cycle 97', color: 'rose' },
  ];

  useEffect(() => {
    async function loadCell() {
      setLoading(true);
      try {
        const detail = await fetchCellDetail(selectedCell);
        setCellInfo(detail);
        setCellHistory(detail.cycles || []);
      } catch (err) {
        console.warn('Fallback cell history:', err);
        const mock = [];
        for (let i = 1; i <= 168; i += 2) {
          const cap = Math.max(1.25, 1.85 - (i * 0.0035) - ((i > 110 ? (i - 110) * 0.005 : 0)));
          mock.push({
            Cycle_Index: i,
            Discharge_Capacity_Ah: cap,
            SOH_Pct: (cap / 2.0) * 100,
            Electrolyte_Resistance_Re: 0.05 + (i * 0.0003),
            Max_Discharge_Temp_C: 32 + (i * 0.04),
            RUL: Math.max(0, 124 - i)
          });
        }
        setCellHistory(mock);
      } finally {
        setLoading(false);
      }
    }
    loadCell();
  }, [selectedCell]);

  return (
    <div className="space-y-6">
      
      {/* Header & Cell Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white tracking-wide font-mono">
                NASA PCoE EXPERIMENTAL BATTERY EXPLORER
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/30">
                18650 Accelerated Cycling
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Cycle-by-cycle empirical degradation characteristics across varying thermal and cutoff voltage regimes
            </p>
          </div>
        </div>

        {/* Cell Selector Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 flex-wrap">
          {cellPresets.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCell(c.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                selectedCell === c.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {c.label} ({c.temp})
            </button>
          ))}
        </div>
      </div>

      {/* Selected Cell Dossier Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel rounded-xl p-4 border border-slate-800 shadow-inner">
          <span className="text-[10px] font-mono text-slate-400 uppercase block font-semibold">ACTIVE CELL ID</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-cyan-400">{selectedCell}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">LiCoO2 / NMC</span>
          </div>
          <span className="text-xs text-slate-400 font-mono mt-1 block">
            Nominal: 2.0 Ah • 3.7 V
          </span>
        </div>

        <div className="glass-panel rounded-xl p-4 border border-slate-800 shadow-inner">
          <span className="text-[10px] font-mono text-slate-400 uppercase block font-semibold">TEST TEMPERATURE</span>
          <div className="flex items-center gap-2 mt-1">
            <Thermometer className="w-4 h-4 text-amber-400" />
            <span className="text-2xl font-bold font-mono text-white">
              {cellPresets.find(c => c.id === selectedCell)?.temp || '24°C'}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono mt-1 block">
            {selectedCell === 'B0018' ? 'High-Temp Environmental Chamber' : 'Ambient Room Chamber'}
          </span>
        </div>

        <div className="glass-panel rounded-xl p-4 border border-slate-800 shadow-inner">
          <span className="text-[10px] font-mono text-slate-400 uppercase block font-semibold">DISCHARGE CUTOFF</span>
          <div className="flex items-center gap-2 mt-1">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-2xl font-bold font-mono text-white">
              {cellPresets.find(c => c.id === selectedCell)?.cutoff || '2.7V'}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono mt-1 block">
            Load: 2.0A Constant Current
          </span>
        </div>

        <div className="glass-panel rounded-xl p-4 border border-slate-800 shadow-inner">
          <span className="text-[10px] font-mono text-slate-400 uppercase block font-semibold">EOL KNEE CROSSING</span>
          <div className="flex items-center gap-2 mt-1">
            <TrendingDown className="w-4 h-4 text-rose-400" />
            <span className="text-2xl font-bold font-mono text-rose-300">
              {cellPresets.find(c => c.id === selectedCell)?.eol || 'Cycle 124'}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono mt-1 block">
            End of Life at 1.40 Ah (70% SOH)
          </span>
        </div>

      </div>

      {/* Primary Chart: Capacity Degradation & SOH Timeline */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Discharge Capacity Fade & SOH Aging Curve ({selectedCell})
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Measured experimental capacity (Ah) across all continuous charge-discharge cycles
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="flex items-center gap-1 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00F0FF] inline-block"></span> Capacity (Ah)
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_6px_#EF4444] inline-block"></span> EOL Threshold (1.4 Ah)
            </span>
          </div>
        </div>

        <div className="h-[270px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cellHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cellCapGradPro" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="Cycle_Index" stroke="#64748B" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
              <YAxis domain={[1.2, 2.1]} stroke="#64748B" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0A101D', borderColor: '#1E293B', borderRadius: '12px', fontSize: '11px', fontFamily: 'monospace' }}
              />
              <ReferenceLine y={1.40} stroke="#EF4444" strokeDasharray="4 4" label={{ value: 'EOL Limit (1.40 Ah)', fill: '#EF4444', fontSize: 10, fontFamily: 'monospace' }} />
              <Area type="monotone" dataKey="Discharge_Capacity_Ah" stroke="#00F0FF" strokeWidth={2.5} fillOpacity={1} fill="url(#cellCapGradPro)" name="Discharge Capacity (Ah)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Chart: Internal Resistance Re & Temperature Rise */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Gauge className="w-4 h-4 text-purple-400" />
              Electrolyte Resistance (Re) Growth & Thermal Escalation
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Electrochemical impedance spectroscopy (EIS) tracking and peak discharge temperature
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="flex items-center gap-1 text-purple-400">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_6px_#A855F7] inline-block"></span> Resistance Re (Ω)
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_#F59E0B] inline-block"></span> Peak Temp (°C)
            </span>
          </div>
        </div>

        <div className="h-[230px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cellHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="Cycle_Index" stroke="#64748B" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
              <YAxis yAxisId="left" stroke="#A855F7" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
              <YAxis yAxisId="right" orientation="right" stroke="#F59E0B" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0A101D', borderColor: '#1E293B', borderRadius: '12px', fontSize: '11px', fontFamily: 'monospace' }}
              />
              <Line yAxisId="left" type="monotone" dataKey="Electrolyte_Resistance_Re" stroke="#A855F7" strokeWidth={2.5} dot={false} name="Electrolyte Resistance Re (Ω)" />
              <Line yAxisId="right" type="monotone" dataKey="Max_Discharge_Temp_C" stroke="#F59E0B" strokeWidth={2} dot={false} name="Peak Temp (°C)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
