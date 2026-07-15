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
    <div className="relative w-full h-full flex items-center justify-center select-none bg-black rounded-full shadow-[0_0_50px_rgba(0,0,0,0.85)] border border-neutral-900/30">
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

        {/* Render Numeric Hours inside the SVG */}
        {hourLabels.map((h) => {
          const angle = (h * 30) * (Math.PI / 180)
          const radius = 64
          const x = 100 + radius * Math.cos(angle)
          const y = 100 + radius * Math.sin(angle)

          return (
            <text
              key={h}
              x={x}
              y={y}
              fill="rgba(255, 255, 255, 0.95)"
              fontSize="12"
              fontWeight="bold"
              fontFamily="sans-serif"
              textAnchor="middle"
              dominantBaseline="central"
              transform={`rotate(90, ${x}, ${y})`}
            >
              {h}
            </text>
          )
        })}

        {/* Clock Hands inside the SVG */}
        {/* Hour Hand */}
        <line
          x1="100"
          y1="100"
          x2="146"
          y2="100"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
          transform={`rotate(${hourDeg}, 100, 100)`}
        />

        {/* Minute Hand */}
        <line
          x1="100"
          y1="100"
          x2="166"
          y2="100"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          transform={`rotate(${minuteDeg}, 100, 100)`}
        />

        {/* Second Hand */}
        {showSeconds && (
          <line
            x1="86"
            y1="100"
            x2="170"
            y2="100"
            stroke="#ff453a"
            strokeWidth="1.2"
            strokeLinecap="round"
            transform={`rotate(${secondDeg}, 100, 100)`}
          />
        )}

        {/* Center Pivot Pin */}
        <circle cx="100" cy="100" r="3.5" fill="#ff453a" stroke="#000000" strokeWidth="0.8" />
      </svg>
    </div>
  )

  const CalendarWidget = (
    <div className="w-full flex flex-col text-left select-none font-sans pl-2">
      {/* Month Header */}
      <div 
        className="text-lg sm:text-xl md:text-2xl font-bold text-[#ff453a] tracking-wider mb-2 lg:mb-4"
        style={isLandscapeMode ? { fontSize: 'max(16px, 2.5vh)', marginBottom: 'max(8px, 1.2vh)' } : {}}
      >
        {monthName}
      </div>

      {/* Weekdays Labels */}
      <div className="grid grid-cols-7 gap-y-2 text-center mb-1.5">
        {weekdays.map((day, idx) => (
          <span 
            key={idx} 
            className="text-[10px] sm:text-xs md:text-sm font-bold text-muted-foreground/60"
            style={isLandscapeMode ? { fontSize: 'max(10px, 1.3vh)' } : {}}
          >
            {day}
          </span>
        ))}
      </div>

      {/* Dates Grid */}
      <div className="grid grid-cols-7 gap-y-1.5 text-center">
        {calendarDays.map((day, idx) => {
          if (day === null) {
            return (
              <div 
                key={idx} 
                className="h-7 sm:h-8 md:h-10" 
                style={isLandscapeMode ? { height: 'max(24px, 3.5vh)' } : {}}
              />
            )
          }
          
          const isToday = day === todayDate
          
          return (
            <div
              key={idx}
              className="h-7 sm:h-8 md:h-10 flex items-center justify-center"
              style={isLandscapeMode ? { height: 'max(24px, 3.5vh)' } : {}}
            >
              {isToday ? (
                <span 
                  className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-[#ff453a] text-white flex items-center justify-center font-bold text-xs sm:text-sm md:text-base shadow-md"
                  style={isLandscapeMode ? { 
                    width: 'max(24px, 3.5vh)', 
                    height: 'max(24px, 3.5vh)', 
                    fontSize: 'max(11px, 1.6vh)' 
                  } : {}}
                >
                  {day}
                </span>
              ) : (
                <span 
                  className="text-xs sm:text-sm md:text-base font-bold text-foreground/90"
                  style={isLandscapeMode ? { fontSize: 'max(11px, 1.6vh)' } : {}}
                >
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
      <div className="w-full max-w-6xl flex flex-row items-center justify-center gap-12 md:gap-16 lg:gap-24 px-6 md:px-12 py-8">
        <div className="w-[32vw] h-[32vw] max-w-[380px] max-h-[380px] min-w-[200px] min-h-[200px] md:w-[42vh] md:h-[42vh] lg:w-[48vh] lg:h-[48vh] flex-shrink-0">
          {ClockFace}
        </div>
        <div className="w-[32vw] max-w-[340px] min-w-[200px] md:w-[42vh] lg:w-[48vh] flex-shrink-0">
          {CalendarWidget}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-10 md:space-y-16 py-8 w-full">
      <div className="w-[55vw] h-[55vw] sm:w-[45vw] sm:h-[45vw] md:w-[35vw] md:h-[35vw] max-w-[360px] max-h-[360px] min-w-[200px] min-h-[200px] flex-shrink-0">
        {ClockFace}
      </div>
      <div className="w-[60vw] sm:w-[50vw] md:w-[40vw] max-w-[340px] min-w-[200px] flex-shrink-0">
        {CalendarWidget}
      </div>
    </div>
  )
}

export default CalendarAnalogClock

