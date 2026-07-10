import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { safeStorage } from '@/core/storage/storage'

export interface SerializedUser {
  uid: string
  phoneNumber: string | null
  displayName: string | null
  photoURL: string | null
  email: string | null
  createdAt: string
  lastLogin?: string
  isPremium?: boolean
  enabledModules?: string[]
}

interface AuthState {
  user: SerializedUser | null
  isAuthenticated: boolean
  isGuest: boolean
  loading: boolean
  phoneNumber: string
  
  // UI triggers for global bottom sheet
  isAuthSheetOpen: boolean
  authSheetTitle: string
  authSheetDescription: string
  authSuccessCallback: (() => void) | null

  login: (user: SerializedUser) => void
  logout: () => void
  restoreSession: (user: SerializedUser | null) => void
  setLoading: (loading: boolean) => void
  setPhoneNumber: (phone: string) => void
  openAuthSheet: (options?: { title?: string; description?: string; onSuccess?: () => void }) => void
  closeAuthSheet: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isGuest: true,
      loading: false,
      phoneNumber: '',
      isAuthSheetOpen: false,
      authSheetTitle: 'Welcome',
      authSheetDescription: 'Sign in to unlock premium modules and sync your data across devices.',
      authSuccessCallback: null,

      login: (user) => set({ 
        user, 
        isAuthenticated: true, 
        isGuest: false,
        phoneNumber: user.phoneNumber || ''
      }),
      logout: () => set({ 
        user: null, 
        isAuthenticated: false, 
        isGuest: true,
        phoneNumber: '',
        isAuthSheetOpen: false, 
        authSuccessCallback: null 
      }),
      restoreSession: (user) => set({ 
        user, 
        isAuthenticated: user !== null, 
        isGuest: user === null,
        phoneNumber: user?.phoneNumber || ''
      }),
      setLoading: (loading) => set({ loading }),
      setPhoneNumber: (phoneNumber) => set({ phoneNumber }),
      openAuthSheet: (options) => set({
        isAuthSheetOpen: true,
        authSheetTitle: options?.title || 'Welcome',
        authSheetDescription: options?.description || 'Sign in to unlock premium modules and sync your data across devices.',
        authSuccessCallback: options?.onSuccess || null
      }),
      closeAuthSheet: () => set({ isAuthSheetOpen: false, authSuccessCallback: null })
    }),
    {
      name: 'pos-auth-storage',
      storage: createJSONStorage(() => safeStorage),
      // Persist only essential authentication state properties
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isGuest: state.isGuest,
        phoneNumber: state.phoneNumber
      })
    }
  )
)
export default useAuthStore
