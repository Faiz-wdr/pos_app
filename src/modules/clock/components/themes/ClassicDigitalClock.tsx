import React from 'react'
import { ClockThemeProps } from './themeInterface'
import { formatTime, formatDate } from '../../utils/format'

export const ClassicDigitalClock: React.FC<ClockThemeProps> = ({
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
      <div className="flex items-baseline justify-center font-semibold tracking-tight text-foreground">
        <span className={`${
          isLandscapeMode ? 'text-8xl sm:text-9xl md:text-[13rem] lg:text-[16rem]' : 'text-6xl sm:text-7xl md:text-8xl lg:text-9xl'
        } font-black tabular-nums tracking-tighter select-text transition-all duration-300`}>
          {timeStr}
        </span>
        {ampm && (
          <span className={`font-black ml-2 text-accent uppercase select-text tracking-normal ${
            isLandscapeMode ? 'text-2xl sm:text-3xl md:text-4xl' : 'text-base sm:text-lg md:text-xl'
          }`}>
            {ampm}
          </span>
        )}
      </div>

      <div className={`text-muted-foreground font-medium select-text tracking-wide ${
        isLandscapeMode ? 'text-lg sm:text-xl md:text-2xl mt-4' : 'text-xs sm:text-sm md:text-base mt-2'
      }`}>
        {dateStr}
      </div>
    </div>
  )
}
export default ClassicDigitalClock
