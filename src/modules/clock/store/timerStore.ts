import { create } from 'zustand'

interface TimerStoreState {
  duration: number // Total target duration in seconds
  secondsRemaining: number
  isRunning: boolean
  isPaused: boolean
  endTime: number | null
  isCompleted: boolean

  // Actions
  setDuration: (seconds: number) => void
  startTimer: () => void
  pauseTimer: () => void
  resumeTimer: () => void
  resetTimer: () => void
  tick: () => void
  syncBackground: () => void
  dismissCompleted: () => void
}

export const useTimerStore = create<TimerStoreState>((set, get) => ({
  duration: 60, // Default to 1 minute
  secondsRemaining: 60,
  isRunning: false,
  isPaused: false,
  endTime: null,
  isCompleted: false,

  setDuration: (seconds) => {
    const { isRunning } = get()
    if (isRunning) return // Cannot change duration while active
    set({
      duration: seconds,
      secondsRemaining: seconds,
      isCompleted: false
    })
  },

  startTimer: () => {
    const { secondsRemaining } = get()
    if (secondsRemaining <= 0) return

    const endTime = Date.now() + secondsRemaining * 1000
    set({
      isRunning: true,
      isPaused: false,
      endTime,
      isCompleted: false
    })
  },

  pauseTimer: () => {
    const { isRunning, isPaused } = get()
    if (!isRunning || isPaused) return

    set({
      isPaused: true,
      endTime: null
    })
  },

  resumeTimer: () => {
    const { isRunning, isPaused, secondsRemaining } = get()
    if (!isRunning || !isPaused) return

    const endTime = Date.now() + secondsRemaining * 1000
    set({
      isPaused: false,
      endTime
    })
  },

  resetTimer: () => {
    const { duration } = get()
    set({
      secondsRemaining: duration,
      isRunning: false,
      isPaused: false,
      endTime: null,
      isCompleted: false
    })
  },

  tick: () => {
    const { isRunning, isPaused, endTime } = get()
    if (!isRunning || isPaused || !endTime) return

    const now = Date.now()
    const remaining = Math.max(0, Math.ceil((endTime - now) / 1000))

    if (remaining <= 0) {
      set({
        secondsRemaining: 0,
        isRunning: false,
        endTime: null,
        isCompleted: true
      })
    } else {
      set({ secondsRemaining: remaining })
    }
  },

  syncBackground: () => {
    const { isRunning, isPaused, endTime } = get()
    if (!isRunning || isPaused || !endTime) return

    const now = Date.now()
    const remaining = Math.max(0, Math.ceil((endTime - now) / 1000))

    if (remaining <= 0) {
      set({
        secondsRemaining: 0,
        isRunning: false,
        endTime: null,
        isCompleted: true
      })
    } else {
      set({ secondsRemaining: remaining })
    }
  },

  dismissCompleted: () => {
    const { duration } = get()
    set({
      isCompleted: false,
      secondsRemaining: duration
    })
  }
}))
export default useTimerStore
