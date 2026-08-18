import React, { useState, useEffect } from 'react';
import { Calculator, TrendingDown, Sliders } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
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

  const [capacity, setCapacity] = useState(1.85);
  const [maxVoltage, setMaxVoltage] = useState(4.18);
  const [minVoltage, setMinVoltage] = useState(2.70);
  const [maxTemp, setMaxTemp] = useState(36.5);
  const [ccTime, setCcTime] = useState(3100);
  const [resistanceRe, setResistanceRe] = useState(0.055);
  const [currentCycle, setCurrentCycle] = useState(35);

  const [prediction, setPrediction] = useState({
    predicted_rul_cycles: 102.5,
    confidence_interval_95: { lower: 93.1, upper: 111.9, uncertainty_std: 4.8 },
    state_of_health_pct: 92.5,
    health_status: 'Optimal (Healthy)',
    status_color: 'emerald',
    model_used: 'XGBoost'
  });

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

      const traj = await predictTrajectory({
        current_cycle: currentCycle,
        current_capacity: capacity,
        ambient_temp_c: maxTemp - 10.0,
        c_rate: 1.0
      });
      setTrajectoryData(traj.trajectory || []);
    } catch (err) {
      console.warn('Calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculatePrognosis();
  }, [capacity, maxVoltage, minVoltage, maxTemp, ccTime, resistanceRe, selectedModel, currentCycle]);

  return (
    <div className="space-y-5">
      
      {/* Header */}
      <div className="card-clean p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight">
            RUL Prognostics & Lifetime Forecaster
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time inference with 95% confidence interval estimation
          </p>
        </div>

        {/* Model Selector */}
        <div className="flex items-center gap-1 p-1 bg-[#121824] rounded-lg border border-[#1e2738] flex-wrap">
          {['XGBoost', 'LightGBM', 'Random Forest', 'SVR', 'Stacking Ensemble'].map((m) => (
            <button
              key={m}
              onClick={() => setSelectedModel(m)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedModel === m
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Parameters & Prediction Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Sliders (5 Cols) */}
        <div className="lg:col-span-5 card-clean p-5 space-y-4">
          <h3 className="text-xs font-semibold text-white tracking-wide">
            Operational Telemetry Inputs
          </h3>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Capacity (Ah):</span>
              <span className="text-white font-mono font-medium">{capacity.toFixed(3)} Ah ({((capacity / 2.0) * 100).toFixed(1)}% SOH)</span>
            </div>
            <input
              type="range"
              min="1.30"
              max="2.00"
              step="0.01"
              value={capacity}
              onChange={(e) => setCapacity(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Current Cycle:</span>
              <span className="text-white font-mono font-medium">{currentCycle}</span>
            </div>
            <input
              type="range"
              min="1"
              max="150"
              value={currentCycle}
              onChange={(e) => setCurrentCycle(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Peak Voltage (V):</span>
              <span className="text-white font-mono font-medium">{maxVoltage.toFixed(2)} V</span>
            </div>
            <input
              type="range"
              min="3.90"
              max="4.25"
              step="0.01"
              value={maxVoltage}
              onChange={(e) => setMaxVoltage(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Min Voltage Cutoff (V):</span>
              <span className="text-white font-mono font-medium">{minVoltage.toFixed(2)} V</span>
            </div>
            <input
              type="range"
              min="2.20"
              max="2.85"
              step="0.01"
              value={minVoltage}
              onChange={(e) => setMinVoltage(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Max Operating Temp (°C):</span>
              <span className="text-white font-mono font-medium">{maxTemp.toFixed(1)} °C</span>
            </div>
            <input
              type="range"
              min="22"
              max="50"
              step="0.5"
              value={maxTemp}
              onChange={(e) => setMaxTemp(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Internal Resistance Re (mΩ):</span>
              <span className="text-white font-mono font-medium">{(resistanceRe * 1000).toFixed(1)} mΩ</span>
            </div>
            <input
              type="range"
              min="0.035"
              max="0.120"
              step="0.002"
              value={resistanceRe}
              onChange={(e) => setResistanceRe(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Prediction Results & Trajectory Chart (7 Cols) */}
        <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
          
          <div className="card-clean p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs text-slate-400 font-medium">
                  Estimated Remaining Life
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-bold font-mono text-white">
                    {prediction.predicted_rul_cycles.toFixed(0)}
                  </span>
                  <span className="text-sm font-medium text-slate-400">
                    cycles ({selectedModel})
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs font-mono font-medium text-slate-200 block">
                  [{prediction.confidence_interval_95?.lower} – {prediction.confidence_interval_95?.upper}] cycles (95% CI)
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  SOH: {prediction.state_of_health_pct.toFixed(1)}% • EOL: Cycle {(currentCycle + prediction.predicted_rul_cycles).toFixed(0)}
                </span>
              </div>
            </div>
          </div>

          {/* Degradation Trajectory Chart */}
          <div className="card-clean p-5 flex flex-col justify-between flex-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-white">
                Projected Capacity Fade Trajectory
              </h3>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                EOL: 1.40 Ah (70% SOH)
              </span>
            </div>

            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cleanTrajGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1b222d" vertical={false} />
                  <XAxis dataKey="cycle" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis domain={[1.2, 2.05]} stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0d1117', borderColor: '#1b222d', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <ReferenceLine y={1.40} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'EOL Cutoff', fill: '#ef4444', fontSize: 10 }} />
                  <Area type="monotone" dataKey="projected_capacity_ah" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#cleanTrajGrad)" name="Capacity (Ah)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
