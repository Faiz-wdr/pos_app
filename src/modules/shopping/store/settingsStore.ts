import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { safeStorage } from '@/core/storage/storage'
import { ShoppingSettings, ShoppingSortType } from '../types'

interface ShoppingSettingsState extends ShoppingSettings {
  setDefaultSort: (sort: ShoppingSortType) => void
  setDefaultUnit: (unit: string) => void
  setCurrency: (currency: string) => void
  setShowEstimatedPrice: (show: boolean) => void
  setShowActualPrice: (show: boolean) => void
  setConfirmDelete: (confirm: boolean) => void
}

export const useShoppingSettingsStore = create<ShoppingSettingsState>()(
  persist(
    (set) => ({
      defaultSort: 'manual',
      defaultUnit: 'Piece',
      currency: '$',
      showEstimatedPrice: true,
      showActualPrice: true,
      confirmDelete: true,

      setDefaultSort: (defaultSort) => set({ defaultSort }),
      setDefaultUnit: (defaultUnit) => set({ defaultUnit }),
      setCurrency: (currency) => set({ currency }),
      setShowEstimatedPrice: (showEstimatedPrice) => set({ showEstimatedPrice }),
      setShowActualPrice: (showActualPrice) => set({ showActualPrice }),
      setConfirmDelete: (confirmDelete) => set({ confirmDelete }),
    }),
    {
      name: 'pos-shopping-settings',
      storage: createJSONStorage(() => safeStorage),
    }
  )
)
export default useShoppingSettingsStore
