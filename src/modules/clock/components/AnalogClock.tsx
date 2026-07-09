import { motion } from 'framer-motion'
import { useClockTime } from '../hooks/useClockTime'
import { useClockStore } from '../store/clockStore'

export const AnalogClock = () => {
  const time = useClockTime()
  const showSeconds = useClockStore((state) => state.showSeconds)

  const hours = time.getHours()
  const minutes = time.getMinutes()
  const seconds = time.getSeconds()

  // Calculate angles
  const secondAngle = seconds * 6
  const minuteAngle = minutes * 6 + seconds * 0.1
  const hourAngle = (hours % 12) * 30 + minutes * 0.5

  return (
    <div className="flex flex-col items-center justify-center py-6 w-full select-none">
      <div className="relative w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-full border-4 border-border bg-card/40 dark:bg-card/25 shadow-md flex items-center justify-center transition-colors duration-300">
        
        {/* Hour Markers (Ticks) */}
        {[...Array(12)].map((_, i) => {
          const isMajor = i % 3 === 0
          return (
            <div
              key={i}
              className={`absolute rounded-full transition-colors duration-300 ${
                isMajor 
                  ? 'w-2 h-2 bg-foreground/60 dark:bg-foreground/75' 
                  : 'w-1 h-1 bg-muted-foreground/30 dark:bg-muted-foreground/50'
              }`}
              style={{
                transform: `rotate(${i * 30}deg) translateY(-105px)`
              }}
            />
          )
        })}

        {/* Hands Container */}
        <svg className="w-full h-full transform -rotate-90 select-none pointer-events-none" viewBox="0 0 200 200">
          
          {/* Hour Hand */}
          <motion.line
            x1="100"
            y1="100"
            x2="142"
            y2="100"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            className="text-foreground/80 dark:text-foreground/90"
            animate={{ rotate: hourAngle }}
            transition={seconds === 0 ? { duration: 0 } : { type: 'spring', stiffness: 200, damping: 20 }}
            style={{ originX: '100px', originY: '100px' }}
          />

          {/* Minute Hand */}
          <motion.line
            x1="100"
            y1="100"
            x2="168"
            y2="100"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            className="text-foreground/70 dark:text-foreground/80"
            animate={{ rotate: minuteAngle }}
            transition={seconds === 0 ? { duration: 0 } : { type: 'spring', stiffness: 200, damping: 25 }}
            style={{ originX: '100px', originY: '100px' }}
          />

          {/* Second Hand */}
          {showSeconds && (
            <motion.g
              animate={{ rotate: secondAngle }}
              transition={{ type: 'spring', stiffness: 280, damping: 20 }}
              style={{ originX: '100px', originY: '100px' }}
            >
              {/* Main Sweep Line */}
              <line
                x1="100"
                y1="100"
                x2="175"
                y2="100"
                stroke="#f8b518" // Accent color
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              {/* Balance Counterweight tail */}
              <line
                x1="100"
                y1="100"
                x2="78"
                y2="100"
                stroke="#f8b518"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </motion.g>
          )}

          {/* Center Pin Hub */}
          <circle cx="100" cy="100" r="5" fill="#f8b518" />
          <circle cx="100" cy="100" r="2.5" className="fill-background" />
        </svg>

      </div>
    </div>
  )
}
export default AnalogClock
