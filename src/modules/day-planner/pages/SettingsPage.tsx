import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { ChevronRight } from 'lucide-react'
import { usePlannerSettingsStore } from '../store/plannerSettingsStore'
import { Dialog } from '@/components/ui/Dialog'
import { ReminderOption } from '../types'

export const SettingsPage = () => {
  const {
    startWeekOn,
    defaultReminder,
    defaultTaskDuration,
    carryForwardPreference,
    notificationPreference,
    setStartWeekOn,
    setDefaultReminder,
    setDefaultTaskDuration,
    setCarryForwardPreference,
    setNotificationPreference
  } = usePlannerSettingsStore()

  // Selector Dialog states
  const [activeDialog, setActiveDialog] = useState<
    'weekStart' | 'reminder' | 'duration' | 'carryForward' | 'notification' | null
  >(null)

  const REMINDER_OPTIONS: { value: ReminderOption; label: string }[] = [
    { value: 'At Time', label: 'At Time' },
    { value: '5 Minutes Before', label: '5 Minutes Before' },
    { value: '10 Minutes Before', label: '10 Minutes Before' },
    { value: '30 Minutes Before', label: '30 Minutes Before' },
    { value: '1 Hour Before', label: '1 Hour Before' },
    { value: '1 Day Before', label: '1 Day Before' }
  ]

  const DURATION_OPTIONS = [
    { value: '15m' as const, label: '15 Minutes' },
    { value: '30m' as const, label: '30 Minutes' },
    { value: '1h' as const, label: '1 Hour' },
    { value: '2h' as const, label: '2 Hours' }
  ]

  const CARRY_FORWARD_OPTIONS = [
    { value: 'ask' as const, label: 'Ask daily' },
    { value: 'always' as const, label: 'Always carry forward' },
    { value: 'never' as const, label: 'Never carry forward' }
  ]

  const NOTIFICATION_OPTIONS = [
    { value: 'all' as const, label: 'All Alerts' },
    { value: 'reminders' as const, label: 'Only Reminders' },
    { value: 'muted' as const, label: 'Muted' }
  ]

  const getDurationLabel = (val: string) => {
    switch (val) {
      case '15m': return '15 Minutes'
      case '30m': return '30 Minutes'
      case '1h': return '1 Hour'
      case '2h': return '2 Hours'
      default: return '30 Minutes'
    }
  }

  const getCarryForwardLabel = (val: string) => {
    switch (val) {
      case 'ask': return 'Ask daily'
      case 'always': return 'Always'
      case 'never': return 'Never'
      default: return 'Ask daily'
    }
  }

  const getNotificationLabel = (val: string) => {
    switch (val) {
      case 'all': return 'All Alerts'
      case 'reminders': return 'Only Reminders'
      case 'muted': return 'Muted'
      default: return 'All Alerts'
    }
  }

  return (
    <div className="flex-1 flex flex-col space-y-5 pb-24 text-left select-none animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-foreground mt-0.5 tracking-tight">Day Planner Settings</h1>
      </div>

      <div className="space-y-4">
        {/* General Group */}
        <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">Calendar & Schedule</h2>
        <Card className="bg-card/30 border border-border/40 rounded-2xl overflow-hidden">
          <CardContent className="p-0 divide-y divide-border/30">
            {/* Week Starts On */}
            <div 
              onClick={() => setActiveDialog('weekStart')}
              className="flex justify-between items-center h-12 px-4 hover:bg-muted/40 transition-colors cursor-pointer"
            >
              <span className="text-xs font-bold text-foreground">Week Starts On</span>
              <div className="flex items-center space-x-1.5 text-muted-foreground">
                <span className="text-xs font-medium">{startWeekOn}</span>
                <ChevronRight className="w-4 h-4 opacity-60" />
              </div>
            </div>

            {/* Default Task Duration */}
            <div 
              onClick={() => setActiveDialog('duration')}
              className="flex justify-between items-center h-12 px-4 hover:bg-muted/40 transition-colors cursor-pointer"
            >
              <span className="text-xs font-bold text-foreground">Default Task Duration</span>
              <div className="flex items-center space-x-1.5 text-muted-foreground">
                <span className="text-xs font-medium">{getDurationLabel(defaultTaskDuration)}</span>
                <ChevronRight className="w-4 h-4 opacity-60" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Management Preferences */}
        <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">Preferences</h2>
        <Card className="bg-card/30 border border-border/40 rounded-2xl overflow-hidden">
          <CardContent className="p-0 divide-y divide-border/30">
            {/* Default Reminder */}
            <div 
              onClick={() => setActiveDialog('reminder')}
              className="flex justify-between items-center h-12 px-4 hover:bg-muted/40 transition-colors cursor-pointer"
            >
              <span className="text-xs font-bold text-foreground">Default Reminder</span>
              <div className="flex items-center space-x-1.5 text-muted-foreground">
                <span className="text-xs font-medium">{defaultReminder}</span>
                <ChevronRight className="w-4 h-4 opacity-60" />
              </div>
            </div>

            {/* Carry Forward Preference */}
            <div 
              onClick={() => setActiveDialog('carryForward')}
              className="flex justify-between items-center h-12 px-4 hover:bg-muted/40 transition-colors cursor-pointer"
            >
              <span className="text-xs font-bold text-foreground">Carry Forward Preference</span>
              <div className="flex items-center space-x-1.5 text-muted-foreground">
                <span className="text-xs font-medium">{getCarryForwardLabel(carryForwardPreference)}</span>
                <ChevronRight className="w-4 h-4 opacity-60" />
              </div>
            </div>

            {/* Notification Preferences */}
            <div 
              onClick={() => setActiveDialog('notification')}
              className="flex justify-between items-center h-12 px-4 hover:bg-muted/40 transition-colors cursor-pointer"
            >
              <span className="text-xs font-bold text-foreground">Notification Preferences</span>
              <div className="flex items-center space-x-1.5 text-muted-foreground">
                <span className="text-xs font-medium">{getNotificationLabel(notificationPreference)}</span>
                <ChevronRight className="w-4 h-4 opacity-60" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Week Starts On Dialog */}
      <Dialog
        isOpen={activeDialog === 'weekStart'}
        onClose={() => setActiveDialog(null)}
        title="Start Week On"
      >
        <div className="space-y-1.5 pt-2">
          {(['Monday', 'Sunday'] as const).map((day) => {
            const isSelected = startWeekOn === day
            return (
              <button
                key={day}
                onClick={() => {
                  setStartWeekOn(day)
                  setActiveDialog(null)
                }}
                className={`w-full flex items-center justify-between h-12 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-accent bg-accent/5 text-foreground' 
                    : 'border-border/60 bg-card/40 text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                }`}
              >
                <span>{day}</span>
                {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-accent" />}
              </button>
            )
          })}
        </div>
      </Dialog>

      {/* Default Reminder Dialog */}
      <Dialog
        isOpen={activeDialog === 'reminder'}
        onClose={() => setActiveDialog(null)}
        title="Default Reminder"
      >
        <div className="space-y-1.5 pt-2 max-h-[60vh] overflow-y-auto pr-1">
          {REMINDER_OPTIONS.map((opt) => {
            const isSelected = defaultReminder === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setDefaultReminder(opt.value)
                  setActiveDialog(null)
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

      {/* Default Task Duration Dialog */}
      <Dialog
        isOpen={activeDialog === 'duration'}
        onClose={() => setActiveDialog(null)}
        title="Default Task Duration"
      >
        <div className="space-y-1.5 pt-2">
          {DURATION_OPTIONS.map((opt) => {
            const isSelected = defaultTaskDuration === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setDefaultTaskDuration(opt.value)
                  setActiveDialog(null)
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

      {/* Carry Forward Dialog */}
      <Dialog
        isOpen={activeDialog === 'carryForward'}
        onClose={() => setActiveDialog(null)}
        title="Carry Forward Preference"
      >
        <div className="space-y-1.5 pt-2">
          {CARRY_FORWARD_OPTIONS.map((opt) => {
            const isSelected = carryForwardPreference === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setCarryForwardPreference(opt.value)
                  setActiveDialog(null)
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

      {/* Notification Preference Dialog */}
      <Dialog
        isOpen={activeDialog === 'notification'}
        onClose={() => setActiveDialog(null)}
        title="Notification Preference"
      >
        <div className="space-y-1.5 pt-2">
          {NOTIFICATION_OPTIONS.map((opt) => {
            const isSelected = notificationPreference === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setNotificationPreference(opt.value)
                  setActiveDialog(null)
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

    </div>
  )
}

export default SettingsPage
