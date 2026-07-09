import React from 'react'
import { ClockThemeProps } from './themeInterface'
import { formatTime, formatDate } from '../../utils/format'

export const ModernDigitalClock: React.FC<ClockThemeProps> = ({
  time,
  showSeconds,
  use24Hour,
  dateFormat,
  isLandscapeMode
}) => {
  const { timeStr, ampm } = formatTime(time, use24Hour, showSeconds)
  const dateStr = formatDate(time, dateFormat)

  return (
    <div className={`flex flex-col items-center justify-center text-center select-none ${
      isLandscapeMode ? 'py-4 max-w-4xl' : 'py-6 w-full'
    }`}>
      <div className="relative group">
        {/* Soft atmospheric background glow behind the clock */}
        <div className="absolute inset-0 bg-accent/5 blur-3xl rounded-full scale-110 pointer-events-none transition-all duration-500" />
        
        <div className="flex items-baseline justify-center font-bold tracking-tight text-foreground drop-shadow-[0_0_20px_rgba(248,181,24,0.15)] dark:drop-shadow-[0_0_25px_rgba(248,181,24,0.2)]">
          <span className={`font-sans rounded-2xl ${
            isLandscapeMode ? 'text-8xl sm:text-9xl md:text-[12rem] lg:text-[15rem]' : 'text-6xl sm:text-7xl md:text-8xl lg:text-9xl'
          } font-extrabold tracking-tighter tabular-nums select-text transition-all duration-300`}>
            {timeStr}
          </span>
          {ampm && (
            <span className={`font-black ml-2 px-2 py-0.5 rounded-lg bg-accent/10 text-accent uppercase select-text tracking-wider ${
              isLandscapeMode ? 'text-xl sm:text-2xl md:text-3xl' : 'text-xs sm:text-sm md:text-base'
            }`}>
              {ampm}
            </span>
          )}
        </div>
      </div>

      <div className={`text-accent font-semibold tracking-widest uppercase opacity-85 select-text ${
        isLandscapeMode ? 'text-base sm:text-lg md:text-xl mt-6' : 'text-[10px] sm:text-xs mt-3.5'
      }`}>
        {dateStr}
      </div>
    </div>
  )
}
export default ModernDigitalClock
