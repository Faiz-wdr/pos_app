export type ClockType = 'digital' | 'analog'
export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'long'

export interface ClockSettings {
  clockType: ClockType
  use24Hour: boolean
  dateFormat: DateFormat
  showSeconds: boolean
  autoHideControls: boolean
  keepAwake: boolean
}
