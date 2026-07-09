import { Sun, Moon, Monitor } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { Switch } from '@/components/ui/Switch'
import { useClockStore } from '../store/clockStore'
import { useThemeStore, ThemeMode } from '@/core/theme/themeStore'

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
      <div className="space-y-5 pt-2 pb-1 select-none text-left">
        
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
        <div className="space-y-3.5">
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
