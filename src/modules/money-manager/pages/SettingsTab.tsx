import React, { useRef, useState } from 'react'
import { useMoneyStore } from '../store/moneyStore'
import { useThemeStore, ThemeMode } from '@/core/theme/themeStore'
import { 
  Coins, 
  Moon, 
  AlertTriangle, 
  Calendar, 
  Palette, 
  Download, 
  Upload, 
  RotateCcw
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Switch } from '@/components/ui/Switch'
import { ActionButton } from '@/admin/components/ActionButton'

export const SettingsTab: React.FC = () => {
  const { settings, updateSettings, exportBackup, importBackup, resetAllData } = useMoneyStore()
  const { theme, setTheme } = useThemeStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const currencyOptions = [
    { label: 'Indian Rupee (₹)', value: '₹' },
    { label: 'US Dollar ($)', value: '$' },
    { label: 'Euro (€)', value: '€' },
    { label: 'British Pound (£)', value: '£' },
    { label: 'Japanese Yen (¥)', value: '¥' }
  ]

  const themeOptions = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'System Default', value: 'system' }
  ]

  const colorOptions = [
    { label: 'Yellow Accent', value: '#f8b518' },
    { label: 'Sleek Blue', value: '#3b82f6' },
    { label: 'Emerald Green', value: '#10b981' },
    { label: 'Rose Pink', value: '#ec4899' },
    { label: 'Deep Purple', value: '#8b5cf6' }
  ]

  const handleCurrencyChange = async (currency: string) => {
    await updateSettings({ currency })
  }

  const handleThemeChange = async (mode: ThemeMode) => {
    setTheme(mode)
    await updateSettings({ theme: mode })
  }

  const handleStartDayChange = async (dayStr: string) => {
    const startDay = parseInt(dayStr, 10)
    if (!isNaN(startDay)) {
      await updateSettings({ startDay })
    }
  }

  const handleColorChange = async (defaultGoalColor: string) => {
    await updateSettings({ defaultGoalColor })
  }

  const handleConfirmDeleteToggle = async (checked: boolean) => {
    await updateSettings({ confirmDelete: checked })
  }

  // Backup routines
  const handleExportBackup = async () => {
    setLoadingAction('export')
    try {
      await exportBackup()
    } finally {
      setLoadingAction(null)
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const confirmText = 'WARNING: Restoring this backup file will completely OVERWRITE your existing transactions, budgets, and savings goals. This action cannot be undone. Are you sure?'
    if (settings.confirmDelete) {
      if (!window.confirm(confirmText)) {
        e.target.value = ''
        return
      }
    }

    setLoadingAction('import')
    const reader = new FileReader()
    
    reader.onload = async (evt) => {
      const jsonString = evt.target?.result as string
      try {
        const res = await importBackup(jsonString)
        if (res.success) {
          alert('Database successfully restored from backup!')
        } else {
          alert(`Failed to import backup: ${res.error || 'Corrupted file structure'}`)
        }
      } catch (err: any) {
        alert(`Failed to parse backup file: ${err.message || err}`)
      } finally {
        setLoadingAction(null)
      }
    }

    reader.readAsText(file)
    e.target.value = '' // Clear selection
  }

  const handleResetData = async () => {
    const confirmText = 'ARE YOU ABSOLUTELY SURE? This will permanently wipe all transactions, budgets, goals, and customized settings from your local device.'
    if (window.confirm(confirmText)) {
      setLoadingAction('reset')
      try {
        await resetAllData()
        alert('All Money Manager database records have been reset.')
      } finally {
        setLoadingAction(null)
      }
    }
  }

  // Generate days 1 to 28
  const startDayOptions = Array.from({ length: 28 }, (_, i) => i + 1)

  return (
    <div className="space-y-5 text-left pb-10">
      
      {/* Title Header */}
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Module Options</span>
        <h2 className="text-xl font-bold text-foreground mt-0.5 tracking-tight">Settings</h2>
      </div>

      <div className="space-y-4">
        {/* Currency & Start Day Grid */}
        <Card className="bg-card/50">
          <CardContent className="pt-4 pb-4 space-y-4 select-none">
            {/* Preferred Currency */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2.5">
                <Coins className="w-4 h-4 text-accent shrink-0" />
                <h3 className="text-xs font-bold text-foreground">Preferred Currency</h3>
              </div>
              <select
                value={settings.currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="w-full h-10 px-3 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
              >
                {currencyOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Day of Month */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              <div className="flex items-center space-x-2.5">
                <Calendar className="w-4 h-4 text-accent shrink-0" />
                <h3 className="text-xs font-bold text-foreground">Start Day of Month</h3>
              </div>
              <p className="text-[9px] text-muted-foreground leading-normal">
                Determine the cycle anchor date. Salaries or recurring transactions will adjust around this date.
              </p>
              <select
                value={settings.startDay || 1}
                onChange={(e) => handleStartDayChange(e.target.value)}
                className="w-full h-10 px-3 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
              >
                {startDayOptions.map((day) => (
                  <option key={day} value={day}>
                    Day {day} of the Month
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Themes & Aesthetics Card */}
        <Card className="bg-card/50">
          <CardContent className="pt-4 pb-4 space-y-4 select-none">
            {/* Visual Theme */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2.5">
                <Moon className="w-4 h-4 text-accent shrink-0" />
                <h3 className="text-xs font-bold text-foreground">Visual Theme</h3>
              </div>
              <select
                value={theme}
                onChange={(e) => handleThemeChange(e.target.value as any)}
                className="w-full h-10 px-3 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
              >
                {themeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Default Goal Color */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              <div className="flex items-center space-x-2.5">
                <Palette className="w-4 h-4 text-accent shrink-0" />
                <h3 className="text-xs font-bold text-foreground">Default Savings Goal Color</h3>
              </div>
              <select
                value={settings.defaultGoalColor || '#f8b518'}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-full h-10 px-3 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
              >
                {colorOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Deletion confirmation switch */}
        <Card className="bg-card/50">
          <CardContent className="pt-4 pb-4 flex items-center justify-between space-x-4 select-none">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-accent shrink-0" />
                <h3 className="text-xs font-bold text-foreground">Confirm Deletion</h3>
              </div>
              <p className="text-[9px] text-muted-foreground leading-relaxed">
                Prompt with warning dialog confirmation before removing transactions or savings goals.
              </p>
            </div>
            <Switch
              checked={settings.confirmDelete}
              onCheckedChange={handleConfirmDeleteToggle}
              className="shrink-0"
            />
          </CardContent>
        </Card>

        {/* Backup and Data Maintenance */}
        <Card className="bg-card/50">
          <CardContent className="pt-4 pb-4 space-y-3.5 select-none">
            <div className="flex items-center space-x-2.5">
              <Download className="w-4 h-4 text-accent shrink-0" />
              <h3 className="text-xs font-bold text-foreground">Backup & Maintenance</h3>
            </div>
            
            <p className="text-[9px] text-muted-foreground leading-normal">
              All transactions are stored locally. Export backups regularly to save records, or import JSON backup files to restore logs.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <ActionButton
                onClick={handleExportBackup}
                loading={loadingAction === 'export'}
                icon={Download}
                variant="outline"
                className="w-full h-10 rounded-xl text-[9px] uppercase font-bold tracking-wider cursor-pointer"
              >
                Export JSON
              </ActionButton>
              
              <ActionButton
                onClick={handleImportClick}
                loading={loadingAction === 'import'}
                icon={Upload}
                variant="outline"
                className="w-full h-10 rounded-xl text-[9px] uppercase font-bold tracking-wider cursor-pointer"
              >
                Import JSON
              </ActionButton>
              <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Wipe database */}
            <div className="pt-3 border-t border-border/40">
              <ActionButton
                onClick={handleResetData}
                loading={loadingAction === 'reset'}
                icon={RotateCcw}
                className="w-full h-10 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-transparent font-bold uppercase tracking-wider text-[9px] cursor-pointer transition-all"
              >
                Reset Money Manager
              </ActionButton>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SettingsTab
