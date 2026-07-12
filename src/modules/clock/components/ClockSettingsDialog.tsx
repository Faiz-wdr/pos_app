import { Sun, Moon, Monitor } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { Switch } from '@/components/ui/Switch'
import { useClockStore } from '../store/clockStore'
import { useThemeStore, ThemeMode } from '@/core/theme/themeStore'
import { STANDBY_THEME_COLORS } from './themes/MinimalClock'

interface ClockSettingsDialogProps {
  isOpen: boolean
  onClose: () => void
}

export const ClockSettingsDialog = ({ isOpen, onClose }: ClockSettingsDialogProps) => {
  const {
    theme: activeTheme,
    setTheme: setActiveTheme,
    themeColor,
    setThemeColor,
    use24Hour,
    setUse24Hour,
    dateFormat,
    setDateFormat,
    showSeconds,
    setShowSeconds,
    autoHideControls,
    setAutoHideControls,
    keepAwake,
    setKeepAwake
  } = useClockStore()

  const { theme, setTheme } = useThemeStore()

  const themeOptions: { mode: ThemeMode; label: string; icon: React.ComponentType<any> }[] = [
    { mode: 'light', label: 'Light', icon: Sun },
    { mode: 'dark', label: 'Dark', icon: Moon },
    { mode: 'system', label: 'System', icon: Monitor }
  ]

  const dateFormats: { value: typeof dateFormat; label: string }[] = [
    { value: 'long', label: 'Long Date (e.g. Thursday, July 9)' },
    { value: 'DD/MM/YYYY', label: 'Day/Month/Year (DD/MM/YYYY)' },
    { value: 'MM/DD/YYYY', label: 'Month/Day/Year (MM/DD/YYYY)' }
  ]

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Clock Preferences"
      description="Personalize your bedside desk clock display."
    >
      <div className="space-y-5 pt-2 pb-1 select-none text-left max-h-[70vh] overflow-y-auto pr-1">
        
        {/* Theme Settings */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Theme Mode</label>
          <div className="grid grid-cols-3 gap-2 bg-muted/65 p-1 rounded-xl border border-border/50">
            {themeOptions.map((opt) => {
              const isSelected = theme === opt.mode
              const Icon = opt.icon
              return (
                <button
                  key={opt.mode}
                  onClick={() => setTheme(opt.mode)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-accent text-accent-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground active:scale-[0.98]'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        <hr className="border-border/60" />

        {/* Display options */}
        <div className="space-y-3.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Display Options</label>

          {/* 24-Hour Time Switch */}
          {activeTheme.includes('digital') && (
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-0.5">
                <span className="text-sm font-semibold">24-Hour Time</span>
                <span className="text-xs text-muted-foreground">Use 24 hour digit readout</span>
              </div>
              <Switch checked={use24Hour} onCheckedChange={setUse24Hour} />
            </div>
          )}

          {/* Show Seconds Switch */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-0.5">
              <span className="text-sm font-semibold">Display Seconds</span>
              <span className="text-xs text-muted-foreground">Show ticking sweep hands/digits</span>
            </div>
            <Switch checked={showSeconds} onCheckedChange={setShowSeconds} />
          </div>
        </div>

        <hr className="border-border/60" />

        {/* Theme Picker Previews */}
        <div className="space-y-2.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Clock Design Theme</label>
          
          <div className="grid grid-cols-2 gap-2.5">
            {/* Modern Digital */}
            <button
              onClick={() => setActiveTheme('modern-digital')}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                activeTheme === 'modern-digital'
                  ? 'border-accent bg-accent/5'
                  : 'border-border bg-card/45 hover:border-muted-foreground/30'
              }`}
            >
              <div className="w-full h-14 flex items-center justify-center bg-stone-900/60 dark:bg-stone-800/40 rounded-xl mb-1.5">
                <span className="text-base font-bold text-accent drop-shadow-[0_0_3px_#f8b518]">10:09</span>
              </div>
              <span className="text-[10px] font-bold text-foreground uppercase tracking-wide">Modern Digital</span>
            </button>

            {/* StandBy Digital */}
            <button
              onClick={() => setActiveTheme('minimal-digital')}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                activeTheme === 'minimal-digital'
                  ? 'border-accent bg-accent/5'
                  : 'border-border bg-card/45 hover:border-muted-foreground/30'
              }`}
            >
              <div className="w-full h-14 flex items-center justify-center bg-black rounded-xl mb-1.5 relative overflow-hidden px-1">
                <style dangerouslySetInnerHTML={{__html: `
                  @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@800;900&display=swap');
                  .standby-preview-font {
                    font-family: 'Fredoka', sans-serif;
                    font-weight: 900;
                    letter-spacing: -0.05em;
                  }
                `}} />
                
                {/* Hours overlapping preview */}
                <div className="flex items-center relative">
                  <span 
                    className="standby-preview-font text-[21px] leading-none inline-block"
                    style={{ 
                      color: (STANDBY_THEME_COLORS[themeColor as keyof typeof STANDBY_THEME_COLORS] || STANDBY_THEME_COLORS.coral).dark,
                      transform: 'rotate(-3deg)'
                    }}
                  >
                    1
                  </span>
                  <span 
                    className="standby-preview-font text-[21px] leading-none -ml-[0.24em] z-10 opacity-92 mix-blend-screen inline-block"
                    style={{ 
                      color: (STANDBY_THEME_COLORS[themeColor as keyof typeof STANDBY_THEME_COLORS] || STANDBY_THEME_COLORS.coral).light,
                      transform: 'rotate(3deg)'
                    }}
                  >
                    0
                  </span>
                </div>

                <span className="text-white/60 mx-0.5 text-xs font-bold scale-95">:</span>

                {/* Minutes overlapping preview */}
                <div className="flex items-center relative">
                  <span 
                    className="standby-preview-font text-[21px] leading-none inline-block"
                    style={{ 
                      color: (STANDBY_THEME_COLORS[themeColor as keyof typeof STANDBY_THEME_COLORS] || STANDBY_THEME_COLORS.coral).dark,
                      transform: 'rotate(-3deg)'
                    }}
                  >
                    0
                  </span>
                  <span 
                    className="standby-preview-font text-[21px] leading-none -ml-[0.24em] z-10 opacity-92 mix-blend-screen inline-block"
                    style={{ 
                      color: (STANDBY_THEME_COLORS[themeColor as keyof typeof STANDBY_THEME_COLORS] || STANDBY_THEME_COLORS.coral).light,
                      transform: 'rotate(3deg)'
                    }}
                  >
                    9
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-foreground uppercase tracking-wide">StandBy Digital</span>
            </button>

            {/* Classic Analog */}
            <button
              onClick={() => setActiveTheme('classic-analog')}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                activeTheme === 'classic-analog'
                  ? 'border-accent bg-accent/5'
                  : 'border-border bg-card/45 hover:border-muted-foreground/30'
              }`}
            >
              <div className="w-full h-14 flex items-center justify-center bg-stone-900/60 dark:bg-stone-800/40 rounded-xl mb-1.5">
                <div className="w-10 h-10 rounded-full border border-accent/20 bg-accent/5 flex items-center justify-center relative">
                  <div className="w-0.5 h-3.5 bg-accent absolute top-1.5 rounded-full origin-bottom" style={{ transform: 'rotate(60deg)' }} />
                  <div className="w-0.5 h-4.5 bg-foreground absolute top-0.5 rounded-full origin-bottom" style={{ transform: 'rotate(180deg)' }} />
                  <span className="absolute text-[6px] font-bold text-foreground top-0.5">12</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-foreground uppercase tracking-wide">Classic Analog</span>
            </button>

            {/* Calendar Analog */}
            <button
              onClick={() => setActiveTheme('calendar-analog')}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                activeTheme === 'calendar-analog'
                  ? 'border-accent bg-accent/5'
                  : 'border-border bg-card/45 hover:border-muted-foreground/30'
              }`}
            >
              <div className="w-full h-14 flex items-center justify-around bg-black rounded-xl mb-1.5 px-2">
                {/* Mini Dial */}
                <div className="w-7 h-7 rounded-full border border-neutral-700/60 flex items-center justify-center relative scale-90">
                  <div className="w-0.5 h-2 bg-white absolute top-1 origin-bottom" style={{ transform: 'rotate(45deg)' }} />
                  <div className="w-0.5 h-2.5 bg-white absolute top-0.5 origin-bottom" style={{ transform: 'rotate(130deg)' }} />
                  <div className="w-1 h-1 rounded-full bg-[#ff453a] absolute" />
                </div>
                {/* Mini Calendar Grid */}
                <div className="flex flex-col space-y-0.5 scale-90">
                  <span className="text-[6px] font-bold text-[#ff453a] scale-90">OCT</span>
                  <div className="grid grid-cols-4 gap-0.5 text-[5px] text-white/50 leading-none">
                    <span>1</span><span>2</span><span>3</span><span className="text-[#ff453a] font-bold">4</span>
                    <span>5</span><span>6</span><span>7</span><span>8</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-foreground uppercase tracking-wide">Calendar Analog</span>
            </button>
          </div>
        </div>

        {/* Theme Color Picker (Only for StandBy Digital theme) */}
        {activeTheme === 'minimal-digital' && (
          <>
            <hr className="border-border/60" />
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">StandBy Digit Color</label>
              <div className="flex flex-wrap gap-2.5 bg-muted/40 p-2.5 rounded-xl border border-border/40">
                {Object.entries(STANDBY_THEME_COLORS).map(([key, col]) => {
                  const isSelected = themeColor === key
                  return (
                    <button
                      key={key}
                      onClick={() => setThemeColor(key)}
                      className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                        isSelected 
                          ? 'border-white scale-110 shadow-md ring-2 ring-accent/30' 
                          : 'border-transparent opacity-80'
                      }`}
                      style={{ backgroundColor: col.dark }}
                      title={key.charAt(0).toUpperCase() + key.slice(1)}
                      aria-label={`Select ${key} color`}
                    />
                  )
                })}
              </div>
            </div>
          </>
        )}

        <hr className="border-border/60" />

        {/* Date format */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Date Format</label>
          <div className="flex flex-col space-y-2">
            {dateFormats.map((f) => (
              <button
                key={f.value}
                onClick={() => setDateFormat(f.value)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  dateFormat === f.value 
                    ? 'border-accent bg-accent/5 text-foreground' 
                    : 'border-border bg-card/45 text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{f.label}</span>
                {dateFormat === f.value && (
                  <span className="w-2 h-2 rounded-full bg-accent" />
                )}
              </button>
            ))}
          </div>
        </div>

        <hr className="border-border/60" />

        {/* Keep screen awake / controls */}
        <div className="space-y-3.5 text-left">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Controls & Wake Lock</label>

          {/* Wake lock toggle */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-0.5">
              <span className="text-sm font-semibold">Keep Screen Awake</span>
              <span className="text-xs text-muted-foreground">Prevent device sleep inside clock</span>
            </div>
            <Switch checked={keepAwake} onCheckedChange={setKeepAwake} />
          </div>

          {/* Auto hide controls */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-0.5">
              <span className="text-sm font-semibold">Auto Hide Controls</span>
              <span className="text-xs text-muted-foreground">Fade out toggles after 5 seconds</span>
            </div>
            <Switch checked={autoHideControls} onCheckedChange={setAutoHideControls} />
          </div>
        </div>

      </div>
    </Dialog>
  )
}
export default ClockSettingsDialog
