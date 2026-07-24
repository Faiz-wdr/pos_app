export const formatDateKey = (date: Date): string => {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export const getTodayKey = (): string => {
  return formatDateKey(new Date())
}

export const getTomorrowKey = (): string => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return formatDateKey(tomorrow)
}

export const parseDateKey = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export const formatDisplayDate = (dateKey: string): { dayName: string; formattedDate: string } => {
  const date = parseDateKey(dateKey)
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return { dayName, formattedDate }
}

export const formatTime = (timeStr: string, format: '12h' | '24h'): string => {
  if (!timeStr) return ''
  if (format === '24h') return timeStr

  const [hStr, mStr] = timeStr.split(':')
  let hours = parseInt(hStr, 10)
  const minutes = mStr || '00'
  const ampm = hours >= 12 ? 'PM' : 'AM'

  hours = hours % 12
  hours = hours ? hours : 12 // 0 should be 12
  const formattedHours = String(hours).padStart(2, '0')

  return `${formattedHours}:${minutes} ${ampm}`
}

export const calculateDuration = (startTime: string, endTime: string): string => {
  if (!startTime || !endTime) return ''
  const [sH, sM] = startTime.split(':').map(Number)
  const [eH, eM] = endTime.split(':').map(Number)

  const startTotalMinutes = sH * 60 + sM
  let endTotalMinutes = eH * 60 + eM

  if (endTotalMinutes < startTotalMinutes) {
    endTotalMinutes += 24 * 60 // crossed midnight
  }

  const diffMinutes = endTotalMinutes - startTotalMinutes
  if (diffMinutes <= 0) return '0m'

  const hours = Math.floor(diffMinutes / 60)
  const mins = diffMinutes % 60

  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`
  if (hours > 0) return `${hours}h`
  return `${mins}m`
}

export const getGreeting = (): string => {
  const hours = new Date().getHours()
  if (hours < 12) return 'Good morning'
  if (hours < 18) return 'Good afternoon'
  return 'Good evening'
}

export interface CalendarDayCell {
  date: Date
  dateKey: string
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
}

export const getCalendarDays = (
  year: number,
  month: number,
  startWeekOn: 'Monday' | 'Sunday'
): CalendarDayCell[] => {
  const todayKey = getTodayKey()
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)

  let startDayOfWeek = firstDayOfMonth.getDay() // 0 = Sunday
  if (startWeekOn === 'Monday') {
    startDayOfWeek = (startDayOfWeek + 6) % 7 // 0 = Monday, 6 = Sunday
  }

  const days: CalendarDayCell[] = []

  // Padding days from previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i)
    const dKey = formatDateKey(d)
    days.push({
      date: d,
      dateKey: dKey,
      dayNumber: d.getDate(),
      isCurrentMonth: false,
      isToday: dKey === todayKey
    })
  }

  // Current month days
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const d = new Date(year, month, i)
    const dKey = formatDateKey(d)
    days.push({
      date: d,
      dateKey: dKey,
      dayNumber: i,
      isCurrentMonth: true,
      isToday: dKey === todayKey
    })
  }

  // Padding days for next month to complete matrix (multiple of 7)
  const remaining = 7 - (days.length % 7)
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i)
      const dKey = formatDateKey(d)
      days.push({
        date: d,
        dateKey: dKey,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: dKey === todayKey
      })
    }
  }

  return days
}
