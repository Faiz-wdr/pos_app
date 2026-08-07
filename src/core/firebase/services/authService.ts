import { 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth } from '../auth'
import { db } from '../firestore'

export const mapFirebaseError = (error: any): string => {
  const code = error?.code || ''
  const message = error?.message || ''
  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'The sign-in popup was closed before completing. Please try again.'
    case 'auth/popup-blocked':
      return 'The sign-in popup was blocked by your browser. Please allow popups for this site.'
    case 'auth/cancelled-popup-request':
      return 'Sign-in request was cancelled. Please try again.'
    case 'auth/network-request-failed':
      return 'Network connection failed. Please check your internet connectivity.'
    case 'permission-denied':
    case 'firestore/permission-denied':
      return 'Access denied. You do not have permissions to access your user profile.'
    default:
      return message || 'Google Sign-In failed. Please try again.'
  }
}

export const authService = {
  async signInWithGoogle(isMobileOrPWA: boolean): Promise<any> {
    const provider = new GoogleAuthProvider()
    // Always prompt user account selector to avoid auto-selecting locked accounts
    provider.setCustomParameters({
      prompt: 'select_account'
    })
    
    if (isMobileOrPWA) {
      await signInWithRedirect(auth, provider)
      // Redirection triggers, so this function never resolves on mobile/PWA
    } else {
      const result = await signInWithPopup(auth, provider)
      return result.user
    }
  },

  async handleRedirectResult(): Promise<any> {
    const result = await getRedirectResult(auth)
    return result?.user || null
  },

  async syncUserProfile(uid: string, email: string | null, fullName: string | null, photoURL: string | null): Promise<any> {
    const userRef = doc(db, 'users', uid)
    const snapshot = await getDoc(userRef)
    const appVersion = '1.0.0'
    const nowISO = new Date().toISOString()
    
    if (!snapshot.exists()) {
      const newProfile = {
        uid,
        fullName: fullName || '',
        email: email || '',
        photoURL: photoURL || null,
        role: 'user',
        plan: 'free',
        enabledModules: [],
        createdAt: nowISO,
        lastLogin: nowISO,
        lastActivity: nowISO,
        appVersion,
        status: 'active'
      }
      await setDoc(userRef, {
        ...newProfile,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        lastActivity: serverTimestamp()
      })
      return {
        ...newProfile,
        isPremium: false
      }
    } else {
      const data = snapshot.data()
      const updatedData = {
        fullName: fullName || data.fullName || '',
        photoURL: photoURL || data.photoURL || null,
        lastLogin: serverTimestamp(),
        lastActivity: serverTimestamp()
      }
      await updateDoc(userRef, updatedData)
      
      return {
        uid: data.uid,
        fullName: fullName || data.fullName || '',
        email: data.email || email || '',
        photoURL: photoURL || data.photoURL || null,
        role: data.role || 'user',
        plan: data.plan || 'free',
        enabledModules: data.enabledModules || [],
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || nowISO,
        lastLogin: nowISO,
        lastActivity: nowISO,
        appVersion: data.appVersion || appVersion,
        status: data.status || 'active',
        isPremium: data.plan === 'pro' || !!data.isPremium
      }
    }
  },

  async logout(): Promise<void> {
    await signOut(auth)
  }
}
export default authService
