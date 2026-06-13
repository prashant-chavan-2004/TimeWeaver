import React, { useState, useEffect, useRef } from 'react';
import { CountdownTimer } from '../types';
import { 
  X, 
  Settings, 
  Maximize2, 
  Move, 
  Sparkles,
  RotateCcw,
  Palette,
  Eye,
  EyeOff,
  Sliders,
  Layers
} from 'lucide-react';

interface SplitFlapCellProps {
  value: number;
  label: string;
  fontSizeClass: string;
  minHeightVal: string;
  paddingVal: string;
  customColor?: string;
  blockStyleOverrideObj: React.CSSProperties;
  customBgClass: string;
  labelFontSizeClass: string;
  showLabel?: boolean;
  themeStyle?: string;
}

const SplitFlapCell: React.FC<SplitFlapCellProps> = ({
  value,
  label,
  fontSizeClass,
  minHeightVal,
  paddingVal,
  customColor,
  blockStyleOverrideObj,
  customBgClass,
  labelFontSizeClass,
  showLabel = true,
  themeStyle,
}) => {
  const [curr, setCurr] = useState(value);
  const [prev, setPrev] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (value !== curr) {
      setPrev(curr);
      setCurr(value);
      setIsFlipping(true);
      const timer = setTimeout(() => {
        setIsFlipping(false);
      }, 450); // 450ms matching duration
      return () => clearTimeout(timer);
    }
  }, [value, curr]);

  const currStr = String(curr).padStart(2, '0');
  const prevStr = String(prev).padStart(2, '0');

  // Elite modern glass styling properties
  const isGlassTheme = themeStyle === 'glass';
  const hasCustomBg = customColor?.trim() && (customColor.startsWith('#') || !customColor.startsWith('bg-'));

  const cellStyle: React.CSSProperties = {
    ...blockStyleOverrideObj,
    minHeight: minHeightVal,
    ...(isGlassTheme
      ? {
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          background: hasCustomBg
            ? `linear-gradient(135deg, ${customColor}35 0%, ${customColor}80 100%)`
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
          borderColor: hasCustomBg ? `${customColor}50` : 'rgba(255, 255, 255, 0.12)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.25), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
        }
      : {
          background: hasCustomBg
            ? `linear-gradient(to bottom, ${customColor}ee 0%, ${customColor} 100%)`
            : 'linear-gradient(to bottom, #111827 0%, #030712 100%)',
        }),
  };

  const defaultPillClass = customBgClass
    ? `${customBgClass} border border-white/20 text-white`
    : isGlassTheme 
      ? 'border text-white' 
      : 'bg-slate-800 border border-slate-700/50 text-slate-100';

  return (
    <div
      className={`${paddingVal} rounded-xl flex flex-col items-center justify-center transition-all duration-300 relative group/cell overflow-hidden ${defaultPillClass}`}
      style={cellStyle}
    >
      <div className="absolute inset-x-0 top-0 h-1/2 bg-white/[0.02] pointer-events-none z-1" />
      <div className="relative overflow-hidden flex items-center justify-center min-w-[3.2ch] sm:min-w-[3.4ch] h-[1.35em] px-1.5 z-5">
        {isFlipping ? (
          <>
            <span 
              className={`absolute font-mono tracking-tighter text-white ${fontSizeClass} animate-fall-out`}
              style={{ textShadow: isGlassTheme ? '0 2px 10px rgba(255,255,255,0.1)' : 'none' }}
            >
              {prevStr}
            </span>
            <span 
              className={`absolute font-mono tracking-tighter text-white ${fontSizeClass} animate-fall-in`}
              style={{ textShadow: isGlassTheme ? '0 2px 10px rgba(255,255,255,0.1)' : 'none' }}
            >
              {currStr}
            </span>
          </>
        ) : (
          <span 
            className={`font-mono tracking-tighter text-white ${fontSizeClass}`}
            style={{ textShadow: isGlassTheme ? '0 2px 10px rgba(255,255,255,0.1)' : 'none' }}
          >
            {currStr}
          </span>
        )}
      </div>
      {showLabel && (
        <span className={`uppercase font-bold tracking-widest text-slate-300 mt-1 select-none z-5 ${labelFontSizeClass}`}>
          {label}
        </span>
      )}
    </div>
  );
};

interface DesktopWidgetProps {
  key?: any;
  timer: CountdownTimer;
  onUpdate: (id: string, updates: Partial<CountdownTimer>) => void;
  onDelete: (id: string) => void;
  containerRef: React.RefObject<any> | any;
}

