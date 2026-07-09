import React from 'react'
import { ClockThemeProps } from './themeInterface'
import { formatTime, formatDate } from '../../utils/format'

export const DashboardClock: React.FC<ClockThemeProps> = ({
  time,
  showSeconds,
  use24Hour,
  dateFormat,
  isLandscapeMode
}) => {
  const { timeStr, ampm } = formatTime(time, use24Hour, showSeconds)
  const dateStr = formatDate(time, dateFormat)

  // Split hours/minutes from seconds if present
  const timeParts = timeStr.split(':')
  const hasSeconds = showSeconds && timeParts.length === 3
  const hoursMinutes = hasSeconds ? `${timeParts[0]}:${timeParts[1]}` : timeStr
  const seconds = hasSeconds ? timeParts[2] : ''

  const dayName = time.toLocaleDateString(undefined, { weekday: 'long' })
  const dayNum = time.getDate()
  const monthName = time.toLocaleDateString(undefined, { month: 'short' })

  return (
    <div className={`flex flex-col items-center md:flex-row md:items-stretch md:justify-center md:space-x-8 w-full select-none ${
      isLandscapeMode ? 'py-4 max-w-5xl' : 'py-6 max-w-xl'
    }`}>
      
      {/* Time telemetry widget */}
      <div className="flex-1 flex flex-col justify-center bg-card/35 dark:bg-card/15 border border-border/40 rounded-3xl p-6 md:p-8 flex-shrink-0">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2 select-none">Time Telemetry</span>
        
        <div className="flex items-baseline justify-start text-foreground select-text">
          <span className={`font-black tabular-nums tracking-tighter ${
            isLandscapeMode ? 'text-8xl sm:text-9xl md:text-[10rem]' : 'text-5xl sm:text-6xl md:text-7xl'
          }`}>
            {hoursMinutes}
          </span>
          
          {hasSeconds && (
            <div className="flex flex-col items-start ml-2">
              <span className={`font-semibold tabular-nums text-accent opacity-80 ${
                isLandscapeMode ? 'text-4xl sm:text-5xl' : 'text-xl sm:text-2xl'
              }`}>
                :{seconds}
              </span>
              {ampm && (
                <span className="text-[9px] font-black text-muted-foreground tracking-wider uppercase select-none mt-0.5">
                  {ampm}
                </span>
              )}
            </div>
          )}

          {!hasSeconds && ampm && (
            <span className={`font-black ml-2 text-accent uppercase select-none ${
              isLandscapeMode ? 'text-2xl sm:text-3xl' : 'text-sm sm:text-base'
            }`}>
              {ampm}
            </span>
          )}
        </div>
      </div>

      {/* Calendar widget */}
      <div className="w-full md:w-56 flex flex-row md:flex-col justify-between items-center bg-card/35 dark:bg-card/15 border border-border/40 rounded-3xl p-6 mt-4 md:mt-0 select-none">
        <div className="text-left md:text-center flex flex-col">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest select-none">Calendar</span>
          <span className="text-sm font-extrabold text-foreground mt-1.5">{dayName}</span>
          <span className="text-xs text-muted-foreground hidden md:inline mt-0.5 select-text">{dateStr}</span>
        </div>

        {/* Big Date Number Display */}
        <div className="flex flex-col items-center justify-center bg-accent/10 border border-accent/20 rounded-2xl w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
          <span className="text-[10px] font-black text-accent uppercase tracking-widest select-none">{monthName}</span>
          <span className="text-2xl sm:text-3xl font-black text-foreground select-text">{dayNum}</span>
        </div>
      </div>

    </div>
  )
}
export default DashboardClock
