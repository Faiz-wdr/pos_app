import { create } from 'zustand'
import { PlannerTask } from '../types'

interface ReminderAlertState {
  activeTask: PlannerTask | null
  setActiveTask: (task: PlannerTask | null) => void
  dismissAlert: () => void
}

export const useReminderAlertStore = create<ReminderAlertState>((set) => ({
  activeTask: null,
  setActiveTask: (task) => set({ activeTask: task }),
  dismissAlert: () => set({ activeTask: null })
}))
