import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Cpu, 
  Activity, 
  TrendingDown, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  HelpCircle,
  Sliders,
  BookmarkCheck
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

import { predictRUL, predictTrajectory } from '../services/api';

export default function RulCalculator() {
  const [selectedModel, setSelectedModel] = useState('XGBoost');
  const [datasetType, setDatasetType] = useState('nasa');

  // Input Parameter States
  const [capacity, setCapacity] = useState(1.85);
  const [maxVoltage, setMaxVoltage] = useState(4.18);
  const [minVoltage, setMinVoltage] = useState(2.70);
  const [maxTemp, setMaxTemp] = useState(36.5);
  const [ccTime, setCcTime] = useState(3100);
  const [resistanceRe, setResistanceRe] = useState(0.055);
  const [currentCycle, setCurrentCycle] = useState(35);

  // Prediction Result State
  const [prediction, setPrediction] = useState({
    predicted_rul_cycles: 102.5,
    confidence_interval_95: { lower: 93.1, upper: 111.9, uncertainty_std: 4.8 },
    state_of_health_pct: 92.5,
    health_status: 'Optimal (Healthy)',
    status_color: 'emerald',
    model_used: 'XGBoost'
  });

  // Trajectory Forecast State
  const [trajectoryData, setTrajectoryData] = useState([]);
  const [loading, setLoading] = useState(false);

  const applyPreset = (preset) => {
    if (preset === 'fresh') {
      setCapacity(1.98);
      setMaxVoltage(4.20);
      setMinVoltage(2.75);
      setMaxTemp(28.0);
      setResistanceRe(0.042);
      setCurrentCycle(5);
    } else if (preset === 'midlife') {
      setCapacity(1.78);
      setMaxVoltage(4.16);
      setMinVoltage(2.70);
      setMaxTemp(35.0);
      setResistanceRe(0.062);
      setCurrentCycle(65);
    } else if (preset === 'thermal') {
      setCapacity(1.68);
      setMaxVoltage(4.12);
      setMinVoltage(2.65);
      setMaxTemp(44.5);
      setResistanceRe(0.078);
      setCurrentCycle(90);
    } else if (preset === 'knee') {
      setCapacity(1.48);
      setMaxVoltage(4.08);
      setMinVoltage(2.55);
      setMaxTemp(41.0);
      setResistanceRe(0.095);
      setCurrentCycle(120);
    }
  };

  const calculatePrognosis = async () => {
    setLoading(true);
    try {
      const soh = (capacity / 2.0) * 100.0;
      const payload = {
        dataset: datasetType,
        model_name: selectedModel,
        features: {
          'Discharge_Capacity_Ah': capacity,
          'SOH_Pct': soh,
          'Max_Discharge_Voltage_V': maxVoltage,
          'Min_Discharge_Voltage_V': minVoltage,
          'Mean_Discharge_Voltage_V': (maxVoltage + minVoltage) / 2.0,
          'Mean_Discharge_Current_A': 1.95,
          'Max_Discharge_Temp_C': maxTemp,
          'Mean_Discharge_Temp_C': maxTemp - 4.0,
          'Discharge_Duration_s': 3350 * (capacity / 2.0),
          'Time_to_3_5V_s': 2100 * (capacity / 2.0),
          'Time_to_3_2V_s': 2850 * (capacity / 2.0),
          'CC_Charge_Time_s': ccTime,
          'CV_Charge_Time_s': 2200,
          'Total_Charge_Time_s': ccTime + 2200,
          'Max_Charge_Temp_C': 27.5,
          'Electrolyte_Resistance_Re': resistanceRe,
          'Charge_Transfer_Resistance_Rct': resistanceRe * 1.35
        }
      };

      const pred = await predictRUL(payload);
      setPrediction(pred);

      const traj = await predictTrajectory({
        current_cycle: currentCycle,
        current_capacity: capacity,
        ambient_temp_c: maxTemp - 10.0,
        c_rate: 1.0
      });
      setTrajectoryData(traj.trajectory || []);
    } catch (err) {
      console.warn('Calculation error, fallback active:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculatePrognosis();
  }, [capacity, maxVoltage, minVoltage, maxTemp, ccTime, resistanceRe, selectedModel, currentCycle]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white tracking-wide font-mono">
                INTERACTIVE RUL PROGNOSTICS FORECASTER
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/30">
                Confidence Envelope 95%
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Adjust operational lifecycle telemetry to forecast remaining useful cycles down to EOL
            </p>
          </div>
        </div>

        {/* Model Selector Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 flex-wrap">
          {['XGBoost', 'LightGBM', 'Random Forest', 'SVR', 'Stacking Ensemble'].map((m) => (
            <button
              key={m}
              onClick={() => setSelectedModel(m)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                selectedModel === m
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Quick Chips */}
      <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
        <span className="text-slate-400 flex items-center gap-1">
          <BookmarkCheck className="w-3.5 h-3.5 text-cyan-400" /> Quick Lifecycle Presets:
        </span>
        <button
          onClick={() => applyPreset('fresh')}
          className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-all"
        >
          🌟 Pristine Cell (Cycle 5, 99% SOH)
        </button>
        <button
          onClick={() => applyPreset('midlife')}
          className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-300 transition-all"
        >
          🔋 Mid-Life Fleet Cell (Cycle 65, 89% SOH)
        </button>
        <button
          onClick={() => applyPreset('thermal')}
          className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-300 transition-all"
        >
          🔥 High Thermal Stress (44.5°C)
        </button>
        <button
          onClick={() => applyPreset('knee')}
          className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-rose-400 transition-all"
        >
          ⚠️ Approaching EOL Knee (74% SOH)
        </button>
      </div>

      {/* Main Grid: Parameter Controls (5 Cols) + Prediction & Trajectory Chart (7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 5 Cols: Interactive Parameter Sliders */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-5 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Operational Telemetry Inputs
          </h3>

          {/* Discharge Capacity */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-400">Discharge Capacity (Ah):</span>
              <span className="text-cyan-300 font-bold">{capacity.toFixed(3)} Ah ({((capacity / 2.0) * 100).toFixed(1)}% SOH)</span>
            </div>
            <input
              type="range"
              min="1.30"
              max="2.00"
              step="0.01"
              value={capacity}
              onChange={(e) => setCapacity(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400 border border-slate-800"
            />
          </div>

          {/* Current Cycle Number */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-400">Current Cycle Count:</span>
              <span className="text-white font-bold">{currentCycle}</span>
            </div>
            <input
              type="range"
              min="1"
              max="150"
              value={currentCycle}
              onChange={(e) => setCurrentCycle(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400 border border-slate-800"
            />
          </div>

          {/* Max Discharge Voltage */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-400">Peak Discharge Voltage (V):</span>
              <span className="text-emerald-300 font-bold">{maxVoltage.toFixed(2)} V</span>
            </div>
            <input
              type="range"
              min="3.90"
              max="4.25"
              step="0.01"
              value={maxVoltage}
              onChange={(e) => setMaxVoltage(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-400 border border-slate-800"
            />
          </div>

          {/* Min Discharge Cutoff Voltage */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-400">Min Cutoff Voltage (V):</span>
              <span className="text-amber-300 font-bold">{minVoltage.toFixed(2)} V</span>
            </div>
            <input
              type="range"
              min="2.20"
              max="2.85"
              step="0.01"
              value={minVoltage}
              onChange={(e) => setMinVoltage(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-amber-400 border border-slate-800"
            />
          </div>

          {/* Peak Operating Temp */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-400">Max Discharge Temp (°C):</span>
              <span className="text-rose-300 font-bold">{maxTemp.toFixed(1)} °C</span>
            </div>
            <input
              type="range"
              min="22"
              max="50"
              step="0.5"
              value={maxTemp}
              onChange={(e) => setMaxTemp(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-rose-400 border border-slate-800"
            />
          </div>

          {/* Electrolyte Resistance Re */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-400">Internal Resistance Re (mΩ):</span>
              <span className="text-purple-300 font-bold">{(resistanceRe * 1000).toFixed(1)} mΩ</span>
            </div>
            <input
              type="range"
              min="0.035"
              max="0.120"
              step="0.002"
              value={resistanceRe}
              onChange={(e) => setResistanceRe(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-purple-400 border border-slate-800"
            />
          </div>

          {/* Constant Current Charge Duration */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-400">CC Charge Dwell Time (s):</span>
              <span className="text-slate-300 font-bold">{ccTime} s</span>
            </div>
            <input
              type="range"
              min="1800"
              max="3800"
              step="50"
              value={ccTime}
              onChange={(e) => setCcTime(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400 border border-slate-800"
            />
          </div>
        </div>

        {/* Right 7 Cols: Master Prediction KPI + Future Trajectory Projection Chart */}
        <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
          
          {/* Top Prediction Card */}
          <div className="glass-panel-glow rounded-2xl p-5 border border-cyan-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-1.5">
                  <Activity className="w-4 h-4" />
                  Estimated Remaining Useful Life (RUL)
                </span>
                <div className="flex items-baseline gap-3 mt-1.5">
                  <span className="text-5xl font-extrabold font-mono text-white text-glow-cyan">
                    {prediction.predicted_rul_cycles.toFixed(0)}
                  </span>
                  <span className="text-sm font-mono text-slate-300 font-semibold">
                    CYCLES (Model: {selectedModel})
                  </span>
                </div>
              </div>

              {/* Status Pill */}
              <div className="flex flex-col items-start sm:items-end">
                <span className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold border shadow-md ${
                  prediction.status_color === 'emerald'
                    ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-400 shadow-emerald-500/20'
                    : prediction.status_color === 'cyan'
                    ? 'bg-cyan-950/90 border-cyan-500/50 text-cyan-400 shadow-cyan-500/20'
                    : prediction.status_color === 'amber'
                    ? 'bg-amber-950/90 border-amber-500/50 text-amber-400 shadow-amber-500/20'
                    : 'bg-rose-950/90 border-rose-500/50 text-rose-400 shadow-rose-500/20'
                }`}>
                  {prediction.health_status}
                </span>
                <span className="text-[10px] font-mono text-slate-400 mt-1.5">
                  95% Range: [{prediction.confidence_interval_95?.lower} – {prediction.confidence_interval_95?.upper}] cycles
                </span>
              </div>
            </div>

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-3.5 border-t border-slate-800 text-xs font-mono">
              <div>
                <span className="text-slate-500 text-[10px] block font-semibold">CURRENT SOH</span>
                <span className="text-emerald-400 font-extrabold text-base">
                  {prediction.state_of_health_pct.toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block font-semibold">PROJECTED EOL CYCLE</span>
                <span className="text-cyan-400 font-extrabold text-base">
                  Cycle {(currentCycle + prediction.predicted_rul_cycles).toFixed(0)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block font-semibold">UNCERTAINTY BOUND</span>
                <span className="text-purple-300 font-extrabold text-base">
                  ±{prediction.confidence_interval_95?.uncertainty_std} cycles
                </span>
              </div>
            </div>
          </div>

          {/* Degradation Trajectory Forecast to EOL Chart */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between flex-1 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-cyan-400" />
                  Projected Capacity Degradation Curve to EOL Threshold
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Multi-cycle capacity fade forecasting with 95% confidence bounds
                </p>
              </div>
              <span className="text-[10px] font-mono text-rose-400 bg-rose-950/80 px-2.5 py-1 rounded-lg border border-rose-500/40 font-bold">
                EOL Limit: 1.40 Ah (70% SOH)
              </span>
            </div>

            <div className="h-[230px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trajGradPro" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="cycle" stroke="#64748B" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis domain={[1.2, 2.05]} stroke="#64748B" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0A101D', borderColor: '#1E293B', borderRadius: '12px', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                  <ReferenceLine y={1.40} stroke="#EF4444" strokeDasharray="4 4" label={{ value: 'EOL Cutoff (1.40 Ah)', fill: '#EF4444', fontSize: 10, fontFamily: 'monospace' }} />
                  <Area type="monotone" dataKey="capacity_upper_bound" stroke="none" fill="#00F0FF" fillOpacity={0.15} name="95% Upper Bound" />
                  <Area type="monotone" dataKey="projected_capacity_ah" stroke="#00F0FF" strokeWidth={2.5} fillOpacity={1} fill="url(#trajGradPro)" name="Projected Capacity (Ah)" />
                  <Area type="monotone" dataKey="capacity_lower_bound" stroke="none" fill="#0F172A" name="95% Lower Bound" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
