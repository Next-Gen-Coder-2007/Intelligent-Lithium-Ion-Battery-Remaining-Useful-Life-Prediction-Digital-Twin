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
  Sliders
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
    <div className="space-y-5">
      
      {/* Top Header & Playback Controls */}
      <div className="card-clean p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white tracking-tight">
              Virtual Cell Test Bench
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              Cycle {cycleIndex} of 168
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Physics-informed digital twin simulation with real-time remaining life forecasting
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isPlaying
                ? 'bg-amber-500 text-black hover:bg-amber-400'
                : 'bg-white text-slate-900 hover:bg-slate-200'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Pause' : 'Simulate'}</span>
          </button>

          <button
            onClick={() => setCycleIndex(prev => Math.min(168, prev + 1))}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            +1 Cycle
          </button>

          <button
            onClick={() => setCycleIndex(prev => Math.min(168, prev + 10))}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            +10 Cycles
          </button>

          <button
            onClick={() => {
              setCycleIndex(1);
              setSocPct(90);
              setIsPlaying(false);
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsCharging(!isCharging)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isCharging
                ? 'bg-blue-950/60 border-blue-800 text-blue-300'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            {isCharging ? 'Charging (CC-CV)' : 'Discharging'}
          </button>
        </div>
      </div>

      {/* Main Grid: CAD Schematic + Master RUL KPI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left 5 Cols: Minimalist Battery Schematic */}
        <div className="lg:col-span-5">
          <BatteryCellHologram state={{ ...cellState, is_charging: isCharging }} />
        </div>

        {/* Right 7 Cols: Master RUL Card & Key Metrics */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          
          {/* Master RUL Card */}
          <div className="card-clean p-5 flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <span className="text-xs text-slate-400 font-medium">
                  Remaining Useful Life (RUL)
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl sm:text-5xl font-bold font-mono text-white tracking-tight">
                    {cellState.predicted_rul_cycles.toFixed(0)}
                  </span>
                  <span className="text-sm font-medium text-slate-400">
                    cycles remaining
                  </span>
                </div>
              </div>

              <div className="bg-[#121824] p-3 rounded-lg border border-[#1e2738] text-left sm:text-right">
                <span className="text-[10px] text-slate-400 block font-medium">95% Confidence Bounds</span>
                <span className="text-xs font-mono font-semibold text-slate-200 block mt-0.5">
                  [{cellState.confidence_interval_95.lower} – {cellState.confidence_interval_95.upper}] cycles
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Uncertainty ±{cellState.confidence_interval_95.uncertainty_std} cycles
                </span>
              </div>
            </div>

            {/* Capacity Progress Bar */}
            <div className="mt-4 pt-3 border-t border-[#1b222d]">
              <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                <span>Capacity: <strong className="text-white font-mono">{cellState.discharge_capacity_ah.toFixed(3)} Ah</strong></span>
                <span>EOL Limit: <strong className="text-slate-300 font-mono">1.40 Ah (70% SOH)</strong></span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    cellState.soh_pct >= 80 ? 'bg-blue-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, ((cellState.discharge_capacity_ah - 1.4) / (2.0 - 1.4)) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          {/* 3 Secondary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="card-clean p-3.5">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Terminal Voltage</span>
              <div className="my-0.5">
                <span className="text-xl font-bold font-mono text-white">
                  {cellState.terminal_voltage_v.toFixed(3)}
                </span>
                <span className="text-xs text-slate-400 ml-1">V</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                OCV: {cellState.open_circuit_voltage_v.toFixed(3)} V
              </span>
            </div>

            <div className="card-clean p-3.5">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Cell Temperature</span>
              <div className="my-0.5">
                <span className="text-xl font-bold font-mono text-white">
                  {cellState.cell_temperature_c.toFixed(1)}
                </span>
                <span className="text-xs text-slate-400 ml-1">°C</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                Ambient: {cellState.ambient_temperature_c}°C
              </span>
            </div>

            <div className="card-clean p-3.5">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Impedance (Re + Rct)</span>
              <div className="my-0.5">
                <span className="text-xl font-bold font-mono text-white">
                  {(cellState.internal_resistance_total_ohm * 1000).toFixed(1)}
                </span>
                <span className="text-xs text-slate-400 ml-1">mΩ</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono truncate block">
                Re: {(cellState.electrolyte_resistance_re_ohm * 1000).toFixed(0)}mΩ • Rct: {(cellState.charge_transfer_resistance_rct_ohm * 1000).toFixed(0)}mΩ
              </span>
            </div>
          </div>

          {/* Degradation Breakdown */}
          <div className="card-clean p-4">
            <h4 className="text-xs font-semibold text-slate-300 mb-2.5">
              Electrochemical Degradation Contribution
            </h4>
            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Solid Electrolyte Interphase (SEI Growth)</span>
                  <span className="text-slate-200 font-mono font-medium">{cellState.degradation_mechanisms.sei_layer_growth_pct}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${cellState.degradation_mechanisms.sei_layer_growth_pct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Loss of Active Material (Cathode LAM)</span>
                  <span className="text-slate-200 font-mono font-medium">{cellState.degradation_mechanisms.active_material_loss_pct}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-slate-400 h-full rounded-full" style={{ width: `${cellState.degradation_mechanisms.active_material_loss_pct}%` }} />
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Sliders & Telemetry Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Sliders (4 Cols) */}
        <div className="lg:col-span-4 card-clean p-5 space-y-4">
          <h3 className="text-xs font-semibold text-white tracking-wide">
            Test Chamber Controls
          </h3>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Aging Cycle:</span>
              <span className="text-white font-mono font-medium">{cycleIndex}</span>
            </div>
            <input
              type="range"
              min="1"
              max="168"
              value={cycleIndex}
              onChange={(e) => setCycleIndex(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">State of Charge (SOC):</span>
              <span className="text-white font-mono font-medium">{socPct}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={socPct}
              onChange={(e) => setSocPct(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Ambient Temp:</span>
              <span className="text-white font-mono font-medium">{ambientTemp}°C</span>
            </div>
            <input
              type="range"
              min="4"
              max="50"
              value={ambientTemp}
              onChange={(e) => setAmbientTemp(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Load C-Rate:</span>
              <span className="text-white font-mono font-medium">{cRate.toFixed(1)} C</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={cRate}
              onChange={(e) => setCRate(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Rolling Waveform Chart (8 Cols) */}
        <div className="lg:col-span-8 card-clean p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-semibold text-white tracking-wide">
                Capacity Fade & Temperature History
              </h3>
              <p className="text-[11px] text-slate-400">Telemetry over simulated cycle steps</p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span> Capacity (Ah)
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-slate-400 inline-block"></span> Temp (°C)
              </span>
            </div>
          </div>

          <div className="h-[210px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cleanCapGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1b222d" vertical={false} />
                <XAxis dataKey="tick" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis yAxisId="left" domain={[1.2, 2.05]} stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis yAxisId="right" orientation="right" domain={[20, 50]} stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d1117', borderColor: '#1b222d', borderRadius: '8px', fontSize: '11px' }}
                />
                <Area yAxisId="left" type="monotone" dataKey="capacity" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#cleanCapGrad)" name="Capacity (Ah)" />
                <Line yAxisId="right" type="monotone" dataKey="temp" stroke="#94a3b8" strokeWidth={1.5} dot={false} name="Temp (°C)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
