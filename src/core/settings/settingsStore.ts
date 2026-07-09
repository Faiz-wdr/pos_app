import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { safeStorage } from '../storage/storage'

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
      version: '1.0.0',
      developer: 'Antigravity Architect & User',
      toggleAnimations: () => set((state) => ({ animationsEnabled: !state.animationsEnabled })),
      setKeepScreenAwake: (enabled) => set({ keepScreenAwake: enabled }),
    }),
    {
      name: 'pos-settings-storage',
      storage: createJSONStorage(() => safeStorage),
    }
  )
)
