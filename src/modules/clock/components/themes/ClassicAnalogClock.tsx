import React from 'react'
import { motion } from 'framer-motion'
import { ClockThemeProps } from './themeInterface'

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

export const ClassicAnalogClock: React.FC<ClockThemeProps> = ({
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
      <div className={`relative rounded-full border-[6px] border-amber-950 bg-stone-100 dark:bg-stone-200/90 shadow-2xl flex items-center justify-center transition-all duration-300 ${
        isLandscapeMode 
          ? 'w-72 h-72 sm:w-80 sm:h-80 md:w-[24rem] md:h-[24rem] lg:w-[28rem] lg:h-[28rem]' 
          : 'w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80'
      }`}>
        
        {/* Roman Numerals */}
        {ROMAN_NUMERALS.map((num, i) => {
          const rotationAngle = (i + 1) * 30
          return (
            <div
              key={num}
              className="absolute text-stone-800 font-serif font-bold text-xs sm:text-sm select-text"
              style={{
                transform: `rotate(${rotationAngle}deg) translateY(${isLandscapeMode ? '-108px' : '-88px'}) rotate(-${rotationAngle}deg)`
              }}
            >
              {num}
            </div>
          )
        })}

        {/* Outer minute markers */}
        {[...Array(60)].map((_, i) => {
          if (i % 5 === 0) return null
          return (
            <div
              key={i}
              className="absolute w-[1px] h-[4px] bg-stone-600/40"
              style={{
                transform: `rotate(${i * 6}deg) translateY(${isLandscapeMode ? '-120px' : '-98px'})`
              }}
            />
          )
        })}

        {/* Dial Face SVG */}
        <svg className="w-full h-full transform -rotate-90 select-none pointer-events-none absolute inset-0" viewBox="0 0 200 200">
          
          {/* Hour Hand: Classic ornamental spade diamond hand */}
          <motion.path
            d="M 100 97.5 L 125 97.5 L 128 95 L 136 100 L 128 105 L 125 102.5 L 100 102.5 Z"
            fill="#1c1917" // stone-900
            animate={{ rotate: hourAngle }}
            transition={seconds === 0 ? { duration: 0 } : { type: 'spring', stiffness: 200, damping: 20 }}
            style={{ originX: '100px', originY: '100px' }}
          />

          {/* Minute Hand: Longer classic ornamental hand */}
          <motion.path
            d="M 100 98.8 L 155 98.8 L 158 97 L 166 100 L 158 103 L 155 101.2 L 100 101.2 Z"
            fill="#1c1917"
            animate={{ rotate: minuteAngle }}
            transition={seconds === 0 ? { duration: 0 } : { type: 'spring', stiffness: 200, damping: 25 }}
            style={{ originX: '100px', originY: '100px' }}
          />

          {/* Second Hand: Slim stone-toned sweep hand */}
          {showSeconds && (
            <motion.g
              animate={{ rotate: secondAngle }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              style={{ originX: '100px', originY: '100px' }}
            >
              <line
                x1="80"
                y1="100"
                x2="175"
                y2="100"
                stroke="#c22"
                strokeWidth="1.2"
              />
              <circle cx="100" cy="100" r="3" fill="#c22" />
            </motion.g>
          )}

          {/* Center Pin Hub */}
          <circle cx="100" cy="100" r="4.5" fill="#1c1917" />
          <circle cx="100" cy="100" r="1.5" className="fill-stone-100" />
        </svg>

      </div>
    </div>
  )
}
export default ClassicAnalogClock
