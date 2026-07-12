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
  const { timeStr, ampm, secondsStr } = formatTime(time, use24Hour)
  const dateStr = formatDate(time, dateFormat)

  return (
    <div className={`flex flex-col items-center justify-center text-center select-none ${
      isLandscapeMode ? 'py-4 max-w-4xl' : 'py-6 w-full'
    }`}>
      <div className="relative group flex flex-col items-center">
        {/* Main Clock Layout Grid/Flex */}
        <div className="flex items-center justify-center font-sans tracking-tight text-foreground select-none">
          {/* AM/PM indicator on the left */}
          {ampm && (
            <div className="flex flex-col items-start justify-center mr-4 sm:mr-6 lg:mr-8 leading-none">
              <span className={`font-bold uppercase tracking-wider transition-all duration-300 ${
                ampm === 'AM' 
                  ? 'text-accent' 
                  : 'text-stone-300/20 dark:text-stone-800/35'
              } ${
                isLandscapeMode ? 'text-xl sm:text-2xl md:text-3xl' : 'text-xs sm:text-sm md:text-base'
              }`}>
                AM
              </span>
              <span className={`font-bold uppercase tracking-wider transition-all duration-300 ${
                ampm === 'PM' 
                  ? 'text-accent' 
                  : 'text-stone-300/20 dark:text-stone-800/35'
              } ${
                isLandscapeMode ? 'text-xl sm:text-2xl md:text-3xl mt-2 lg:mt-3' : 'text-xs sm:text-sm md:text-base mt-1'
              }`}>
                PM
              </span>
            </div>
          )}

          {/* Time digits */}
          <div className="flex items-baseline justify-center select-text">
            {/* Hours and Minutes */}
            <span className={`font-sans font-light tracking-tighter tabular-nums text-stone-200 dark:text-stone-100 ${
              isLandscapeMode 
                ? 'text-7xl sm:text-8xl md:text-[10rem] lg:text-[13rem]' 
                : 'text-6xl sm:text-7xl md:text-8xl lg:text-9xl'
            } transition-all duration-300`}>
              {timeStr}
            </span>

            {/* Small Ticking Seconds */}
            {showSeconds && (
              <span className={`font-sans font-light tracking-tighter tabular-nums text-stone-400 dark:text-stone-500 ml-1.5 sm:ml-3 transition-all duration-300 ${
                isLandscapeMode 
                  ? 'text-3xl sm:text-4xl md:text-5xl lg:text-7xl' 
                  : 'text-xl sm:text-2xl md:text-3xl lg:text-4xl'
              }`}>
                :{secondsStr}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Date display below */}
      <div className={`text-accent font-bold tracking-widest uppercase opacity-85 select-text ${
        isLandscapeMode ? 'text-base sm:text-lg md:text-xl mt-6' : 'text-[10px] sm:text-xs mt-4'
      }`}>
        {dateStr}
      </div>
    </div>
  )
}

export default ModernDigitalClock
