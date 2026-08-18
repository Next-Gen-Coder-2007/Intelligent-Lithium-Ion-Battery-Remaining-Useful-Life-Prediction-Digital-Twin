import React, { useState, useEffect } from 'react';
import { Sliders, AlertCircle, Info } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

import { runWhatIfAnalysis } from '../services/api';

export default function WhatIfSandbox() {
  const [testTemp, setTestTemp] = useState(45);
  const [testCRate, setTestCRate] = useState(2.5);
  const [dodPct, setDodPct] = useState(100);

  const [whatIfResult, setWhatIfResult] = useState({
    baseline_conditions: { ambient_temp_c: 25, c_rate: 1.0, dod_pct: 80, expected_eol_cycle: 160 },
    stress_conditions: { ambient_temp_c: 45, c_rate: 2.5, dod_pct: 100, expected_eol_cycle: 95 },
    lifetime_impact: { life_reduction_pct: 40.6, aging_acceleration_factor: 1.68, cycle_loss: 65 },
    recommendations: [
      "Thermal Stress Alert: Active liquid cooling required to avoid accelerated SEI breakdown.",
      "Fast-Charging Overpotential: Step-down charging protocol (multi-stage CC-CV) recommended.",
      "Depth of Discharge Penalty: Restricting cycling depth between 15% - 85% can extend cycle lifespan by up to 2.3x."
    ],
    baseline_curve: [],
    stress_curve: []
  });

  const [combinedChartData, setCombinedChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const data = await runWhatIfAnalysis({
        base_temp: 25.0,
        test_temp: testTemp,
        base_c_rate: 1.0,
        test_c_rate: testCRate,
        dod_pct: dodPct
      });
      setWhatIfResult(data);

      const merged = [];
      const len = Math.max(data.baseline_curve?.length || 0, data.stress_curve?.length || 0);
      for (let i = 0; i < len; i++) {
        const b = data.baseline_curve?.[i];
        const s = data.stress_curve?.[i];
        merged.push({
          cycle: b?.cycle || s?.cycle,
          baseline_capacity: b?.capacity_ah,
          stress_capacity: s?.capacity_ah,
          baseline_temp: b?.temp_c,
          stress_temp: s?.temp_c
        });
      }
      setCombinedChartData(merged);
    } catch (err) {
      console.warn('What-if fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [testTemp, testCRate, dodPct]);

  return (
    <div className="space-y-5">
      
      {/* Header */}
      <div className="card-clean p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight">
            What-If Degradation Sandbox
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Physics-informed Arrhenius stress modeling across temperature, C-rate, and DoD
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1 p-1 bg-[#121824] rounded-lg border border-[#1e2738] flex-wrap">
          <button
            onClick={() => { setTestTemp(25); setTestCRate(1.0); setDodPct(80); }}
            className="px-2.5 py-1 rounded-md text-xs text-slate-400 hover:text-white"
          >
            Nominal EV (25°C, 1C)
          </button>
          <button
            onClick={() => { setTestTemp(45); setTestCRate(2.5); setDodPct(100); }}
            className="px-2.5 py-1 rounded-md text-xs text-white bg-slate-800 font-medium"
          >
            Fast Charge (45°C, 2.5C)
          </button>
          <button
            onClick={() => { setTestTemp(0); setTestCRate(2.0); setDodPct(90); }}
            className="px-2.5 py-1 rounded-md text-xs text-slate-400 hover:text-white"
          >
            Cold Stress (0°C, 2C)
          </button>
        </div>
      </div>

      {/* 3 Impact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-clean p-4">
          <span className="text-xs text-slate-400 block">Lifetime Capacity Loss</span>
          <h3 className="text-2xl font-bold font-mono text-white mt-1">
            -{whatIfResult.lifetime_impact.life_reduction_pct}%
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Lost {whatIfResult.lifetime_impact.cycle_loss} usable cycles before EOL
          </p>
        </div>

        <div className="card-clean p-4">
          <span className="text-xs text-slate-400 block">Aging Acceleration</span>
          <h3 className="text-2xl font-bold font-mono text-white mt-1">
            {whatIfResult.lifetime_impact.aging_acceleration_factor}x
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Degradation rate relative to 25°C 1.0C
          </p>
        </div>

        <div className="card-clean p-4">
          <span className="text-xs text-slate-400 block">Projected EOL Cycle</span>
          <h3 className="text-2xl font-bold font-mono text-slate-200 mt-1">
            Cycle {whatIfResult.stress_conditions.expected_eol_cycle}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            vs Baseline Cycle {whatIfResult.baseline_conditions.expected_eol_cycle}
          </p>
        </div>
      </div>

      {/* Sliders & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Sliders (4 Cols) */}
        <div className="lg:col-span-4 card-clean p-5 space-y-4">
          <h3 className="text-xs font-semibold text-white tracking-wide">
            Stress Test Parameters
          </h3>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Ambient Temp (°C):</span>
              <span className="text-white font-mono font-medium">{testTemp}°C</span>
            </div>
            <input
              type="range"
              min="-10"
              max="55"
              step="1"
              value={testTemp}
              onChange={(e) => setTestTemp(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Fast Charge C-Rate:</span>
              <span className="text-white font-mono font-medium">{testCRate.toFixed(1)} C</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.5"
              step="0.1"
              value={testCRate}
              onChange={(e) => setTestCRate(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Depth of Discharge (DoD):</span>
              <span className="text-white font-mono font-medium">{dodPct}%</span>
            </div>
            <input
              type="range"
              min="40"
              max="100"
              step="5"
              value={dodPct}
              onChange={(e) => setDodPct(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Recommendations */}
          <div className="mt-4 pt-3 border-t border-[#1b222d] space-y-2">
            <span className="text-xs text-slate-300 font-medium block">
              BMS Mitigations
            </span>
            {whatIfResult.recommendations.map((rec, idx) => (
              <div key={idx} className="p-2 rounded bg-[#121824] border border-[#1e2738] text-[11px] text-slate-300">
                {rec}
              </div>
            ))}
          </div>
        </div>

        {/* Comparative Trajectory Chart (8 Cols) */}
        <div className="lg:col-span-8 card-clean p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-semibold text-white">
                Trajectory Comparison: Baseline vs Stress
              </h3>
              <p className="text-[11px] text-slate-400">Capacity retention (Ah) to 1.40 Ah EOL</p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-blue-400 font-medium">● Baseline (25°C, 1C)</span>
              <span className="text-rose-400 font-medium">● Stress ({testTemp}°C, {testCRate}C)</span>
            </div>
          </div>

          <div className="h-[270px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={combinedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1b222d" vertical={false} />
                <XAxis dataKey="cycle" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis domain={[1.2, 2.05]} stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d1117', borderColor: '#1b222d', borderRadius: '8px', fontSize: '11px' }}
                />
                <ReferenceLine y={1.40} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'EOL Cutoff', fill: '#ef4444', fontSize: 10 }} />
                <Line type="monotone" dataKey="baseline_capacity" stroke="#3b82f6" strokeWidth={2} dot={false} name="Baseline" />
                <Line type="monotone" dataKey="stress_capacity" stroke="#ef4444" strokeWidth={2} dot={false} name="Stress" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
