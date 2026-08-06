import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { safeStorage } from '@/core/storage/storage'

export interface SerializedUser {
  uid: string
  fullName: string | null
  email: string | null
  photoURL: string | null
  createdAt: string
  lastLogin?: string
  isPremium?: boolean
  enabledModules?: string[]
  role?: string
  status?: 'active' | 'suspended'
}

interface AuthState {
  user: SerializedUser | null
  isAuthenticated: boolean
  isGuest: boolean
  loading: boolean
  
  // UI triggers for the global bottom sheet
  isAuthSheetOpen: boolean
  authSheetTitle: string
  authSheetDescription: string
  authSuccessCallback: (() => void) | null

  error: string | null
  setError: (error: string | null) => void

  login: (user: SerializedUser) => void
  signup: (user: SerializedUser) => void
  logout: () => void
  restoreSession: (user: SerializedUser | null) => void
  setLoading: (loading: boolean) => void
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
      error: null,
      isAuthSheetOpen: false,
      authSheetTitle: 'Welcome',
      authSheetDescription: 'Sign in to unlock premium modules and sync your data across devices.',
      authSuccessCallback: null,

      setError: (error) => set({ error }),
      login: (user) => set({ 
        user, 
        isAuthenticated: true, 
        isGuest: false,
        error: null
      }),
      signup: (user) => set({ 
        user, 
        isAuthenticated: true, 
        isGuest: false,
        error: null
      }),
      logout: () => set({ 
        user: null, 
        isAuthenticated: false, 
        isGuest: true,
        isAuthSheetOpen: false, 
        authSuccessCallback: null,
        error: null
      }),
      restoreSession: (user) => set({ 
        user, 
        isAuthenticated: user !== null, 
        isGuest: user === null,
        error: null
      }),
      setLoading: (loading) => set({ loading }),
      openAuthSheet: (options) => set({
        isAuthSheetOpen: true,
        error: null,
        authSheetTitle: options?.title || 'Welcome',
        authSheetDescription: options?.description || 'Sign in to unlock premium modules and sync your data across devices.',
        authSuccessCallback: options?.onSuccess || null
      }),
      closeAuthSheet: () => set({ isAuthSheetOpen: false, authSuccessCallback: null, error: null })
    }),
    {
      name: 'pos-auth-storage',
      storage: createJSONStorage(() => safeStorage),
      // Persist only essential authentication state properties
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isGuest: state.isGuest
      })
    }
  )
)
export default useAuthStore
