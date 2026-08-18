import React, { useState, useEffect } from 'react';
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
  Database,
  ShieldCheck,
  Clock,
  Github
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, systemHealth }) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toTimeString().split(' ')[0] + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'cockpit', label: 'Virtual Cockpit', icon: Zap, badge: 'LIVE HUD' },
    { id: 'arena', label: 'AI Model Arena', icon: Cpu, badge: 'R² 0.9965' },
    { id: 'prognostics', label: 'RUL Forecaster', icon: Activity },
    { id: 'explorer', label: 'NASA Telemetry', icon: Database, badge: '4 Cells' },
    { id: 'whatif', label: 'What-If Sandbox', icon: Sliders, badge: 'Physics' },
    { id: 'batch', label: 'Batch Diagnostics', icon: FileText },
    { id: 'architecture', label: 'Architecture & Resume', icon: Sparkles, badge: '2026' },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3.5 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row items-center justify-between gap-4">
        
        {/* Left: Branding & Digital Twin Identity */}
        <div className="flex items-center justify-between w-full xl:w-auto">
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-purple-600/30 border border-cyan-500/40 text-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.25)]">
              <Zap className="w-5 h-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500 shadow-[0_0_8px_#00F0FF]"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base lg:text-lg font-extrabold tracking-wider text-white flex items-center gap-1 font-mono">
                  BATTERY<span className="text-cyan-400 text-glow-cyan font-bold">TWIN</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-300 font-mono font-bold uppercase tracking-wider">
                  2026 PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                <span>Physics-Informed RUL Prognostics</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> NASA PCoE Model
                </span>
              </p>
            </div>
          </div>

          {/* Mobile Status Indicator */}
          <div className="xl:hidden flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400">ONLINE</span>
          </div>
        </div>

        {/* Center/Nav: Tab Navigation */}
        <nav className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1 scrollbar-none w-full xl:w-auto justify-start xl:justify-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono transition-all duration-200 whitespace-nowrap group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/15 text-cyan-300 border border-cyan-500/50 shadow-[0_0_16px_rgba(0,240,255,0.2)] font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 border border-transparent font-medium'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono font-bold tracking-tight ${
                    isActive ? 'bg-cyan-400/20 text-cyan-200 border border-cyan-400/30' : 'bg-slate-800/80 text-slate-400 border border-slate-700/50'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-cyan-400 shadow-[0_0_8px_#00F0FF] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Live Telemetry Telemetry & Clock */}
        <div className="hidden xl:flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-300 shadow-inner">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">{timeStr || '00:00:00 UTC'}</span>
            <span className="text-slate-700">|</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_6px_#10B981]"></span>
            </span>
            <span className="text-emerald-400 font-bold tracking-wide">
              DJANGO 5.2 • ACTIVE
            </span>
          </div>
        </div>

      </div>
    </header>
  );
}
