import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor, ShieldAlert, Cloud, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Switch } from '@/components/ui/Switch'
import { Button } from '@/components/ui/Button'
import { useThemeStore, ThemeMode } from '@/core/theme/themeStore'
import { useSettingsStore } from '@/core/settings/settingsStore'
import { useWakeLock } from '@/shared/hooks/useWakeLock'
import { Dialog } from '@/components/ui/Dialog'
import { usePWAUpdate } from '@/core/pwa/usePWAUpdate'

export const Settings = () => {
  const { theme, setTheme } = useThemeStore()
  const { animationsEnabled, toggleAnimations, keepScreenAwake, setKeepScreenAwake, version, developer } = useSettingsStore()
  const { isSupported: wakeLockSupported, request: requestWakeLock, release: releaseWakeLock } = useWakeLock()
  const [resetDialogOpen, setResetDialogOpen] = useState(false)

  const { 
    checkForUpdates, 
    loading: updatesLoading, 
    lastUpdated, 
    error: updatesError, 
    currentVersion 
  } = usePWAUpdate()
  const [checkingResult, setCheckingResult] = useState<string | null>(null)

  const handleCheckForUpdates = async () => {
    setCheckingResult(null)
    try {
      const isNewer = await checkForUpdates(true)
      if (!isNewer) {
        setCheckingResult("You're running the latest version.")
        setTimeout(() => setCheckingResult(null), 4000)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Synchronize Screen Wake Lock state with toggle value
  useEffect(() => {
    if (keepScreenAwake) {
      requestWakeLock()
    } else {
      releaseWakeLock()
    }
  }, [keepScreenAwake, requestWakeLock, releaseWakeLock])

  const handleWakeLockToggle = (checked: boolean) => {
    setKeepScreenAwake(checked)
  }

  const handleResetSystem = () => {
    localStorage.clear()
    window.location.reload()
  }

  const themeOptions: { mode: ThemeMode; label: string; icon: React.ComponentType<any> }[] = [
    { mode: 'light', label: 'Light', icon: Sun },
    { mode: 'dark', label: 'Dark', icon: Moon },
    { mode: 'system', label: 'System', icon: Monitor }
  ]

  return (
    <div className="flex-1 flex flex-col space-y-6 pb-8 select-none">
      
      {/* Page Title */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-foreground mt-0.5 tracking-tight">Settings</h1>
      </div>

      {/* Theme Selection */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">Appearance</h2>
        <Card className="bg-card/50">
          <CardContent className="pt-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold">Color Theme</span>
              <span className="text-xs text-muted-foreground capitalize">{theme}</span>
            </div>
            
            {/* Segmented control style buttons */}
            <div className="grid grid-cols-3 gap-2 bg-muted/60 p-1.5 rounded-xl border border-border/60">
              {themeOptions.map((opt) => {
                const isSelected = theme === opt.mode
                const Icon = opt.icon
                return (
                  <button
                    key={opt.mode}
                    onClick={() => setTheme(opt.mode)}
                    className={`flex flex-col items-center justify-center py-2 px-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
          </CardContent>
        </Card>
      </div>

      {/* App Toggles */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">System Controls</h2>
        <Card className="bg-card/50">
          <CardContent className="pt-5 space-y-5">
            {/* Animations Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-0.5">
                <span className="text-sm font-semibold">App Animations</span>
                <span className="text-xs text-muted-foreground">Smooth page transitions</span>
              </div>
              <Switch checked={animationsEnabled} onCheckedChange={toggleAnimations} />
            </div>

            <hr className="border-border/60" />

            {/* Screen Wake Lock Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-0.5">
                <span className="text-sm font-semibold">Keep Screen Awake</span>
                <span className="text-xs text-muted-foreground">Prevent device from sleeping</span>
              </div>
              <Switch 
                checked={keepScreenAwake} 
                onCheckedChange={handleWakeLockToggle}
                disabled={!wakeLockSupported}
              />
            </div>
            {!wakeLockSupported && (
              <p className="text-[10px] text-red-500/80 mt-1">
                * Wake Lock is not supported on this browser.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Placeholders for Future Settings */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">Account & Sync</h2>
        <Card className="bg-card/30 border-dashed">
          <CardContent className="pt-5 space-y-4 text-muted-foreground opacity-60">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-muted rounded-lg"><User className="w-4 h-4" /></div>
                <span className="text-sm font-semibold">Cloud Profile</span>
              </div>
              <span className="text-[10px] font-bold uppercase bg-muted px-2 py-0.5 rounded-full">Future</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-muted rounded-lg"><Cloud className="w-4 h-4" /></div>
                <span className="text-sm font-semibold">Database Backup</span>
              </div>
              <span className="text-[10px] font-bold uppercase bg-muted px-2 py-0.5 rounded-full">Future</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Reset & Help */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">Danger Zone</h2>
        <Card className="bg-card/50">
          <CardContent className="pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-0.5">
                <span className="text-sm font-semibold">Reset System</span>
                <span className="text-xs text-muted-foreground">Wipe all local settings</span>
              </div>
              <Button 
                variant="danger" 
                size="sm" 
                onClick={() => setResetDialogOpen(true)}
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* About Section */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">About</h2>
        <Card className="bg-card/50">
          <CardContent className="pt-5 space-y-4 text-xs leading-relaxed">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <span className="font-bold text-foreground">v{currentVersion || version}</span>
            </div>
            {lastUpdated && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-bold text-foreground">{lastUpdated}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Architect</span>
              <span className="font-bold text-foreground">{developer}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Build Environment</span>
              <span className="font-bold text-foreground">React 19 + Vite</span>
            </div>

            <hr className="border-border/60" />

            <div className="flex flex-col space-y-2 pt-1 select-none">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCheckForUpdates}
                disabled={updatesLoading}
                className="w-full flex items-center justify-center space-x-1.5 font-bold uppercase text-[10px] tracking-wider rounded-xl cursor-pointer"
              >
                <span>{updatesLoading ? 'Checking for updates...' : 'Check for Updates'}</span>
              </Button>

              {checkingResult && (
                <p className="text-emerald-500 font-bold text-[9px] text-center uppercase tracking-wider mt-1 animate-in fade-in duration-200">
                  {checkingResult}
                </p>
              )}

              {updatesError && (
                <p className="text-red-500 font-bold text-[9px] text-center uppercase tracking-wider mt-1 animate-in fade-in duration-200">
                  {updatesError}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reset Confirmation Dialog */}
      <Dialog
        isOpen={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        title="Confirm System Reset"
        description="Are you absolutely sure you want to reset?"
      >
        <div className="space-y-4 pt-1">
          <div className="flex items-start space-x-3 p-3 bg-red-500/10 text-red-500 rounded-xl">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              This action will clear all persistent offline databases, custom registries, and restore theme preferences back to default. This cannot be undone.
            </p>
          </div>
          <div className="flex space-x-3 justify-end">
            <Button variant="secondary" onClick={() => setResetDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleResetSystem}>
              Yes, Reset System
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
export default Settings
