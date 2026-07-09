import { useState, useEffect } from 'react'

export const useDeviceOrientation = () => {
  const [isLandscape, setIsLandscape] = useState(
    window.innerWidth > window.innerHeight
  )

  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight)
    }
    
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    
    handleResize()
    
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  return isLandscape
}
export default useDeviceOrientation
