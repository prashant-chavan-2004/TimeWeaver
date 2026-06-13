import React, { useState } from 'react';
import { CountdownTimer } from '../types';
import { 
  Plus, 
  Calendar, 
  Clock, 
  Trash2, 
  Eye, 
  EyeOff, 
  Sparkles, 
  HelpCircle,
  Video,
  Monitor,
  CheckCircle,
  Layout,
  Sliders,
  BellRing,
  Layers
} from 'lucide-react';

interface ControlPanelProps {
  timers: CountdownTimer[];
  onCreateTimer: (timer: Omit<CountdownTimer, 'id'>) => void;
  onDeleteTimer: (id: string) => void;
  onUpdateTimer: (id: string, updates: Partial<CountdownTimer>) => void;
  onOpenPreset: (presetType: string) => void;
  isAmbientWallpaperMode?: boolean;
  onToggleAmbientWallpaperMode?: () => void;
}

export default function ControlPanel({ 
  timers, 
  onCreateTimer, 
  onDeleteTimer, 
  onUpdateTimer,
  onOpenPreset,
  isAmbientWallpaperMode = false,
  onToggleAmbientWallpaperMode
}: ControlPanelProps) {
  // Form states
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('12:00');
  const [colorPreset, setColorPreset] = useState<CountdownTimer['colorPreset']>('violet');
  const [themeStyle, setThemeStyle] = useState<CountdownTimer['themeStyle']>('glass');
  const [widgetPresetSize, setWidgetPresetSize] = useState<CountdownTimer['widgetPresetSize']>('standard');
  const [showSeconds, setShowSeconds] = useState(true);
  const [bgOpacity, setBgOpacity] = useState(45);
  
  const [errorMessage, setErrorMessage] = useState('');
  const [successMemo, setSuccessMemo] = useState('');

  // Built-in presets for quick creation
  const handleQuickPreset = (type: 'hour' | 'tomorrow' | 'weekend' | 'new-year') => {
    const now = new Date();
    let target = new Date();
    let name = '';
    let color: CountdownTimer['colorPreset'] = 'violet';

    switch (type) {
      case 'hour':
        target.setHours(now.getHours() + 1);
        name = 'Next Hour Sprint';
        color = 'emerald';
        break;
      case 'tomorrow':
        target.setDate(now.getDate() + 1);
        target.setHours(9, 0, 0, 0); // 9:00 AM Tomorrow
        name = 'Tomorrow Morning Goal';
        color = 'ocean';
        break;
      case 'weekend':
        // Calculate days to Friday 5 PM
        const currentDay = now.getDay();
        const daysToFriday = (5 - currentDay + 7) % 7;
        target.setDate(now.getDate() + (daysToFriday === 0 ? 7 : daysToFriday));
        target.setHours(17, 0, 0, 0);
        name = 'Weekend Launch';
        color = 'amber';
        break;
      case 'new-year':
        const nextYear = now.getFullYear() + 1;
        target = new Date(nextYear, 0, 1, 0, 0, 0);
        name = `New Year ${nextYear}`;
        color = 'rose';
        break;
    }

    // Convert to ISO-like YYYY-MM-DD and HH:mm
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = target.getFullYear();
    const mm = pad(target.getMonth() + 1);
    const dd = pad(target.getDate());
    const hh = pad(target.getHours());
    const min = pad(target.getMinutes());

    setTitle(name);
    setDate(`${yyyy}-${mm}-${dd}`);
    setTime(`${hh}:${min}`);
    setColorPreset(color);
    setErrorMessage('');
    
    setSuccessMemo(`Loaded "${name}" preset! Click "+ Add Countdown" to save.`);
    setTimeout(() => setSuccessMemo(''), 4500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!title.trim()) {
      setErrorMessage('Please provide an event or task name.');
      return;
    }
    if (!date) {
      setErrorMessage('Please pick a target event date.');
      return;
    }

    // Validate date format is proper and build composite date string
    const targetDateTimeStr = `${date}T${time || '12:00'}:00`;
    const targetDateObj = new Date(targetDateTimeStr);

    if (isNaN(targetDateObj.getTime())) {
      setErrorMessage('Invalid date or time selected.');
      return;
    }

    const difference = +targetDateObj - +new Date();
    if (difference <= 0) {
      setErrorMessage('Warning/Note: You picked a date in the past! It will display as "Event Reached". Please select a future date to watch it tick down.');
      return;
    }

    // Determine initial dimensions based on size presets
    let initialWidth = 300;
    let initialHeight = 160;

    switch (widgetPresetSize) {
      case 'compact': initialWidth = 240; initialHeight = 110; break;
      case 'standard': initialWidth = 300; initialHeight = 160; break;
      case 'large': initialWidth = 380; initialHeight = 200; break;
      case 'dashboard': initialWidth = 500; initialHeight = 180; break;
    }

    // Randomize initial position slightly so widgets don't layer precisely
    const randomOffset = 40 + Math.random() * 80;

    onCreateTimer({
      title: title.trim(),
      targetDate: targetDateTimeStr,
      colorPreset,
      isWidget: true, // create directly as desktop widget of this screen
      widgetPresetSize,
      widgetSize: {
        width: initialWidth,
        height: initialHeight
      },
      widgetPosition: {
        x: randomOffset,
        y: randomOffset + 120
      },
      showSeconds,
      themeStyle,
      bgOpacity,
      fontSize: 'base'
    });

    // Reset Form
    setTitle('');
    setDate('');
    setTime('12:00');
    setErrorMessage('');
    setSuccessMemo('Countdown created and widget added to the workspace.');
    setTimeout(() => setSuccessMemo(''), 3500);
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-lg border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col w-full h-full text-slate-200">
      {/* Window Header */}
      <div className="bg-slate-950/80 px-5 py-3.5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2 font-sans">
            <Monitor className="w-4 h-4 text-indigo-400" />
            Countdown System Control Panel
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Active Engines</span>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-5 space-y-6 style-scrollbar">
        {/* Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Creating Section */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 bg-slate-950/40 p-4 border border-slate-800/70 rounded-xl space-y-4">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-900 pb-2">
              <Plus className="w-4 h-4" /> Add Date & Time Event
            </h3>

            {/* Event Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">Event / Task Title</label>
              <input
                id="event-title-input"
                type="text"
                placeholder="e.g. New Project Release, Christmas Party"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/50 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Date & Time Pickers */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Pick Date
                </label>
                <input
                  id="event-date-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700/50 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors text-center"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" /> Select Time
                </label>
                <input
                  id="event-time-input"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700/50 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors text-center"
                />
              </div>
            </div>

            {/* Palette & Aesthetics */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-semibold text-slate-300 block">Color & Styling Theme</label>
              
              <div className="grid grid-cols-7 gap-1.5">
                {[
                  { name: 'violet', bg: 'bg-violet-600', label: 'Violet' },
                  { name: 'emerald', bg: 'bg-emerald-600', label: 'Emerald' },
                  { name: 'amber', bg: 'bg-amber-600', label: 'Amber' },
                  { name: 'rose', bg: 'bg-rose-600', label: 'Rose' },
                  { name: 'ocean', bg: 'bg-sky-600', label: 'Ocean' },
                  { name: 'slate', bg: 'bg-slate-600', label: 'Slate' },
                  { name: 'color-shift', bg: 'bg-gradient-to-tr from-indigo-550 via-purple-550 to-pink-550 animate-gradient-infinite animate-infinite-background', label: 'Infinite Color Shift ⚡' },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    title={preset.label}
                    onClick={() => setColorPreset(preset.name as any)}
                    className={`w-full h-7 rounded-md transition-all flex items-center justify-center border-2 ${preset.bg} ${
                      colorPreset === preset.name 
                        ? 'border-white scale-110 shadow-lg' 
                        : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                  >
                    {colorPreset === preset.name && (
                      <span className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Widget Initial size settings */}
            <div className="space-y-3 pt-2 border-t border-slate-900">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">Default Widget Footprint size</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['compact', 'standard', 'large', 'dashboard'] as const).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setWidgetPresetSize(preset)}
                      className={`py-1 px-1.5 rounded text-[10px] truncate capitalize border transition-all ${
                        widgetPresetSize === preset
                          ? 'border-indigo-500 bg-indigo-550/20 text-indigo-200 font-bold'
                          : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400">
                  {widgetPresetSize === 'compact' && 'Compact (240x110px) - Great for tight desk spaces'}
                  {widgetPresetSize === 'standard' && 'Standard (300x160px) - Perfect balance of typography'}
                  {widgetPresetSize === 'large' && 'Large (380x200px) - Highly legible display numbers'}
                  {widgetPresetSize === 'dashboard' && 'Wide (500x180px) - Displays countdown beautifully in a row'}
                </p>
              </div>

              {/* Advanced widget visual parameters */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    id="frm-seconds-toggle"
                    checked={showSeconds}
                    onChange={(e) => setShowSeconds(e.target.checked)}
                    className="rounded accent-indigo-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 bg-slate-800 text-indigo-600"
                  />
                  <label htmlFor="frm-seconds-toggle" className="cursor-pointer select-none text-xs text-slate-300">
                    Always Show Seconds
                  </label>
                </div>

                <div className="flex items-center gap-1 justify-end">
                  <span className="text-xs text-slate-400">Card Opacity:</span>
                  <input
                    type="range"
                    min="15"
                    max="100"
                    step="5"
                    value={bgOpacity}
                    onChange={(e) => setBgOpacity(parseInt(e.target.value))}
                    className="w-14 accent-indigo-500 h-1 rounded-lg bg-slate-800 cursor-pointer"
                  />
                  <span className="text-xs font-mono w-6 text-right text-slate-100">{bgOpacity}%</span>
                </div>
              </div>
            </div>

            {/* Output statuses */}
            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-medium">
                {errorMessage}
              </div>
            )}

            {successMemo && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/20 text-emerald-300 rounded-lg text-xs font-medium">
                {successMemo}
              </div>
            )}

            <button
              id="submit-create-timer"
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg py-2 px-4 text-xs font-bold hover:shadow-lg hover:shadow-indigo-500/10 transition-all flex items-center justify-center gap-2 select-none group"
            >
              <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Deploy Timer Widget</span>
            </button>
          </form>

          {/* Quick presets & Live lists */}
          <div className="lg:col-span-3 flex flex-col justify-between space-y-4">
            {/* Presets Tray */}
            <div className="bg-slate-950/40 p-4 border border-slate-800/70 rounded-xl space-y-2.5">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Instant Demo Templates
              </h3>
              <p className="text-[11px] text-slate-400">
                Click a preset below to instantly populate target parameters, or click "+ Add Countdown" to publish standard widgets immediately.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickPreset('hour')}
                  className="bg-slate-900 border border-emerald-500/20 hover:border-emerald-500/50 p-2 text-left rounded-lg transition-all text-slate-300 hover:text-emerald-300 text-xs flex flex-col justify-between h-14 hover:bg-slate-850"
                >
                  <span className="font-semibold block truncate">1 Hour Sprint</span>
                  <span className="text-[10px] text-slate-500 block">Focus/Pomodoro</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('tomorrow')}
                  className="bg-slate-900 border border-sky-500/20 hover:border-sky-500/50 p-2 text-left rounded-lg transition-all text-slate-300 hover:text-sky-300 text-xs flex flex-col justify-between h-14 hover:bg-slate-850"
                >
                  <span className="font-semibold block truncate">Tomorrow Morning</span>
                  <span className="text-[10px] text-slate-500 block">Daily task track</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('weekend')}
                  className="bg-slate-900 border border-amber-500/20 hover:border-amber-500/50 p-2 text-left rounded-lg transition-all text-slate-300 hover:text-amber-300 text-xs flex flex-col justify-between h-14 hover:bg-slate-850"
                >
                  <span className="font-semibold block truncate">The Weekend</span>
                  <span className="text-[10px] text-slate-500 block">Friday 5:00 PM</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('new-year')}
                  className="bg-slate-900 border border-rose-500/20 hover:border-rose-500/50 p-2 text-left rounded-lg transition-all text-slate-300 hover:text-rose-300 text-xs flex flex-col justify-between h-14 hover:bg-slate-850"
                >
                  <span className="font-semibold block truncate">New Year's Eve</span>
                  <span className="text-[10px] text-slate-500 block">Global Event</span>
                </button>
              </div>
            </div>

            {/* PC Live Wallpaper Setup Card */}
            <div className="bg-slate-950/45 p-3.5 border border-indigo-500/30 rounded-xl space-y-2.5 shadow-[0_0_15px_rgba(99,102,241,0.1)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-1.5">
                  <Monitor className="w-4 h-4 text-indigo-450" /> Live PC Wallpaper Setup
                </h3>
                <span className="text-[9px] bg-indigo-900/40 text-indigo-200 border border-indigo-700/30 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                  Interactive Background
                </span>
              </div>
              <p className="text-[10px] text-slate-300 leading-relaxed">
                Run this live countdown desk directly as your real computer desktop background wallpaper using free companion tools!
              </p>
              
              <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800 space-y-1.5 text-[10px] text-slate-400">
                <div className="flex items-start gap-1">
                  <span className="text-indigo-400 font-bold">1.</span>
                  <span><strong>Windows PC:</strong> Install free open-source <a href="https://rocksdanister.github.io/lively/" target="_blank" rel="noreferrer" className="text-indigo-300 hover:underline font-semibold">Lively Wallpaper</a> or <strong>Wallpaper Engine</strong> via Steam.</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="text-indigo-400 font-bold">2.</span>
                  <span><strong>macOS:</strong> Download free <a href="https://plash.app" target="_blank" rel="noreferrer" className="text-indigo-300 hover:underline font-semibold">Plash</a> to pin web pages directly as your active wallpaper background.</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="text-indigo-400 font-bold">3.</span>
                  <span>Pin your countdown cards exactly where you want them, click the button below to hide Web Controls, and enjoy!</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setSuccessMemo('Live Countdown URL copied to clipboard! Add it directly in Lively, Plash or Wallpaper Engine.');
                    setTimeout(() => setSuccessMemo(''), 5000);
                  }}
                  className="flex-1 bg-slate-900 hover:bg-slate-850 border border-indigo-500/35 hover:border-indigo-400 text-indigo-200 rounded py-1.5 px-3 text-[10px] font-bold transition-all text-center select-none"
                >
                  📋 Copy Countdown URL
                </button>
                
                {onToggleAmbientWallpaperMode && (
                  <button
                    type="button"
                    onClick={onToggleAmbientWallpaperMode}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded py-1.5 px-3 text-[10px] font-bold transition-all text-center select-none shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                  >
                    🖥️ Hide UI / Live Wallpaper Mode
                  </button>
                )}
              </div>
            </div>

            {/* Timers Active Inventory Table */}
            <div className="bg-slate-950/40 p-4 border border-slate-800/70 rounded-xl flex-grow flex flex-col">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-2 mb-2">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Layout className="w-4 h-4" /> Registered Countdown Timeline
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-850 text-slate-400 border border-slate-800 font-mono">
                  Total Timers: {timers.length}
                </span>
              </div>

              {timers.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center py-6 text-slate-500">
                  <BellRing className="w-8 h-8 opacity-40 mb-2 text-slate-400" />
                  <p className="text-xs font-medium">No countdowns deployed yet.</p>
                  <p className="text-[10px] text-slate-500 px-4 mt-1">
                    Fill the form on the left or load a preset, then deploy to see floating widgets instantly!
                  </p>
                </div>
              ) : (
                <div className="flex-grow overflow-y-auto max-h-[190px] style-scrollbar space-y-2">
                  {timers.map((timer) => {
                    const diff = +new Date(timer.targetDate) - +new Date();
                    const isOver = diff <= 0;
                    
                    return (
                      <div
                        key={timer.id}
                        id={`timer-row-${timer.id}`}
                        className="bg-slate-900/60 border border-slate-800 hover:border-slate-700/65 rounded-lg p-2.5 flex items-center justify-between gap-4 transition-all"
                      >
                        <div className="min-w-0 flex-grow">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${
                              timer.colorPreset === 'slate' ? 'bg-slate-400' :
                              timer.colorPreset === 'violet' ? 'bg-violet-400' :
                              timer.colorPreset === 'emerald' ? 'bg-emerald-400' :
                              timer.colorPreset === 'amber' ? 'bg-amber-400' :
                              timer.colorPreset === 'rose' ? 'bg-rose-400' :
                              'bg-sky-400'
                            }`} />
                            <h4 className="text-xs font-bold text-white truncate max-w-[160px] font-sans">
                              {timer.title}
                            </h4>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                              timer.widgetPresetSize === 'compact' ? 'bg-slate-800 text-slate-300' :
                              timer.widgetPresetSize === 'standard' ? 'bg-emerald-900/40 text-emerald-300' :
                              timer.widgetPresetSize === 'large' ? 'bg-amber-900/40 text-amber-300' :
                              'bg-fuchsia-900/30 text-fuchsia-300'
                            }`}>
                              {timer.widgetPresetSize}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">
                              {new Date(timer.targetDate).toLocaleString(undefined, { 
                                month: 'short', 
                                day: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                            {isOver && (
                              <span className="text-rose-400 font-bold ml-1 flex items-center gap-0.5">
                                [Ended]
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Widget management buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Wallpaper Pin status */}
                          {timer.isWidget && (
                            <button
                              id={`toggle-timer-wallpaper-${timer.id}`}
                              onClick={() => onUpdateTimer(timer.id, { isWallpaper: !timer.isWallpaper })}
                              className={`p-1.5 rounded-lg border transition-all ${
                                timer.isWallpaper
                                  ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20'
                                  : 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-300'
                              }`}
                              title={timer.isWallpaper ? 'Make Floating (Draggable)' : 'Set as Background Wallpaper (Pinned)'}
                            >
                              <div className="flex items-center gap-1 text-[10px] px-0.5">
                                <Layers className="w-3.5 h-3.5" />
                                <span>{timer.isWallpaper ? 'Wallpaper' : 'Floating'}</span>
                              </div>
                            </button>
                          )}

                          {/* Visibility status */}
                          <button
                            id={`toggle-widget-visibility-${timer.id}`}
                            onClick={() => onUpdateTimer(timer.id, { isWidget: !timer.isWidget })}
                            className={`p-1.5 rounded-lg border transition-all ${
                              timer.isWidget
                                ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20'
                                : 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-300'
                            }`}
                            title={timer.isWidget ? 'Hide Desktop Widget' : 'Show Desktop Widget'}
                          >
                            {timer.isWidget ? (
                              <div className="flex items-center gap-1 text-[10px] px-0.5">
                                <Eye className="w-3.5 h-3.5" />
                                <span>Visible</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-[10px] px-0.5">
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>Hidden</span>
                              </div>
                            )}
                          </button>

                          {/* Delete */}
                          <button
                            id={`delete-timer-${timer.id}`}
                            onClick={() => onDeleteTimer(timer.id)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/20 transition-all active:scale-95"
                            title="Delete Countdown"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
