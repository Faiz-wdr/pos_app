import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { safeStorage } from '@/core/storage/storage'
import { ClockSettings, ClockType, DateFormat, DigitalTheme, AnalogTheme, ViewMode } from '../types'

interface ClockStoreState extends ClockSettings {
  setClockType: (type: ClockType) => void
  setUse24Hour: (use24Hour: boolean) => void
  setDateFormat: (format: DateFormat) => void
  setShowSeconds: (show: boolean) => void
  setAutoHideControls: (hide: boolean) => void
  setKeepAwake: (awake: boolean) => void
  setDigitalTheme: (theme: DigitalTheme) => void
  setAnalogTheme: (theme: AnalogTheme) => void
  setViewMode: (mode: ViewMode) => void
}

export const useClockStore = create<ClockStoreState>()(
  persist(
    (set) => ({
      clockType: 'digital',
      use24Hour: false,
      dateFormat: 'long',
      showSeconds: true,
      autoHideControls: false,
      keepAwake: false,
      digitalTheme: 'classic',
      analogTheme: 'minimal',
      viewMode: 'auto',

      setClockType: (clockType) => set({ clockType }),
      setUse24Hour: (use24Hour) => set({ use24Hour }),
      setDateFormat: (dateFormat) => set({ dateFormat }),
      setShowSeconds: (showSeconds) => set({ showSeconds }),
      setAutoHideControls: (autoHideControls) => set({ autoHideControls }),
      setKeepAwake: (keepAwake) => set({ keepAwake }),
      setDigitalTheme: (digitalTheme) => set({ digitalTheme }),
      setAnalogTheme: (analogTheme) => set({ analogTheme }),
      setViewMode: (viewMode) => set({ viewMode }),
    }),
    {
      name: 'pos-clock-settings',
      storage: createJSONStorage(() => safeStorage),
    }
  )
)
