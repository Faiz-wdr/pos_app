export type TaskCategory = 
  | 'Personal' 
  | 'Study' 
  | 'Work' 
  | 'Health' 
  | 'Family' 
  | 'Other'

export type RepeatOption = 
  | 'Never' 
  | 'Daily' 
  | 'Weekdays' 
  | 'Weekends' 
  | 'Weekly' 
  | 'Monthly' 
  | 'Yearly' 
  | 'Custom Days'

export type CustomDay = 
  | 'Monday' 
  | 'Tuesday' 
  | 'Wednesday' 
  | 'Thursday' 
  | 'Friday' 
  | 'Saturday' 
  | 'Sunday'

export type ReminderOption = 
  | 'At Time' 
  | '5 Minutes Before' 
  | '10 Minutes Before' 
  | '30 Minutes Before' 
  | '1 Hour Before' 
  | '1 Day Before'

export interface PlannerTask {
  id: string
  title: string
  date: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
  category: TaskCategory
  repeat: RepeatOption
  customDays?: CustomDay[]
  reminder: ReminderOption
  notes?: string
  completed: boolean
  createdAt: number
  updatedAt: number
}

export interface TemplateItem {
  title: string
  startTime: string
  endTime: string
  category: TaskCategory
  repeat: RepeatOption
  reminder: ReminderOption
  notes?: string
}

export interface PlannerTemplate {
  id: string
  name: string
  description?: string
  category: TaskCategory
  items: TemplateItem[]
  createdAt: number
  updatedAt: number
}

export interface PlannerSettings {
  startWeekOn: 'Monday' | 'Sunday'
  timeFormat: '12h' | '24h'
  defaultReminder: ReminderOption
  defaultCategory: TaskCategory
  showCompletedTasks: boolean
}
