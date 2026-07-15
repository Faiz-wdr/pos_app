export interface Transaction {
  id?: number
  amount: number
  type: 'income' | 'expense'
  category: string
  date: string // format: YYYY-MM-DD
  notes?: string
}

export interface Budget {
  id?: string // e.g. 'monthly'
  amount: number
}

export interface MoneySettings {
  id?: string // e.g. 'current'
  currency: string // default: '₹'
  theme: 'light' | 'dark' | 'system'
  confirmDelete: boolean
  startDay: number // 1-28
  defaultGoalColor: string
}

export interface SavingsGoal {
  id?: number
  name: string
  targetAmount: number
  currentAmount: number
  targetDate?: string // format: YYYY-MM-DD
  icon: string
  color: string
  archived: boolean
}
