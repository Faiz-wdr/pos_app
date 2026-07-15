import Dexie, { type Table } from 'dexie'
import { Transaction, Budget, MoneySettings, SavingsGoal } from '../types'

export class MoneyManagerDatabase extends Dexie {
  transactions!: Table<Transaction, number>
  budget!: Table<Budget, string>
  settings!: Table<MoneySettings, string>
  goals!: Table<SavingsGoal, number>

  constructor() {
    super('MoneyManagerDB')
    
    // Version 1: Initial schema release
    this.version(1).stores({
      transactions: '++id, amount, type, category, date, notes',
      budget: 'id, amount',
      settings: 'id, currency, theme, confirmDelete'
    })

    // Version 2: Added Savings Goals table and extended settings fields
    this.version(2).stores({
      transactions: '++id, amount, type, category, date, notes',
      budget: 'id, amount',
      settings: 'id, currency, theme, confirmDelete, startDay, defaultGoalColor',
      goals: '++id, name, targetAmount, currentAmount, targetDate, icon, color, archived'
    })
  }
}

export const db = new MoneyManagerDatabase()
export default db
