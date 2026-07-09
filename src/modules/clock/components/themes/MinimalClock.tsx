import React from 'react'
import { ClockThemeProps } from './themeInterface'
import { formatTime, formatDate } from '../../utils/format'

export const MinimalClock: React.FC<ClockThemeProps> = ({
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
      <div className="flex items-baseline justify-center font-black tracking-tight text-foreground select-text">
        <span className={`${
          isLandscapeMode ? 'text-9xl sm:text-[14rem] md:text-[18rem] lg:text-[22rem]' : 'text-7xl sm:text-8xl md:text-9xl lg:text-[10rem]'
        } font-black tracking-tighter tabular-nums select-text transition-all duration-300 leading-none`}>
          {timeStr}
        </span>
        {ampm && (
          <span className="text-[10px] font-bold ml-1 text-muted-foreground select-none uppercase align-super">
            {ampm}
          </span>
        )}
      </div>

      <div className="text-[9px] sm:text-xs font-bold tracking-widest text-muted-foreground/60 select-text uppercase mt-2 sm:mt-4">
        {dateStr}
      </div>
    </div>
  )
}
export default MinimalClock
