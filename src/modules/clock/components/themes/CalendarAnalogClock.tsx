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
    <div className="relative w-[18em] h-[18em] flex items-center justify-center select-none bg-black rounded-full shadow-[0_0_3em_rgba(0,0,0,0.85)] border border-neutral-900/30">
      <svg className="w-full h-full absolute" viewBox="0 0 200 200">
        {/* Render minute/hour ticks */}
        {ticks.map((t, idx) => {
          const r1 = t.isHour ? 82 : 88
          const r2 = 94
          const rad = ((t.angle - 90) * Math.PI) / 180
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

        {/* Render Numeric Hours */}
        {hourLabels.map((h) => {
          const angle = (h * 30 - 90) * (Math.PI / 180)
          const radius = 64 // Radius positioning
          const x = 100 + radius * Math.cos(angle)
          const y = 100 + radius * Math.sin(angle)

          return (
            <text
              key={h}
              x={x}
              y={y}
              fill="rgba(255, 255, 255, 0.95)"
              fontSize="13"
              fontWeight="bold"
              fontFamily="sans-serif"
              textAnchor="middle"
              dominantBaseline="central"
              className="select-none"
            >
              {h}
            </text>
          )
        })}

        {/* Clock Hands */}
        {/* Hour Hand */}
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="56"
          stroke="#FFFFFF"
          strokeWidth="5"
          strokeLinecap="round"
          transform={`rotate(${hourDeg} 100 100)`}
        />

        {/* Minute Hand */}
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="38"
          stroke="#FFFFFF"
          strokeWidth="3.2"
          strokeLinecap="round"
          transform={`rotate(${minuteDeg} 100 100)`}
        />

        {/* Second Hand */}
        {showSeconds && (
          <line
            x1="100"
            y1="115"
            x2="100"
            y2="24"
            stroke="#ff453a"
            strokeWidth="1.2"
            strokeLinecap="round"
            transform={`rotate(${secondDeg} 100 100)`}
          />
        )}

        {/* Center Pivot Pin */}
        <circle
          cx="100"
          cy="100"
          r="3.8"
          fill="#ff453a"
          stroke="#000000"
          strokeWidth="0.8"
        />
      </svg>
    </div>
  )

  const CalendarWidget = (
    <div className="w-[18em] flex flex-col text-left select-none font-sans pl-[0.5em]">
      {/* Month Header */}
      <div className="text-[1.25em] font-bold text-[#ff453a] tracking-wider mb-[0.7em]">
        {monthName}
      </div>

      {/* Weekdays Labels */}
      <div className="grid grid-cols-7 gap-y-[0.5em] text-center mb-[0.4em]">
        {weekdays.map((day, idx) => (
          <span key={idx} className="text-[0.75em] font-bold text-muted-foreground/60">
            {day}
          </span>
        ))}
      </div>

      {/* Dates Grid */}
      <div className="grid grid-cols-7 gap-y-[0.4em] text-center">
        {calendarDays.map((day, idx) => {
          if (day === null) {
            return <div key={idx} className="h-[2em]" />
          }
          
          const isToday = day === todayDate
          
          return (
            <div
              key={idx}
              className="h-[2em] flex items-center justify-center"
            >
              {isToday ? (
                <span className="w-[2em] h-[2em] rounded-full bg-[#ff453a] text-white flex items-center justify-center font-bold text-[0.85em] shadow-md">
                  {day}
                </span>
              ) : (
                <span className="text-[0.85em] font-bold text-foreground/90">
                  {day}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  // Determine responsive base font size
  const fontSize = isLandscapeMode
    ? 'min(2.5vw, 4.2vh)'
    : 'min(4.2vw, 3.5vh)'

  if (isLandscapeMode) {
    return (
      <div 
        className="w-full max-w-5xl flex flex-row items-center justify-center space-x-16 px-6"
        style={{ fontSize }}
      >
        {ClockFace}
        {CalendarWidget}
      </div>
    )
  }

  return (
    <div 
      className="flex flex-col items-center justify-center space-y-12 py-6 w-full"
      style={{ fontSize }}
    >
      {ClockFace}
      {CalendarWidget}
    </div>
  )
}

export default CalendarAnalogClock
