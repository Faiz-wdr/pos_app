import { useEffect, useState, useCallback, useRef } from 'react'

export const useAutoHide = (enabled: boolean, delay = 5000) => {
  const [isVisible, setIsVisible] = useState(true)
  const timerRef = useRef<any>(null)

  const showControls = useCallback(() => {
    setIsVisible(true)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    if (enabled) {
      timerRef.current = setTimeout(() => {
        setIsVisible(false)
      }, delay)
    }
  }, [enabled, delay])

  useEffect(() => {
    if (!enabled) {
      setIsVisible(true)
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      return
    }

    // Initial trigger
    showControls()

    const events = ['mousemove', 'mousedown', 'pointerdown', 'touchstart', 'keydown']
    const handleActivity = () => showControls()

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [enabled, showControls])

  return { isVisible, showControls }
}
export default useAutoHide
