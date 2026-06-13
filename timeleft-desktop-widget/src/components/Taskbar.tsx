import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  Clock, 
  Sparkles, 
  LayoutGrid, 
  Settings, 
  HelpCircle,
  Undo2,
  CalendarDays,
  Grid
} from 'lucide-react';

interface TaskbarProps {
  onToggleControlPanel: () => void;
  isControlPanelOpen: boolean;
  onAutoAlign: () => void;
  activeWidgetsCount: number;
  wallpaper: string;
  onChangeWallpaper: (wallpaper: 'aurora' | 'cyber' | 'obsidian' | 'soft-gradient' | 'minimalist' | 'color-shift') => void;
}

export default function Taskbar({
  onToggleControlPanel,
  isControlPanelOpen,
  onAutoAlign,
  activeWidgetsCount,
  wallpaper,
  onChangeWallpaper
}: TaskbarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="h-12 w-full bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-4 flex items-center justify-between z-40 relative select-none shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
      {/* Left side: Start Button & Menu */}
      <div className="flex items-center gap-2">
        <button
          id="pc-start-button"
          onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all transition-transform duration-200 active:scale-95 border ${
            isStartMenuOpen
              ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/35'
              : 'bg-slate-900/90 hover:bg-slate-850 border-slate-755 text-slate-100 hover:border-slate-600'
          }`}
        >
          <Tv 
            className="w-4 h-4 text-white animate-pulse" 
            style={{ filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 16px rgba(255, 255, 255, 0.85))' }}
          />
          <span className="text-white select-none" style={{ textShadow: '0 0 8px rgba(255, 255, 255, 0.6)' }}>Start System</span>
        </button>

        {/* Start Menu Popup */}
        {isStartMenuOpen && (
          <div 
            id="start-menu-popup"
            className="absolute bottom-14 left-4 w-72 bg-slate-900 border border-slate-700/80 rounded-xl p-4 shadow-2xl z-50 text-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-250"
          >
            <div className="space-y-4">
              {/* Profile Header */}
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white text-lg">
                  PC
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Countdown Desk Pro</h4>
                  <p className="text-[10px] text-emerald-400 font-medium">System Operating Normal</p>
                </div>
              </div>

              {/* Wallpaper Switcher */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1">
                  <Grid className="w-3 h-3 text-indigo-400" /> Choose Wallpaper
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'aurora', name: 'Deep Aurora' },
                    { id: 'color-shift', name: '🌈 Infinite Hue' },
                    { id: 'cyber', name: 'Cyberpunk Grid' },
                    { id: 'obsidian', name: 'Matte Obsidian' },
                    { id: 'soft-gradient', name: 'Soft Orchid' },
                    { id: 'minimalist', name: 'Dark Slate' }
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        onChangeWallpaper(preset.id as any);
                        setIsStartMenuOpen(false);
                      }}
                      className={`text-[10px] py-1 px-1.5 rounded text-left border ${
                        wallpaper === preset.id
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300 font-bold'
                          : 'border-slate-850 bg-slate-950/40 hover:bg-slate-850 text-slate-400'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions list */}
              <div className="space-y-1.5 pt-1 border-t border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">System Utilities</span>
                
                <button
                  onClick={() => {
                    onAutoAlign();
                    setIsStartMenuOpen(false);
                  }}
                  className="w-full text-left text-xs p-2 rounded bg-slate-950/40 hover:bg-slate-800 border border-slate-850/50 hover:border-slate-700/60 transition-all flex items-center gap-2 text-indigo-300"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Auto-Align Floating Cards</span>
                </button>

                <button
                  onClick={() => {
                    onToggleControlPanel();
                    setIsStartMenuOpen(false);
                  }}
                  className="w-full text-left text-xs p-2 rounded bg-slate-950/40 hover:bg-slate-800 border border-slate-850/50 hover:border-slate-700/60 transition-all flex items-center gap-2 text-slate-200"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isControlPanelOpen ? 'Minimize Settings Center' : 'Restore Settings Center'}</span>
                </button>
              </div>

              {/* Instructions overview */}
              <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800/80 text-[10px] text-slate-400">
                <p className="font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-yellow-400" />
                  Resize Tips:
                </p>
                <ul className="list-disc ml-3.5 space-y-0.5 font-sans">
                  <li>Input targets to deploy widget cards onto the desktop.</li>
                  <li>Click and drag headers to re-orient positions.</li>
                  <li>Drag the bottom-right coordinate corners to shrink/expand card scales.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Custom Application Shortcut to bring config center alive */}
        <button
          id="taskbar-settings-trigger"
          onClick={onToggleControlPanel}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
            isControlPanelOpen
              ? 'bg-slate-850 border-slate-700 text-indigo-300 shadow-[inset_0_1px_4px_rgba(0,0,0,0.6)]'
              : 'bg-slate-900 border-slate-850 hover:border-slate-750 text-slate-300'
          }`}
          title="Toggle System Control Center"
        >
          <Settings className={`w-3.5 h-3.5 ${isControlPanelOpen ? 'animate-spin-slow text-indigo-400' : ''}`} />
          <span className="hidden sm:inline">Settings Workstation</span>
        </button>

        {activeWidgetsCount > 0 && (
          <button
            id="taskbar-align-trigger"
            onClick={onAutoAlign}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-850 hover:border-slate-750 text-slate-400 hover:text-white transition-all"
            title="Snap widgets to clean layout grid positions"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
            <span>Auto-Align ({activeWidgetsCount})</span>
          </button>
        )}
      </div>

      {/* Center status bar */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded bg-slate-900/60 border border-slate-800 text-slate-400 text-[10px] font-mono select-none">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>PC-SYSTEM WORKPLACE // V3.0</span>
      </div>

      {/* Right side: Dynamic Clock indicator */}
      <div className="flex items-center gap-3 bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-800 selection:bg-transparent">
        <div className="flex flex-col items-end">
          <span className="text-xs font-bold text-white font-mono tracking-wider">
            {formattedTime}
          </span>
          <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide">
            {formattedDate}
          </span>
        </div>
        <Clock className="w-4 h-4 text-indigo-400" />
      </div>
    </div>
  );
}
