import { useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Switch } from '@/components/ui/Switch'
import { useClockStore, CLOCK_COLORS } from '../store/clockStore'
import { ClockTheme, DateFormat } from '../types'
import { ChevronRight } from 'lucide-react'

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
    setKeepAwake,
    landscapeRotation,
    setLandscapeRotation
  } = useClockStore()

  // Sub-dialog selector states
  const [activeSubDialog, setActiveSubDialog] = useState<'type' | 'theme' | 'color' | 'dateFormat' | null>(null)

  const dateFormats: { value: DateFormat; label: string }[] = [
    { value: 'long', label: 'Long Date (e.g. Thursday, July 9)' },
    { value: 'DD/MM/YYYY', label: 'Day/Month/Year (DD/MM/YYYY)' },
    { value: 'MM/DD/YYYY', label: 'Month/Day/Year (MM/DD/YYYY)' }
  ]

  const themeOptions = [
    { value: 'modern-digital' as ClockTheme, label: 'Modern Digital' },
    { value: 'minimal-digital' as ClockTheme, label: 'StandBy Digital' },
    { value: 'classic-analog' as ClockTheme, label: 'Classic Analog' },
    { value: 'calendar-analog' as ClockTheme, label: 'Calendar Analog' }
  ]

  const getClockType = () => {
    return activeTheme.includes('analog') ? 'Analog' : 'Digital'
  }

  const getThemeLabel = (val: ClockTheme) => {
    const opt = themeOptions.find(o => o.value === val)
    return opt ? opt.label : val
  }

  const getDateFormatLabel = (val: DateFormat) => {
    const opt = dateFormats.find(o => o.value === val)
    return opt ? opt.label : val
  }

  const getColorLabel = (val: string) => {
    const opt = (CLOCK_COLORS as any)[val]
    return opt ? opt.name : val
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Clock Settings"
    >
      <div className="space-y-4 pt-2 pb-1 select-none text-left max-h-[70vh] overflow-y-auto pr-1">
        
        {/* General Settings Group */}
        <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">General</h2>
        <div className="bg-card/30 border border-border/40 rounded-2xl overflow-hidden divide-y divide-border/30">
          {/* Clock Type */}
          <div 
            onClick={() => setActiveSubDialog('type')}
            className="flex justify-between items-center h-12 px-4 hover:bg-muted/40 transition-colors cursor-pointer"
          >
            <span className="text-xs font-bold text-foreground">Clock Type</span>
            <div className="flex items-center space-x-1.5 text-muted-foreground">
              <span className="text-xs font-medium">{getClockType()}</span>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </div>
          </div>

          {/* Clock Theme */}
          <div 
            onClick={() => setActiveSubDialog('theme')}
            className="flex justify-between items-center h-12 px-4 hover:bg-muted/40 transition-colors cursor-pointer"
          >
            <span className="text-xs font-bold text-foreground">Clock Design Theme</span>
            <div className="flex items-center space-x-1.5 text-muted-foreground">
              <span className="text-xs font-medium">{getThemeLabel(activeTheme)}</span>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </div>
          </div>

          {/* Standby Color */}
          {activeTheme === 'minimal-digital' && (
            <div 
              onClick={() => setActiveSubDialog('color')}
              className="flex justify-between items-center h-12 px-4 hover:bg-muted/40 transition-colors cursor-pointer"
            >
              <span className="text-xs font-bold text-foreground">StandBy Digit Color</span>
              <div className="flex items-center space-x-1.5 text-muted-foreground">
                <span className="text-xs font-medium">{getColorLabel(themeColor)}</span>
                <ChevronRight className="w-4 h-4 opacity-60" />
              </div>
            </div>
          )}

          {/* Date Format */}
          <div 
            onClick={() => setActiveSubDialog('dateFormat')}
            className="flex justify-between items-center h-12 px-4 hover:bg-muted/40 transition-colors cursor-pointer"
          >
            <span className="text-xs font-bold text-foreground">Date Format</span>
            <div className="flex items-center space-x-1.5 text-muted-foreground">
              <span className="text-xs font-medium truncate max-w-[140px]">{getDateFormatLabel(dateFormat)}</span>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </div>
          </div>
        </div>

        {/* Display Toggles Group */}
        <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">Display Controls</h2>
        <div className="bg-card/30 border border-border/40 rounded-2xl overflow-hidden divide-y divide-border/30">
          {/* 24-Hour Switch (Only relevant for Digital) */}
          {!activeTheme.includes('analog') && (
            <div className="flex items-center justify-between h-12 px-4">
              <span className="text-xs font-bold text-foreground">24-Hour Time</span>
              <Switch checked={use24Hour} onCheckedChange={setUse24Hour} />
            </div>
          )}

          {/* Show Seconds */}
          <div className="flex items-center justify-between h-12 px-4">
            <span className="text-xs font-bold text-foreground">Display Seconds</span>
            <Switch checked={showSeconds} onCheckedChange={setShowSeconds} />
          </div>

          {/* Landscape Rotation */}
          <div className="flex items-center justify-between h-12 px-4">
            <span className="text-xs font-bold text-foreground">Auto Rotate</span>
            <Switch checked={landscapeRotation} onCheckedChange={setLandscapeRotation} />
          </div>
        </div>

        {/* System Controls Group */}
        <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">System</h2>
        <div className="bg-card/30 border border-border/40 rounded-2xl overflow-hidden divide-y divide-border/30">
          {/* Keep Screen Awake */}
          <div className="flex items-center justify-between h-12 px-4">
            <span className="text-xs font-bold text-foreground">Keep Screen Awake</span>
            <Switch checked={keepAwake} onCheckedChange={setKeepAwake} />
          </div>

          {/* Auto Hide Controls */}
          <div className="flex items-center justify-between h-12 px-4">
            <span className="text-xs font-bold text-foreground">Auto Hide Controls</span>
            <Switch checked={autoHideControls} onCheckedChange={setAutoHideControls} />
          </div>
        </div>

      </div>

      {/* Sub-Dialog: Clock Type */}
      <Dialog
        isOpen={activeSubDialog === 'type'}
        onClose={() => setActiveSubDialog(null)}
        title="Clock Type"
      >
        <div className="space-y-1.5 pt-2">
          {['Digital', 'Analog'].map((t) => {
            const isSelected = getClockType() === t
            return (
              <button
                key={t}
                onClick={() => {
                  if (t === 'Digital') {
                    setActiveTheme('modern-digital')
                  } else {
                    setActiveTheme('classic-analog')
                  }
                  setActiveSubDialog(null)
                }}
                className={`w-full flex items-center justify-between h-12 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-accent bg-accent/5 text-foreground' 
                    : 'border-border/60 bg-card/40 text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                }`}
              >
                <span>{t}</span>
                {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-accent" />}
              </button>
            )
          })}
        </div>
      </Dialog>

      {/* Sub-Dialog: Clock Theme */}
      <Dialog
        isOpen={activeSubDialog === 'theme'}
        onClose={() => setActiveSubDialog(null)}
        title="Clock Design Theme"
      >
        <div className="space-y-1.5 pt-2">
          {themeOptions.map((opt) => {
            const isSelected = activeTheme === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setActiveTheme(opt.value)
                  setActiveSubDialog(null)
                }}
                className={`w-full flex items-center justify-between h-12 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-accent bg-accent/5 text-foreground' 
                    : 'border-border/60 bg-card/40 text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-accent" />}
              </button>
            )
          })}
        </div>
      </Dialog>

      {/* Sub-Dialog: Standby color */}
      <Dialog
        isOpen={activeSubDialog === 'color'}
        onClose={() => setActiveSubDialog(null)}
        title="StandBy Digit Color"
      >
        <div className="space-y-1.5 pt-2 max-h-[50vh] overflow-y-auto pr-1">
          {Object.entries(CLOCK_COLORS).map(([key, col]) => {
            const isSelected = themeColor === key
            return (
              <button
                key={key}
                onClick={() => {
                  setThemeColor(key)
                  setActiveSubDialog(null)
                }}
                className={`w-full flex items-center justify-between h-12 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-accent bg-accent/5 text-foreground' 
                    : 'border-border/60 bg-card/40 text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-4 h-4 rounded-full border border-border/40" style={{ backgroundColor: col.value }} />
                  <span>{col.name}</span>
                </div>
                {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-accent" />}
              </button>
            )
          })}
        </div>
      </Dialog>

      {/* Sub-Dialog: Date Format */}
      <Dialog
        isOpen={activeSubDialog === 'dateFormat'}
        onClose={() => setActiveSubDialog(null)}
        title="Date Format"
      >
        <div className="space-y-1.5 pt-2">
          {dateFormats.map((f) => {
            const isSelected = dateFormat === f.value
            return (
              <button
                key={f.value}
                onClick={() => {
                  setDateFormat(f.value)
                  setActiveSubDialog(null)
                }}
                className={`w-full flex items-center justify-between h-12 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-accent bg-accent/5 text-foreground' 
                    : 'border-border/60 bg-card/40 text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                }`}
              >
                <span>{f.label}</span>
                {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-accent" />}
              </button>
            )
          })}
        </div>
      </Dialog>

    </Dialog>
  )
}
export default ClockSettingsDialog
