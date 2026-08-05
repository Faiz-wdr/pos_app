import React, { useRef, useState } from 'react'
import { useMoneyStore } from '../store/moneyStore'
import { ChevronRight, Download, Upload, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Switch } from '@/components/ui/Switch'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export const SettingsTab: React.FC = () => {
  const { settings, updateSettings, exportBackup, importBackup, resetAllData } = useMoneyStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Dialog visibility states
  const [currencyOpen, setCurrencyOpen] = useState(false)
  const [startDayOpen, setStartDayOpen] = useState(false)
  const [budgetOpen, setBudgetOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)

  // Edit states
  const [tempBudget, setTempBudget] = useState(String(settings.defaultBudget || 0))

  const currencyOptions = [
    { label: 'Indian Rupee (₹)', value: '₹' },
    { label: 'US Dollar ($)', value: '$' },
    { label: 'Euro (€)', value: '€' },
    { label: 'British Pound (£)', value: '£' },
    { label: 'Japanese Yen (¥)', value: '¥' }
  ]

  const handleCurrencyChange = async (currency: string) => {
    await updateSettings({ currency })
    setCurrencyOpen(false)
  }

  const handleStartDayChange = async (day: number) => {
    await updateSettings({ startDay: day })
    setStartDayOpen(false)
  }

  const handleSaveBudget = async () => {
    const val = parseFloat(tempBudget)
    if (!isNaN(val) && val >= 0) {
      await updateSettings({ defaultBudget: val })
    }
    setBudgetOpen(false)
  }

  const handleConfirmDeleteToggle = (checked: boolean) => {
    updateSettings({ confirmDelete: checked })
  }

  // Backup routines
  const handleExportBackup = async () => {
    try {
      await exportBackup()
    } catch (e) {
      console.error(e)
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const confirmText = 'WARNING: Restoring this backup will completely OVERWRITE all transactions, budgets, and goals. Proceed?'
    if (!window.confirm(confirmText)) {
      e.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = async (evt) => {
      const jsonString = evt.target?.result as string
      try {
        const res = await importBackup(jsonString)
        if (res.success) {
          alert('Database successfully restored!')
        } else {
          alert(`Failed: ${res.error || 'Corrupted file'}`)
        }
      } catch (err: any) {
        alert(`Failed parsing: ${err.message || err}`)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleResetData = async () => {
    await resetAllData()
    setResetOpen(false)
    alert('All data reset.')
  }

  const getCurrencyLabel = (val: string) => {
    const opt = currencyOptions.find(o => o.value === val)
    return opt ? opt.label : val
  }

  // Days 1 to 28
  const startDayOptions = Array.from({ length: 28 }, (_, i) => i + 1)

  return (
    <div className="space-y-5 text-left pb-16 select-none animate-in fade-in duration-200">
      
      {/* Title Header */}
      <div className="flex flex-col">
        <h2 className="text-xl font-bold text-foreground mt-0.5 tracking-tight">Money Manager Settings</h2>
      </div>

      <div className="space-y-4">
        {/* General Settings Group */}
        <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">General</h2>
        <Card className="bg-card/30 border border-border/40 rounded-2xl overflow-hidden">
          <CardContent className="p-0 divide-y divide-border/30">
            {/* Preferred Currency */}
            <div 
              onClick={() => setCurrencyOpen(true)}
              className="flex justify-between items-center h-12 px-4 hover:bg-muted/40 transition-colors cursor-pointer"
            >
              <span className="text-xs font-bold text-foreground">Preferred Currency</span>
              <div className="flex items-center space-x-1.5 text-muted-foreground">
                <span className="text-xs font-medium">{getCurrencyLabel(settings.currency)}</span>
                <ChevronRight className="w-4 h-4 opacity-60" />
              </div>
            </div>

            {/* Start Day of Month */}
            <div 
              onClick={() => setStartDayOpen(true)}
              className="flex justify-between items-center h-12 px-4 hover:bg-muted/40 transition-colors cursor-pointer"
            >
              <span className="text-xs font-bold text-foreground">Month Start Day</span>
              <div className="flex items-center space-x-1.5 text-muted-foreground">
                <span className="text-xs font-medium">Day {settings.startDay}</span>
                <ChevronRight className="w-4 h-4 opacity-60" />
              </div>
            </div>

            {/* Default Budget */}
            <div 
              onClick={() => {
                setTempBudget(String(settings.defaultBudget || 0))
                setBudgetOpen(true)
              }}
              className="flex justify-between items-center h-12 px-4 hover:bg-muted/40 transition-colors cursor-pointer"
            >
              <span className="text-xs font-bold text-foreground">Default Budget</span>
              <div className="flex items-center space-x-1.5 text-muted-foreground">
                <span className="text-xs font-medium">{settings.currency}{settings.defaultBudget || 0}</span>
                <ChevronRight className="w-4 h-4 opacity-60" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Safeties Group */}
        <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">Safeties</h2>
        <Card className="bg-card/30 border border-border/40 rounded-2xl overflow-hidden">
          <CardContent className="p-0 divide-y divide-border/30">
            <div className="flex items-center justify-between h-12 px-4">
              <span className="text-xs font-bold text-foreground">Confirm Deletion</span>
              <Switch
                checked={settings.confirmDelete}
                onCheckedChange={handleConfirmDeleteToggle}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Group */}
        <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">Backup & Maintenance</h2>
        <Card className="bg-card/30 border border-border/40 rounded-2xl overflow-hidden">
          <CardContent className="p-0 divide-y divide-border/30">
            <div 
              onClick={handleExportBackup}
              className="flex justify-between items-center h-12 px-4 hover:bg-muted/40 transition-colors cursor-pointer text-foreground"
            >
              <span className="text-xs font-bold flex items-center space-x-2">
                <Download className="w-4 h-4 text-muted-foreground opacity-80" />
                <span>Export Data (JSON)</span>
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-60" />
            </div>

            <div 
              onClick={handleImportClick}
              className="flex justify-between items-center h-12 px-4 hover:bg-muted/40 transition-colors cursor-pointer text-foreground"
            >
              <span className="text-xs font-bold flex items-center space-x-2">
                <Upload className="w-4 h-4 text-muted-foreground opacity-80" />
                <span>Import Data (JSON)</span>
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-60" />
            </div>
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* Reset / Danger Group */}
        <div className="pt-2">
          <Button
            variant="danger"
            onClick={() => setResetOpen(true)}
            className="w-full h-11 font-bold uppercase tracking-wider text-xs rounded-xl cursor-pointer"
          >
            Reset Money Manager
          </Button>
        </div>
      </div>

      {/* Currency Selection Dialog */}
      <Dialog
        isOpen={currencyOpen}
        onClose={() => setCurrencyOpen(false)}
        title="Preferred Currency"
      >
        <div className="space-y-1.5 pt-2">
          {currencyOptions.map((opt) => {
            const isSelected = settings.currency === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => handleCurrencyChange(opt.value)}
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

      {/* Start Day Selection Dialog */}
      <Dialog
        isOpen={startDayOpen}
        onClose={() => setStartDayOpen(false)}
        title="Month Start Day"
      >
        <div className="space-y-1.5 pt-2 max-h-[50vh] overflow-y-auto pr-1">
          {startDayOptions.map((day) => {
            const isSelected = (settings.startDay || 1) === day
            return (
              <button
                key={day}
                onClick={() => handleStartDayChange(day)}
                className={`w-full flex items-center justify-between h-12 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-accent bg-accent/5 text-foreground' 
                    : 'border-border/60 bg-card/40 text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                }`}
              >
                <span>Day {day}</span>
                {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-accent" />}
              </button>
            )
          })}
        </div>
      </Dialog>

      {/* Default Budget Dialog */}
      <Dialog
        isOpen={budgetOpen}
        onClose={() => setBudgetOpen(false)}
        title="Default Budget"
      >
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Budget Amount ({settings.currency})</label>
            <Input
              type="number"
              value={tempBudget}
              onChange={(e) => setTempBudget(e.target.value)}
              className="h-11 bg-neutral-950 border-neutral-800 focus-visible:ring-1 focus-visible:ring-accent rounded-xl text-xs text-white"
              placeholder="e.g. 5000"
            />
          </div>
          <div className="flex space-x-3 justify-end">
            <Button variant="secondary" onClick={() => setBudgetOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveBudget}>
              Save
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <Dialog
        isOpen={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset Money Manager"
      >
        <div className="space-y-4 pt-1">
          <div className="flex items-start space-x-3 p-3 bg-red-500/10 text-red-500 rounded-xl">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              This action will clear all transactions, budgets, goals, and customized settings from your local device. This cannot be undone.
            </p>
          </div>
          <div className="flex space-x-3 justify-end">
            <Button variant="secondary" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleResetData}>
              Yes, Reset Data
            </Button>
          </div>
        </div>
      </Dialog>

    </div>
  )
}

export default SettingsTab