export default function DesktopWidget({ timer, onUpdate, onDelete, containerRef }: DesktopWidgetProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false,
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showQuickSettings, setShowQuickSettings] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Live countdown effect
  useEffect(() => {
    function calculateTime() {
      const difference = +new Date(timer.targetDate) - +new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isOver: false,
      });
    }

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [timer.targetDate]);

  // Dragging logic
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (timer.isWallpaper) {
      return;
    }
    // Avoid dragging when clicking buttons
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('select')) {
      return;
    }
    
    setIsDragging(true);
    const rect = widgetRef.current?.getBoundingClientRect();
    const parentRect = containerRef.current?.getBoundingClientRect();
    
    if (rect && parentRect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && containerRef.current) {
        const parentRect = containerRef.current.getBoundingClientRect();
        
        let newX = e.clientX - parentRect.left - dragOffset.x;
        let newY = e.clientY - parentRect.top - dragOffset.y;
        
        // Boundaries
        newX = Math.max(0, Math.min(newX, parentRect.width - (timer.widgetSize.width || 250)));
        newY = Math.max(0, Math.min(newY, parentRect.height - (timer.widgetSize.height || 150)));
        
        onUpdate(timer.id, {
          widgetPosition: { x: newX, y: newY }
        });
      }

      if (isResizing && containerRef.current && widgetRef.current) {
        const rect = widgetRef.current.getBoundingClientRect();
        
        let newWidth = e.clientX - rect.left;
        let newHeight = e.clientY - rect.top;
        
        // Constraints
        newWidth = Math.max(220, Math.min(newWidth, 700));
        newHeight = Math.max(120, Math.min(newHeight, 400));
        
        onUpdate(timer.id, {
          widgetSize: { width: newWidth, height: newHeight },
          widgetPresetSize: 'custom' // mark as custom since manual resize occurs
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, timer.widgetSize, timer.id]);

  // Resize start handler
  const handleResizeStart = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
    e.stopPropagation();
  };

  // Color theme class getters
  const getThemeClasses = () => {
    const opacityClass = `bg-opacity-${timer.bgOpacity || 40}`;
    
    const bases = {
      slate: {
        bg: `bg-slate-900/${timer.bgOpacity || 40} backdrop-blur-md border border-slate-700/60 shadow-xl shadow-black/30`,
        header: 'border-b border-slate-800/80 bg-slate-950/40',
        glow: 'shadow-[0_0_15px_-3px_rgba(148,163,184,0.15)]',
        colorText: 'text-slate-400',
        pill: 'bg-slate-800/50 border border-slate-700/40 text-slate-100',
        badge: 'bg-slate-700/50 text-slate-200 border border-slate-600/40',
        accentGlow: 'before:absolute before:-inset-px before:rounded-xl before:bg-gradient-to-r before:from-slate-500/10 before:to-slate-300/10 before:blur-sm before:-z-10'
      },
      violet: {
        bg: `bg-violet-950/${timer.bgOpacity || 40} backdrop-blur-md border border-violet-500/30 shadow-xl shadow-violet-950/20`,
        header: 'border-b border-violet-800/40 bg-violet-950/30',
        glow: 'shadow-[0_0_25px_-5px_rgba(139,92,246,0.3)]',
        colorText: 'text-violet-300',
        pill: 'bg-violet-900/40 border border-violet-500/30 text-violet-100',
        badge: 'bg-violet-800/40 text-violet-100 border border-violet-700/30',
        accentGlow: 'before:absolute before:-inset-px before:rounded-xl before:bg-gradient-to-r before:from-violet-500/20 before:to-fuchsia-500/20 before:blur-sm before:-z-10'
      },
      emerald: {
        bg: `bg-emerald-950/${timer.bgOpacity || 40} backdrop-blur-md border border-emerald-500/30 shadow-xl shadow-emerald-950/20`,
        header: 'border-b border-emerald-800/40 bg-emerald-950/30',
        glow: 'shadow-[0_0_25px_-5px_rgba(16,185,129,0.25)]',
        colorText: 'text-emerald-300',
        pill: 'bg-emerald-900/30 border border-emerald-500/20 text-emerald-100',
        badge: 'bg-emerald-800/30 text-emerald-100 border border-emerald-700/20',
        accentGlow: 'before:absolute before:-inset-px before:rounded-xl before:bg-gradient-to-r before:from-emerald-500/15 before:to-teal-500/15 before:blur-sm before:-z-10'
      },
      amber: {
        bg: `bg-amber-950/${timer.bgOpacity || 40} backdrop-blur-md border border-amber-500/30 shadow-xl shadow-amber-950/20`,
        header: 'border-b border-amber-850 bg-amber-950/30',
        glow: 'shadow-[0_0_25px_-5px_rgba(245,158,11,0.25)]',
        colorText: 'text-amber-300 border-amber-900/40',
        pill: 'bg-amber-900/30 border border-amber-500/30 text-amber-100',
        badge: 'bg-amber-800/30 text-amber-100 border border-amber-700/20',
        accentGlow: 'before:absolute before:-inset-px before:rounded-xl before:bg-gradient-to-r before:from-amber-500/15 before:to-orange-500/15 before:blur-sm before:-z-10'
      },
      rose: {
        bg: `bg-rose-950/${timer.bgOpacity || 40} backdrop-blur-md border border-rose-500/30 shadow-xl shadow-rose-950/20`,
        header: 'border-b border-rose-800/40 bg-rose-950/30',
        glow: 'shadow-[0_0_25px_-5px_rgba(244,63,94,0.3)]',
        colorText: 'text-rose-300',
        pill: 'bg-rose-900/30 border border-rose-500/30 text-rose-100',
        badge: 'bg-rose-800/30 text-rose-100 border border-rose-700/20',
        accentGlow: 'before:absolute before:-inset-px before:rounded-xl before:bg-gradient-to-r before:from-rose-500/20 before:to-pink-500/20 before:blur-sm before:-z-10'
      },
      ocean: {
        bg: `bg-sky-950/${timer.bgOpacity || 40} backdrop-blur-md border border-sky-500/30 shadow-xl shadow-sky-950/20`,
        header: 'border-b border-sky-800/40 bg-sky-950/30',
        glow: 'shadow-[0_0_25px_-5px_rgba(14,165,233,0.3)]',
        colorText: 'text-sky-300',
        pill: 'bg-sky-900/30 border border-sky-500/30 text-sky-100',
        badge: 'bg-sky-800/30 text-sky-100 border border-sky-700/20',
        accentGlow: 'before:absolute before:-inset-px before:rounded-xl before:bg-gradient-to-r before:from-sky-500/20 before:to-indigo-500/20 before:blur-sm before:-z-10'
      },
      neon: {
        bg: 'bg-black/85 border-2 border-magenta-500 shadow-[0_0_30px_rgba(240,46,170,0.4)]',
        header: 'border-b border-magenta-500 bg-violet-950/50',
        glow: 'shadow-[0_0_20px_rgba(240,46,170,0.3)]',
        colorText: 'text-fuchsia-400 font-mono tracking-wider',
        pill: 'bg-fuchsia-950/40 border border-fuchsia-500 text-fuchsia-200',
        badge: 'bg-purple-900 text-fuchsia-100 border border-purple-500',
        accentGlow: 'before:absolute before:-inset-px before:rounded-xl before:bg-gradient-to-r before:from-cyan-500/30 before:to-fuchsia-500/30 before:blur-md before:-z-10'
      },
      'color-shift': {
        bg: 'bg-gradient-to-tr from-indigo-950 via-purple-900 to-rose-950 animate-gradient-infinite animate-infinite-background backdrop-blur-md border border-purple-500/30 shadow-xl',
        header: 'border-b border-purple-850 bg-purple-950/30',
        glow: 'shadow-[0_0_25px_-5px_rgba(168,85,247,0.4)]',
        colorText: 'text-purple-300',
        pill: 'bg-gradient-to-tr from-indigo-950/30 via-purple-900/30 to-rose-950/30 animate-gradient-infinite animate-infinite-background border border-purple-500/30 text-white',
        badge: 'bg-purple-800/30 text-white border border-purple-700/20',
        accentGlow: 'before:absolute before:-inset-px before:rounded-xl before:bg-gradient-to-r before:from-purple-500/20 before:to-pink-500/20 before:blur-sm before:-z-10'
      }
    };
    
    const active = bases[timer.colorPreset] || bases.slate;

    if (timer.themeStyle === 'glass') {
      const opacityPercent = timer.bgOpacity || 25;
      const glassColors = {
        slate: {
          bg: `bg-slate-900/${opacityPercent} backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.35)]`,
          header: 'border-b border-white/10 bg-slate-950/20',
          glow: 'shadow-[0_0_20px_rgba(255,255,255,0.05)]',
          colorText: 'text-slate-300',
          pill: 'bg-white/5 backdrop-blur-lg border border-white/10 text-white',
          badge: 'bg-white/10 text-white border border-white/20',
          accentGlow: 'before:absolute before:-inset-px before:rounded-xl before:bg-gradient-to-r before:from-white/10 before:to-transparent before:blur-sm before:-z-10'
        },
        violet: {
          bg: `bg-violet-950/${opacityPercent} backdrop-blur-xl border border-violet-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.35)]`,
          header: 'border-b border-violet-500/10 bg-violet-950/20',
          glow: 'shadow-[0_0_25px_rgba(139,92,246,0.15)]',
          colorText: 'text-violet-300',
          pill: 'bg-violet-950/10 backdrop-blur-lg border border-violet-500/20 text-violet-100',
          badge: 'bg-violet-500/25 text-violet-100 border border-violet-500/30',
          accentGlow: 'before:absolute before:-inset-px before:rounded-xl before:bg-gradient-to-r before:from-violet-500/15 before:to-transparent before:blur-sm before:-z-10'
        },
        emerald: {
          bg: `bg-emerald-950/${opacityPercent} backdrop-blur-xl border border-emerald-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.35)]`,
          header: 'border-b border-emerald-500/10 bg-emerald-950/20',
          glow: 'shadow-[0_0_25px_rgba(16,185,129,0.15)]',
          colorText: 'text-emerald-300',
          pill: 'bg-emerald-950/10 backdrop-blur-lg border border-emerald-500/20 text-emerald-100',
          badge: 'bg-emerald-500/25 text-emerald-100 border border-emerald-500/30',
          accentGlow: 'before:absolute before:-inset-px before:rounded-xl before:bg-gradient-to-r before:from-emerald-500/15 before:to-transparent before:blur-sm before:-z-10'
        },
        amber: {
          bg: `bg-amber-950/${opacityPercent} backdrop-blur-xl border border-amber-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.35)]`,
          header: 'border-b border-amber-500/10 bg-amber-950/20',
          glow: 'shadow-[0_0_25px_rgba(245,158,11,0.15)]',
          colorText: 'text-amber-350',
          pill: 'bg-amber-950/10 backdrop-blur-lg border border-amber-500/20 text-amber-100',
          badge: 'bg-amber-500/25 text-amber-100 border border-amber-500/30',
          accentGlow: 'before:absolute before:-inset-px before:rounded-xl before:bg-gradient-to-r before:from-amber-500/15 before:to-transparent before:blur-sm before:-z-10'
        },
        rose: {
          bg: `bg-rose-950/${opacityPercent} backdrop-blur-xl border border-rose-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.35)]`,
          header: 'border-b border-rose-500/10 bg-rose-950/20',
          glow: 'shadow-[0_0_25px_rgba(244,63,94,0.15)]',
          colorText: 'text-rose-300',
          pill: 'bg-rose-950/10 backdrop-blur-lg border border-rose-500/20 text-rose-100',
          badge: 'bg-rose-500/25 text-rose-100 border border-rose-500/30',
          accentGlow: 'before:absolute before:-inset-px before:rounded-xl before:bg-gradient-to-r before:from-rose-500/15 before:to-transparent before:blur-sm before:-z-10'
        },
        ocean: {
          bg: `bg-sky-950/${opacityPercent} backdrop-blur-xl border border-sky-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.35)]`,
          header: 'border-b border-sky-500/10 bg-sky-950/20',
          glow: 'shadow-[0_0_25px_rgba(14,165,233,0.15)]',
          colorText: 'text-sky-300',
          pill: 'bg-sky-950/10 backdrop-blur-lg border border-sky-500/20 text-sky-100',
          badge: 'bg-sky-500/25 text-sky-100 border border-sky-500/30',
          accentGlow: 'before:absolute before:-inset-px before:rounded-xl before:bg-gradient-to-r before:from-sky-500/15 before:to-transparent before:blur-sm before:-z-10'
        },
        neon: {
          bg: `bg-fuchsia-950/${opacityPercent} backdrop-blur-xl border border-fuchsia-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.35)]`,
          header: 'border-b border-fuchsia-500/10 bg-fuchsia-950/20',
          glow: 'shadow-[0_0_25px_rgba(240,46,170,0.15)]',
          colorText: 'text-fuchsia-300',
          pill: 'bg-fuchsia-950/10 backdrop-blur-lg border border-fuchsia-500/20 text-fuchsia-200',
          badge: 'bg-fuchsia-500/25 text-fuchsia-100 border border-fuchsia-500/30',
          accentGlow: 'before:absolute before:-inset-px before:rounded-xl before:bg-gradient-to-r before:from-fuchsia-500/15 before:to-transparent before:blur-sm before:-z-10'
        },
        'color-shift': {
          bg: `bg-gradient-to-tr from-indigo-950/${opacityPercent} via-purple-900/${opacityPercent} to-rose-950/${opacityPercent} animate-gradient-infinite animate-infinite-background backdrop-blur-xl border border-white/20 shadow-xl`,
          header: 'border-b border-white/10 bg-purple-950/20',
          glow: 'shadow-[0_0_25px_rgba(168,85,247,0.2)]',
          colorText: 'text-purple-200',
          pill: 'bg-gradient-to-tr from-indigo-950/25 via-purple-900/25 to-rose-950/25 animate-gradient-infinite animate-infinite-background border border-white/25 text-white',
          badge: 'bg-white/15 text-white border border-white/20',
          accentGlow: 'before:absolute before:-inset-px before:rounded-xl before:bg-gradient-to-r before:from-purple-500/25 before:to-transparent before:blur-sm before:-z-10'
        }
      };

      const key = timer.colorPreset in glassColors ? timer.colorPreset : 'slate';
      return glassColors[key];
    }

    if (timer.themeStyle === 'solid') {
      const solidColors = {
        slate: 'bg-slate-900 border border-slate-700 shadow-2xl',
        violet: 'bg-indigo-950 border border-indigo-700 shadow-2xl',
        emerald: 'bg-emerald-950 border border-emerald-700 shadow-2xl',
        amber: 'bg-stone-900 border border-amber-800 shadow-2xl',
        rose: 'bg-rose-950 border border-rose-800 shadow-2xl',
        ocean: 'bg-blue-950 border border-blue-800 shadow-2xl',
        neon: 'bg-zinc-950 border-2 border-fuchsia-600 shadow-2xl',
        'color-shift': 'bg-gradient-to-tr from-indigo-950 via-purple-900 to-rose-950 animate-gradient-infinite animate-infinite-background border border-purple-800 shadow-2xl'
      };
      return {
        ...active,
        bg: solidColors[timer.colorPreset] || solidColors.slate,
        accentGlow: ''
      };
    }

    if (timer.themeStyle === 'cyberpunk') {
      return {
        bg: 'bg-black border-2 border-yellow-400 shadow-[4px_4px_0px_#facc15] font-mono',
        header: 'bg-yellow-400 text-black border-b border-yellow-500',
        glow: '',
        colorText: 'text-yellow-400',
        pill: 'bg-zinc-900 border border-yellow-400 text-yellow-300',
        badge: 'bg-yellow-400 text-black font-black',
        accentGlow: ''
      };
    }

    return active;
  };

  const themeClasses = getThemeClasses();

  // Handle Preset Size adjustments
  const applyPresetSize = (preset: 'compact' | 'standard' | 'large' | 'dashboard') => {
    let width = 280;
    let height = 150;

    switch (preset) {
      case 'compact':
        width = 240;
        height = 110;
        break;
      case 'standard':
        width = 300;
        height = 160;
        break;
      case 'large':
        width = 380;
        height = 200;
        break;
      case 'dashboard':
        width = 500;
        height = 180;
        break;
    }

    onUpdate(timer.id, {
      widgetPresetSize: preset,
      widgetSize: { width, height }
    });
  };

  // Label sizes based on scaling and custom block sizes
  const getTimerFontSize = () => {
    const size = timer.blockSize || 'md';
    if (size === 'sm') return 'text-lg sm:text-xl font-bold';
    if (size === 'md') return 'text-2xl sm:text-3xl font-extrabold';
    if (size === 'lg') return 'text-3xl sm:text-4xl font-black';
    if (size === 'xl') return 'text-4xl sm:text-5xl font-black';
    return 'text-5xl sm:text-6xl md:text-7xl font-black'; // giant
  };

  const getLabelFontSize = () => {
    const size = timer.blockSize || 'md';
    if (size === 'sm') return 'text-[8px] font-medium';
    if (size === 'md') return 'text-[10px] font-semibold';
    if (size === 'lg') return 'text-xs font-bold';
    if (size === 'xl') return 'text-sm font-extrabold';
    return 'text-base font-black'; // giant
  };

  // Convert timer name into readable format
  const formattedTitle = timer.title.trim() || 'Untitled Countdown';

  // Customizable visual cell block renderer
  const renderCounterBlock = (
    value: number,
    fallbackLabel: string,
    customLabel?: string,
    customColor?: string
  ) => {
    const displayLabel = customLabel || fallbackLabel;

    // Resolve color overlay
    let customBgClass = '';
    let blockStyleOverrideObj: React.CSSProperties = {};

    if (customColor?.trim()) {
      const trimmedColor = customColor.trim();
      if (trimmedColor.startsWith('#') || trimmedColor.startsWith('rgb') || trimmedColor.startsWith('hsl')) {
        blockStyleOverrideObj = { backgroundColor: trimmedColor };
      } else if (trimmedColor.startsWith('bg-')) {
        customBgClass = trimmedColor;
      } else {
        // Fallback for simple names like "red", "blue"
        blockStyleOverrideObj = { backgroundColor: trimmedColor };
      }
    }

    // Resolve card heights and paddings based on custom block size
    const sizePreset = timer.blockSize || 'md';
    let minHeightVal = '76px';
    let paddingVal = 'p-1.5';
    if (sizePreset === 'sm') {
      minHeightVal = '52px';
      paddingVal = 'p-1';
    } else if (sizePreset === 'md') {
      minHeightVal = '76px';
      paddingVal = 'p-1.5';
    } else if (sizePreset === 'lg') {
      minHeightVal = '102px';
      paddingVal = 'p-2.5';
    } else if (sizePreset === 'xl') {
      minHeightVal = '132px';
      paddingVal = 'p-4';
    } else if (sizePreset === 'giant') {
      minHeightVal = '170px';
      paddingVal = 'p-5';
    }

    return (
      <SplitFlapCell
        value={value}
        label={displayLabel}
        fontSizeClass={getTimerFontSize()}
        minHeightVal={minHeightVal}
        paddingVal={paddingVal}
        customColor={customColor}
        blockStyleOverrideObj={blockStyleOverrideObj}
        customBgClass={customBgClass}
        labelFontSizeClass={getLabelFontSize()}
        showLabel={true}
        themeStyle={timer.themeStyle}
      />
    );
  };

  return (
    <div
      ref={widgetRef}
      id={`widget-${timer.id}`}
      style={{
        width: `${timer.widgetSize.width}px`,
        height: `${timer.widgetSize.height}px`,
        left: `${timer.widgetPosition.x}px`,
        top: `${timer.widgetPosition.y}px`,
      }}
      className={`absolute select-none overflow-hidden rounded-xl group transition-all duration-300 flex flex-col ${
        timer.isWallpaper 
          ? 'z-0 border-dashed border-indigo-500/30 shadow-none hover:border-indigo-500/50' 
          : 'z-10 shadow-lg shadow-black/25'
      } ${themeClasses.bg} ${themeClasses.glow} ${themeClasses.accentGlow}`}
    >
      {/* Widget Header bar */}
      <div
        onMouseDown={timer.isWallpaper ? undefined : handleDragStart}
        className={`px-3 py-1.5 flex items-center justify-between ${
          timer.isWallpaper ? 'cursor-default' : 'cursor-move active:cursor-grabbing'
        } text-xs select-none font-medium ${themeClasses.header}`}
      >
        <div className="flex items-center gap-1.5 min-w-0 pr-2">
          {timer.isWallpaper ? (
            <Layers className="w-3.5 h-3.5 flex-shrink-0 text-indigo-400 opacity-90 animate-pulse" />
          ) : (
            <Move className={`w-3 h-3 flex-shrink-0 ${themeClasses.colorText} opacity-70`} />
          )}
          <span className="truncate font-sans font-semibold tracking-wide text-slate-200">
            {formattedTitle} {timer.isWallpaper && <span className="text-[9px] text-indigo-400 font-mono tracking-wider italic font-black ml-1">[WALLPAPER PIN]</span>}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Wallpaper Toggle Shortcut Icon */}
          <button
            id={`toggle-wallpaper-pin-${timer.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onUpdate(timer.id, { isWallpaper: !timer.isWallpaper });
            }}
            className={`p-1 rounded-md active:scale-95 transition-all flex items-center justify-center ${
              timer.isWallpaper
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                : 'hover:bg-white/10 text-slate-400 hover:text-slate-200'
            }`}
            title={timer.isWallpaper ? "Convert back to Floating Widget" : "Pin directly as Desktop Wallpaper"}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          {/* Quick config settings button */}
          <button
            id={`toggle-settings-${timer.id}`}
            onClick={() => setShowQuickSettings(!showQuickSettings)}
            className="p-1 rounded-md hover:bg-white/10 active:scale-95 transition-all text-slate-300"
            title="Widget Preferences"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
          
          {/* Close/Remove widget */}
          <button
            id={`close-widget-${timer.id}`}
            onClick={() => onUpdate(timer.id, { isWidget: false })}
            className="p-1 rounded-md hover:bg-rose-500/20 hover:text-rose-300 active:scale-95 transition-all text-slate-300"
            title="Hide Widget"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Widget Body Content */}
      <div className="p-3 flex-grow flex flex-col justify-center relative overflow-hidden">
        {showQuickSettings ? (
          /* QUICK PREFERENCES SCREEN (Within widget) */
          <div className="absolute inset-0 bg-slate-950/98 p-3 flex flex-col overflow-y-auto z-15 text-[11px] text-slate-300 scrollbar-thin">
            <div className="space-y-3 pb-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-1.5Packed">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  Widget Customizer
                </span>
                <button 
                  onClick={() => setShowQuickSettings(false)}
                  className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-600 text-[10px] text-slate-950 font-bold active:scale-95 transition-all"
                >
                  Save & Exit
                </button>
              </div>

              {/* RETRO FLIP & BLOCK LAYOUT CONTROLS */}
              <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800">
                <label className="text-[9px] text-slate-400 block mb-1 font-bold uppercase tracking-wider">Arrangement</label>
                <select
                  value={timer.blockLayout || 'row'}
                  onChange={(e) => onUpdate(timer.id, { blockLayout: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 py-1 px-1 rounded text-amber-200 text-[10px] font-medium"
                >
                  <option value="row">4-Column Row</option>
                  <option value="grid-2x2">Bento Grid 2x2</option>
                  <option value="compact-side-by-side">Compact Side-by-side</option>
                  <option value="stacked">Vertical Columns</option>
                </select>
              </div>

              {/* Widget Preset Size Controls */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block font-medium">Widget Preset Dimensions</label>
                <div className="grid grid-cols-4 gap-1">
                  {(['compact', 'standard', 'large', 'dashboard'] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => applyPresetSize(sz)}
                      className={`py-0.5 px-1 rounded truncate border ${
                        timer.widgetPresetSize === sz
                          ? 'border-indigo-500 bg-indigo-550/20 text-indigo-200'
                          : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider Size Controls */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-900">
                <div>
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-[10px] text-slate-400">Width</span>
                    <span className="text-slate-100 font-mono text-[9px]">{timer.widgetSize.width}px</span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="650"
                    value={timer.widgetSize.width}
                    onChange={(e) => onUpdate(timer.id, {
                      widgetSize: { ...timer.widgetSize, width: parseInt(e.target.value) },
                      widgetPresetSize: 'custom'
                    })}
                    className="w-full accent-indigo-500 h-1 rounded-lg bg-slate-800 cursor-ew-resize"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-[10px] text-slate-400">Height</span>
                    <span className="text-slate-100 font-mono text-[9px]">{timer.widgetSize.height}px</span>
                  </div>
                  <input
                    type="range"
                    min="120"
                    max="385"
                    value={timer.widgetSize.height}
                    onChange={(e) => onUpdate(timer.id, {
                      widgetSize: { ...timer.widgetSize, height: parseInt(e.target.value) },
                      widgetPresetSize: 'custom'
                    })}
                    className="w-full accent-indigo-500 h-1 rounded-lg bg-slate-800 cursor-ns-resize"
                  />
                </div>
              </div>

              {/* Other Options */}
              <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-900">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      id={`seconds-chk-${timer.id}`}
                      checked={timer.showSeconds}
                      onChange={(e) => onUpdate(timer.id, { showSeconds: e.target.checked })}
                      className="rounded accent-indigo-500 focus:ring-0 focus:ring-offset-0 w-3 h-3 bg-slate-800"
                    />
                    <label htmlFor={`seconds-chk-${timer.id}`} className="cursor-pointer select-none text-[10px] text-slate-300">
                      Show Seconds
                    </label>
                  </div>

                  <div className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      id={`wallpaper-chk-${timer.id}`}
                      checked={!!timer.isWallpaper}
                      onChange={(e) => onUpdate(timer.id, { isWallpaper: e.target.checked })}
                      className="rounded accent-indigo-500 focus:ring-0 focus:ring-offset-0 w-3 h-3 bg-slate-850"
                    />
                    <label htmlFor={`wallpaper-chk-${timer.id}`} className="cursor-pointer select-none text-[10px] font-semibold text-indigo-300 hover:text-indigo-200">
                      Set as Wallpaper
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-1 justify-end">
                  <span className="text-[10px] text-slate-400">Opacity:</span>
                  <input
                    type="range"
                    min="15"
                    max="100"
                    step="5"
                    value={timer.bgOpacity || 40}
                    onChange={(e) => onUpdate(timer.id, { bgOpacity: parseInt(e.target.value) })}
                    className="w-14 accent-indigo-500 h-1 rounded-lg bg-slate-800"
                  />
                  <span className="text-[9px] font-mono w-5 text-right">{timer.bgOpacity || 40}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1 pb-1">
                <div>
                  <label className="text-[9px] text-slate-400 block mb-0.5 font-medium">Card Finish</label>
                  <select
                    value={timer.themeStyle}
                    onChange={(e) => onUpdate(timer.id, { themeStyle: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-800 py-0.5 px-1 rounded text-slate-200 text-[10px]"
                  >
                    <option value="glass">Frosted Glass</option>
                    <option value="solid">High Contrast Solid</option>
                    <option value="neon-glow">Futuristic Border</option>
                    <option value="cyberpunk">Yellow Cyberpunk</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] text-slate-400 block mb-0.5 font-medium">Palette Preset</label>
                  <select
                    value={timer.colorPreset}
                    onChange={(e) => onUpdate(timer.id, { colorPreset: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-800 py-0.5 px-1 rounded text-slate-200 text-[10px]"
                  >
                    <option value="slate">Cool Slate</option>
                    <option value="violet">Deep Violet</option>
                    <option value="emerald">Chic Emerald</option>
                    <option value="amber">Warm Amber</option>
                    <option value="rose">Soft Rose</option>
                    <option value="ocean">Ocean Sky</option>
                    <option value="neon">Radioactive Neon</option>
                    <option value="color-shift">Infinite Color Shift ⚡</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {timeLeft.isOver ? (
          /* EVENT REACHED / END STATE */
          <div className="flex flex-col items-center justify-center text-center py-2 animate-pulse">
            <Sparkles className="w-7 h-7 text-yellow-400 mb-1" />
            <h3 className="font-bold tracking-tight text-white leading-tight">
              Event Reached!
            </h3>
            <p className="text-[11px] text-slate-300 mt-0.5 max-w-[85%] mx-auto font-sans">
              "{formattedTitle}" is live.
            </p>
          </div>
        ) : (
          /* COUNTDOWN TICKER */
          <div className="w-full flex-grow flex flex-col justify-center">
            {/* RENDER CELL CARDS BASED ON SELECTED LAYOUT CONFIGURATION */}
            <div className={`w-full items-center justify-center text-center ${
              timer.blockLayout === 'stacked'
                ? 'grid grid-cols-1 gap-1.5 overflow-y-auto max-h-[220px] py-1 scrollbar-thin'
                : timer.blockLayout === 'grid-2x2'
                  ? 'grid grid-cols-2 gap-2'
                  : 'flex flex-row flex-wrap items-center justify-center gap-1.5 sm:gap-2.5'
            }`}>
              {/* DAYS PILL */}
              <div className={timer.blockLayout === 'grid-2x2' || timer.blockLayout === 'stacked' ? 'w-full' : 'flex-1 min-w-[50px] max-w-[130px]'}>
                {renderCounterBlock(
                  timeLeft.days,
                  timeLeft.days === 1 ? 'Day' : 'Days',
                  timer.customDaysLabel,
                  timer.customDaysColor
                )}
              </div>

              {/* COLON BETWEEN DAYS AND HOURS */}
              {timer.blockLayout !== 'stacked' && timer.blockLayout !== 'grid-2x2' && (
                <div 
                  className="font-mono font-bold select-none px-1 animate-pulse text-xl sm:text-2xl md:text-3xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,1)]" 
                  style={{ alignSelf: 'center', textShadow: '0 0 12px rgba(255,255,255,1), 0 0 24px rgba(255,255,255,0.7)' }}
                >
                  :
                </div>
              )}

              {/* HOURS PILL */}
              <div className={timer.blockLayout === 'grid-2x2' || timer.blockLayout === 'stacked' ? 'w-full' : 'flex-1 min-w-[50px] max-w-[130px]'}>
                {renderCounterBlock(
                  timeLeft.hours,
                  'Hrs',
                  timer.customHoursLabel,
                  timer.customHoursColor
                )}
              </div>

              {/* COLON BETWEEN HOURS AND MINUTES */}
              {timer.blockLayout !== 'stacked' && timer.blockLayout !== 'grid-2x2' && (
                <div 
                  className="font-mono font-bold select-none px-1 animate-pulse text-xl sm:text-2xl md:text-3xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,1)]" 
                  style={{ alignSelf: 'center', textShadow: '0 0 12px rgba(255,255,255,1), 0 0 24px rgba(255,255,255,0.7)' }}
                >
                  :
                </div>
              )}

              {/* MINUTES PILL */}
              <div className={timer.blockLayout === 'grid-2x2' || timer.blockLayout === 'stacked' ? 'w-full' : 'flex-1 min-w-[50px] max-w-[130px]'}>
                {renderCounterBlock(
                  timeLeft.minutes,
                  'Min',
                  timer.customMinsLabel,
                  timer.customMinsColor
                )}
              </div>

              {/* COLON AND SECONDS PILL */}
              {(timer.showSeconds || timer.blockLayout === 'grid-2x2' || timer.blockLayout === 'stacked' || timer.blockLayout === 'compact-side-by-side') && (
                <>
                  {timer.blockLayout !== 'stacked' && timer.blockLayout !== 'grid-2x2' && (
                    <div 
                      className="font-mono font-bold select-none px-1 animate-pulse text-xl sm:text-2xl md:text-3xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,1)]" 
                      style={{ alignSelf: 'center', textShadow: '0 0 12px rgba(255,255,255,1), 0 0 24px rgba(255,255,255,0.7)' }}
                    >
                      :
                    </div>
                  )}
                  <div className={timer.blockLayout === 'grid-2x2' || timer.blockLayout === 'stacked' ? 'w-full' : 'flex-1 min-w-[50px] max-w-[130px]'}>
                    {renderCounterBlock(
                      timeLeft.seconds,
                      'Sec',
                      timer.customSecsLabel,
                      timer.customSecsColor
                    )}
                  </div>
                </>
              )}
            </div>
            
            {/* Minimal remaining status badge */}
            {timer.widgetSize.height >= 145 && (
              <div className="mt-2 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1 cursor-default">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Remaining until {new Date(timer.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Resize handle bottom-right corner - styled so user clearly sees it */}
      {!timer.isWallpaper && (
        <div
          onMouseDown={handleResizeStart}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-end justify-end p-0.5 z-20 group-hover:bg-slate-700/20 rounded-tl-lg"
          title="Drag corner to resize the widget"
        >
          <Maximize2 className="w-2.5 h-2.5 text-slate-400 hover:text-white transform rotate-45" />
        </div>
      )}
    </div>
  );
}
