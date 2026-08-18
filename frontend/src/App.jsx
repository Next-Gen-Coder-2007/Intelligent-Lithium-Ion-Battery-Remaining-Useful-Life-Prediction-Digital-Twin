import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DigitalTwinCockpit from './components/DigitalTwinCockpit';
import ModelArena from './components/ModelArena';
import RulCalculator from './components/RulCalculator';
import CellExplorer from './components/CellExplorer';
import WhatIfSandbox from './components/WhatIfSandbox';
import BatchAnalyzer from './components/BatchAnalyzer';
import ResumeShowcase from './components/ResumeShowcase';
import { fetchHealth } from './services/api';
import { Zap, Cpu, Github, ExternalLink } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('cockpit');
  const [systemHealth, setSystemHealth] = useState({
    status: 'HEALTHY',
    version: '2.0.0',
    total_models_loaded: 12
  });

  useEffect(() => {
    async function checkBackend() {
      try {
        const health = await fetchHealth();
        setSystemHealth(health);
      } catch (err) {
        console.warn('Backend ping:', err);
      }
    }
    checkBackend();
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* Top Fixed / Sticky Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        systemHealth={systemHealth} 
      />

      {/* Main Dynamic View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {activeTab === 'cockpit' && <DigitalTwinCockpit />}
        {activeTab === 'arena' && <ModelArena />}
        {activeTab === 'prognostics' && <RulCalculator />}
        {activeTab === 'explorer' && <CellExplorer />}
        {activeTab === 'whatif' && <WhatIfSandbox />}
        {activeTab === 'batch' && <BatchAnalyzer />}
        {activeTab === 'architecture' && <ResumeShowcase />}
      </main>

      {/* Footer */}
      <footer className="glass-panel border-t border-slate-800/80 py-6 px-4 lg:px-8 mt-12 text-xs font-mono text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-white font-bold">Lithium-Ion Battery Digital Twin Platform</span>
            <span className="text-slate-600">|</span>
            <span>2026 Machine Learning & Battery Health Prognostics</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">Python</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">Scikit-learn</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400">XGBoost</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400">LightGBM</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-300">Django 5</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">React + Vite</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-purple-300">Tailwind CSS</span>
          </div>

          <div className="text-slate-500 text-[11px]">
            <span>NASA Ames Prognostics Center of Excellence (PCoE) Dataset</span>
          </div>

        </div>
      </footer>

    </div>
  );
}
