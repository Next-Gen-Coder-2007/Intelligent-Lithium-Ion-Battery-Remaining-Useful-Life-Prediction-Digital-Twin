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
  AlertTriangle,
  Radio,
  Sparkles,
  Info
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
  Area,
  ReferenceLine
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

  // Real-time telemetry history for oscilloscope chart
  const [history, setHistory] = useState([
    { tick: 1, voltage: 3.88, temp: 25.4, soh: 96.5, rul: 120, capacity: 1.93 },
    { tick: 5, voltage: 3.85, temp: 26.1, soh: 95.8, rul: 116, capacity: 1.916 },
    { tick: 10, voltage: 3.83, temp: 26.8, soh: 95.1, rul: 113, capacity: 1.902 },
    { tick: 15, voltage: 3.82, temp: 27.2, soh: 94.6, rul: 109, capacity: 1.892 },
  ]);

  const timerRef = useRef(null);

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
          ...prev.slice(-24),
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
      console.warn('Simulation query error:', err);
    }
  };

  useEffect(() => {
    fetchSimulationState(cycleIndex, socPct, ambientTemp, cRate, isCharging);
  }, [cycleIndex, socPct, ambientTemp, cRate, isCharging]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCycleIndex(prev => {
          if (prev >= 168) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1100);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel rounded-2xl p-4.5 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white tracking-wide font-mono">
                VIRTUAL TEST BENCH & DIGITAL TWIN HUD
              </h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono font-bold">
                CYCLE {cycleIndex} / 168
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Live electrochemical degradation tracking with multi-model predictive prognostics
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-extrabold transition-all duration-200 shadow-lg ${
              isPlaying
                ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-amber-500/20'
                : 'bg-cyan-400 text-black hover:bg-cyan-300 shadow-cyan-500/30'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlaying ? 'PAUSE CYCLE' : 'RUN CONTINUOUS SIMULATION'}</span>
          </button>

          <button
            onClick={() => setCycleIndex(prev => Math.min(168, prev + 1))}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-mono border border-slate-700 transition-all"
            title="Step +1 Cycle"
          >
            <span>+1 Step</span>
          </button>

          <button
            onClick={() => setCycleIndex(prev => Math.min(168, prev + 10))}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 text-xs font-mono border border-slate-700 transition-all"
            title="Fast Forward +10 Cycles"
          >
            <FastForward className="w-3.5 h-3.5 text-cyan-400" />
            <span>+10 Cycles</span>
          </button>

          <button
            onClick={() => {
              setCycleIndex(1);
              setSocPct(90);
              setIsPlaying(false);
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 transition-all"
            title="Reset to Fresh Cell (Cycle 1)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsCharging(!isCharging)}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
              isCharging
                ? 'bg-cyan-950/90 border-cyan-500/60 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                : 'bg-amber-950/90 border-amber-500/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
            }`}
          >
            {isCharging ? '⚡ FAST CHARGING (CC-CV)' : '🔋 LOAD DISCHARGING'}
          </button>
        </div>
      </div>

      {/* Main Grid: Hologram + Master Prognostics HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 5 Cols: Hologram Component */}
        <div className="lg:col-span-5 flex flex-col">
          <BatteryCellHologram state={{ ...cellState, is_charging: isCharging }} />
        </div>

        {/* Right 7 Cols: Master RUL Prognostics & Telemetry Gauges */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          
          {/* Top Master RUL KPI Card */}
          <div className="glass-panel-glow rounded-2xl p-5 border border-cyan-500/40 relative overflow-hidden bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-cyan-950/30">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                  Remaining Useful Life (RUL) Prognosis
                </span>
                <div className="flex items-baseline gap-3 mt-2">
                  <span className="text-4xl sm:text-5xl font-extrabold font-mono text-white tracking-tight text-glow-cyan">
                    {cellState.predicted_rul_cycles.toFixed(0)}
                  </span>
                  <span className="text-sm font-mono text-slate-300 font-semibold">
                    CYCLES REMAINING
                  </span>
                </div>
              </div>

              {/* 95% Confidence Interval Pill */}
              <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800 shadow-inner text-left sm:text-right">
                <span className="text-[10px] font-mono text-slate-400 block font-semibold">95% CONFIDENCE ENVELOPE</span>
                <span className="text-sm font-mono font-extrabold text-cyan-300 block mt-0.5">
                  [{cellState.confidence_interval_95.lower} – {cellState.confidence_interval_95.upper}] cycles
                </span>
                <span className="text-[9px] font-mono text-slate-500 block mt-0.5">
                  Uncertainty σ = ±{cellState.confidence_interval_95.uncertainty_std} cycles
                </span>
              </div>
            </div>

            {/* Capacity Degradation Trajectory Bar */}
            <div className="mt-4 pt-3.5 border-t border-slate-800/90">
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1.5 font-semibold">
                <span>Measured Capacity: <strong className="text-cyan-300">{cellState.discharge_capacity_ah.toFixed(4)} Ah</strong></span>
                <span>EOL Threshold: <strong className="text-rose-400">1.400 Ah (70% SOH)</strong></span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800 shadow-inner">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    cellState.soh_pct >= 85
                      ? 'bg-gradient-to-r from-emerald-500 via-cyan-400 to-cyan-300'
                      : cellState.soh_pct >= 75
                      ? 'bg-gradient-to-r from-cyan-400 via-amber-400 to-amber-300'
                      : 'bg-gradient-to-r from-amber-400 via-rose-500 to-rose-600'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, ((cellState.discharge_capacity_ah - 1.4) / (2.0 - 1.4)) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>Fresh (2.0 Ah)</span>
                <span>Usable Operating Window</span>
                <span>Decommission Knee</span>
              </div>
            </div>
          </div>

          {/* 3 Physical Diagnostic Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Terminal Voltage */}
            <div className="glass-panel rounded-xl p-3.5 border border-slate-800 flex flex-col justify-between shadow-inner">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>TERMINAL VOLTAGE</span>
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="my-1">
                <span className="text-2xl font-bold font-mono text-white">
                  {cellState.terminal_voltage_v.toFixed(3)}
                </span>
                <span className="text-xs font-mono text-slate-400 ml-1">V</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                OCV: {cellState.open_circuit_voltage_v.toFixed(3)} V
              </span>
            </div>

            {/* Operating Temp */}
            <div className="glass-panel rounded-xl p-3.5 border border-slate-800 flex flex-col justify-between shadow-inner">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>CELL TEMPERATURE</span>
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="my-1">
                <span className="text-2xl font-bold font-mono text-white">
                  {cellState.cell_temperature_c.toFixed(1)}
                </span>
                <span className="text-xs font-mono text-slate-400 ml-1">°C</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                Chamber: {cellState.ambient_temperature_c}°C
              </span>
            </div>

            {/* Internal Resistance Re + Rct */}
            <div className="glass-panel rounded-xl p-3.5 border border-slate-800 flex flex-col justify-between shadow-inner">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>IMPEDANCE (Re/Rct)</span>
                <Gauge className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="my-1">
                <span className="text-2xl font-bold font-mono text-purple-300">
                  {(cellState.internal_resistance_total_ohm * 1000).toFixed(1)}
                </span>
                <span className="text-xs font-mono text-slate-400 ml-1">mΩ</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 truncate">
                Re: {(cellState.electrolyte_resistance_re_ohm * 1000).toFixed(0)} | Rct: {(cellState.charge_transfer_resistance_rct_ohm * 1000).toFixed(0)}mΩ
              </span>
            </div>

          </div>

          {/* Degradation Mechanisms Progress Breakdown */}
          <div className="glass-panel rounded-xl p-4 border border-slate-800 shadow-inner">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Electrochemical Degradation Contribution</span>
              <span className="text-[10px] text-slate-500">Physics Decomposition</span>
            </h4>
            <div className="space-y-2.5 text-xs font-mono">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Solid Electrolyte Interphase (SEI Growth)</span>
                  <span className="text-amber-400 font-bold">{cellState.degradation_mechanisms.sei_layer_growth_pct}%</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full shadow-[0_0_8px_#F59E0B]" style={{ width: `${cellState.degradation_mechanisms.sei_layer_growth_pct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Loss of Active Material (Cathode LAM)</span>
                  <span className="text-cyan-400 font-bold">{cellState.degradation_mechanisms.active_material_loss_pct}%</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full rounded-full shadow-[0_0_8px_#00F0FF]" style={{ width: `${cellState.degradation_mechanisms.active_material_loss_pct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Lithium Plating & Non-linear Knee Stress</span>
                  <span className="text-rose-400 font-bold">{cellState.degradation_mechanisms.plating_knee_stress_pct}%</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-rose-400 h-full rounded-full shadow-[0_0_8px_#EF4444]" style={{ width: `${cellState.degradation_mechanisms.plating_knee_stress_pct}%` }} />
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
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Virtual Chamber Controls
          </h3>

          {/* Cycle Index Slider */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-400">Aging Cycle Count:</span>
              <span className="text-cyan-300 font-bold">{cycleIndex}</span>
            </div>
            <input
              type="range"
              min="1"
              max="168"
              value={cycleIndex}
              onChange={(e) => setCycleIndex(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400 border border-slate-800"
            />
          </div>

          {/* State of Charge (SOC) */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-400">State of Charge (SOC):</span>
              <span className="text-amber-300 font-bold">{socPct}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={socPct}
              onChange={(e) => setSocPct(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-amber-400 border border-slate-800"
            />
          </div>

          {/* Ambient Temperature */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-400">Chamber Temp:</span>
              <span className="text-white font-bold">{ambientTemp}°C</span>
            </div>
            <input
              type="range"
              min="4"
              max="50"
              value={ambientTemp}
              onChange={(e) => setAmbientTemp(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-rose-400 border border-slate-800"
            />
          </div>

          {/* C-Rate Stress */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
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
              className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-purple-400 border border-slate-800"
            />
          </div>
        </div>

        {/* Live Rolling History Chart (8 Cols) */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Live Digital Twin Waveforms (Capacity Fade & Thermal Rise)
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">Rolling real-time history over simulated cycle steps</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00F0FF] inline-block"></span> Capacity (Ah)
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_#F59E0B] inline-block"></span> Temp (°C)
              </span>
            </div>
          </div>

          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="capGradCockpit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.45}/>
                    <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="tick" stroke="#64748B" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis yAxisId="left" domain={[1.2, 2.05]} stroke="#00F0FF" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis yAxisId="right" orientation="right" domain={[20, 50]} stroke="#F59E0B" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A101D', borderColor: '#1E293B', borderRadius: '12px', fontSize: '11px', fontFamily: 'monospace', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                />
                <Area yAxisId="left" type="monotone" dataKey="capacity" stroke="#00F0FF" strokeWidth={2.5} fillOpacity={1} fill="url(#capGradCockpit)" name="Capacity (Ah)" />
                <Line yAxisId="right" type="monotone" dataKey="temp" stroke="#F59E0B" strokeWidth={2} dot={false} name="Temp (°C)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
