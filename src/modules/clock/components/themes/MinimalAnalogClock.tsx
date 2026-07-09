import React from 'react'
import { motion } from 'framer-motion'
import { ClockThemeProps } from './themeInterface'

export const MinimalAnalogClock: React.FC<ClockThemeProps> = ({
  time,
  showSeconds,
  isLandscapeMode
}) => {
  const hours = time.getHours()
  const minutes = time.getMinutes()
  const seconds = time.getSeconds()

  const secondAngle = seconds * 6
  const minuteAngle = minutes * 6 + seconds * 0.1
  const hourAngle = (hours % 12) * 30 + minutes * 0.5

  return (
    <div className="flex flex-col items-center justify-center w-full select-none py-4">
      <div className={`relative rounded-full border-2 border-border/40 bg-card/25 shadow-xl flex items-center justify-center transition-all duration-300 ${
        isLandscapeMode 
          ? 'w-72 h-72 sm:w-80 sm:h-80 md:w-[24rem] md:h-[24rem] lg:w-[28rem] lg:h-[28rem]' 
          : 'w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80'
      }`}>
        
        {/* Hour dots */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full bg-foreground/40 dark:bg-foreground/50 ${
              i % 3 === 0 ? 'w-1.5 h-1.5' : 'w-1 h-1'
            }`}
            style={{
              transform: `rotate(${i * 30}deg) translateY(${isLandscapeMode ? '-120px' : '-96px'})`
            }}
          />
        ))}

        {/* Dial Face SVG */}
        <svg className="w-full h-full transform -rotate-90 select-none pointer-events-none absolute inset-0" viewBox="0 0 200 200">
          
          {/* Hour Hand */}
          <motion.line
            x1="100"
            y1="100"
            x2="142"
            y2="100"
            stroke="currentColor"
            strokeWidth="3.5"
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
            strokeWidth="2.2"
            strokeLinecap="round"
            className="text-foreground/75 dark:text-foreground/85"
            animate={{ rotate: minuteAngle }}
            transition={seconds === 0 ? { duration: 0 } : { type: 'spring', stiffness: 200, damping: 25 }}
            style={{ originX: '100px', originY: '100px' }}
          />

          {/* Second Hand */}
          {showSeconds && (
            <motion.g
              animate={{ rotate: secondAngle }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              style={{ originX: '100px', originY: '100px' }}
            >
              <line
                x1="100"
                y1="100"
                x2="175"
                y2="100"
                stroke="#f8b518" // Accent color
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </motion.g>
          )}

          {/* Center Hub */}
          <circle cx="100" cy="100" r="3.5" fill="#f8b518" />
          <circle cx="100" cy="100" r="1.5" className="fill-background" />
        </svg>

      </div>
    </div>
  )
}
export default MinimalAnalogClock
