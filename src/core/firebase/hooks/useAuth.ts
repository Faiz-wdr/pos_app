import { useAuthStore, SerializedUser } from '../stores/authStore'
import { authService, mapFirebaseError } from '../services/authService'
import { User } from 'firebase/auth'

export const serializeFirebaseUser = (user: User): SerializedUser => ({
  uid: user.uid,
  fullName: user.displayName || '',
  email: user.email,
  photoURL: user.photoURL,
  createdAt: user.metadata.creationTime || new Date().toISOString()
})

export const useAuth = () => {
  const store = useAuthStore()

  const loginWithGoogle = async () => {
    store.setLoading(true)
    store.setError(null)
    try {
      const isMobileUA = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isMobileOrPWA = isMobileUA || isStandalone

      const firebaseUser = await authService.signInWithGoogle(isMobileOrPWA)
      if (firebaseUser) {
        const profile = await authService.syncUserProfile(
          firebaseUser.uid,
          firebaseUser.email,
          firebaseUser.displayName,
          firebaseUser.photoURL
        )
        store.login(profile)
        return profile
      }
    } catch (e: any) {
      console.error('Error logging in with Google:', e)
      const mapped = mapFirebaseError(e)
      store.setError(mapped)
      throw new Error(mapped)
    } finally {
      store.setLoading(false)
    }
  }

  const restoreSession = async (firebaseUser: User | null) => {
    if (firebaseUser) {
      try {
        const profile = await authService.syncUserProfile(
          firebaseUser.uid,
          firebaseUser.email,
          firebaseUser.displayName,
          firebaseUser.photoURL
        )
        store.restoreSession(profile)
      } catch (e) {
        console.error('Error syncing profile on session restore:', e)
        const isLocalPro = localStorage.getItem('personalos_pro_activated_' + firebaseUser.uid) === 'true'
        store.restoreSession({
          ...serializeFirebaseUser(firebaseUser),
          isPremium: isLocalPro
        })
      }
    } else {
      store.restoreSession(null)
    }
  }

  const logout = async () => {
    store.setLoading(true)
    store.setError(null)
    try {
      await authService.logout()
      store.logout()
    } catch (e: any) {
      console.error('Error during logout:', e)
      store.setError(mapFirebaseError(e))
    } finally {
      store.setLoading(false)
    }
  }

  const resetAuth = () => {
    store.setError(null)
  }

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isGuest: store.isGuest,
    loading: store.loading,
    error: store.error,
    isAuthSheetOpen: store.isAuthSheetOpen,
    authSheetTitle: store.authSheetTitle,
    authSheetDescription: store.authSheetDescription,
    authSuccessCallback: store.authSuccessCallback,
    loginWithGoogle,
    logout,
    restoreSession,
    setLoading: store.setLoading,
    openAuthSheet: store.openAuthSheet,
    closeAuthSheet: store.closeAuthSheet,
    setError: store.setError,
    resetAuth
  }
}
