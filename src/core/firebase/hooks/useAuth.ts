import { useState } from 'react'
import { useAuthStore, SerializedUser } from '../stores/authStore'
import { authService, mapFirebaseError } from '../services/authService'
import { User } from 'firebase/auth'

export const serializeFirebaseUser = (user: User): SerializedUser => ({
  uid: user.uid,
  phoneNumber: user.phoneNumber,
  displayName: user.displayName,
  photoURL: user.photoURL,
  email: user.email,
  createdAt: user.metadata.creationTime || new Date().toISOString()
})

export const useAuth = () => {
  const store = useAuthStore()
  const [error, setError] = useState<string | null>(null)
  const [authStep, setAuthStep] = useState<'phone' | 'otp'>('phone')
  
  const setupRecaptcha = (containerId: string) => {
    setError(null)
    return authService.setupRecaptcha(containerId)
  }

  const sendOtp = async (phoneNumber: string, containerId: string) => {
    store.setLoading(true)
    setError(null)
    try {
      const verifier = setupRecaptcha(containerId)
      await authService.sendOtp(phoneNumber, verifier)
      store.setPhoneNumber(phoneNumber)
      setAuthStep('otp')
    } catch (e: any) {
      console.error('Error sending SMS OTP:', e)
      const mapped = mapFirebaseError(e)
      setError(mapped)
      throw new Error(mapped)
    } finally {
      store.setLoading(false)
    }
  }

  const verifyOtp = async (code: string) => {
    store.setLoading(true)
    setError(null)
    try {
      const firebaseUser = await authService.verifyOtp(code)
      // Create user profile document in Firestore or update lastLogin
      const profile = await authService.syncUserProfile(firebaseUser.uid, firebaseUser.phoneNumber)
      
      // Store globally using Zustand actions
      store.login(profile)
      setError(null)
      setAuthStep('phone') // Reset step for next flow
      return profile
    } catch (e: any) {
      console.error('Error verifying SMS OTP:', e)
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
        const profile = await authService.syncUserProfile(firebaseUser.uid, firebaseUser.phoneNumber)
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

  const resetAuth = () => {
    setError(null)
    setAuthStep('phone')
  }

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isGuest: store.isGuest,
    loading: store.loading,
    phoneNumber: store.phoneNumber,
    isAuthSheetOpen: store.isAuthSheetOpen,
    authSheetTitle: store.authSheetTitle,
    authSheetDescription: store.authSheetDescription,
    authSuccessCallback: store.authSuccessCallback,
    login: store.login,
    logout,
    restoreSession,
    setLoading: store.setLoading,
    openAuthSheet: store.openAuthSheet,
    closeAuthSheet: store.closeAuthSheet,
    error,
    authStep,
    setAuthStep,
    sendOtp,
    verifyOtp,
    resetAuth
  }
}
