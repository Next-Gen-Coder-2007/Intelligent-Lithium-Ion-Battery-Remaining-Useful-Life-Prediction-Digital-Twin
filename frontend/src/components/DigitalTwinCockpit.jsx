import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Zap, 
  Thermometer, 
  Gauge, 
  Activity, 
  Sliders, 
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

import BatteryCellHologram from './BatteryCellHologram';
import { simulateStep } from '../services/api';

export default function DigitalTwinCockpit() {
  const [cycleIndex, setCycleIndex] = useState(15);
  const [socPct, setSocPct] = useState(80);
  const [ambientTemp, setAmbientTemp] = useState(25);
  const [cRate, setCRate] = useState(1.0);
  const [isCharging, setIsCharging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Live state from simulation API
  const [cellState, setCellState] = useState({
    cycle_index: 15,
    soc_pct: 80,
    terminal_voltage_v: 3.82,
    open_circuit_voltage_v: 3.86,
    current_load_a: 1.5,
    cell_temperature_c: 27.2,
    ambient_temperature_c: 25,
    discharge_capacity_ah: 1.892,
    nominal_capacity_ah: 2.0,
    soh_pct: 94.6,
    electrolyte_resistance_re_ohm: 0.052,
    charge_transfer_resistance_rct_ohm: 0.068,
    internal_resistance_total_ohm: 0.120,
    predicted_rul_cycles: 109.0,
    confidence_interval_95: { lower: 99.2, upper: 118.8, uncertainty_std: 4.9 },
    health_status: 'Optimal (Healthy)',
    status_color: 'emerald',
    is_eol_reached: false,
    degradation_mechanisms: {
      sei_layer_growth_pct: 54.2,
      active_material_loss_pct: 35.8,
      plating_knee_stress_pct: 10.0
    }
  });

  // Real-time telemetry history for charts
  const [history, setHistory] = useState([
    { tick: 1, voltage: 3.88, temp: 25.4, soh: 96.5, rul: 120, capacity: 1.93 },
    { tick: 5, voltage: 3.85, temp: 26.1, soh: 95.8, rul: 116, capacity: 1.916 },
    { tick: 10, voltage: 3.83, temp: 26.8, soh: 95.1, rul: 113, capacity: 1.902 },
    { tick: 15, voltage: 3.82, temp: 27.2, soh: 94.6, rul: 109, capacity: 1.892 },
  ]);

  const timerRef = useRef(null);

  // Function to query digital twin step simulation
  const fetchSimulationState = async (cIdx, soc, temp, cr, charging) => {
    try {
      const data = await simulateStep({
        cycle_index: cIdx,
        soc_pct: soc,
        current_load_a: 1.5 * cr,
        ambient_temp_c: temp,
        c_rate: cr,
        is_charging: charging
      });
      setCellState(data);

      setHistory(prev => {
        const next = [
          ...prev.slice(-19),
          {
            tick: cIdx,
            voltage: data.terminal_voltage_v,
            temp: data.cell_temperature_c,
            soh: data.soh_pct,
            rul: data.predicted_rul_cycles,
            capacity: data.discharge_capacity_ah
          }
        ];
        return next;
      });
    } catch (err) {
      console.warn('Simulation step query fallback:', err);
    }
  };

  // Trigger step whenever parameters change
  useEffect(() => {
    fetchSimulationState(cycleIndex, socPct, ambientTemp, cRate, isCharging);
  }, [cycleIndex, socPct, ambientTemp, cRate, isCharging]);

  // Continuous play timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCycleIndex(prev => {
          if (prev >= 170) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1200);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Digital Twin Cockpit Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel rounded-2xl p-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              Virtual Test Bench & Digital Twin Cockpit
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono">
                CYCLE {cycleIndex} / 168
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Live electrochemical state tracking with real-time ML-estimated Remaining Useful Life
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shadow-md ${
              isPlaying
                ? 'bg-amber-500 text-black hover:bg-amber-400'
                : 'bg-cyan-500 text-black hover:bg-cyan-400'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'PAUSE AUTO-CYCLE' : 'PLAY VIRTUAL CYCLE'}</span>
          </button>

          <button
            onClick={() => setCycleIndex(prev => Math.min(170, prev + 1))}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-all"
            title="Step +1 Cycle"
          >
            <span>+1 Step</span>
          </button>

          <button
            onClick={() => setCycleIndex(prev => Math.min(170, prev + 10))}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-all"
            title="Fast Forward +10 Cycles"
          >
            <FastForward className="w-3 h-3 text-cyan-400" />
            <span>+10 Cycles</span>
          </button>

          <button
            onClick={() => {
              setCycleIndex(1);
              setSocPct(90);
              setIsPlaying(false);
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-all"
            title="Reset to Fresh Cell (Cycle 1)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsCharging(!isCharging)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-all ${
              isCharging
                ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300'
                : 'bg-amber-950/80 border-amber-500/50 text-amber-300'
            }`}
          >
            {isCharging ? '⚡ CHARGING (CC-CV)' : '🔋 DISCHARGING (Load)'}
          </button>
        </div>
      </div>

      {/* Main Grid: Holographic Battery Core + High-Priority Prognostics KPI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 5 Cols: Hologram Component */}
        <div className="lg:col-span-5 flex flex-col">
          <BatteryCellHologram state={{ ...cellState, is_charging: isCharging }} />
        </div>

        {/* Right 7 Cols: Master RUL Prognostics & Telemetry Gauges */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          
          {/* Top Master RUL KPI Card */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-cyan-950/20">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-1.5 font-bold">
                  <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  Machine Learning RUL Prognosis
                </span>
                <div className="flex items-baseline gap-3 mt-1.5">
                  <span className="text-4xl lg:text-5xl font-extrabold font-mono text-white tracking-tight">
                    {cellState.predicted_rul_cycles.toFixed(0)}
                  </span>
                  <span className="text-sm font-mono text-slate-400 font-medium">
                    CYCLES REMAINING
                  </span>
                </div>
              </div>

              {/* 95% Confidence Interval Pill */}
              <div className="text-right bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block">95% CONFIDENCE BOUNDS</span>
                <span className="text-xs font-mono font-bold text-cyan-300">
                  [{cellState.confidence_interval_95.lower} – {cellState.confidence_interval_95.upper}]
                </span>
                <span className="text-[9px] font-mono text-slate-500 block mt-0.5">
                  σ = ±{cellState.confidence_interval_95.uncertainty_std} cycles
                </span>
              </div>
            </div>

            {/* Capacity Degradation Trajectory Bar */}
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1.5">
                <span>Measured Capacity: <strong className="text-white">{cellState.discharge_capacity_ah.toFixed(4)} Ah</strong></span>
                <span>EOL Threshold: <strong className="text-rose-400">1.400 Ah (70% SOH)</strong></span>
              </div>
              <div className="w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    cellState.soh_pct >= 85
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                      : cellState.soh_pct >= 75
                      ? 'bg-gradient-to-r from-cyan-400 to-amber-400'
                      : 'bg-gradient-to-r from-amber-400 to-rose-500'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, ((cellState.discharge_capacity_ah - 1.4) / (2.0 - 1.4)) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>Fresh Cell (2.0 Ah)</span>
                <span>Remaining Usable Life Window</span>
                <span>EOL Decommissioning</span>
              </div>
            </div>
          </div>

          {/* 3 Physical Diagnostic Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Terminal Voltage */}
            <div className="glass-panel rounded-xl p-3.5 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>TERMINAL VOLTAGE</span>
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="my-1">
                <span className="text-xl font-bold font-mono text-white">
                  {cellState.terminal_voltage_v.toFixed(3)}
                </span>
                <span className="text-xs font-mono text-slate-400 ml-1">V</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                OCV: {cellState.open_circuit_voltage_v.toFixed(3)} V
              </span>
            </div>

            {/* Operating Temp */}
            <div className="glass-panel rounded-xl p-3.5 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>CELL TEMPERATURE</span>
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="my-1">
                <span className="text-xl font-bold font-mono text-white">
                  {cellState.cell_temperature_c.toFixed(1)}
                </span>
                <span className="text-xs font-mono text-slate-400 ml-1">°C</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                Ambient: {cellState.ambient_temperature_c}°C
              </span>
            </div>

            {/* Internal Resistance Re + Rct */}
            <div className="glass-panel rounded-xl p-3.5 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>IMPEDANCE (Re/Rct)</span>
                <Gauge className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="my-1">
                <span className="text-xl font-bold font-mono text-purple-300">
                  {(cellState.internal_resistance_total_ohm * 1000).toFixed(1)}
                </span>
                <span className="text-xs font-mono text-slate-400 ml-1">mΩ</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                Re: {(cellState.electrolyte_resistance_re_ohm * 1000).toFixed(0)}mΩ | Rct: {(cellState.charge_transfer_resistance_rct_ohm * 1000).toFixed(0)}mΩ
              </span>
            </div>

          </div>

          {/* Degradation Mechanisms Progress Breakdown */}
          <div className="glass-panel rounded-xl p-4 border border-slate-800">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Electrochemical Degradation Contribution</span>
              <span className="text-[10px] text-slate-500">Physics Decomposition</span>
            </h4>
            <div className="space-y-2 text-xs font-mono">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Solid Electrolyte Interphase (SEI Growth)</span>
                  <span className="text-amber-400 font-bold">{cellState.degradation_mechanisms.sei_layer_growth_pct}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: `${cellState.degradation_mechanisms.sei_layer_growth_pct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Loss of Active Material (Cathode LAM)</span>
                  <span className="text-cyan-400 font-bold">{cellState.degradation_mechanisms.active_material_loss_pct}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${cellState.degradation_mechanisms.active_material_loss_pct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Lithium Plating & Non-linear Knee Stress</span>
                  <span className="text-rose-400 font-bold">{cellState.degradation_mechanisms.plating_knee_stress_pct}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-rose-400 h-full rounded-full" style={{ width: `${cellState.degradation_mechanisms.plating_knee_stress_pct}%` }} />
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Environmental Chamber Sliders + Live Trend Waves */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sliders (4 Cols) */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Virtual Chamber Controls
          </h3>

          {/* Cycle Index Slider */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-400">Aging Cycle Count:</span>
              <span className="text-cyan-300 font-bold">{cycleIndex}</span>
            </div>
            <input
              type="range"
              min="1"
              max="168"
              value={cycleIndex}
              onChange={(e) => setCycleIndex(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* State of Charge (SOC) */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-400">State of Charge (SOC):</span>
              <span className="text-amber-300 font-bold">{socPct}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={socPct}
              onChange={(e) => setSocPct(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          {/* Ambient Temperature */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-400">Chamber Temp:</span>
              <span className="text-white font-bold">{ambientTemp}°C</span>
            </div>
            <input
              type="range"
              min="4"
              max="50"
              value={ambientTemp}
              onChange={(e) => setAmbientTemp(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
            />
          </div>

          {/* C-Rate Stress */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-400">Charge/Discharge C-Rate:</span>
              <span className="text-purple-300 font-bold">{cRate.toFixed(1)} C</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={cRate}
              onChange={(e) => setCRate(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
          </div>
        </div>

        {/* Live Rolling History Chart (8 Cols) */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400" />
                Live Digital Twin Waveforms (Capacity Fade & SOH Degradation)
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">Rolling history over simulated cycle steps</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span> Capacity (Ah)
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span> Temp (°C)
              </span>
            </div>
          </div>

          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="capGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="tick" stroke="#64748B" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis yAxisId="left" domain={[1.2, 2.05]} stroke="#00F0FF" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis yAxisId="right" orientation="right" domain={[20, 50]} stroke="#F59E0B" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Area yAxisId="left" type="monotone" dataKey="capacity" stroke="#00F0FF" strokeWidth={2} fillOpacity={1} fill="url(#capGrad)" name="Capacity (Ah)" />
                <Line yAxisId="right" type="monotone" dataKey="temp" stroke="#F59E0B" strokeWidth={1.5} dot={false} name="Temp (°C)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
