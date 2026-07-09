import React from 'react'
import { ClockThemeProps } from './themeInterface'
import { formatTime, formatDate } from '../../utils/format'

// Segment states for characters 0-9 and space
const SEGMENTS_MAP: Record<string, number[]> = {
  '0': [1, 1, 1, 1, 1, 1, 0], // a, b, c, d, e, f, g
  '1': [0, 1, 1, 0, 0, 0, 0],
  '2': [1, 1, 0, 1, 1, 0, 1],
  '3': [1, 1, 1, 1, 0, 0, 1],
  '4': [0, 1, 1, 0, 0, 1, 1],
  '5': [1, 0, 1, 1, 0, 1, 1],
  '6': [1, 0, 1, 1, 1, 1, 1],
  '7': [1, 1, 1, 0, 0, 0, 0],
  '8': [1, 1, 1, 1, 1, 1, 1],
  '9': [1, 1, 1, 1, 0, 1, 1],
  ' ': [0, 0, 0, 0, 0, 0, 0]
}

const SEGMENT_PATHS = [
  "M 6,4 L 26,4 L 23,8 L 9,8 Z",        // a (top)
  "M 27,6 L 27,27 L 24,25 L 24,9 Z",      // b (top-right)
  "M 25,33 L 25,54 L 22,52 L 22,35 Z",    // c (bottom-right)
  "M 5,56 L 21,56 L 18,52 L 8,52 Z",      // d (bottom)
  "M 4,33 L 4,54 L 7,52 L 7,35 Z",        // e (bottom-left)
  "M 5,6 L 5,27 L 8,25 L 8,9 Z",          // f (top-left)
  "M 7,30 L 23,30 L 20,28 L 10,28 Z"       // g (middle)
]

const SevenSegmentDigit: React.FC<{ value: string }> = ({ value }) => {
  const activeSegments = SEGMENTS_MAP[value] || SEGMENTS_MAP[' ']

  return (
    <svg viewBox="0 0 32 60" className="w-12 h-20 sm:w-16 sm:h-28 md:w-20 md:h-36 lg:w-24 lg:h-44 transition-all select-none">
      <g transform="skewX(-6) translate(1, 1)">
        {SEGMENT_PATHS.map((path, index) => {
          const isActive = activeSegments[index] === 1
          return (
            <path
              key={index}
              d={path}
              className="transition-all duration-200"
              fill={isActive ? '#f8b518' : 'rgba(248, 181, 24, 0.05)'}
              style={{
                filter: isActive ? 'drop-shadow(0 0 3px #f8b518)' : 'none'
              }}
            />
          )
        })}
      </g>
    </svg>
  )
}

export const LEDClock: React.FC<ClockThemeProps> = ({
  time,
  showSeconds,
  use24Hour,
  dateFormat,
  isLandscapeMode
}) => {
  const { timeStr, ampm } = formatTime(time, use24Hour, showSeconds)
  const dateStr = formatDate(time, dateFormat)

  // Split digits, colons, and spaces
  const chars = timeStr.split('')

  return (
    <div className={`flex flex-col items-center justify-center select-none ${
      isLandscapeMode ? 'py-4 max-w-4xl' : 'py-6 w-full'
    }`}>
      {/* LED Display Box */}
      <div className="relative rounded-3xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl flex items-center justify-center space-x-1.5 sm:space-x-3 select-none">
        
        {chars.map((char, index) => {
          if (char === ':') {
            return (
              <div key={index} className="flex flex-col justify-center space-y-4 px-1.5 sm:px-3">
                <div 
                  className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-accent animate-ping"
                  style={{ animationDuration: '2s', filter: 'drop-shadow(0 0 3px #f8b518)' }}
                />
                <div 
                  className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-accent animate-ping"
                  style={{ animationDuration: '2s', filter: 'drop-shadow(0 0 3px #f8b518)' }}
                />
              </div>
            )
          }
          return <SevenSegmentDigit key={index} value={char} />
        })}

        {ampm && (
          <div className="flex flex-col justify-end h-16 sm:h-24 md:h-32 pl-2">
            <span className="text-[10px] sm:text-xs md:text-sm font-black text-accent tracking-widest uppercase select-text bg-accent/10 px-1.5 py-0.5 rounded-md">
              {ampm}
            </span>
          </div>
        )}
      </div>

      <div className={`text-muted-foreground font-mono font-bold tracking-widest uppercase select-text mt-6 ${
        isLandscapeMode ? 'text-lg sm:text-xl' : 'text-xs'
      }`}>
        {dateStr}
      </div>
    </div>
  )
}
export default LEDClock
