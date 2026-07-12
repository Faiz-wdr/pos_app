import { useState } from 'react'
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
  const [error, setError] = useState<string | null>(null)
  
  const loginWithEmail = async (email: string, password: string) => {
    store.setLoading(true)
    setError(null)
    try {
      const firebaseUser = await authService.loginWithEmail(email, password)
      const profile = await authService.syncUserProfile(firebaseUser.uid, firebaseUser.email, firebaseUser.displayName, false)
      store.login(profile)
      return profile
    } catch (e: any) {
      console.error('Error logging in:', e)
      const mapped = mapFirebaseError(e)
      setError(mapped)
      throw new Error(mapped)
    } finally {
      store.setLoading(false)
    }
  }

  const signupWithEmail = async (email: string, password: string, fullName: string) => {
    store.setLoading(true)
    setError(null)
    try {
      const firebaseUser = await authService.signupWithEmail(email, password)
      const profile = await authService.syncUserProfile(firebaseUser.uid, firebaseUser.email, fullName, true)
      store.login(profile)
      return profile
    } catch (e: any) {
      console.error('Error signing up:', e)
      const mapped = mapFirebaseError(e)
      setError(mapped)
      throw new Error(mapped)
    } finally {
      store.setLoading(false)
    }
  }

  const sendPasswordReset = async (email: string) => {
    store.setLoading(true)
    setError(null)
    try {
      await authService.sendPasswordReset(email)
    } catch (e: any) {
      console.error('Error sending reset email:', e)
      const mapped = mapFirebaseError(e)
      setError(mapped)
      throw new Error(mapped)
    } finally {
      store.setLoading(false)
    }
  }

  const restoreSession = async (firebaseUser: User | null) => {
    if (firebaseUser) {
      try {
        const profile = await authService.syncUserProfile(firebaseUser.uid, firebaseUser.email, firebaseUser.displayName, false)
        store.restoreSession(profile)
      } catch (e) {
        console.error('Error syncing profile on session restore:', e)
        store.restoreSession(serializeFirebaseUser(firebaseUser))
      }
    } else {
      store.restoreSession(null)
    }
  }

  const logout = async () => {
    store.setLoading(true)
    setError(null)
    try {
      await authService.logout()
      store.logout()
    } catch (e: any) {
      console.error('Error during logout:', e)
      setError(mapFirebaseError(e))
    } finally {
      store.setLoading(false)
    }
  }

  const updateProfile = async (fullName: string, email: string, password?: string) => {
    store.setLoading(true)
    setError(null)
    try {
      const updatedProfile = await authService.updateUserProfile(fullName, email, password)
      store.login(updatedProfile)
      return updatedProfile
    } catch (e: any) {
      console.error('Error updating profile:', e)
      const mapped = mapFirebaseError(e)
      setError(mapped)
      throw new Error(mapped)
    } finally {
      store.setLoading(false)
    }
  }

  const resetAuth = () => {
    setError(null)
  }

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isGuest: store.isGuest,
    loading: store.loading,
    isAuthSheetOpen: store.isAuthSheetOpen,
    authSheetTitle: store.authSheetTitle,
    authSheetDescription: store.authSheetDescription,
    authSuccessCallback: store.authSuccessCallback,
    loginWithEmail,
    signupWithEmail,
    sendPasswordReset,
    logout,
    updateProfile,
    restoreSession,
    setLoading: store.setLoading,
    openAuthSheet: store.openAuthSheet,
    closeAuthSheet: store.closeAuthSheet,
    error,
    setError,
    resetAuth
  }
}
