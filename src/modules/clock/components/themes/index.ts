import ClassicDigitalClock from './ClassicDigitalClock'
import ModernDigitalClock from './ModernDigitalClock'
import LEDClock from './LEDClock'
import DashboardClock from './DashboardClock'
import MinimalClock from './MinimalClock'

import MinimalAnalogClock from './MinimalAnalogClock'
import SwissAnalogClock from './SwissAnalogClock'
import ModernAnalogClock from './ModernAnalogClock'
import ClassicAnalogClock from './ClassicAnalogClock'

export const DIGITAL_THEMES = {
  classic: ClassicDigitalClock,
  modern: ModernDigitalClock,
  led: LEDClock,
  dashboard: DashboardClock,
  minimal: MinimalClock
}

export const ANALOG_THEMES = {
  minimal: MinimalAnalogClock,
  swiss: SwissAnalogClock,
  modern: ModernAnalogClock,
  classic: ClassicAnalogClock
}

export type DigitalThemeType = keyof typeof DIGITAL_THEMES
export type AnalogThemeType = keyof typeof ANALOG_THEMES
export type { ClockThemeProps } from './themeInterface'
