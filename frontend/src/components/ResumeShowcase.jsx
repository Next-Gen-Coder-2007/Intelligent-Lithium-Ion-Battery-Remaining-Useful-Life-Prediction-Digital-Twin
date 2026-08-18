import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Terminal, 
  Layers, 
  Cpu, 
  Flame, 
  Zap, 
  Database, 
  Activity, 
  Award,
  CheckCircle2
} from 'lucide-react';

export default function ResumeShowcase() {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const resumeBullets = [
    {
      title: "Comprehensive Master Resume Entry (Machine Learning / Full Stack)",
      text: "Battery Digital Twin for Remaining Useful Life Prediction (2026) | Tech Stack: Python, Scikit-learn, XGBoost, LightGBM, Django, React, Tailwind CSS, Docker\n• Developed an intelligent battery health and Remaining Useful Life (RUL) prediction platform for lithium-ion batteries using accelerated life-testing data and physics-informed machine learning.\n• Designed and engineered 17 multi-channel degradation features spanning discharge capacity fade, constant-current/voltage dwell intervals, and internal impedance growth (Re, Rct).\n• Implemented and benchmarked 6 regression architectures (Random Forest, Gradient Boosting, XGBoost, LightGBM, SVR, Stacking Ensemble) across 5-fold cross-validation, achieving top-tier predictive accuracy with R² = 0.9965 and MAE = 1.80 cycles.\n• Integrated predictive pipelines with a high-throughput Django REST Framework backend and an interactive Cyber-Industrial React digital twin interface featuring real-time virtual test bench telemetry, what-if Arrhenius thermal stress sandbox, and batch CSV diagnostics."
    },
    {
      title: "Machine Learning & Model Benchmarking Bullet",
      text: "• Built a data-driven battery degradation prognostic workflow benchmarking 6 regression models (XGBoost, LightGBM, SVR, Random Forest, GBDT, Stacking), achieving R² = 0.9965 and Test MAE = 1.80 cycles on NASA accelerated life test datasets with 0.016ms inference latency."
    },
    {
      title: "Digital Twin & Physics-Informed Modeling Bullet",
      text: "• Formulated a physics-informed digital twin simulator combining Arrhenius thermal kinetics, Solid Electrolyte Interphase (SEI) growth laws, and dynamic internal impedance escalation (Re + Rct) for real-time battery health monitoring and what-if stress scenario analysis."
    },
    {
      title: "Full-Stack & Cloud Deployment Bullet",
      text: "• Architected a production-ready Django REST Framework backend and responsive React (Vite + Tailwind CSS) dashboard, featuring live holographic cell visualization, 95% confidence intervals, and batch CSV processing, containerized via Docker for cloud deployment on Render & Vercel."
    }
  ];

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white tracking-wide font-mono">
                SYSTEM ARCHITECTURE & RESUME SHOWCASE
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold border border-purple-500/30">
                2026 Portfolio Ready
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              End-to-end technical pipeline breakdown, mathematical formulations, and ATS-optimized resume bullet points
            </p>
          </div>
        </div>
      </div>

      {/* End-to-End System Architecture Pipeline Flow */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4 shadow-xl">
        <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          End-to-End Technical Architecture Flow
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
          
          {/* Stage 1 */}
          <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between shadow-inner">
            <div>
              <div className="flex items-center justify-between text-cyan-400 font-bold mb-2">
                <span>01. DATA & PHYSICS</span>
                <Database className="w-4 h-4" />
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                NASA PCoE 18650 Accelerated Cycling Dataset (B0005, B0006, B0007, B0018) + 14,992-cycle Operational Dataset.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-semibold">
              17 Engineered Physical Features
            </div>
          </div>

          {/* Stage 2 */}
          <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between shadow-inner">
            <div>
              <div className="flex items-center justify-between text-purple-400 font-bold mb-2">
                <span>02. ML ENSEMBLE</span>
                <Cpu className="w-4 h-4" />
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                6 Algorithmic Architectures: XGBoost, LightGBM, Random Forest, GBDT, SVR (RBF Kernel), and Stacking Meta-Regressor.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-emerald-400 font-bold">
              R² = 0.9965 • MAE = 1.80 cycles
            </div>
          </div>

          {/* Stage 3 */}
          <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between shadow-inner">
            <div>
              <div className="flex items-center justify-between text-amber-400 font-bold mb-2">
                <span>03. DJANGO BACKEND</span>
                <Zap className="w-4 h-4" />
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Django 5 + DRF REST APIs with CORS, Whitenoise static collection, live simulation generator, and batch CSV processing.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-semibold">
              11 Production REST Endpoints
            </div>
          </div>

          {/* Stage 4 */}
          <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between shadow-inner">
            <div>
              <div className="flex items-center justify-between text-emerald-400 font-bold mb-2">
                <span>04. REACT DIGITAL TWIN</span>
                <Activity className="w-4 h-4" />
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                React (Vite) + Tailwind CSS Cyber-Industrial HUD, Animated Battery Cell Visualizer, Recharts telemetry, What-If Sandbox.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-cyan-300 font-bold">
              Responsive & Cloud Deployable
            </div>
          </div>

        </div>
      </div>

      {/* Mathematical & Electrochemical Formulations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Electrochemical Aging Physics */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3 shadow-xl">
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            Electrochemical Aging & Thermal Formulations
          </h3>

          <div className="space-y-3 text-xs font-mono text-slate-300">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
              <span className="text-[10px] text-cyan-400 font-bold block mb-1">
                1. SEI GROWTH & CAPACITY FADE LAW
              </span>
              <p className="text-slate-300 text-[11px] font-bold">
                Q_loss(N, T, I) = B(T) • exp(-Ea / RT) • I^β • N^z
              </p>
              <span className="text-[10px] text-slate-400 block mt-1">
                Models parabolic Solid Electrolyte Interphase layer thickening on graphite anode
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
              <span className="text-[10px] text-amber-400 font-bold block mb-1">
                2. ARRHENIUS THERMAL ACCELERATION
              </span>
              <p className="text-slate-300 text-[11px] font-bold">
                k(T) = A • exp(-Ea / (R • T_kelvin))
              </p>
              <span className="text-[10px] text-slate-400 block mt-1">
                Governs 1.58x - 2.4x accelerated kinetic degradation under high-temperature cycling
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
              <span className="text-[10px] text-purple-400 font-bold block mb-1">
                3. TERMINAL VOLTAGE POLARIZATION
              </span>
              <p className="text-slate-300 text-[11px] font-bold">
                V_term(t) = V_ocv(SOC) - I • (Re + Rct) - η_polarization
              </p>
              <span className="text-[10px] text-slate-400 block mt-1">
                Accounts for internal electrolyte resistance (Re) and charge transfer resistance (Rct)
              </span>
            </div>
          </div>
        </div>

        {/* Machine Learning Formulation & Metrics */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3 shadow-xl">
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Machine Learning Evaluation Metrics
          </h3>

          <div className="space-y-3 text-xs font-mono text-slate-300">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-emerald-400 font-bold">COEFFICIENT OF DETERMINATION (R²)</span>
                <span className="text-emerald-400 font-bold">0.9965 (SVR)</span>
              </div>
              <p className="text-slate-300 text-[11px] font-bold">
                R² = 1 - [Σ(y_i - ŷ_i)² / Σ(y_i - ȳ)²]
              </p>
              <span className="text-[10px] text-slate-400 block mt-1">
                Explains 99.65% of total variance in remaining useful lifecycle across testing folds
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-cyan-400 font-bold">MEAN ABSOLUTE ERROR (MAE)</span>
                <span className="text-cyan-400 font-bold">1.80 Cycles</span>
              </div>
              <p className="text-slate-300 text-[11px] font-bold">
                MAE = (1/n) • Σ |y_i - ŷ_i|
              </p>
              <span className="text-[10px] text-slate-400 block mt-1">
                Average prognosis divergence is within 1.8 cycles out of a 168-cycle cell lifespan
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-purple-400 font-bold">INFERENCE SPEED / THROUGHPUT</span>
                <span className="text-purple-400 font-bold">0.016 ms / sample</span>
              </div>
              <p className="text-slate-300 text-[11px] font-bold">
                Capable of 62,500 real-time inference checks per second on modest CPU hardware
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Ready-to-Copy Resume Bullets */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Tailored Resume Entries & Portfolio Descriptions
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Formatted for Applicant Tracking Systems (ATS) and hiring manager technical reviews
            </p>
          </div>
        </div>

        <div className="space-y-3.5">
          {resumeBullets.map((bullet, idx) => (
            <div key={idx} className="bg-slate-950/90 rounded-2xl p-4.5 border border-slate-800 space-y-2.5 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-300">{bullet.title}</span>
                <button
                  onClick={() => handleCopy(bullet.text, idx)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 border border-slate-700 transition-all"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Bullet</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed bg-slate-900/90 p-3.5 rounded-xl border border-slate-800/80">
                {bullet.text}
              </pre>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
