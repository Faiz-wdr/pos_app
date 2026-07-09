import React from 'react'
import { motion } from 'framer-motion'
import { ClockThemeProps } from './themeInterface'

export const ModernAnalogClock: React.FC<ClockThemeProps> = ({
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

  const numerals = ['3', '6', '9', '12']

  return (
    <div className="flex flex-col items-center justify-center w-full select-none py-4">
      <div className={`relative rounded-full border border-border/80 bg-neutral-950 dark:bg-neutral-900/90 shadow-2xl flex items-center justify-center transition-all duration-300 ${
        isLandscapeMode 
          ? 'w-72 h-72 sm:w-80 sm:h-80 md:w-[24rem] md:h-[24rem] lg:w-[28rem] lg:h-[28rem]' 
          : 'w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80'
      }`}>
        
        {/* Soft radial glow inside the dial */}
        <div className="absolute inset-4 rounded-full bg-radial from-accent/10 to-transparent pointer-events-none opacity-80" />

        {/* Hour Numbers at 3, 6, 9, 12 */}
        {numerals.map((num, i) => {
          const rotationAngle = (i + 1) * 90
          return (
            <div
              key={num}
              className="absolute text-foreground font-black text-sm md:text-base select-text"
              style={{
                transform: `rotate(${rotationAngle}deg) translateY(${isLandscapeMode ? '-105px' : '-85px'}) rotate(-${rotationAngle}deg)`
              }}
            >
              {num}
            </div>
          )
        })}

        {/* Minute Ticks */}
        {[...Array(12)].map((_, i) => {
          if (i % 3 === 0) return null // Skip numbers positions
          return (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-accent/35"
              style={{
                transform: `rotate(${i * 30}deg) translateY(${isLandscapeMode ? '-110px' : '-90px'})`
              }}
            />
          )
        })}

        {/* Dial Face SVG */}
        <svg className="w-full h-full transform -rotate-90 select-none pointer-events-none absolute inset-0" viewBox="0 0 200 200">
          
          {/* Hour Hand: sleek tapered metal pointer */}
          <motion.path
            d="M 100 96 L 148 100 L 100 104 Z"
            fill="currentColor"
            className="text-foreground/90"
            animate={{ rotate: hourAngle }}
            transition={seconds === 0 ? { duration: 0 } : { type: 'spring', stiffness: 200, damping: 20 }}
            style={{ originX: '100px', originY: '100px' }}
          />

          {/* Minute Hand: longer, thinner tapered pointer */}
          <motion.path
            d="M 100 98 L 178 100 L 100 102 Z"
            fill="currentColor"
            className="text-foreground/80"
            animate={{ rotate: minuteAngle }}
            transition={seconds === 0 ? { duration: 0 } : { type: 'spring', stiffness: 200, damping: 25 }}
            style={{ originX: '100px', originY: '100px' }}
          />

          {/* Second Hand: glowing accent sweep line */}
          {showSeconds && (
            <motion.g
              animate={{ rotate: secondAngle }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              style={{ originX: '100px', originY: '100px' }}
            >
              <line
                x1="80"
                y1="100"
                x2="182"
                y2="100"
                stroke="#f8b518"
                strokeWidth="1.5"
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 2px #f8b518)' }}
              />
            </motion.g>
          )}

          {/* Center Hub */}
          <circle cx="100" cy="100" r="5" fill="#f8b518" />
          <circle cx="100" cy="100" r="2.5" className="fill-neutral-950" />
        </svg>

      </div>
    </div>
  )
}
export default ModernAnalogClock
