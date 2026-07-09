export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'long'
export type ClockTheme = 'modern-digital' | 'minimal-digital' | 'classic-analog' | 'calendar-analog'

export interface ClockSettings {
  theme: ClockTheme
  themeColor: string
  use24Hour: boolean
  dateFormat: DateFormat
  showSeconds: boolean
  autoHideControls: boolean
  keepAwake: boolean
}
