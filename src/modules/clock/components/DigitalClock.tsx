import { useClockStore } from '../store/clockStore'
import { useClockTime } from '../hooks/useClockTime'
import { formatTime, formatDate } from '../utils/format'

export const DigitalClock = () => {
  const time = useClockTime()
  const use24Hour = useClockStore((state) => state.use24Hour)
  const showSeconds = useClockStore((state) => state.showSeconds)
  const dateFormat = useClockStore((state) => state.dateFormat)

  const { timeStr, ampm } = formatTime(time, use24Hour, showSeconds)
  const dateStr = formatDate(time, dateFormat)
  const weekdayStr = time.toLocaleDateString(undefined, { weekday: 'long' })

  return (
    <div className="flex flex-col items-center justify-center text-center w-full select-none py-6">
      {/* High-visibility digital readout */}
      <div className="flex items-baseline justify-center font-black tracking-tighter text-foreground transition-all duration-300">
        <h2 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl tabular-nums font-black select-text">
          {timeStr}
        </h2>
        {ampm && (
          <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black ml-2 text-accent uppercase select-text">
            {ampm}
          </span>
        )}
      </div>
      
      {/* Date detail readout */}
      <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:space-x-3 text-muted-foreground font-semibold text-xs sm:text-sm md:text-base select-text">
        <span>{weekdayStr}</span>
        <span className="hidden sm:inline opacity-30">•</span>
        <span>{dateStr}</span>
      </div>
    </div>
  )
}
export default DigitalClock
