import { useEffect, useRef, useState, useCallback } from 'react'

export const useWakeLock = () => {
  const [isSupported, setIsSupported] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const wakeLockRef = useRef<any>(null) // Use any for WakeLockSentinel type safety across environments

  useEffect(() => {
    setIsSupported('wakeLock' in navigator)
  }, [])

  const request = useCallback(async () => {
    if (!('wakeLock' in navigator)) return false

    try {
      // Re-use current lock if it exists
      if (wakeLockRef.current) return true
      
      const wakeLock = await (navigator as any).wakeLock.request('screen')
      wakeLockRef.current = wakeLock
      setIsActive(true)

      wakeLock.addEventListener('release', () => {
        wakeLockRef.current = null
        setIsActive(false)
      })

      return true
    } catch (err) {
      console.warn('Failed to acquire screen wake lock:', err)
      setIsActive(false)
      return false
    }
  }, [])

  const release = useCallback(async () => {
    if (!wakeLockRef.current) return

    try {
      await wakeLockRef.current.release()
      wakeLockRef.current = null
      setIsActive(false)
    } catch (err) {
      console.warn('Failed to release screen wake lock:', err)
    }
  }, [])

  // Auto re-acquire wake lock if active and page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (isActive && document.visibilityState === 'visible') {
        await request()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isActive, request])

  return {
    isSupported,
    isActive,
    request,
    release
  }
}
