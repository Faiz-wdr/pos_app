import { Card, CardContent } from '@/components/ui/Card'
import { Switch } from '@/components/ui/Switch'
import { Button } from '@/components/ui/Button'
import { Bell, Calendar, Clock, Tag, Eye } from 'lucide-react'
import { usePlannerSettingsStore } from '../store/plannerSettingsStore'
import { usePlannerNotifications } from '../hooks/usePlannerNotifications'
import { TaskCategory, ReminderOption } from '../types'

const CATEGORIES: TaskCategory[] = ['Personal', 'Study', 'Work', 'Health', 'Family', 'Other']
const REMINDER_OPTIONS: ReminderOption[] = ['At Time', '5 Minutes Before', '10 Minutes Before', '30 Minutes Before', '1 Hour Before', '1 Day Before']

export const SettingsPage = () => {
  const {
    startWeekOn,
    timeFormat,
    defaultReminder,
    defaultCategory,
    showCompletedTasks,
    setStartWeekOn,
    setTimeFormat,
    setDefaultReminder,
    setDefaultCategory,
    setShowCompletedTasks
  } = usePlannerSettingsStore()

  const { permission, requestPermission } = usePlannerNotifications()

  return (
    <div className="flex-1 flex flex-col space-y-3 pb-24 text-left select-none">
      {/* Header Title */}
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
          Preferences
        </span>
        <h1 className="text-lg font-extrabold text-foreground tracking-tight leading-none mt-0.5">
          Planner Settings
        </h1>
      </div>

      <div className="space-y-4">
        {/* Calendar & Time Display Settings */}
        <Card className="bg-card/70 border-border/70 shadow-xs rounded-2xl overflow-hidden">
          <CardContent className="p-4 sm:p-5 space-y-4">
            <h3 className="text-xs font-extrabold uppercase text-muted-foreground tracking-wider flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-accent" />
              Calendar & Time Format
            </h3>

            {/* Start Week On */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground">Start Week On</span>
                <p className="text-[11px] text-muted-foreground">Select first day of the week for calendar</p>
              </div>
              <div className="flex bg-muted/60 p-1 rounded-xl border border-border/50">
                <button
                  onClick={() => setStartWeekOn('Monday')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    startWeekOn === 'Monday' ? 'bg-accent text-accent-foreground shadow-xs' : 'text-muted-foreground'
                  }`}
                >
                  Mon
                </button>
                <button
                  onClick={() => setStartWeekOn('Sunday')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    startWeekOn === 'Sunday' ? 'bg-accent text-accent-foreground shadow-xs' : 'text-muted-foreground'
                  }`}
                >
                  Sun
                </button>
              </div>
            </div>

            <hr className="border-border/40" />

            {/* 12 Hour / 24 Hour */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground">Time Format</span>
                <p className="text-[11px] text-muted-foreground">Display times in 12h AM/PM or 24h format</p>
              </div>
              <div className="flex bg-muted/60 p-1 rounded-xl border border-border/50">
                <button
                  onClick={() => setTimeFormat('12h')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    timeFormat === '12h' ? 'bg-accent text-accent-foreground shadow-xs' : 'text-muted-foreground'
                  }`}
                >
                  12 Hour
                </button>
                <button
                  onClick={() => setTimeFormat('24h')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    timeFormat === '24h' ? 'bg-accent text-accent-foreground shadow-xs' : 'text-muted-foreground'
                  }`}
                >
                  24 Hour
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Defaults Settings */}
        <Card className="bg-card/70 border-border/70 shadow-xs rounded-2xl overflow-hidden">
          <CardContent className="p-4 sm:p-5 space-y-4">
            <h3 className="text-xs font-extrabold uppercase text-muted-foreground tracking-wider flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-accent" />
              Task Defaults
            </h3>

            {/* Default Category */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground">Default Category</span>
                <p className="text-[11px] text-muted-foreground">Pre-selected category for quick add</p>
              </div>
              <select
                value={defaultCategory}
                onChange={(e) => setDefaultCategory(e.target.value as TaskCategory)}
                className="h-9 px-3 font-bold text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <hr className="border-border/40" />

            {/* Default Reminder */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground">Default Reminder</span>
                <p className="text-[11px] text-muted-foreground">Pre-selected alert offset for new tasks</p>
              </div>
              <select
                value={defaultReminder}
                onChange={(e) => setDefaultReminder(e.target.value as ReminderOption)}
                className="h-9 px-3 font-bold text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {REMINDER_OPTIONS.map((rem) => (
                  <option key={rem} value={rem}>
                    {rem}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* View & Notification Settings */}
        <Card className="bg-card/70 border-border/70 shadow-xs rounded-2xl overflow-hidden">
          <CardContent className="p-4 sm:p-5 space-y-4">
            <h3 className="text-xs font-extrabold uppercase text-muted-foreground tracking-wider flex items-center">
              <Eye className="w-3.5 h-3.5 mr-1.5 text-accent" />
              View & Notifications
            </h3>

            {/* Show Completed Tasks */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground">Show Completed Tasks</span>
                <p className="text-[11px] text-muted-foreground">Display finished tasks in timeline section</p>
              </div>
              <Switch
                checked={showCompletedTasks}
                onCheckedChange={setShowCompletedTasks}
              />
            </div>

            <hr className="border-border/40" />

            {/* Browser Notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground">Browser Reminders</span>
                <p className="text-[11px] text-muted-foreground">
                  Permission: <span className="font-extrabold capitalize text-foreground">{permission}</span>
                </p>
              </div>
              {permission !== 'granted' ? (
                <Button
                  onClick={requestPermission}
                  size="sm"
                  variant="primary"
                  className="rounded-xl h-8 font-bold text-xs cursor-pointer shadow-xs"
                >
                  <Bell className="w-3.5 h-3.5 mr-1" />
                  Enable Alerts
                </Button>
              ) : (
                <span className="text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-full">
                  Enabled
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SettingsPage
