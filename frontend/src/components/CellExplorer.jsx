import React, { useState, useEffect } from 'react';
import { Database, Thermometer, Zap, TrendingDown } from 'lucide-react';
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

import { fetchCellDetail } from '../services/api';

export default function CellExplorer() {
  const [selectedCell, setSelectedCell] = useState('B0005');
  const [cellInfo, setCellInfo] = useState(null);
  const [cellHistory, setCellHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const cellPresets = [
    { id: 'B0005', label: 'B0005 (24°C Nominal)', temp: '24°C', cutoff: '2.7V', eol: 'Cycle 124' },
    { id: 'B0006', label: 'B0006 (24°C Deep Cutoff)', temp: '24°C', cutoff: '2.5V', eol: 'Cycle 109' },
    { id: 'B0007', label: 'B0007 (24°C Extended)', temp: '24°C', cutoff: '2.2V', eol: 'Cycle 168' },
    { id: 'B0018', label: 'B0018 (44°C High Temp)', temp: '44°C', cutoff: '2.5V', eol: 'Cycle 97' },
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
    <div className="space-y-5">
      
      {/* Header & Switcher */}
      <div className="card-clean p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight">
            NASA PCoE Experimental Cells
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Empirical lifecycle telemetry from accelerated aging test chambers
          </p>
        </div>

        {/* Cell Selector Buttons */}
        <div className="flex items-center gap-1 p-1 bg-[#121824] rounded-lg border border-[#1e2738] flex-wrap">
          {cellPresets.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCell(c.id)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedCell === c.id
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {c.id}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Cell Dossier Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-clean p-3.5">
          <span className="text-[10px] text-slate-400 block uppercase">Cell ID</span>
          <span className="text-lg font-bold font-mono text-white mt-0.5 block">{selectedCell}</span>
          <span className="text-[11px] text-slate-400">18650 Li-ion</span>
        </div>

        <div className="card-clean p-3.5">
          <span className="text-[10px] text-slate-400 block uppercase">Test Temperature</span>
          <span className="text-lg font-bold font-mono text-white mt-0.5 block">
            {cellPresets.find(c => c.id === selectedCell)?.temp || '24°C'}
          </span>
          <span className="text-[11px] text-slate-400">
            {selectedCell === 'B0018' ? 'Thermal Chamber' : 'Room Chamber'}
          </span>
        </div>

        <div className="card-clean p-3.5">
          <span className="text-[10px] text-slate-400 block uppercase">Discharge Cutoff</span>
          <span className="text-lg font-bold font-mono text-white mt-0.5 block">
            {cellPresets.find(c => c.id === selectedCell)?.cutoff || '2.7V'}
          </span>
          <span className="text-[11px] text-slate-400">2.0A Constant Current</span>
        </div>

        <div className="card-clean p-3.5">
          <span className="text-[10px] text-slate-400 block uppercase">EOL Crossing</span>
          <span className="text-lg font-bold font-mono text-slate-300 mt-0.5 block">
            {cellPresets.find(c => c.id === selectedCell)?.eol || 'Cycle 124'}
          </span>
          <span className="text-[11px] text-slate-400">70% SOH Boundary</span>
        </div>
      </div>

      {/* Primary Chart: Capacity Degradation */}
      <div className="card-clean p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-white">
            Discharge Capacity Fade ({selectedCell})
          </h3>
          <span className="text-[11px] text-slate-400">Experimental Capacity (Ah)</span>
        </div>

        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cellHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cellCapClean" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1b222d" vertical={false} />
              <XAxis dataKey="Cycle_Index" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
              <YAxis domain={[1.2, 2.1]} stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0d1117', borderColor: '#1b222d', borderRadius: '8px', fontSize: '11px' }}
              />
              <ReferenceLine y={1.40} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'EOL Limit', fill: '#ef4444', fontSize: 10 }} />
              <Area type="monotone" dataKey="Discharge_Capacity_Ah" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#cellCapClean)" name="Capacity (Ah)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Chart: Impedance Re */}
      <div className="card-clean p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-white">
            Electrolyte Resistance Growth & Thermal Rise
          </h3>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Resistance Re (Ω)</span>
            <span>Peak Temp (°C)</span>
          </div>
        </div>

        <div className="h-[210px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cellHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1b222d" vertical={false} />
              <XAxis dataKey="Cycle_Index" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
              <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0d1117', borderColor: '#1b222d', borderRadius: '8px', fontSize: '11px' }}
              />
              <Line yAxisId="left" type="monotone" dataKey="Electrolyte_Resistance_Re" stroke="#8b5cf6" strokeWidth={1.5} dot={false} name="Resistance Re (Ω)" />
              <Line yAxisId="right" type="monotone" dataKey="Max_Discharge_Temp_C" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="Peak Temp (°C)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
