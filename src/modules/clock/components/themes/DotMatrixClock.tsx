import React from 'react'
import { ClockThemeProps } from './themeInterface'
import { formatTime, formatDate } from '../../utils/format'

const DOT_MATRIX: Record<string, number[][]> = {
  '0': [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1]
  ],
  '1': [
    [0, 0, 1, 0, 0],
    [0, 1, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0]
  ],
  '2': [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1]
  ],
  '3': [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1]
  ],
  '4': [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1]
  ],
  '5': [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1]
  ],
  '6': [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1]
  ],
  '7': [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0],
    [1, 0, 0, 0, 0]
  ],
  '8': [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1]
  ],
  '9': [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1]
  ]
}

const LETTER_MATRIX: Record<string, number[][]> = {
  'A': [
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
    [1, 0, 1],
    [1, 0, 1]
  ],
  'P': [
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
    [1, 0, 0],
    [1, 0, 0]
  ],
  'M': [
    [1, 0, 1],
    [1, 1, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1]
  ]
}

const COLON_MATRIX = [
  [0],
  [0],
  [1],
  [0],
  [1],
  [0],
  [0]
]

const DotMatrixDigit = ({ char, small = false }: { char: string; small?: boolean }) => {
  const matrix = DOT_MATRIX[char] || DOT_MATRIX['0']

  const dotSizeClass = small 
    ? 'w-1 h-1 sm:w-1.5 sm:h-1.5' 
    : 'w-2 sm:w-2.5 md:w-3.5 lg:w-4.5 h-2 sm:h-2.5 md:h-3.5 lg:h-4.5'

  return (
    <div className="grid grid-cols-5 gap-0.5 sm:gap-1">
      {matrix.map((row, rIdx) => 
        row.map((val, cIdx) => (
          <div
            key={`${rIdx}-${cIdx}`}
            className={`rounded-xs transition-all duration-300 ${dotSizeClass}`}
            style={{
              backgroundColor: val === 1 ? '#ffffff' : undefined,
              boxShadow: val === 1 ? '0 0 8px rgba(255, 255, 255, 0.85)' : undefined,
              opacity: val === 1 ? 1 : 0.15
            }}
          />
        ))
      )}
    </div>
  )
}

const DotMatrixColon = ({ small = false }: { small?: boolean }) => {
  const dotSizeClass = small 
    ? 'w-1 h-1 sm:w-1.5 sm:h-1.5' 
    : 'w-2 sm:w-2.5 md:w-3.5 lg:w-4.5 h-2 sm:h-2.5 md:h-3.5 lg:h-4.5'

  return (
    <div className="grid grid-cols-1 gap-0.5 sm:gap-1 mx-1.5 sm:mx-3">
      {COLON_MATRIX.map((row, rIdx) => 
        row.map((val, cIdx) => (
          <div
            key={`${rIdx}-${cIdx}`}
            className={`rounded-xs transition-all duration-300 ${dotSizeClass}`}
            style={{
              backgroundColor: val === 1 ? '#ffffff' : undefined,
              boxShadow: val === 1 ? '0 0 8px rgba(255, 255, 255, 0.85)' : undefined,
              opacity: val === 1 ? 1 : 0
            }}
          />
        ))
      )}
    </div>
  )
}

const DotMatrixLetter = ({ char }: { char: string }) => {
  const matrix = LETTER_MATRIX[char] || LETTER_MATRIX['P']

  return (
    <div className="grid grid-cols-3 gap-0.5">
      {matrix.map((row, rIdx) => 
        row.map((val, cIdx) => (
          <div
            key={`${rIdx}-${cIdx}`}
            className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-xs transition-all duration-300"
            style={{
              backgroundColor: val === 1 ? '#ffffff' : undefined,
              boxShadow: val === 1 ? '0 0 4px rgba(255, 255, 255, 0.8)' : undefined,
              opacity: val === 1 ? 1 : 0.15
            }}
          />
        ))
      )}
    </div>
  )
}

const DotMatrixAMPM = ({ period }: { period: string }) => {
  if (!period) return null
  return (
    <div className="flex space-x-1 select-none">
      <DotMatrixLetter char={period[0]} />
      <DotMatrixLetter char={period[1]} />
    </div>
  )
}

export const DotMatrixClock: React.FC<ClockThemeProps> = ({
  time,
  showSeconds,
  use24Hour,
  dateFormat,
  isLandscapeMode
}) => {
  const { timeStr, ampm, secondsStr } = formatTime(time, use24Hour)
  const dateStr = formatDate(time, dateFormat)

  return (
    <div className={`flex flex-col items-center justify-center text-center select-none w-full ${
      isLandscapeMode ? 'py-4 max-w-4xl' : 'py-6'
    }`}>
      <div className="relative flex flex-col items-start justify-center">
        {/* AM/PM indicator row above first digit */}
        {ampm && (
          <div className="mb-3 sm:mb-4 pl-1">
            <DotMatrixAMPM period={ampm} />
          </div>
        )}

        {/* Matrix Digits Display */}
        <div className="flex items-center space-x-2 sm:space-x-3.5">
          <DotMatrixDigit char={timeStr[0]} />
          <DotMatrixDigit char={timeStr[1]} />
          <DotMatrixColon />
          <DotMatrixDigit char={timeStr[3]} />
          <DotMatrixDigit char={timeStr[4]} />

          {/* Seconds inside the grid */}
          {showSeconds && (
            <div className="flex items-center space-x-2 sm:space-x-3 ml-2.5 sm:ml-4">
              <span className="text-white/30 text-lg sm:text-2xl font-light select-none">:</span>
              <DotMatrixDigit char={secondsStr[0]} small />
              <DotMatrixDigit char={secondsStr[1]} small />
            </div>
          )}
        </div>
      </div>

      {/* Date display below */}
      <div className={`text-white/50 font-bold tracking-widest uppercase opacity-80 select-text ${
        isLandscapeMode ? 'text-sm sm:text-base mt-8' : 'text-[10px] sm:text-xs mt-6'
      }`}>
        {dateStr}
      </div>
    </div>
  )
}

export default DotMatrixClock
