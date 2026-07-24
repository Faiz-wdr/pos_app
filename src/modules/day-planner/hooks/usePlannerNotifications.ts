import { useState, useEffect } from 'react'

export const usePlannerNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false
    }

    try {
      const res = await Notification.requestPermission()
      setPermission(res)
      return res === 'granted'
    } catch (e) {
      console.error('Failed to request notification permission:', e)
      return false
    }
  }

  const triggerNotification = (title: string, body?: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico'
        })
      } catch (e) {
        console.error('Error firing notification:', e)
      }
    }
  }

  return {
    permission,
    requestPermission,
    triggerNotification,
    isSupported: typeof window !== 'undefined' && 'Notification' in window
  }
}
