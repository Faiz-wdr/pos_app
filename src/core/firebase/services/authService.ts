import { 
  signInWithPhoneNumber, 
  RecaptchaVerifier, 
  signOut,
  ConfirmationResult
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth } from '../auth'
import { db } from '../firestore'

let currentConfirmationResult: ConfirmationResult | null = null
let currentRecaptchaVerifier: RecaptchaVerifier | null = null

export const mapFirebaseError = (error: any): string => {
  const code = error?.code || ''
  const message = error?.message || ''
  switch (code) {
    case 'auth/invalid-phone-number':
      return 'Please enter a valid phone number (e.g. +91 98765 43210).'
    case 'auth/missing-phone-number':
      return 'Phone number is required.'
    case 'auth/too-many-requests':
      return 'Too many requests. Please wait a few minutes before trying again.'
    case 'auth/invalid-verification-code':
      return 'The code entered is incorrect. Please check the SMS and retry.'
    case 'auth/code-expired':
      return 'Verification code expired. Please request a new one.'
    case 'auth/network-request-failed':
      return 'Connection failed. Please check your internet connectivity.'
    case 'auth/app-not-authorized':
      return 'This domain is not authorized in the Firebase Console. Please add this URL/domain under Firebase Console -> Authentication -> Settings -> Authorized Domains.'
    case 'auth/invalid-app-credential':
      return 'Invalid application credentials. Check your Firebase API key configuration.'
    case 'auth/operation-not-allowed':
      return 'Phone Authentication is disabled in your Firebase Project. Please go to the Firebase Console -> Authentication -> Sign-in Method, and enable the "Phone" sign-in provider.'
    default:
      return `Verification failed: ${code || message || 'Please check details and try again.'}`
  }
}

export const authService = {
  setupRecaptcha(containerId: string): RecaptchaVerifier {
    if (currentRecaptchaVerifier) {
      try {
        currentRecaptchaVerifier.clear()
      } catch (e) {
        console.warn('Error clearing recaptcha verifier:', e)
      }
      currentRecaptchaVerifier = null
    }

    const container = document.getElementById(containerId)
    if (container) {
      container.innerHTML = ''
    }

    currentRecaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        // Recaptcha expired
      }
    })

    return currentRecaptchaVerifier
  },

  async sendOtp(phoneNumber: string, verifier: RecaptchaVerifier): Promise<void> {
    currentConfirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier)
  },

  async verifyOtp(otp: string): Promise<any> {
    if (!currentConfirmationResult) {
      throw new Error('No active verification session. Please request a code first.')
    }
    const credential = await currentConfirmationResult.confirm(otp)
    currentConfirmationResult = null // Clear SMS session
    return credential.user
  },

  async syncUserProfile(uid: string, phoneNumber: string | null): Promise<any> {
    const userRef = doc(db, 'users', uid)
    const snapshot = await getDoc(userRef)
    
    if (!snapshot.exists()) {
      const newProfile = {
        uid,
        phoneNumber,
        displayName: '',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isPremium: false,
        enabledModules: []
      }
      await setDoc(userRef, {
        ...newProfile,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      })
      return newProfile
    } else {
      await updateDoc(userRef, {
        lastLogin: serverTimestamp()
      })
      const data = snapshot.data()
      return {
        uid: data.uid,
        phoneNumber: data.phoneNumber || phoneNumber,
        displayName: data.displayName || '',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isPremium: !!data.isPremium,
        enabledModules: data.enabledModules || []
      }
    }
  },

  async logout(): Promise<void> {
    await signOut(auth)
    currentConfirmationResult = null
    if (currentRecaptchaVerifier) {
      try {
        currentRecaptchaVerifier.clear()
      } catch (e) {
        // Ignore clear errors on teardown
      }
      currentRecaptchaVerifier = null
    }
  }
}
