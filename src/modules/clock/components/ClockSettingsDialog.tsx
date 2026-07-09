import React from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { Switch } from '@/components/ui/Switch'
import { useClockStore } from '../store/clockStore'
import { useThemeStore, ThemeMode } from '@/core/theme/themeStore'
import { ViewMode } from '../types'

interface ClockSettingsDialogProps {
  isOpen: boolean
  onClose: () => void
}

export const ClockSettingsDialog = ({ isOpen, onClose }: ClockSettingsDialogProps) => {
  const {
    clockType,
    setClockType,
    use24Hour,
    setUse24Hour,
    dateFormat,
    setDateFormat,
    showSeconds,
    setShowSeconds,
    autoHideControls,
    setAutoHideControls,
    keepAwake,
    setKeepAwake,
    digitalTheme,
    setDigitalTheme,
    analogTheme,
    setAnalogTheme,
    viewMode,
    setViewMode
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

        {/* View Mode Settings */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">View Mode</label>
          <div className="grid grid-cols-3 gap-2 bg-muted/65 p-1 rounded-xl border border-border/50">
            {[
              { value: 'portrait', label: 'Portrait' },
              { value: 'landscape', label: 'Desk Mode' },
              { value: 'auto', label: 'Auto Rotate' }
            ].map((opt) => {
              const isSelected = viewMode === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setViewMode(opt.value as ViewMode)}
                  className={`py-2.5 px-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-accent text-accent-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground active:scale-[0.98]'
                  }`}
                >
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
          
          {/* Clock Style */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-0.5">
              <span className="text-sm font-semibold">Clock Face</span>
              <span className="text-xs text-muted-foreground">Select rendering layout</span>
            </div>
            <div className="flex bg-muted p-0.5 rounded-lg border border-border/60">
              <button
                onClick={() => setClockType('digital')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  clockType === 'digital' 
                    ? 'bg-background text-foreground shadow-xs' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Digital
              </button>
              <button
                onClick={() => setClockType('analog')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  clockType === 'analog' 
                    ? 'bg-background text-foreground shadow-xs' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Analog
              </button>
            </div>
          </div>

          {/* 24-Hour Switch */}
          {clockType === 'digital' && (
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
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Clock Design Theme</label>
          
          {clockType === 'digital' ? (
            <div className="grid grid-cols-2 gap-2">
              {/* Classic Digital */}
              <button
                onClick={() => setDigitalTheme('classic')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                  digitalTheme === 'classic'
                    ? 'border-accent bg-accent/5'
                    : 'border-border bg-card/45 hover:border-muted-foreground/30'
                }`}
              >
                <div className="w-full h-12 flex items-center justify-center bg-stone-900/60 dark:bg-stone-800/40 rounded-xl mb-1.5">
                  <span className="text-base font-black text-foreground">10:09</span>
                </div>
                <span className="text-[10px] font-black text-foreground uppercase tracking-wide">Classic</span>
              </button>

              {/* Modern Digital */}
              <button
                onClick={() => setDigitalTheme('modern')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                  digitalTheme === 'modern'
                    ? 'border-accent bg-accent/5'
                    : 'border-border bg-card/45 hover:border-muted-foreground/30'
                }`}
              >
                <div className="w-full h-12 flex items-center justify-center bg-stone-900/60 dark:bg-stone-800/40 rounded-xl mb-1.5">
                  <span className="text-base font-black text-accent drop-shadow-[0_0_3px_#f8b518]">10:09</span>
                </div>
                <span className="text-[10px] font-black text-foreground uppercase tracking-wide">Modern</span>
              </button>

              {/* LED Digital */}
              <button
                onClick={() => setDigitalTheme('led')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                  digitalTheme === 'led'
                    ? 'border-accent bg-accent/5'
                    : 'border-border bg-card/45 hover:border-muted-foreground/30'
                }`}
              >
                <div className="w-full h-12 flex items-center justify-center bg-black rounded-xl mb-1.5">
                  <span className="text-sm font-mono font-black text-accent tracking-wider italic">10:09</span>
                </div>
                <span className="text-[10px] font-black text-foreground uppercase tracking-wide">LED Display</span>
              </button>

              {/* Dashboard Digital */}
              <button
                onClick={() => setDigitalTheme('dashboard')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                  digitalTheme === 'dashboard'
                    ? 'border-accent bg-accent/5'
                    : 'border-border bg-card/45 hover:border-muted-foreground/30'
                }`}
              >
                <div className="w-full h-12 flex items-center justify-center bg-stone-900/60 dark:bg-stone-800/40 rounded-xl mb-1.5 space-x-1">
                  <span className="text-sm font-black text-foreground">10:09</span>
                  <span className="text-[9px] font-black text-accent">:32</span>
                </div>
                <span className="text-[10px] font-black text-foreground uppercase tracking-wide">Dashboard</span>
              </button>

              {/* Minimal Digital */}
              <button
                onClick={() => setDigitalTheme('minimal')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 cursor-pointer transition-all col-span-2 ${
                  digitalTheme === 'minimal'
                    ? 'border-accent bg-accent/5'
                    : 'border-border bg-card/45 hover:border-muted-foreground/30'
                }`}
              >
                <div className="w-full h-12 flex items-center justify-center bg-stone-900/60 dark:bg-stone-800/40 rounded-xl mb-1.5">
                  <span className="text-2xl font-black tracking-tighter leading-none text-foreground">10:09</span>
                </div>
                <span className="text-[10px] font-black text-foreground uppercase tracking-wide">Ultra Minimal</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {/* Minimal Analog */}
              <button
                onClick={() => setAnalogTheme('minimal')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                  analogTheme === 'minimal'
                    ? 'border-accent bg-accent/5'
                    : 'border-border bg-card/45 hover:border-muted-foreground/30'
                }`}
              >
                <div className="w-full h-14 flex items-center justify-center bg-stone-900/60 dark:bg-stone-800/40 rounded-xl mb-1.5">
                  <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center relative">
                    <div className="w-0.5 h-3 bg-foreground absolute top-2 rounded-full origin-bottom" style={{ transform: 'rotate(45deg)' }} />
                    <div className="w-0.5 h-4 bg-foreground absolute top-1 rounded-full origin-bottom" style={{ transform: 'rotate(120deg)' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-accent absolute" />
                  </div>
                </div>
                <span className="text-[10px] font-black text-foreground uppercase tracking-wide">Minimal</span>
              </button>

              {/* Swiss Analog */}
              <button
                onClick={() => setAnalogTheme('swiss')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                  analogTheme === 'swiss'
                    ? 'border-accent bg-accent/5'
                    : 'border-border bg-card/45 hover:border-muted-foreground/30'
                }`}
              >
                <div className="w-full h-14 flex items-center justify-center bg-white rounded-xl mb-1.5">
                  <div className="w-10 h-10 rounded-full border-2 border-neutral-900 flex items-center justify-center relative">
                    <div className="w-0.5 h-3 bg-neutral-900 absolute top-2 origin-bottom" style={{ transform: 'rotate(30deg)' }} />
                    <div className="w-0.5 h-4 bg-neutral-900 absolute top-1 origin-bottom" style={{ transform: 'rotate(150deg)' }} />
                    <div className="w-0.5 h-4 bg-red-600 absolute top-1 origin-bottom" style={{ transform: 'rotate(270deg)' }} />
                  </div>
                </div>
                <span className="text-[10px] font-black text-foreground uppercase tracking-wide">Swiss Railway</span>
              </button>

              {/* Modern Analog */}
              <button
                onClick={() => setAnalogTheme('modern')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                  analogTheme === 'modern'
                    ? 'border-accent bg-accent/5'
                    : 'border-border bg-card/45 hover:border-muted-foreground/30'
                }`}
              >
                <div className="w-full h-14 flex items-center justify-center bg-stone-900/60 dark:bg-stone-800/40 rounded-xl mb-1.5">
                  <div className="w-10 h-10 rounded-full border border-accent/20 bg-accent/5 flex items-center justify-center relative">
                    <div className="w-0.5 h-3 bg-accent absolute top-2 rounded-full origin-bottom" style={{ transform: 'rotate(60deg)' }} />
                    <div className="w-0.5 h-4 bg-foreground absolute top-1 rounded-full origin-bottom" style={{ transform: 'rotate(180deg)' }} />
                    <span className="absolute text-[6px] font-black text-foreground top-0.5">12</span>
                  </div>
                </div>
                <span className="text-[10px] font-black text-foreground uppercase tracking-wide">Modern</span>
              </button>

              {/* Classic Analog */}
              <button
                onClick={() => setAnalogTheme('classic')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                  analogTheme === 'classic'
                    ? 'border-accent bg-accent/5'
                    : 'border-border bg-card/45 hover:border-muted-foreground/30'
                }`}
              >
                <div className="w-full h-14 flex items-center justify-center bg-stone-100 rounded-xl mb-1.5">
                  <div className="w-10 h-10 rounded-full border-2 border-stone-800 flex items-center justify-center relative">
                    <div className="w-0.5 h-3.5 bg-stone-900 absolute top-1.5 origin-bottom" style={{ transform: 'rotate(90deg)' }} />
                    <div className="w-0.5 h-4 bg-stone-900 absolute top-1 origin-bottom" style={{ transform: 'rotate(210deg)' }} />
                    <span className="absolute text-[6px] font-serif font-black text-stone-900 top-0.5">XII</span>
                  </div>
                </div>
                <span className="text-[10px] font-black text-foreground uppercase tracking-wide">Classic Roman</span>
              </button>
            </div>
          )}
        </div>

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
