import React, { useState } from 'react';
import { Copy, Check, Layers, Cpu, Zap, Activity } from 'lucide-react';

export default function ResumeShowcase() {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const resumeBullets = [
    {
      title: "Full Project Experience Entry (Machine Learning / Full Stack)",
      text: "Battery Digital Twin for Remaining Useful Life Prediction (2026) | Tech Stack: Python, Scikit-learn, XGBoost, LightGBM, Django, React, Tailwind CSS, Docker\n• Developed an intelligent battery health and Remaining Useful Life (RUL) prediction platform for lithium-ion batteries using accelerated life-testing data and physics-informed machine learning.\n• Designed and engineered 17 multi-channel degradation features spanning discharge capacity fade, constant-current/voltage dwell intervals, and internal impedance growth (Re, Rct).\n• Implemented and benchmarked 6 regression architectures (Random Forest, Gradient Boosting, XGBoost, LightGBM, SVR, Stacking Ensemble) across 5-fold cross-validation, achieving top-tier predictive accuracy with R² = 0.9965 and MAE = 1.80 cycles.\n• Integrated predictive pipelines with a high-throughput Django REST Framework backend and an interactive React digital twin interface featuring real-time virtual test bench telemetry, what-if Arrhenius thermal stress sandbox, and batch CSV diagnostics."
    },
    {
      title: "Machine Learning Modeling Bullet",
      text: "• Built a data-driven battery degradation prognostic workflow benchmarking 6 regression models (XGBoost, LightGBM, SVR, Random Forest, GBDT, Stacking), achieving R² = 0.9965 and Test MAE = 1.80 cycles on NASA accelerated life test datasets with 0.016ms inference latency."
    },
    {
      title: "Physics-Informed Digital Twin Bullet",
      text: "• Formulated a physics-informed digital twin simulator combining Arrhenius thermal kinetics, Solid Electrolyte Interphase (SEI) growth laws, and dynamic internal impedance escalation (Re + Rct) for real-time battery health monitoring and what-if stress scenario analysis."
    },
    {
      title: "Full-Stack & Deployment Bullet",
      text: "• Architected a production-ready Django REST Framework backend and responsive React (Vite + Tailwind CSS) dashboard, featuring live cell visualization, 95% confidence intervals, and batch CSV processing, containerized via Docker for cloud deployment on Render & Vercel."
    }
  ];

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-5">
      
      {/* Header */}
      <div className="card-clean p-4">
        <h2 className="text-sm font-semibold text-white tracking-tight">
          System Architecture & Portfolio Documentation
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          End-to-end technical pipeline specifications, mathematical formulations, and resume entries
        </p>
      </div>

      {/* 4-Stage Architecture Grid */}
      <div className="card-clean p-5 space-y-3">
        <h3 className="text-xs font-semibold text-white">
          End-to-End System Pipeline
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#121824] p-3.5 rounded-lg border border-[#1e2738]">
            <span className="text-[11px] font-semibold text-blue-400 block mb-1">01. Physics & Data</span>
            <p className="text-slate-300 text-[11px]">
              NASA PCoE 18650 cycling data (B0005, B0006, B0007, B0018) + 14,992-cycle Operational dataset.
            </p>
            <span className="text-[10px] text-slate-500 block mt-2">17 Physical Features</span>
          </div>

          <div className="bg-[#121824] p-3.5 rounded-lg border border-[#1e2738]">
            <span className="text-[11px] font-semibold text-blue-400 block mb-1">02. ML Regressors</span>
            <p className="text-slate-300 text-[11px]">
              6 Models: XGBoost, LightGBM, Random Forest, GBDT, SVR (RBF Kernel), and Stacking Ensemble.
            </p>
            <span className="text-[10px] text-emerald-400 block mt-2">R² = 0.9965 • MAE = 1.80 cycles</span>
          </div>

          <div className="bg-[#121824] p-3.5 rounded-lg border border-[#1e2738]">
            <span className="text-[11px] font-semibold text-blue-400 block mb-1">03. Django Backend</span>
            <p className="text-slate-300 text-[11px]">
              Django 5 + DRF REST APIs with CORS, Whitenoise static serving, and live physics simulator.
            </p>
            <span className="text-[10px] text-slate-500 block mt-2">11 REST Endpoints</span>
          </div>

          <div className="bg-[#121824] p-3.5 rounded-lg border border-[#1e2738]">
            <span className="text-[11px] font-semibold text-blue-400 block mb-1">04. React Digital Twin</span>
            <p className="text-slate-300 text-[11px]">
              React + Tailwind CSS minimalist dashboard, Recharts telemetry, What-If sandbox.
            </p>
            <span className="text-[10px] text-slate-400 block mt-2">Vercel & Docker Ready</span>
          </div>
        </div>
      </div>

      {/* Mathematical Formulations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card-clean p-5 space-y-2.5">
          <h3 className="text-xs font-semibold text-white">
            Electrochemical Aging Physics
          </h3>

          <div className="space-y-2 text-xs font-mono text-slate-300">
            <div className="p-2.5 rounded bg-[#121824] border border-[#1e2738]">
              <span className="text-[10px] text-slate-400 block">SEI Layer Capacity Fade Law</span>
              <p className="text-white text-[11px] mt-0.5">
                Q_loss(N, T, I) = B(T) • exp(-Ea / RT) • I^β • N^z
              </p>
            </div>

            <div className="p-2.5 rounded bg-[#121824] border border-[#1e2738]">
              <span className="text-[10px] text-slate-400 block">Arrhenius Thermal Acceleration</span>
              <p className="text-white text-[11px] mt-0.5">
                k(T) = A • exp(-Ea / (R • T_kelvin))
              </p>
            </div>

            <div className="p-2.5 rounded bg-[#121824] border border-[#1e2738]">
              <span className="text-[10px] text-slate-400 block">Terminal Voltage Under Load</span>
              <p className="text-white text-[11px] mt-0.5">
                V_term(t) = V_ocv(SOC) - I • (Re + Rct) - η_polarization
              </p>
            </div>
          </div>
        </div>

        <div className="card-clean p-5 space-y-2.5">
          <h3 className="text-xs font-semibold text-white">
            Machine Learning Evaluation
          </h3>

          <div className="space-y-2 text-xs font-mono text-slate-300">
            <div className="p-2.5 rounded bg-[#121824] border border-[#1e2738]">
              <div className="flex justify-between">
                <span className="text-[10px] text-slate-400">Coefficient of Determination (R²)</span>
                <span className="text-emerald-400 font-semibold">0.9965 (SVR)</span>
              </div>
              <p className="text-white text-[11px] mt-0.5">
                R² = 1 - [Σ(y_i - ŷ_i)² / Σ(y_i - ȳ)²]
              </p>
            </div>

            <div className="p-2.5 rounded bg-[#121824] border border-[#1e2738]">
              <div className="flex justify-between">
                <span className="text-[10px] text-slate-400">Mean Absolute Error (MAE)</span>
                <span className="text-blue-400 font-semibold">1.80 Cycles</span>
              </div>
              <p className="text-white text-[11px] mt-0.5">
                MAE = (1/n) • Σ |y_i - ŷ_i|
              </p>
            </div>

            <div className="p-2.5 rounded bg-[#121824] border border-[#1e2738]">
              <div className="flex justify-between">
                <span className="text-[10px] text-slate-400">Inference Throughput</span>
                <span className="text-slate-200 font-semibold">0.016 ms / sample</span>
              </div>
              <p className="text-white text-[11px] mt-0.5">
                Real-time sub-millisecond edge prediction
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Copyable Resume Bullets */}
      <div className="card-clean p-5 space-y-3">
        <h3 className="text-xs font-semibold text-white">
          Resume Bullet Points
        </h3>

        <div className="space-y-3">
          {resumeBullets.map((bullet, idx) => (
            <div key={idx} className="bg-[#121824] p-3.5 rounded-lg border border-[#1e2738] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">{bullet.title}</span>
                <button
                  onClick={() => handleCopy(bullet.text, idx)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed bg-[#0d1117] p-3 rounded border border-[#1b222d]">
                {bullet.text}
              </pre>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
