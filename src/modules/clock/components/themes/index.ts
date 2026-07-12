import ModernDigitalClock from './ModernDigitalClock'
import MinimalClock from './MinimalClock'
import DotMatrixClock from './DotMatrixClock'
import CalendarAnalogClock from './CalendarAnalogClock'

export const THEMES = {
  'modern-digital': ModernDigitalClock,
  'minimal-digital': MinimalClock,
  'classic-analog': DotMatrixClock,
  'calendar-analog': CalendarAnalogClock
}

export type { ClockThemeProps } from './themeInterface'
