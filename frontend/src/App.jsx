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
    <div className="min-h-screen bg-[#090b10] text-slate-200 flex flex-col font-sans">
      
      {/* Top Fixed Header */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        systemHealth={systemHealth} 
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {activeTab === 'cockpit' && <DigitalTwinCockpit />}
        {activeTab === 'arena' && <ModelArena />}
        {activeTab === 'prognostics' && <RulCalculator />}
        {activeTab === 'explorer' && <CellExplorer />}
        {activeTab === 'whatif' && <WhatIfSandbox />}
        {activeTab === 'batch' && <BatchAnalyzer />}
        {activeTab === 'architecture' && <ResumeShowcase />}
      </main>

      {/* Minimalist Footer */}
      <footer className="border-t border-[#1b222d] py-5 px-4 lg:px-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="text-slate-400 font-medium">Lithium-Ion Battery Digital Twin</span>
            <span className="mx-2">•</span>
            <span>RUL Prognostics & Health Monitoring</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
            <span>Python 3.11</span>
            <span>•</span>
            <span>Django 5</span>
            <span>•</span>
            <span>React</span>
            <span>•</span>
            <span>XGBoost</span>
            <span>•</span>
            <span>LightGBM</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
