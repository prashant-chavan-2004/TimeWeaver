export interface CountdownTimer {
  id: string;
  title: string;
  targetDate: string; // ISO String (e.g. 2026-12-31T23:59:00)
  colorPreset: 'slate' | 'violet' | 'emerald' | 'amber' | 'rose' | 'ocean' | 'neon' | 'color-shift';
  isWidget: boolean; // Is it shown as a floating widget on the desktop?
  widgetSize: {
    width: number; // in pixels
    height: number; // in pixels
  };
  widgetPosition: {
    x: number;
    y: number;
  };
  widgetPresetSize: 'compact' | 'standard' | 'large' | 'dashboard' | 'custom';
  showSeconds: boolean;
  themeStyle: 'glass' | 'solid' | 'neon-glow' | 'cyberpunk';
  bgOpacity: number; // range 10-100
  fontSize: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  isWallpaper?: boolean; // Pinned directly as a desktop wallpaper background element
  blockLayout?: 'row' | 'grid-2x2' | 'compact-side-by-side' | 'stacked';
  customDaysColor?: string;
  customHoursColor?: string;
  customMinsColor?: string;
  customSecsColor?: string;
  customDaysLabel?: string;
  customHoursLabel?: string;
  customMinsLabel?: string;
  customSecsLabel?: string;
  blockSize?: 'sm' | 'md' | 'lg' | 'xl' | 'giant'; // Custom individual block sizing
}

export type WallpaperPreset = 'aurora' | 'cyber' | 'obsidian' | 'soft-gradient' | 'minimalist' | 'color-shift';
