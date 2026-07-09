import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { safeStorage } from '../storage/storage'
import { AppModule } from './registry'

interface ModuleState {
  modules: AppModule[]
  registerModule: (module: AppModule) => void
  toggleModule: (id: string, enabled: boolean) => void
  setModules: (modules: AppModule[]) => void
}

export const useModuleStore = create<ModuleState>()(
  persist(
    (set) => ({
      modules: [], // Empty by default
      registerModule: (module) =>
        set((state) => {
          if (state.modules.some((m) => m.id === module.id)) {
            return state // Avoid duplicate registrations
          }
          return { modules: [...state.modules, module] }
        }),
      toggleModule: (id, enabled) =>
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === id ? { ...m, enabled } : m
          ),
        })),
      setModules: (modules) => set({ modules }),
    }),
    {
      name: 'pos-modules-storage',
      storage: createJSONStorage(() => safeStorage),
    }
  )
)
