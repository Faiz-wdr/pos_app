import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { safeStorage } from '../storage/storage'

declare const __APP_VERSION__: string

const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0'

interface SettingsState {
  animationsEnabled: boolean
  keepScreenAwake: boolean
  version: string
  developer: string
  toggleAnimations: () => void
  setKeepScreenAwake: (enabled: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      animationsEnabled: true,
      keepScreenAwake: false,
      version: appVersion,
      developer: 'Antigravity Architect & User',
      toggleAnimations: () => set((state) => ({ animationsEnabled: !state.animationsEnabled })),
      setKeepScreenAwake: (enabled) => set({ keepScreenAwake: enabled }),
    }),
    {
      name: 'pos-settings-storage',
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        animationsEnabled: state.animationsEnabled,
        keepScreenAwake: state.keepScreenAwake
      })
    }
  )
)
