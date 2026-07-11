import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth } from '../auth'
import { db } from '../firestore'

export const mapFirebaseError = (error: any): string => {
  const code = error?.code || ''
  const message = error?.message || ''
  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/user-disabled':
      return 'This user account has been disabled. Please contact support.'
    case 'auth/user-not-found':
      return 'No account found with this email. Please check the spelling or sign up.'
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.'
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address. Please log in instead.'
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.'
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please try again later.'
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please check your credentials.'
    case 'auth/network-request-failed':
      return 'Connection failed. Please check your internet connectivity.'
    case 'permission-denied':
    case 'firestore/permission-denied':
      return 'Firestore permissions denied. Please make sure you have initialized a Firestore Database in your Firebase Console and updated your Security Rules to allow user document operations.'
    default:
      return message || 'Authentication failed. Please check your details and try again.'
  }
}

export const authService = {
  async loginWithEmail(email: string, password: string): Promise<any> {
    const credential = await signInWithEmailAndPassword(auth, email, password)
    return credential.user
  },

  async signupWithEmail(email: string, password: string): Promise<any> {
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    return credential.user
  },

  async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email)
  },

  async syncUserProfile(uid: string, email: string | null, fullName: string | null, isNew: boolean): Promise<any> {
    const userRef = doc(db, 'users', uid)
    
    if (isNew) {
      const newProfile = {
        uid,
        fullName: fullName || '',
        email,
        photoURL: null,
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
      const snapshot = await getDoc(userRef)
      if (snapshot.exists()) {
        const data = snapshot.data()
        return {
          uid: data.uid,
          fullName: data.fullName || fullName || '',
          email: data.email || email,
          photoURL: data.photoURL || null,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          isPremium: !!data.isPremium,
          enabledModules: data.enabledModules || []
        }
      } else {
        // Fallback profile if Firestore sync fails to find doc
        return {
          uid,
          fullName: fullName || '',
          email,
          photoURL: null,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          isPremium: false,
          enabledModules: []
        }
      }
    }
  },

  async logout(): Promise<void> {
    await signOut(auth)
  }
}
export default authService
