import React from 'react'
import { motion } from 'framer-motion'
import { ClockThemeProps } from './themeInterface'

export const SwissAnalogClock: React.FC<ClockThemeProps> = ({
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
      <div className={`relative rounded-full border-4 border-neutral-900 bg-white dark:bg-neutral-100 shadow-xl flex items-center justify-center transition-all duration-300 ${
        isLandscapeMode 
          ? 'w-72 h-72 sm:w-80 sm:h-80 md:w-[24rem] md:h-[24rem] lg:w-[28rem] lg:h-[28rem]' 
          : 'w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80'
      }`}>
        
        {/* Swiss Ticks */}
        {[...Array(60)].map((_, i) => {
          const isMajor = i % 5 === 0
          const isHour = i % 15 === 0
          return (
            <div
              key={i}
              className={`absolute bg-neutral-950 transition-all ${
                isHour 
                  ? 'w-[5px] h-[18px]' 
                  : isMajor 
                  ? 'w-[3.5px] h-[14px]' 
                  : 'w-[1px] h-[5px] opacity-70'
              }`}
              style={{
                transform: `rotate(${i * 6}deg) translateY(${isLandscapeMode ? '-120px' : '-96px'})`
              }}
            />
          )
        })}

        {/* Dial Face SVG */}
        <svg className="w-full h-full transform -rotate-90 select-none pointer-events-none absolute inset-0" viewBox="0 0 200 200">
          
          {/* Hour Hand: thick black rectangle */}
          <motion.line
            x1="100"
            y1="100"
            x2="140"
            y2="100"
            stroke="#111111"
            strokeWidth="7"
            strokeLinecap="square"
            animate={{ rotate: hourAngle }}
            transition={seconds === 0 ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 20 }}
            style={{ originX: '100px', originY: '100px' }}
          />

          {/* Minute Hand: longer, slightly thinner black rectangle */}
          <motion.line
            x1="100"
            y1="100"
            x2="175"
            y2="100"
            stroke="#111111"
            strokeWidth="5"
            strokeLinecap="square"
            animate={{ rotate: minuteAngle }}
            transition={seconds === 0 ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 25 }}
            style={{ originX: '100px', originY: '100px' }}
          />

          {/* Red Sweep Second Hand with circle tip */}
          {showSeconds && (
            <motion.g
              animate={{ rotate: secondAngle }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{ originX: '100px', originY: '100px' }}
            >
              {/* Main Red Rod */}
              <line
                x1="80"
                y1="100"
                x2="162"
                y2="100"
                stroke="#c22"
                strokeWidth="1.8"
              />
              {/* Balance Counterweight tail */}
              <line
                x1="100"
                y1="100"
                x2="75"
                y2="100"
                stroke="#c22"
                strokeWidth="2.8"
              />
              {/* Iconic Red Circle Tip */}
              <circle cx="162" cy="100" r="4.5" fill="#c22" />
            </motion.g>
          )}

          {/* Center black hub */}
          <circle cx="100" cy="100" r="5" fill="#111111" />
        </svg>

      </div>
    </div>
  )
}
export default SwissAnalogClock
