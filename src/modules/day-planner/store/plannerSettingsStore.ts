import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { safeStorage } from '@/core/storage/storage'
import { PlannerSettings, TaskCategory, ReminderOption } from '../types'

interface PlannerSettingsState extends PlannerSettings {
  setStartWeekOn: (val: 'Monday' | 'Sunday') => void
  setTimeFormat: (val: '12h' | '24h') => void
  setDefaultReminder: (val: ReminderOption) => void
  setDefaultCategory: (val: TaskCategory) => void
  setShowCompletedTasks: (val: boolean) => void
  setDefaultTaskDuration: (val: '15m' | '30m' | '1h' | '2h') => void
  setCarryForwardPreference: (val: 'ask' | 'always' | 'never') => void
  setNotificationPreference: (val: 'all' | 'reminders' | 'muted') => void
}

export const usePlannerSettingsStore = create<PlannerSettingsState>()(
  persist(
    (set) => ({
      startWeekOn: 'Monday',
      timeFormat: '12h',
      defaultReminder: '10 Minutes Before',
      defaultCategory: 'Personal',
      showCompletedTasks: true,
      defaultTaskDuration: '30m',
      carryForwardPreference: 'ask',
      notificationPreference: 'all',

      setStartWeekOn: (startWeekOn) => set({ startWeekOn }),
      setTimeFormat: (timeFormat) => set({ timeFormat }),
      setDefaultReminder: (defaultReminder) => set({ defaultReminder }),
      setDefaultCategory: (defaultCategory) => set({ defaultCategory }),
      setShowCompletedTasks: (showCompletedTasks) => set({ showCompletedTasks }),
      setDefaultTaskDuration: (defaultTaskDuration) => set({ defaultTaskDuration }),
      setCarryForwardPreference: (carryForwardPreference) => set({ carryForwardPreference }),
      setNotificationPreference: (notificationPreference) => set({ notificationPreference }),
    }),
    {
      name: 'pos-day-planner-settings',
      storage: createJSONStorage(() => safeStorage),
    }
  )
)

export default usePlannerSettingsStore
