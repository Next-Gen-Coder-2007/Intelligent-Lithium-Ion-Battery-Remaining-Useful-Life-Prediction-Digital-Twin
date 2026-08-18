import React from 'react';
import { 
  Activity, 
  Cpu, 
  Zap, 
  Layers, 
  Sliders, 
  FileText, 
  Sparkles, 
  Radio, 
  Terminal,
  Database
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, systemHealth }) {
  const navItems = [
    { id: 'cockpit', label: 'Digital Twin Cockpit', icon: Zap, badge: 'LIVE' },
    { id: 'arena', label: 'AI Model Arena', icon: Cpu, badge: '6 Models' },
    { id: 'prognostics', label: 'RUL Forecaster', icon: Activity },
    { id: 'explorer', label: 'NASA Cells Explorer', icon: Database, badge: '4 Cells' },
    { id: 'whatif', label: 'What-If Sandbox', icon: Sliders, badge: 'Physics' },
    { id: 'batch', label: 'Batch CSV Analyzer', icon: FileText },
    { id: 'architecture', label: 'Architecture & Resume', icon: Sparkles, badge: '2026' },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Branding & Digital Twin Identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 text-cyan-400 shadow-lg shadow-cyan-500/10">
            <Zap className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base lg:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                BATTERY <span className="text-cyan-400 font-mono">TWIN</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300 font-mono uppercase tracking-wider">
                  v2.0
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
              <span>Prognostics & Remaining Useful Life Digital Twin</span>
            </p>
          </div>
        </div>

        {/* Center/Nav: Tab Navigation */}
        <nav className="flex items-center gap-1 overflow-x-auto max-w-full py-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                    isActive ? 'bg-cyan-500/30 text-cyan-200' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Live Connection Status */}
        <div className="hidden xl:flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300">
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                systemHealth?.status === 'HEALTHY' ? 'bg-emerald-400' : 'bg-amber-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                systemHealth?.status === 'HEALTHY' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}></span>
            </span>
            <span className="text-slate-400">DJANGO API:</span>
            <span className={systemHealth?.status === 'HEALTHY' ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
              {systemHealth?.status === 'HEALTHY' ? 'ONLINE (CUDA/ML)' : 'CONNECTED'}
            </span>
          </div>
        </div>

      </div>
    </header>
  );
}
