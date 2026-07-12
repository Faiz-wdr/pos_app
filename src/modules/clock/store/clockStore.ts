import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { safeStorage } from '@/core/storage/storage'
import { ClockSettings, ClockTheme, DateFormat } from '../types'

interface ClockStoreState extends ClockSettings {
  setTheme: (theme: ClockTheme) => void
  setThemeColor: (color: string) => void
  setUse24Hour: (use24Hour: boolean) => void
  setDateFormat: (format: DateFormat) => void
  setShowSeconds: (show: boolean) => void
  setAutoHideControls: (hide: boolean) => void
  setKeepAwake: (awake: boolean) => void
}

export const useClockStore = create<ClockStoreState>()(
  persist(
    (set) => ({
      theme: 'modern-digital',
      themeColor: 'coral',
      use24Hour: false,
      dateFormat: 'long',
      showSeconds: true,
      autoHideControls: false,
      keepAwake: true,

      setTheme: (theme) => set({ theme }),
      setThemeColor: (themeColor) => set({ themeColor }),
      setUse24Hour: (use24Hour) => set({ use24Hour }),
      setDateFormat: (dateFormat) => set({ dateFormat }),
      setShowSeconds: (showSeconds) => set({ showSeconds }),
      setAutoHideControls: (autoHideControls) => set({ autoHideControls }),
      setKeepAwake: (keepAwake) => set({ keepAwake }),
    }),
    {
      name: 'pos-clock-settings',
      storage: createJSONStorage(() => safeStorage),
    }
  )
)

export const CLOCK_COLORS = {
  coral: { name: 'Coral', value: '#ff5e5b' },
  orange: { name: 'Orange', value: '#ff9f0a' },
  yellow: { name: 'Yellow', value: '#ffd60a' },
  green: { name: 'Green', value: '#30d158' },
  blue: { name: 'Blue', value: '#0a84ff' },
  purple: { name: 'Purple', value: '#bf5af2' },
  pink: { name: 'Pink', value: '#ff375f' },
  white: { name: 'White', value: '#ffffff' }
} as const

