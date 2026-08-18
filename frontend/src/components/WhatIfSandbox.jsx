import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Flame, 
  Zap, 
  TrendingDown, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  Info,
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
  Legend
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
      "Thermal Stress Alert: Active liquid cooling required to avoid accelerated SEI breakdown and catastrophic knee.",
      "Fast-Charging Overpotential: Step-down charging protocol (multi-stage CC-CV) recommended to reduce polarization heating.",
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
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white tracking-wide font-mono">
                PHYSICS-INFORMED WHAT-IF STRESS SANDBOX
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                Arrhenius Thermal Kinetics
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Stress-test virtual battery degradation under extreme temperatures, high C-rate fast charging, and depth of discharge
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 flex-wrap">
          <button
            onClick={() => { setTestTemp(25); setTestCRate(1.0); setDodPct(80); }}
            className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 bg-slate-800 hover:bg-slate-700 transition-all"
          >
            🚗 Standard EV (25°C, 1C)
          </button>
          <button
            onClick={() => { setTestTemp(45); setTestCRate(2.5); setDodPct(100); }}
            className="px-3 py-1.5 rounded-lg text-xs font-mono text-amber-300 bg-amber-500/20 border border-amber-500/40 font-bold transition-all shadow-[0_0_10px_rgba(245,158,11,0.2)]"
          >
            ⚡ Supercharger Stress (45°C, 2.5C)
          </button>
          <button
            onClick={() => { setTestTemp(0); setTestCRate(2.0); setDodPct(90); }}
            className="px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-300 bg-cyan-500/20 border border-cyan-500/40 transition-all"
          >
            ❄️ Sub-Zero Plating (0°C, 2C)
          </button>
        </div>
      </div>

      {/* Top 3 Impact KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Life Reduction */}
        <div className="glass-panel rounded-2xl p-5 border border-rose-500/35 bg-gradient-to-br from-rose-950/30 via-slate-900 to-slate-900 shadow-xl">
          <div className="flex items-center justify-between text-xs font-mono text-rose-400">
            <span className="flex items-center gap-1.5 font-bold">
              <TrendingDown className="w-4 h-4" /> LIFETIME CAPACITY PENALTY
            </span>
            <span className="text-[10px] bg-rose-500/20 px-2 py-0.5 rounded font-bold text-rose-300">
              AGING LOSS
            </span>
          </div>
          <div className="mt-2.5">
            <h3 className="text-4xl font-extrabold font-mono text-white text-glow-rose">
              -{whatIfResult.lifetime_impact.life_reduction_pct}%
            </h3>
            <p className="text-xs text-slate-300 font-mono mt-1">
              Lost: <strong className="text-rose-400 font-bold text-sm">{whatIfResult.lifetime_impact.cycle_loss} usable cycles</strong> before EOL
            </p>
          </div>
        </div>

        {/* Aging Acceleration Multiplier */}
        <div className="glass-panel rounded-2xl p-5 border border-amber-500/35 bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900 shadow-xl">
          <div className="flex items-center justify-between text-xs font-mono text-amber-400">
            <span className="flex items-center gap-1.5 font-bold">
              <Flame className="w-4 h-4" /> AGING ACCELERATION FACTOR
            </span>
            <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded font-bold text-amber-300">
              KINETIC MULTIPLIER
            </span>
          </div>
          <div className="mt-2.5">
            <h3 className="text-4xl font-extrabold font-mono text-white text-glow-amber">
              {whatIfResult.lifetime_impact.aging_acceleration_factor}x <span className="text-xs text-slate-400 font-normal">faster aging</span>
            </h3>
            <p className="text-xs text-slate-300 font-mono mt-1">
              Compared to standard 25°C 1.0C baseline cycling
            </p>
          </div>
        </div>

        {/* Expected EOL Cycle */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-cyan-400" /> PROJECTED EOL BOUNDARY
            </span>
            <span className="text-[10px] text-slate-500">1.40 Ah Threshold</span>
          </div>
          <div className="mt-2.5">
            <h3 className="text-4xl font-extrabold font-mono text-cyan-300">
              Cycle {whatIfResult.stress_conditions.expected_eol_cycle}
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-1">
              vs Baseline: <span className="text-emerald-400 font-bold">Cycle {whatIfResult.baseline_conditions.expected_eol_cycle}</span>
            </p>
          </div>
        </div>

      </div>

      {/* Stress Controls & Comparative Trajectory Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 4 Cols: Stress Sliders */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-5 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            Environmental Stress Parameters
          </h3>

          {/* Stress Temp */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-400">Chamber Temp (°C):</span>
              <span className="text-rose-400 font-bold">{testTemp}°C</span>
            </div>
            <input
              type="range"
              min="-10"
              max="55"
              step="1"
              value={testTemp}
              onChange={(e) => setTestTemp(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-rose-400 border border-slate-800"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
              <span>-10°C (Plating)</span>
              <span>25°C (Nominal)</span>
              <span>55°C (Severe)</span>
            </div>
          </div>

          {/* Fast-Charging C-Rate */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-400">Charging Rate (C-Rate):</span>
              <span className="text-amber-400 font-bold">{testCRate.toFixed(1)} C</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.5"
              step="0.1"
              value={testCRate}
              onChange={(e) => setTestCRate(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-amber-400 border border-slate-800"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
              <span>0.5C (Slow)</span>
              <span>1.0C (Standard)</span>
              <span>3.5C (Extreme)</span>
            </div>
          </div>

          {/* Depth of Discharge (DoD) */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-400">Depth of Discharge (DoD %):</span>
              <span className="text-purple-400 font-bold">{dodPct}%</span>
            </div>
            <input
              type="range"
              min="40"
              max="100"
              step="5"
              value={dodPct}
              onChange={(e) => setDodPct(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-purple-400 border border-slate-800"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
              <span>40% (Partial)</span>
              <span>80% (Optimal)</span>
              <span>100% (Full)</span>
            </div>
          </div>

          {/* BMS Engineering Recommendations */}
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              Automated BMS Mitigations
            </h4>
            <div className="space-y-2">
              {whatIfResult.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-300 shadow-inner">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="leading-tight">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 8 Cols: Comparative Lifetime Trajectory Chart */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-cyan-400" />
                Lifetime Degradation Trajectory: Baseline vs Stress Scenario
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Comparison of capacity retention (Ah) to 1.40 Ah End-of-Life (EOL) boundary
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00F0FF] inline-block"></span> Baseline (25°C, 1C)
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_6px_#EF4444] inline-block"></span> Stress ({testTemp}°C, {testCRate}C)
              </span>
            </div>
          </div>

          <div className="h-[290px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={combinedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="cycle" stroke="#64748B" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis domain={[1.2, 2.05]} stroke="#64748B" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A101D', borderColor: '#1E293B', borderRadius: '12px', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <ReferenceLine y={1.40} stroke="#EF4444" strokeDasharray="4 4" label={{ value: 'EOL Threshold (1.40 Ah)', fill: '#EF4444', fontSize: 10, fontFamily: 'monospace' }} />
                <Line type="monotone" dataKey="baseline_capacity" stroke="#00F0FF" strokeWidth={3} dot={false} name="Baseline (25°C, 1.0C)" />
                <Line type="monotone" dataKey="stress_capacity" stroke="#EF4444" strokeWidth={3} dot={false} name={`Stress (${testTemp}°C, ${testCRate}C)`} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
