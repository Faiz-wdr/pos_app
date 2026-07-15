import { useEffect, useRef } from 'react'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/core/firebase/firestore'
import { auth } from '@/core/firebase/auth'

declare const __APP_VERSION__: string

export const useUserHeartbeat = () => {
  const intervalRef = useRef<any>(null)

  useEffect(() => {
    const getDeviceType = () => {
      const width = window.innerWidth
      if (width < 640) return 'mobile'
      if (width < 1024) return 'tablet'
      return 'desktop'
    }

    const getBrowserName = () => {
      const ua = navigator.userAgent
      if (ua.includes('Chrome') && !ua.includes('Chromium') && !ua.includes('Edg')) return 'Chrome'
      if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari'
      if (ua.includes('Firefox')) return 'Firefox'
      if (ua.includes('Edg')) return 'Edge'
      return 'Browser'
    }

    const updateHeartbeat = async () => {
      const currentUser = auth.currentUser
      if (!currentUser) return

      try {
        const userRef = doc(db, 'users', currentUser.uid)
        await updateDoc(userRef, {
          lastActivity: serverTimestamp(),
          appVersion: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0',
          device: getDeviceType(),
          browser: getBrowserName()
        })
      } catch (e) {
        console.warn('Failed to update heartbeat:', e)
      }
    }

    const startHeartbeat = () => {
      updateHeartbeat() // Update immediately
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = setInterval(updateHeartbeat, 60 * 1000)
    }

    const stopHeartbeat = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    // Auth state listener
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        startHeartbeat()
      } else {
        stopHeartbeat()
      }
    })

    // Visibility change listener (stops heartbeat when tab is inactive/closed)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        startHeartbeat()
      } else {
        stopHeartbeat()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      unsubscribeAuth()
      stopHeartbeat()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])
}

export default useUserHeartbeat
