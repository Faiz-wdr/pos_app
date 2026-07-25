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

const VALID_MODULE_IDS = ['clock', 'shopping', 'income', 'day-planner']

export const useModuleStore = create<ModuleState>()(
  persist(
    (set) => ({
      modules: [], // Empty by default
      registerModule: (module) =>
        set((state) => {
          if (!VALID_MODULE_IDS.includes(module.id)) {
            return state
          }
          // Filter out obsolete/removed modules from persisted localStorage (e.g. 'diet-planner')
          const cleanModules = (state.modules || []).filter((m) => VALID_MODULE_IDS.includes(m.id))
          const existingIndex = cleanModules.findIndex((m) => m.id === module.id)

          if (existingIndex >= 0) {
            const updated = [...cleanModules]
            updated[existingIndex] = {
              ...module,
              enabled: cleanModules[existingIndex].enabled
            }
            return { modules: updated }
          }
          return { modules: [...cleanModules, module] }
        }),
      toggleModule: (id, enabled) =>
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === id ? { ...m, enabled } : m
          ),
        })),
      setModules: (modules) => set({ modules: modules.filter((m) => VALID_MODULE_IDS.includes(m.id)) }),
    }),
    {
      name: 'pos-modules-storage',
      storage: createJSONStorage(() => safeStorage),
    }
  )
)
