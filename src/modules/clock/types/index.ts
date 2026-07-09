export type ClockType = 'digital' | 'analog'
export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'long'

export type DigitalTheme = 'classic' | 'modern' | 'led' | 'dashboard' | 'minimal'
export type AnalogTheme = 'minimal' | 'swiss' | 'modern' | 'classic'
export type ViewMode = 'portrait' | 'landscape' | 'auto'

export interface ClockSettings {
  clockType: ClockType
  use24Hour: boolean
  dateFormat: DateFormat
  showSeconds: boolean
  autoHideControls: boolean
  keepAwake: boolean
  digitalTheme: DigitalTheme
  analogTheme: AnalogTheme
  viewMode: ViewMode
}
