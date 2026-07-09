import React from 'react'
import { ClockThemeProps } from './themeInterface'

export const CalendarAnalogClock: React.FC<ClockThemeProps> = ({
  time,
  showSeconds,
  isLandscapeMode = false
}) => {
  const hours = time.getHours()
  const minutes = time.getMinutes()
  const seconds = time.getSeconds()

  // Calculate rotation angles
  const secondDeg = (seconds / 60) * 360
  const minuteDeg = ((minutes * 60 + seconds) / 3600) * 360
  const hourDeg = (((hours % 12) * 3600 + minutes * 60 + seconds) / 43200) * 360

  // Calendar calculations
  const currentYear = time.getFullYear()
  const currentMonth = time.getMonth()
  const todayDate = time.getDate()

  const monthName = time.toLocaleDateString('en-US', { month: 'long' }).toUpperCase()
  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  // Generate calendar dates grid
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay()
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate()
  
  const calendarDays: (number | null)[] = []
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null)
  }
  for (let d = 1; d <= totalDays; d++) {
    calendarDays.push(d)
  }

  // Ticks generation helper (60 ticks)
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const angle = i * 6
    const isHour = i % 5 === 0
    return {
      angle,
      isHour
    }
  })

  // Numeric hour position markers (1 to 12)
  const hourLabels = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

  const ClockFace = (
    <div className="relative w-[230px] h-[230px] flex items-center justify-center select-none bg-black rounded-full shadow-[0_0_50px_rgba(0,0,0,0.85)] border border-neutral-900/30">
      <svg className="w-full h-full transform -rotate-90 absolute" viewBox="0 0 200 200">
        {/* Render minute/hour ticks */}
        {ticks.map((t, idx) => {
          const r1 = t.isHour ? 82 : 88
          const r2 = 94
          const rad = (t.angle * Math.PI) / 180
          const x1 = 100 + r1 * Math.cos(rad)
          const y1 = 100 + r1 * Math.sin(rad)
          const x2 = 100 + r2 * Math.cos(rad)
          const y2 = 100 + r2 * Math.sin(rad)
          
          return (
            <line
              key={idx}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={t.isHour ? '#FFFFFF' : 'rgba(255, 255, 255, 0.28)'}
              strokeWidth={t.isHour ? 2.2 : 1.0}
              strokeLinecap="round"
            />
          )
        })}
      </svg>

      {/* Render Numeric Hours */}
      {hourLabels.map((h) => {
        // Calculate angle. 12 is at top (0 deg / -90 deg relative to normal SVG polar starting at right)
        const angle = (h * 30 - 90) * (Math.PI / 180)
        const radius = 64 // Radius positioning
        const x = 115 + radius * Math.cos(angle)
        const y = 115 + radius * Math.sin(angle)

        return (
          <span
            key={h}
            className="absolute text-sm font-black text-white/95 font-sans"
            style={{
              left: `${x}px`,
              top: `${y}px`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {h}
          </span>
        )
      })}

      {/* Clock Hands */}
      {/* Hour Hand */}
      <div
        className="absolute w-1.5 rounded-full bg-white origin-bottom"
        style={{
          height: '46px',
          bottom: '50%',
          transform: `rotate(${hourDeg}deg)`,
          transformOrigin: '50% 100%',
        }}
      />

      {/* Minute Hand */}
      <div
        className="absolute w-1 rounded-full bg-white origin-bottom"
        style={{
          height: '66px',
          bottom: '50%',
          transform: `rotate(${minuteDeg}deg)`,
          transformOrigin: '50% 100%',
        }}
      />

      {/* Second Hand */}
      {showSeconds && (
        <div
          className="absolute w-0.5 bg-[#ff453a] origin-bottom flex items-end justify-center"
          style={{
            height: '80px',
            bottom: '50%',
            transform: `rotate(${secondDeg}deg)`,
            transformOrigin: '50% 100%',
          }}
        >
          {/* Extended tail past pivot */}
          <div className="w-0.5 h-4 bg-[#ff453a] absolute top-[80px]" />
        </div>
      )}

      {/* Center Pivot Pin */}
      <div className="absolute w-2 h-2 rounded-full bg-[#ff453a] z-10 border border-black" />
    </div>
  )

  const CalendarWidget = (
    <div className="w-[240px] flex flex-col text-left select-none font-sans pl-2">
      {/* Month Header */}
      <div className="text-[17px] font-black text-[#ff453a] tracking-wider mb-3">
        {monthName}
      </div>

      {/* Weekdays Labels */}
      <div className="grid grid-cols-7 gap-y-2 text-center mb-1.5">
        {weekdays.map((day, idx) => (
          <span key={idx} className="text-[10px] font-extrabold text-muted-foreground/60">
            {day}
          </span>
        ))}
      </div>

      {/* Dates Grid */}
      <div className="grid grid-cols-7 gap-y-1.5 text-center">
        {calendarDays.map((day, idx) => {
          if (day === null) {
            return <div key={idx} className="h-[26px]" />
          }
          
          const isToday = day === todayDate
          
          return (
            <div
              key={idx}
              className="h-[26px] flex items-center justify-center"
            >
              {isToday ? (
                <span className="w-[26px] h-[26px] rounded-full bg-[#ff453a] text-white flex items-center justify-center font-black text-xs shadow-md">
                  {day}
                </span>
              ) : (
                <span className="text-xs font-bold text-foreground/90">
                  {day}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  if (isLandscapeMode) {
    return (
      <div className="w-full max-w-2xl flex flex-row items-center justify-around space-x-12 px-6">
        {ClockFace}
        {CalendarWidget}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-10 py-4">
      {ClockFace}
      {CalendarWidget}
    </div>
  )
}

export default CalendarAnalogClock
