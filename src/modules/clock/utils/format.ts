import { DateFormat } from '../types'

export const formatTime = (
  date: Date,
  use24Hour: boolean,
  showSeconds: boolean
): { timeStr: string; ampm: string } => {
  let hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = showSeconds ? ':' + String(date.getSeconds()).padStart(2, '0') : ''
  let ampm = ''

  if (!use24Hour) {
    ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    hours = hours ? hours : 12 // The hour '0' should be '12'
  }

  const hoursStr = String(hours).padStart(2, '0')
  return {
    timeStr: `${hoursStr}:${minutes}${seconds}`,
    ampm
  }
}

export const formatDate = (date: Date, format: DateFormat): string => {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`
    case 'long':
    default:
      return date.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
  }
}

export const formatTimerSeconds = (totalSeconds: number): { hours: string; minutes: string; seconds: string } => {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60

  return {
    hours: String(h).padStart(2, '0'),
    minutes: String(m).padStart(2, '0'),
    seconds: String(s).padStart(2, '0')
  }
}
