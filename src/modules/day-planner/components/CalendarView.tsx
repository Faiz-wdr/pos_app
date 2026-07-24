import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { getCalendarDays, getTodayKey } from '../utils/dateUtils'
import { usePlannerSettingsStore } from '../store/plannerSettingsStore'
import { usePlannedDatesMap } from '../hooks/useDayPlanner'
import { cn } from '@/shared/utils/cn'

interface CalendarViewProps {
  selectedDateKey: string
  onSelectDate: (dateKey: string) => void
}

export const CalendarView = ({ selectedDateKey, onSelectDate }: CalendarViewProps) => {
  const { startWeekOn } = usePlannerSettingsStore()
  const plannedDatesMap = usePlannedDatesMap() || {}

  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth()) // 0-11

  const days = getCalendarDays(currentYear, currentMonth, startWeekOn)
  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  const weekHeaders = startWeekOn === 'Monday'
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <Card className="bg-card/70 border-[#D9D9D9] dark:border-[#27272a] shadow-xs rounded-2xl p-4 space-y-4 select-none">
      {/* Month Navigation Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-foreground tracking-tight px-1">
          {monthName}
        </h3>
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => {
              const today = new Date()
              setCurrentYear(today.getFullYear())
              setCurrentMonth(today.getMonth())
              onSelectDate(getTodayKey())
            }}
            className="px-2 py-1 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent font-extrabold text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels Header */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekHeaders.map((dayLabel) => (
          <span key={dayLabel} className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider py-1">
            {dayLabel}
          </span>
        ))}
      </div>

      {/* Calendar Days Matrix */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((cell) => {
          const isSelected = cell.dateKey === selectedDateKey
          const taskInfo = plannedDatesMap[cell.dateKey]
          const hasTasks = taskInfo && taskInfo.total > 0

          return (
            <button
              key={cell.dateKey}
              onClick={() => onSelectDate(cell.dateKey)}
              className={cn(
                'relative flex flex-col items-center justify-center h-10 sm:h-11 rounded-xl text-xs font-bold transition-all cursor-pointer border',
                cell.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/40 border-transparent',
                cell.isToday && !isSelected && 'border-accent/40 text-accent font-extrabold bg-accent/5',
                isSelected
                  ? 'bg-accent text-accent-foreground border-accent shadow-sm scale-[1.03] z-10'
                  : 'hover:bg-muted/60 border-transparent'
              )}
            >
              <span>{cell.dayNumber}</span>

              {/* Task Indicator Dot */}
              {hasTasks && (
                <div
                  className={cn(
                    'w-1.5 h-1.5 rounded-full mt-0.5',
                    isSelected
                      ? 'bg-accent-foreground'
                      : taskInfo.completed === taskInfo.total
                      ? 'bg-emerald-500'
                      : 'bg-accent'
                  )}
                />
              )}
            </button>
          )
        })}
      </div>
    </Card>
  )
}

export default CalendarView
