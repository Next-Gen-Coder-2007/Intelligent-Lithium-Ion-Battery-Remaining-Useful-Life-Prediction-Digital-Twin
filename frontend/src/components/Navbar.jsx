import React from 'react';
import { 
  Zap, 
  Cpu, 
  Activity, 
  Database, 
  Sliders, 
  FileText, 
  FileCode2
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, systemHealth }) {
  const navItems = [
    { id: 'cockpit', label: 'Digital Twin', icon: Zap },
    { id: 'arena', label: 'Model Benchmarks', icon: Cpu },
    { id: 'prognostics', label: 'RUL Forecaster', icon: Activity },
    { id: 'explorer', label: 'NASA Telemetry', icon: Database },
    { id: 'whatif', label: 'What-If Sandbox', icon: Sliders },
    { id: 'batch', label: 'Batch CSV', icon: FileText },
    { id: 'architecture', label: 'Architecture & Resume', icon: FileCode2 },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#090b10]/90 backdrop-blur-md border-b border-[#1b222d] px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Left: Branding */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white tracking-tight">
                Battery Digital Twin
              </span>
              <span className="text-[11px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Lithium-Ion Remaining Useful Life Prognostics
            </p>
          </div>
        </div>

        {/* Center: Minimalist Tab Navigation */}
        <nav className="flex items-center gap-1 overflow-x-auto max-w-full py-0.5 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Clean Status Badge */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
          <span className="text-[11px] font-mono text-slate-300">API Connected</span>
        </div>

      </div>
    </header>
  );
}
