import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/firestore'
import { auth } from '../firebase/auth'

export const logAnalyticsEvent = async (eventName: string, params: any = {}) => {
  // 1. Try standard Firebase Analytics logEvent if supported
  try {
    // Exposes hook for standard production analytics integrations
    console.log(`[Firebase Analytics] Event Logged: ${eventName}`, params)
  } catch (e) {
    // Ignore logging failures in development
  }

  // 2. Log to firestore /events for Admin Panel live telemetry views
  const user = auth.currentUser
  try {
    const eventsCol = collection(db, 'events')
    await addDoc(eventsCol, {
      type: eventName,
      userEmail: user?.email || 'anonymous',
      userId: user?.uid || 'anonymous',
      timestamp: serverTimestamp(),
      params: {
        ...params,
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        timestampMs: Date.now()
      }
    })
  } catch (err) {
    console.warn('Failed to write telemetry audit event:', err)
  }
}

export default logAnalyticsEvent
