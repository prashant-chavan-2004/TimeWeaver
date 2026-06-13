import React, { useState, useEffect, useRef } from 'react';
import { CountdownTimer, WallpaperPreset } from './types';
import DesktopWidget from './components/DesktopWidget';
import ControlPanel from './components/ControlPanel';
import Taskbar from './components/Taskbar';
import { 
  Tv, 
  Settings, 
  Sparkles, 
  ListTodo, 
  HelpCircle, 
  X, 
  Minus,
  Maximize2,
  Calendar,
  Layers,
  MousePointerClick
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'pc_countdown_timers_v3';
const WALLPAPER_KEY = 'pc_countdown_wallpaper_v3';
const CONTROL_PANEL_OPEN_KEY = 'pc_control_panel_open_v3';

// Direct utility to generate default timers relative to today's date
const generateDefaultTimers = (): CountdownTimer[] => {
  const now = new Date();
  
  // 1. Next weekend countdown (Friday at 5 PM)
  const currentDay = now.getDay();
  const daysToFriday = (5 - currentDay + 7) % 7;
  const fridayTarget = new Date(now);
  fridayTarget.setDate(now.getDate() + (daysToFriday === 0 ? 7 : daysToFriday));
  fridayTarget.setHours(17, 0, 0, 0);

  // 2. Cosmic milestone event (80 days, 14 hours in the future)
  const milestoneTarget = new Date(now);
  milestoneTarget.setDate(now.getDate() + 80);
  milestoneTarget.setHours(now.getHours() + 14, 30, 0, 0);

  return [
    {
      id: 'default-weekend',
      title: 'Weekend Target',
      targetDate: fridayTarget.toISOString().slice(0, 16), // Format to YYYY-MM-DDTHH:mm
      colorPreset: 'rose',
      isWidget: true,
      widgetPresetSize: 'standard',
      widgetSize: { width: 300, height: 160 },
      widgetPosition: { x: 30, y: 70 },
      showSeconds: true,
      themeStyle: 'glass',
      bgOpacity: 50,
      fontSize: 'base'
    },
    {
      id: 'default-milestone',
      title: 'Cosmic Journey Launch',
      targetDate: milestoneTarget.toISOString().slice(0, 16),
      colorPreset: 'violet',
      isWidget: true,
      widgetPresetSize: 'large',
      widgetSize: { width: 380, height: 200 },
      widgetPosition: { x: 30, y: 250 },
      showSeconds: true,
      themeStyle: 'neon-glow',
      bgOpacity: 45,
      fontSize: 'base'
    }
  ];
};

export default function App() {
  const [timers, setTimers] = useState<CountdownTimer[]>([]);
  const [wallpaper, setWallpaper] = useState<WallpaperPreset>('color-shift');
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'widgets' | 'guide'>('widgets');
  const [isAmbientWallpaperMode, setIsAmbientWallpaperMode] = useState(false);
  
  const desktopRef = useRef<HTMLDivElement>(null);

  // Control Panel Dragging state
  const [controlPanelPos, setControlPanelPos] = useState({ x: 450, y: 70 });
  const [isCPDragging, setIsCPDragging] = useState(false);
  const [cpDragOffset, setCpDragOffset] = useState({ x: 0, y: 0 });
  const controlPanelHeaderRef = useRef<HTMLDivElement>(null);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setTimers(JSON.parse(stored));
      } else {
        const defaults = generateDefaultTimers();
        setTimers(defaults);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaults));
      }
    } catch (e) {
      console.error('Failed to load timers from localStorage:', e);
      setTimers(generateDefaultTimers());
    }

    try {
      const storedWallpaper = localStorage.getItem(WALLPAPER_KEY) as WallpaperPreset;
      if (storedWallpaper) {
        setWallpaper(storedWallpaper);
      }
    } catch (e) {
      console.error(e);
    }

    try {
      const storedCPOpen = localStorage.getItem(CONTROL_PANEL_OPEN_KEY);
      if (storedCPOpen !== null) {
        setIsControlPanelOpen(JSON.parse(storedCPOpen));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save to LocalStorage whenever timers change
  const saveTimersToStorage = (newTimers: CountdownTimer[]) => {
    setTimers(newTimers);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newTimers));
    } catch (e) {
      console.error('Failed to save timers to localStorage:', e);
    }
  };

  // Change Wallpaper
  const handleWallpaperChange = (p: WallpaperPreset) => {
    setWallpaper(p);
    try {
      localStorage.setItem(WALLPAPER_KEY, p);
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle Control Panel
  const handleToggleControlPanel = () => {
    const nextState = !isControlPanelOpen;
    setIsControlPanelOpen(nextState);
    try {
      localStorage.setItem(CONTROL_PANEL_OPEN_KEY, JSON.stringify(nextState));
    } catch (e) {
      console.error(e);
    }
  };

  // Create Timer
  const handleCreateTimer = (newTimer: Omit<CountdownTimer, 'id'>) => {
    const timer: CountdownTimer = {
      ...newTimer,
      id: `timer-${Date.now()}`
    };
    saveTimersToStorage([...timers, timer]);
  };

  // Delete Timer
  const handleDeleteTimer = (id: string) => {
    saveTimersToStorage(timers.filter((t) => t.id !== id));
  };

  // Update specific timer
  const handleUpdateTimer = (id: string, updates: Partial<CountdownTimer>) => {
    saveTimersToStorage(
      timers.map((timer) => {
        if (timer.id === id) {
          // If updates includes widget size, bounds check it
          let newSize = timer.widgetSize;
          if (updates.widgetSize) {
            newSize = {
              width: Math.max(200, Math.min(updates.widgetSize.width, 800)),
              height: Math.max(100, Math.min(updates.widgetSize.height, 500))
            };
          }

          return {
            ...timer,
            ...updates,
            widgetSize: newSize
          };
        }
        return timer;
      })
    );
  };

  // Auto-align all visible widgets on desktop beautifully
  const handleAutoAlign = () => {
    const activeWidgets = timers.filter((t) => t.isWidget);
    if (activeWidgets.length === 0) return;

    const desktopRect = desktopRef.current?.getBoundingClientRect();
    const containerWidth = desktopRect ? desktopRect.width : 1200;
    const padding = 20;
    
    // We start widget column alignment from the right or in a grid
    // For smaller screens or standard sizes, let's slot them starting from X:30
    // Y: 70 if CP is closed, or starting from left column & right column
    let currentX = padding;
    let currentY = 70;
    let maxRowHeight = 0;

    const aligned = timers.map((t) => {
      if (!t.isWidget) return t;

      const widgetWidth = t.widgetSize.width;
      const widgetHeight = t.widgetSize.height;

      // Wrap to next line if it exceeds container width
      if (currentX + widgetWidth > containerWidth - padding) {
        currentX = padding;
        currentY += maxRowHeight + padding;
        maxRowHeight = 0;
      }

      const assignedPos = { x: currentX, y: currentY };

      // Increment x coordinate
      currentX += widgetWidth + padding;
      maxRowHeight = Math.max(maxRowHeight, widgetHeight);

      return {
        ...t,
        widgetPosition: assignedPos
      };
    });

    saveTimersToStorage(aligned);
  };

  // Control Panel Drag handlers
  const handleCPMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('select')) {
      return;
    }

    setIsCPDragging(true);
    setCpDragOffset({
      x: e.clientX - controlPanelPos.x,
      y: e.clientY - controlPanelPos.y
    });
    e.preventDefault();
  };

  useEffect(() => {
    const handleCPMouseMove = (e: MouseEvent) => {
      if (isCPDragging && desktopRef.current) {
        const parentRect = desktopRef.current.getBoundingClientRect();
        
        let newX = e.clientX - cpDragOffset.x;
        let newY = e.clientY - cpDragOffset.y;
        
        // Settings panel bounds check (e.g. Panel is about 640px wide & 460px high)
        newX = Math.max(0, Math.min(newX, parentRect.width - 250));
        newY = Math.max(0, Math.min(newY, parentRect.height - 100));

        setControlPanelPos({ x: newX, y: newY });
      }
    };

    const handleCPMouseUp = () => {
      setIsCPDragging(false);
    };

    if (isCPDragging) {
      window.addEventListener('mousemove', handleCPMouseMove);
      window.addEventListener('mouseup', handleCPMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleCPMouseMove);
      window.removeEventListener('mouseup', handleCPMouseUp);
    };
  }, [isCPDragging, cpDragOffset]);

  // Wallpaper backgrounds configurations
  const getWallpaperClasses = () => {
    switch (wallpaper) {
      case 'color-shift':
        return 'bg-gradient-to-tr from-indigo-950 via-purple-900 to-rose-950 animate-gradient-infinite animate-infinite-background';
      case 'cyber':
        return 'bg-zinc-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.2),rgba(255,255,255,0))] selection:bg-yellow-400 selection:text-black';
      case 'obsidian':
        return 'bg-[#0a0a0c] bg-radial-gradient selection:bg-slate-700';
      case 'soft-gradient':
        return 'bg-gradient-to-tr from-slate-900 via-indigo-950 to-purple-900 animate-gradient-infinite animate-infinite-background';
      case 'minimalist':
        return 'bg-slate-900';
      case 'aurora':
      default:
        return 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-purple-950 to-slate-950';
    }
  };

  const visibleWidgets = timers.filter((t) => t.isWidget);

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden relative font-sans text-white select-none ${getWallpaperClasses()}`}>
      
      {/* Decorative Aurora background circles for 'aurora' mode */}
      {wallpaper === 'aurora' && (
        <>
          <div className="absolute top-12 right-20 w-[420px] h-[420px] rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />
          <div className="absolute bottom-16 left-32 w-[350px] h-[350px] rounded-full bg-violet-600/10 blur-[70px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] rounded-full bg-fuchsia-500/5 blur-[90px] pointer-events-none" />
        </>
      )}

      {/* Cyber Laser Lines for 'cyber' mode */}
      {wallpaper === 'cyber' && (
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      )}

      {/* Virtual Desktop Canvas */}
      <div 
        ref={desktopRef}
        id="desktop-canvas"
        className="flex-grow w-full relative overflow-hidden"
      >
        {/* Floating Widgets Map */}
        {visibleWidgets.map((timer) => (
          <DesktopWidget
            key={timer.id}
            timer={timer}
            onUpdate={handleUpdateTimer}
            onDelete={handleDeleteTimer}
            containerRef={desktopRef}
          />
        ))}

        {/* DRAGGABLE CONTROL PANEL WINDOW */}
        {isControlPanelOpen && !isAmbientWallpaperMode && (
          <div
            style={{
              left: `${controlPanelPos.x}px`,
              top: `${controlPanelPos.y}px`
            }}
            id="draggable-control-workstation"
            className="absolute w-[92vw] sm:w-[650px] md:w-[740px] max-h-[85vh] z-30 transition-shadow duration-200 select-none flex flex-col shadow-2xl"
          >
            {/* Draggable Title Header Handle */}
            <div 
              onMouseDown={handleCPMouseDown}
              className="bg-slate-950/90 text-slate-100 px-4 py-2 flex items-center justify-between cursor-move hover:bg-slate-950 border-t border-x border-slate-800 rounded-t-xl text-xs active:cursor-grabbing font-bold select-none"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4.5 h-4.5 text-indigo-400 rotate-45 animate-pulse" />
                <span>Drag Header to Slide Windows</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Minimize window button */}
                <button
                  id="header-minimize-btn"
                  onClick={handleToggleControlPanel}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                  title="Minimize window"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                {/* Standard close button */}
                <button
                  id="header-close-btn"
                  onClick={handleToggleControlPanel}
                  className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-all font-bold"
                  title="Close settings"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Render Settings Panel body in window structure */}
            <div className="flex-grow overflow-hidden rounded-b-xl border-b border-x border-slate-850 bg-slate-900 shadow-2xl h-[480px]">
              <ControlPanel
                timers={timers}
                onCreateTimer={handleCreateTimer}
                onDeleteTimer={handleDeleteTimer}
                onUpdateTimer={handleUpdateTimer}
                onOpenPreset={(type) => console.log('preset called', type)}
                isAmbientWallpaperMode={isAmbientWallpaperMode}
                onToggleAmbientWallpaperMode={() => setIsAmbientWallpaperMode(true)}
              />
            </div>
          </div>
        )}

        {/* Floating Exit Ambient Wallpaper Overlay */}
        {isAmbientWallpaperMode && (
          <button
            id="exit-ambient-wallpaper-btn"
            onClick={() => setIsAmbientWallpaperMode(false)}
            className="absolute top-4 right-4 z-50 bg-slate-950/85 hover:bg-slate-900 border border-white/20 hover:border-purple-400 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] text-white px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md transition-all flex items-center gap-2 shadow-2xl group cursor-pointer select-none"
            title="Exit Ambient Wallpaper mode"
          >
            <Tv className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span>⚙️ Exit Wallpaper Mode</span>
          </button>
        )}

        {/* Minimal Instructions tooltip if Control Panel is closed & no widgets are visible */}
        {timers.length === 0 && !isControlPanelOpen && !isAmbientWallpaperMode && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center p-6 bg-slate-900/80 border border-slate-750 backdrop-blur-md rounded-2xl max-w-sm shadow-xl">
            <Tv className="w-10 h-10 text-indigo-400 mx-auto mb-2 animate-bounce" />
            <h3 className="text-sm font-bold text-slate-100">Clean Canvas Desktop</h3>
            <p className="text-xs text-slate-400 mt-1">
              Click <span className="font-bold text-indigo-400">Start System</span> or <span className="font-semibold text-slate-300">Settings Workstation</span> on the bottom taskbar to deploy a customizable countdown widget!
            </p>
          </div>
        )}
      </div>

      {/* Taskbar bottom component */}
      {!isAmbientWallpaperMode && (
        <Taskbar
          onToggleControlPanel={handleToggleControlPanel}
          isControlPanelOpen={isControlPanelOpen}
          onAutoAlign={handleAutoAlign}
          activeWidgetsCount={visibleWidgets.length}
          wallpaper={wallpaper}
          onChangeWallpaper={handleWallpaperChange}
        />
      )}
    </div>
  );
}
