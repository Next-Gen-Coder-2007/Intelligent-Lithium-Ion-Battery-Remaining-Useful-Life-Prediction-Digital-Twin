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
  Sliders
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

      // Also compute full future degradation trajectory
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel rounded-2xl p-5 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              Interactive RUL Prognostics & Lifetime Forecaster
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                Confidence Envelope 95%
              </span>
            </h2>
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
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                selectedModel === m
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Parameter Controls (5 Cols) + Prediction & Trajectory Chart (7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 5 Cols: Interactive Parameter Sliders */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Operational Telemetry Inputs
          </h3>

          {/* Discharge Capacity */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
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
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Current Cycle Number */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-400">Current Cycle Count:</span>
              <span className="text-white font-bold">{currentCycle}</span>
            </div>
            <input
              type="range"
              min="1"
              max="150"
              value={currentCycle}
              onChange={(e) => setCurrentCycle(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Max Discharge Voltage */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
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
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {/* Min Discharge Cutoff Voltage */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
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
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          {/* Peak Operating Temp */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
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
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
            />
          </div>

          {/* Electrolyte Resistance Re */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
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
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
          </div>

          {/* Constant Current Charge Duration */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-400">CC Charge Time (s):</span>
              <span className="text-slate-300 font-bold">{ccTime} s</span>
            </div>
            <input
              type="range"
              min="1800"
              max="3800"
              step="50"
              value={ccTime}
              onChange={(e) => setCcTime(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        </div>

        {/* Right 7 Cols: Master Prediction KPI + Future Trajectory Projection Chart */}
        <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
          
          {/* Top Prediction Card */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  Estimated Remaining Useful Life (RUL)
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-4xl font-extrabold font-mono text-white">
                    {prediction.predicted_rul_cycles.toFixed(0)}
                  </span>
                  <span className="text-sm font-mono text-slate-400">
                    CYCLES (Model: {selectedModel})
                  </span>
                </div>
              </div>

              {/* Status Pill */}
              <div className="flex flex-col items-start sm:items-end">
                <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                  prediction.status_color === 'emerald'
                    ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400'
                    : prediction.status_color === 'cyan'
                    ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-400'
                    : prediction.status_color === 'amber'
                    ? 'bg-amber-950/80 border-amber-500/40 text-amber-400'
                    : 'bg-rose-950/80 border-rose-500/40 text-rose-400'
                }`}>
                  {prediction.health_status}
                </span>
                <span className="text-[10px] font-mono text-slate-400 mt-1">
                  95% Range: [{prediction.confidence_interval_95?.lower} – {prediction.confidence_interval_95?.upper}] cycles
                </span>
              </div>
            </div>

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-800 text-xs font-mono">
              <div>
                <span className="text-slate-500 text-[10px] block">ESTIMATED SOH</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {prediction.state_of_health_pct.toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">EXPECTED EOL CYCLE</span>
                <span className="text-cyan-400 font-bold text-sm">
                  Cycle {(currentCycle + prediction.predicted_rul_cycles).toFixed(0)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">UNCERTAINTY</span>
                <span className="text-purple-300 font-bold text-sm">
                  ±{prediction.confidence_interval_95?.uncertainty_std} cycles
                </span>
              </div>
            </div>
          </div>

          {/* Degradation Trajectory Forecast to EOL Chart */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between flex-1">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-cyan-400" />
                  Projected Capacity Degradation Curve to EOL Threshold
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Future capacity fade trajectory with shaded 95% confidence interval
                </p>
              </div>
              <span className="text-[10px] font-mono text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30">
                EOL: 1.40 Ah (70% SOH)
              </span>
            </div>

            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trajGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="cycle" stroke="#64748B" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis domain={[1.2, 2.05]} stroke="#64748B" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                  <ReferenceLine y={1.40} stroke="#EF4444" strokeDasharray="4 4" label={{ value: 'EOL Cutoff (1.40 Ah)', fill: '#EF4444', fontSize: 10, fontFamily: 'monospace' }} />
                  <Area type="monotone" dataKey="capacity_upper_bound" stroke="none" fill="#00F0FF" fillOpacity={0.15} name="95% Upper Bound" />
                  <Area type="monotone" dataKey="projected_capacity_ah" stroke="#00F0FF" strokeWidth={2.5} fillOpacity={1} fill="url(#trajGrad)" name="Projected Capacity (Ah)" />
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
