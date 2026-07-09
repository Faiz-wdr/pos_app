import { useEffect, useState } from 'react'

export const useClockTime = () => {
  const [time, setTime] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return time
}
export default useClockTime
