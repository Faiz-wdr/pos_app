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
}

export const usePlannerSettingsStore = create<PlannerSettingsState>()(
  persist(
    (set) => ({
      startWeekOn: 'Monday',
      timeFormat: '12h',
      defaultReminder: '10 Minutes Before',
      defaultCategory: 'Personal',
      showCompletedTasks: true,

      setStartWeekOn: (startWeekOn) => set({ startWeekOn }),
      setTimeFormat: (timeFormat) => set({ timeFormat }),
      setDefaultReminder: (defaultReminder) => set({ defaultReminder }),
      setDefaultCategory: (defaultCategory) => set({ defaultCategory }),
      setShowCompletedTasks: (showCompletedTasks) => set({ showCompletedTasks }),
    }),
    {
      name: 'pos-day-planner-settings',
      storage: createJSONStorage(() => safeStorage),
    }
  )
)

export default usePlannerSettingsStore
