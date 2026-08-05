import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor, ShieldAlert, ChevronRight, ArrowLeft, Info, ShieldCheck, Mail, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Switch } from '@/components/ui/Switch'
import { Button } from '@/components/ui/Button'
import { useThemeStore, ThemeMode } from '@/core/theme/themeStore'
import { useSettingsStore } from '@/core/settings/settingsStore'
import { useWakeLock } from '@/shared/hooks/useWakeLock'
import { Dialog } from '@/components/ui/Dialog'
import { usePWAUpdate } from '@/core/pwa/usePWAUpdate'

import { db as dayPlannerDb } from '@/modules/day-planner/database/db'
import { db as shoppingDb } from '@/modules/shopping/database/db'
import { db as moneyDb } from '@/modules/money-manager/database/db'

// Helper to format byte sizes
const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const Settings = () => {
  const { theme, setTheme } = useThemeStore()
  const { animationsEnabled, toggleAnimations, keepScreenAwake, setKeepScreenAwake, version, developer } = useSettingsStore()
  const { isSupported: wakeLockSupported, request: requestWakeLock, release: releaseWakeLock } = useWakeLock()
  
  const [view, setView] = useState<'main' | 'storage'>('main')
  const [themeDialogOpen, setThemeDialogOpen] = useState(false)
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false)
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)

  // Storage states
  const [storageSizes, setStorageSizes] = useState({
    dayPlanner: 0,
    moneyManager: 0,
    shopping: 0,
    system: 0,
    total: 0
  })

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
        setCheckingResult("Latest version active")
        setTimeout(() => setCheckingResult(null), 3000)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Calculate sizes
  const calculateSizes = async () => {
    try {
      let dpSize = 0
      for (const table of dayPlannerDb.tables) {
        const arr = await table.toArray()
        dpSize += JSON.stringify(arr).length * 2
      }
      const dpLS = localStorage.getItem('pos-day-planner-settings')
      if (dpLS) dpSize += dpLS.length * 2

      let mmSize = 0
      for (const table of moneyDb.tables) {
        const arr = await table.toArray()
        mmSize += JSON.stringify(arr).length * 2
      }

      let shSize = 0
      for (const table of shoppingDb.tables) {
        const arr = await table.toArray()
        shSize += JSON.stringify(arr).length * 2
      }
      const shLS = localStorage.getItem('pos-shopping-storage')
      if (shLS) shSize += shLS.length * 2

      let systemLSSize = 0
      const systemKeys = ['pos-settings-storage', 'pos-theme-storage', 'pos-modules-storage', 'pos-auth-storage', 'pos-admin-settings', 'pos-admin-theme']
      systemKeys.forEach(k => {
        const val = localStorage.getItem(k)
        if (val) systemLSSize += val.length * 2
      })

      const total = dpSize + mmSize + shSize + systemLSSize

      setStorageSizes({
        dayPlanner: dpSize,
        moneyManager: mmSize,
        shopping: shSize,
        system: systemLSSize,
        total: total
      })
    } catch (e) {
      console.error('Failed to calculate storage size', e)
    }
  }

  useEffect(() => {
    if (view === 'storage') {
      calculateSizes()
    }
  }, [view])

  // Synchronize Screen Wake Lock
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

  const handleClearModule = async (moduleId: string) => {
    if (!window.confirm(`Are you sure you want to clear all local data for ${moduleId}? This cannot be undone.`)) {
      return
    }
    if (moduleId === 'dayPlanner') {
      await dayPlannerDb.tasks.clear()
      await dayPlannerDb.templates.clear()
      localStorage.removeItem('pos-day-planner-settings')
    } else if (moduleId === 'moneyManager') {
      await moneyDb.transactions.clear()
      await moneyDb.budget.clear()
      await moneyDb.goals.clear()
      await moneyDb.settings.clear()
    } else if (moduleId === 'shopping') {
      await shoppingDb.shoppingLists.clear()
      await shoppingDb.shoppingItems.clear()
      await shoppingDb.shoppingTemplates.clear()
      await shoppingDb.templateItems.clear()
      await shoppingDb.customUnits.clear()
      localStorage.removeItem('pos-shopping-storage')
    } else if (moduleId === 'system') {
      localStorage.removeItem('pos-settings-storage')
      localStorage.removeItem('pos-theme-storage')
      localStorage.removeItem('pos-modules-storage')
      localStorage.removeItem('pos-auth-storage')
      localStorage.removeItem('pos-admin-settings')
    }
    calculateSizes()
  }

  const themeOptions = [
    { mode: 'light' as ThemeMode, label: 'Light', icon: Sun },
    { mode: 'dark' as ThemeMode, label: 'Dark', icon: Moon },
    { mode: 'system' as ThemeMode, label: 'System Default', icon: Monitor }
  ]

  const getThemeLabel = (mode: ThemeMode) => {
    switch (mode) {
      case 'light': return 'Light'
      case 'dark': return 'Dark'
      case 'system': return 'System'
    }
  }

  if (view === 'storage') {
    return (
      <div className="flex-1 flex flex-col space-y-5 pb-8 select-none text-left animate-in fade-in duration-200">
        {/* Sub Header */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setView('main')} 
            className="p-2 -ml-2 rounded-full hover:bg-card text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Storage</h1>
        </div>

        <div className="space-y-4">
          <Card className="bg-card/30 border border-border/40 rounded-2xl overflow-hidden">
            <CardContent className="p-0 divide-y divide-border/30">
              <div className="flex justify-between items-center h-12 px-4">
                <span className="text-xs font-bold text-foreground">Total Storage Used</span>
                <span className="text-xs font-extrabold text-accent">{formatSize(storageSizes.total)}</span>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">Storage Breakdown</h2>
          <Card className="bg-card/30 border border-border/40 rounded-2xl overflow-hidden">
            <CardContent className="p-0 divide-y divide-border/30">
              {/* Day Planner */}
              <div className="flex justify-between items-center h-14 px-4">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground">Day Planner</span>
                  <span className="text-[10px] text-muted-foreground">{formatSize(storageSizes.dayPlanner)}</span>
                </div>
                <button 
                  onClick={() => handleClearModule('dayPlanner')}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 cursor-pointer transition-colors"
                  title="Clear Day Planner data"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Money Manager */}
              <div className="flex justify-between items-center h-14 px-4">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground">Money Manager</span>
                  <span className="text-[10px] text-muted-foreground">{formatSize(storageSizes.moneyManager)}</span>
                </div>
                <button 
                  onClick={() => handleClearModule('moneyManager')}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 cursor-pointer transition-colors"
                  title="Clear Money Manager data"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Shopping List */}
              <div className="flex justify-between items-center h-14 px-4">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground">Shopping List</span>
                  <span className="text-[10px] text-muted-foreground">{formatSize(storageSizes.shopping)}</span>
                </div>
                <button 
                  onClick={() => handleClearModule('shopping')}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 cursor-pointer transition-colors"
                  title="Clear Shopping List data"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* System & Cache */}
              <div className="flex justify-between items-center h-14 px-4">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground">System & Settings</span>
                  <span className="text-[10px] text-muted-foreground">{formatSize(storageSizes.system)}</span>
                </div>
                <button 
                  onClick={() => handleClearModule('system')}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 cursor-pointer transition-colors"
                  title="Reset settings"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </CardContent>
          </Card>

          <div className="pt-2">
            <Button
              variant="danger"
              className="w-full h-11 font-bold uppercase tracking-wider text-xs rounded-xl cursor-pointer"
              onClick={() => setResetDialogOpen(true)}
            >
              Wipe All Data
            </Button>
          </div>
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

  return (
    <div className="flex-1 flex flex-col space-y-5 pb-8 select-none text-left">
      
      {/* Header */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-foreground mt-0.5 tracking-tight">Settings</h1>
      </div>

      <div className="space-y-4">
        {/* Appearance Group */}
        <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">Appearance</h2>
        <Card className="bg-card/30 border border-border/40 rounded-2xl overflow-hidden">
          <CardContent className="p-0 divide-y divide-border/30">
            <div 
              onClick={() => setThemeDialogOpen(true)}
              className="flex justify-between items-center h-12 px-4 hover:bg-muted/40 transition-colors cursor-pointer"
            >
              <span className="text-xs font-bold text-foreground">Color Theme</span>
              <div className="flex items-center space-x-1.5 text-muted-foreground">
                <span className="text-xs font-medium capitalize">{getThemeLabel(theme)}</span>
                <ChevronRight className="w-4 h-4 opacity-60" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* General Controls Group */}
        <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">General</h2>
        <Card className="bg-card/30 border border-border/40 rounded-2xl overflow-hidden">
          <CardContent className="p-0 divide-y divide-border/30">
            <div className="flex items-center justify-between h-12 px-4">
              <span className="text-xs font-bold text-foreground">App Animations</span>
              <Switch checked={animationsEnabled} onCheckedChange={toggleAnimations} />
            </div>
            
            <div className="flex items-center justify-between h-12 px-4">
              <span className="text-xs font-bold text-foreground">Keep Screen Awake</span>
              <Switch 
                checked={keepScreenAwake} 
                onCheckedChange={handleWakeLockToggle}
                disabled={!wakeLockSupported}
              />
            </div>

            <div 
              onClick={() => setView('storage')}
              className="flex justify-between items-center h-12 px-4 hover:bg-muted/40 transition-colors cursor-pointer"
            >
              <span className="text-xs font-bold text-foreground">Storage</span>
              <div className="flex items-center space-x-1.5 text-muted-foreground">
                <ChevronRight className="w-4 h-4 opacity-60" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support & Legal Group */}
        <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">Support & Legal</h2>
        <Card className="bg-card/30 border border-border/40 rounded-2xl overflow-hidden">
          <CardContent className="p-0 divide-y divide-border/30">
            <div 
              onClick={() => setPrivacyDialogOpen(true)}
              className="flex justify-between items-center h-12 px-4 hover:bg-muted/40 transition-colors cursor-pointer"
            >
              <span className="text-xs font-bold text-foreground">Privacy Policy</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-60" />
            </div>

            <div 
              onClick={() => setContactDialogOpen(true)}
              className="flex justify-between items-center h-12 px-4 hover:bg-muted/40 transition-colors cursor-pointer"
            >
              <span className="text-xs font-bold text-foreground">Contact Support</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-60" />
            </div>
          </CardContent>
        </Card>

        {/* About Group */}
        <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">About</h2>
        <Card className="bg-card/30 border border-border/40 rounded-2xl overflow-hidden">
          <CardContent className="p-0 divide-y divide-border/30">
            <div className="flex justify-between items-center h-12 px-4">
              <span className="text-xs font-bold text-foreground">Version</span>
              <span className="text-xs font-extrabold text-muted-foreground">v{currentVersion || version}</span>
            </div>
            
            <div className="flex justify-between items-center h-12 px-4">
              <span className="text-xs font-bold text-foreground">Architect</span>
              <span className="text-xs font-extrabold text-muted-foreground">{developer}</span>
            </div>

            {lastUpdated && (
              <div className="flex justify-between items-center h-12 px-4">
                <span className="text-xs font-bold text-foreground">Last Updated</span>
                <span className="text-xs font-extrabold text-muted-foreground">{lastUpdated}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="pt-2">
          <Button
            variant="outline"
            onClick={handleCheckForUpdates}
            disabled={updatesLoading}
            className="w-full h-11 flex items-center justify-center space-x-1.5 font-bold uppercase text-[10px] tracking-wider rounded-xl cursor-pointer"
          >
            <span>{updatesLoading ? 'Checking...' : 'Check for Updates'}</span>
          </Button>

          {checkingResult && (
            <p className="text-emerald-500 font-bold text-[9px] text-center uppercase tracking-wider mt-1.5 animate-in fade-in duration-200">
              {checkingResult}
            </p>
          )}

          {updatesError && (
            <p className="text-red-500 font-bold text-[9px] text-center uppercase tracking-wider mt-1.5 animate-in fade-in duration-200">
              {updatesError}
            </p>
          )}
        </div>

        {/* Reset System Group */}
        <div className="pt-4">
          <Button
            variant="danger"
            onClick={() => setResetDialogOpen(true)}
            className="w-full h-11 font-bold uppercase tracking-wider text-xs rounded-xl cursor-pointer"
          >
            Reset System Settings
          </Button>
        </div>
      </div>

      {/* Theme Dialog Selector */}
      <Dialog
        isOpen={themeDialogOpen}
        onClose={() => setThemeDialogOpen(false)}
        title="Select Theme"
      >
        <div className="space-y-1.5 pt-2">
          {themeOptions.map((opt) => {
            const isSelected = theme === opt.mode
            const Icon = opt.icon
            return (
              <button
                key={opt.mode}
                onClick={() => {
                  setTheme(opt.mode)
                  setThemeDialogOpen(false)
                }}
                className={`w-full flex items-center justify-between h-12 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-accent bg-accent/5 text-foreground' 
                    : 'border-border/60 bg-card/40 text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-accent" />}
              </button>
            )
          })}
        </div>
      </Dialog>

      {/* Privacy Policy Dialog */}
      <Dialog
        isOpen={privacyDialogOpen}
        onClose={() => setPrivacyDialogOpen(false)}
        title="Privacy Policy"
      >
        <div className="space-y-3 pt-2 text-xs leading-relaxed text-muted-foreground">
          <div className="flex items-start space-x-2.5 p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-foreground">Offline & Secure</p>
              <p className="text-[11px] leading-normal text-muted-foreground">
                Your data is stored 100% locally in your browser's IndexedDB. No analytics, tracking or telemetry is synced unless explicitly configured.
              </p>
            </div>
          </div>
          <p>
            PersonalOS respects your privacy. All notes, calendar entries, lists, budgets, and logs are saved within local sandbox databases and are completely secure.
          </p>
          <div className="flex justify-end pt-2">
            <Button variant="secondary" onClick={() => setPrivacyDialogOpen(false)}>Close</Button>
          </div>
        </div>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog
        isOpen={contactDialogOpen}
        onClose={() => setContactDialogOpen(false)}
        title="Contact Support"
      >
        <div className="space-y-3.5 pt-2 text-xs leading-relaxed text-muted-foreground">
          <div className="flex items-start space-x-2.5 p-3 bg-accent/10 text-accent rounded-xl">
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-foreground">Support & Feedback</p>
              <p className="text-[11px] leading-normal text-muted-foreground">
                Have questions or features to request? Connect with the developer.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 bg-card border border-border/40 p-2.5 rounded-xl">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-foreground select-all">support@personalos.com</span>
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <Button variant="secondary" onClick={() => setContactDialogOpen(false)}>Close</Button>
          </div>
        </div>
      </Dialog>

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
