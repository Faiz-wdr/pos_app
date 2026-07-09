export interface ClockThemeProps {
  time: Date
  showSeconds: boolean
  use24Hour: boolean
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'long'
  isLandscapeMode: boolean
}
