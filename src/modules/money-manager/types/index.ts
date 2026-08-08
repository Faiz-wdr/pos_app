export interface Transaction {
  id?: number
  uuid?: string // Unique identifier for cloud sync
  amount: number
  type: 'income' | 'expense'
  category: string
  date: string // format: YYYY-MM-DD
  notes?: string
  createdAt?: number
  updatedAt?: number
}

export interface Budget {
  id?: string // e.g. 'monthly'
  amount: number
  createdAt?: number
  updatedAt?: number
}

export interface MoneySettings {
  id?: string // e.g. 'current'
  currency: string // default: '₹'
  theme: 'light' | 'dark' | 'system'
  confirmDelete: boolean
  startDay: number // 1-28
  defaultGoalColor: string
  defaultBudget?: number
  createdAt?: number
  updatedAt?: number
}

export interface SavingsGoal {
  id?: number
  uuid?: string // Unique identifier for cloud sync
  name: string
  targetAmount: number
  currentAmount: number
  targetDate?: string // format: YYYY-MM-DD
  icon: string
  color: string
  archived: boolean
  createdAt?: number
  updatedAt?: number
}
