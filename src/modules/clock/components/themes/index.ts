import ModernDigitalClock from './ModernDigitalClock'
import MinimalClock from './MinimalClock'
import ModernAnalogClock from './ModernAnalogClock'
import CalendarAnalogClock from './CalendarAnalogClock'

export const THEMES = {
  'modern-digital': ModernDigitalClock,
  'minimal-digital': MinimalClock,
  'classic-analog': ModernAnalogClock,
  'calendar-analog': CalendarAnalogClock
}

export type { ClockThemeProps } from './themeInterface'
