import { create } from 'zustand'
import { db } from '../database/db'
import { Transaction, MoneySettings, SavingsGoal } from '../types'

interface MoneyStoreState {
  transactions: Transaction[]
  goals: SavingsGoal[]
  budget: number
  selectedMonth: string // format: YYYY-MM
  settings: MoneySettings
  loading: boolean
  
  loadData: () => Promise<void>
  setSelectedMonth: (month: string) => Promise<void>
  
  // Transactions
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>
  deleteTransaction: (id: number) => Promise<void>
  
  // Budget
  updateBudget: (amount: number) => Promise<void>
  
  // Goals
  addGoal: (goal: Omit<SavingsGoal, 'id'>) => Promise<void>
  updateGoal: (id: number, updates: Partial<SavingsGoal>) => Promise<void>
  deleteGoal: (id: number) => Promise<void>
  addSavingsToGoal: (id: number, amount: number) => Promise<void>
  withdrawSavingsFromGoal: (id: number, amount: number) => Promise<void>
  
  // Settings
  updateSettings: (updates: Partial<MoneySettings>) => Promise<void>
  
  // Backup & Maintenance
  exportBackup: () => Promise<void>
  importBackup: (jsonString: string) => Promise<{ success: boolean; error?: string }>
  resetAllData: () => Promise<void>
}

// Helper to get current month string YYYY-MM
const getCurrentMonthString = () => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export const useMoneyStore = create<MoneyStoreState>((set, get) => ({
  transactions: [],
  goals: [],
  budget: 0,
  selectedMonth: getCurrentMonthString(),
  settings: {
    currency: '₹',
    theme: 'system',
    confirmDelete: true,
    startDay: 1,
    defaultGoalColor: '#f8b518'
  },
  loading: true,

  loadData: async () => {
    set({ loading: true })
    try {
      const month = get().selectedMonth

      // 1. Fetch transactions
      const txs = await db.transactions.toArray()
      
      // 2. Fetch budget for selectedMonth (fallback to general 'monthly' or create 0)
      let currentBudget = 0
      const dbBudget = await db.budget.get(month)
      if (dbBudget) {
        currentBudget = dbBudget.amount
      } else {
        // Migration: check if old 'monthly' budget exists and copy it
        const oldBudget = await db.budget.get('monthly')
        if (oldBudget) {
          currentBudget = oldBudget.amount
          await db.budget.put({ id: month, amount: currentBudget })
        } else {
          await db.budget.put({ id: month, amount: 0 })
        }
      }

      // 3. Fetch goals
      const dbGoals = await db.goals.toArray()

      // 4. Fetch settings (seed if missing)
      let currentSettings: MoneySettings = {
        currency: '₹',
        theme: 'system',
        confirmDelete: true,
        startDay: 1,
        defaultGoalColor: '#f8b518'
      }
      const dbSettings = await db.settings.get('current')
      if (dbSettings) {
        currentSettings = { ...currentSettings, ...dbSettings }
      } else {
        await db.settings.put({ id: 'current', ...currentSettings })
      }

      set({
        transactions: txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        goals: dbGoals.filter(g => !g.archived),
        budget: currentBudget,
        settings: currentSettings,
        loading: false
      })
    } catch (e) {
      console.error('Error loading offline money manager data:', e)
      set({ loading: false })
    }
  },

  setSelectedMonth: async (month) => {
    set({ selectedMonth: month, loading: true })
    try {
      // Fetch budget for the selected month
      let currentBudget = 0
      const dbBudget = await db.budget.get(month)
      if (dbBudget) {
        currentBudget = dbBudget.amount
      } else {
        await db.budget.put({ id: month, amount: 0 })
      }
      
      set({ budget: currentBudget, loading: false })
    } catch (e) {
      console.error('Error switching month data:', e)
      set({ loading: false })
    }
  },

  addTransaction: async (tx) => {
    try {
      const id = await db.transactions.add(tx as Transaction)
      const newTx: Transaction = { id, ...tx }
      set((state) => {
        const next = [newTx, ...state.transactions]
        return {
          transactions: next.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        }
      })
    } catch (e) {
      console.error('Failed to save transaction:', e)
    }
  },

  deleteTransaction: async (id) => {
    try {
      await db.transactions.delete(id)
      set((state) => ({
        transactions: state.transactions.filter((tx) => tx.id !== id)
      }))
    } catch (e) {
      console.error('Failed to delete transaction:', e)
    }
  },

  updateBudget: async (amount) => {
    const month = get().selectedMonth
    try {
      await db.budget.put({ id: month, amount })
      set({ budget: amount })
    } catch (e) {
      console.error('Failed to update budget limit:', e)
    }
  },

  addGoal: async (goal) => {
    try {
      const id = await db.goals.add(goal as SavingsGoal)
      const newGoal = { id, ...goal }
      set((state) => ({
        goals: [...state.goals, newGoal]
      }))
    } catch (e) {
      console.error('Failed to add savings goal:', e)
    }
  },

  updateGoal: async (id, updates) => {
    try {
      await db.goals.update(id, updates)
      set((state) => ({
        goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)).filter(g => !g.archived)
      }))
    } catch (e) {
      console.error('Failed to update savings goal:', e)
    }
  },

  deleteGoal: async (id) => {
    try {
      await db.goals.delete(id)
      set((state) => ({
        goals: state.goals.filter((g) => g.id !== id)
      }))
    } catch (e) {
      console.error('Failed to delete savings goal:', e)
    }
  },

  addSavingsToGoal: async (id, amount) => {
    try {
      const goal = get().goals.find((g) => g.id === id)
      if (!goal) return
      
      const newAmount = goal.currentAmount + amount
      await db.goals.update(id, { currentAmount: newAmount })
      
      // Auto-log a corresponding expense if desired or keep it separate.
      // Goal parameters are kept independent as requested.
      set((state) => ({
        goals: state.goals.map((g) => (g.id === id ? { ...g, currentAmount: newAmount } : g))
      }))
    } catch (e) {
      console.error('Failed to deposit savings:', e)
    }
  },

  withdrawSavingsFromGoal: async (id, amount) => {
    try {
      const goal = get().goals.find((g) => g.id === id)
      if (!goal) return
      
      const newAmount = Math.max(0, goal.currentAmount - amount)
      await db.goals.update(id, { currentAmount: newAmount })

      set((state) => ({
        goals: state.goals.map((g) => (g.id === id ? { ...g, currentAmount: newAmount } : g))
      }))
    } catch (e) {
      console.error('Failed to withdraw savings:', e)
    }
  },

  updateSettings: async (updates) => {
    try {
      const nextSettings = { ...get().settings, ...updates }
      await db.settings.put({ id: 'current', ...nextSettings })
      set({ settings: nextSettings })
    } catch (e) {
      console.error('Failed to update settings:', e)
    }
  },

  exportBackup: async () => {
    try {
      const transactionsList = await db.transactions.toArray()
      const budgetList = await db.budget.toArray()
      const goalsList = await db.goals.toArray()
      const settingsObj = await db.settings.get('current')

      const backupObj = {
        version: 2,
        exportedAt: new Date().toISOString(),
        transactions: transactionsList,
        budget: budgetList,
        goals: goalsList,
        settings: settingsObj || get().settings
      }

      const jsonString = JSON.stringify(backupObj, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `money_manager_backup_${getCurrentMonthString()}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Failed to export backup registry:', e)
    }
  },

  importBackup: async (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString)
      
      // Basic validation checks
      if (!parsed.transactions || !parsed.budget || !parsed.goals) {
        return { success: false, error: 'Invalid backup file structure.' }
      }

      // Clear all existing databases
      await db.transactions.clear()
      await db.budget.clear()
      await db.goals.clear()
      await db.settings.clear()

      // Bulk restore
      if (parsed.transactions.length > 0) {
        await db.transactions.bulkAdd(parsed.transactions)
      }
      if (parsed.budget.length > 0) {
        await db.budget.bulkAdd(parsed.budget)
      }
      if (parsed.goals.length > 0) {
        await db.goals.bulkAdd(parsed.goals)
      }
      if (parsed.settings) {
        await db.settings.put(parsed.settings)
      }

      // Re-load data
      await get().loadData()
      return { success: true }
    } catch (e: any) {
      console.error('Failed to import database backup:', e)
      return { success: false, error: e.message || 'Parsing error.' }
    }
  },

  resetAllData: async () => {
    try {
      await db.transactions.clear()
      await db.budget.clear()
      await db.goals.clear()
      await db.settings.clear()
      
      // Restore default state
      set({
        transactions: [],
        goals: [],
        budget: 0,
        selectedMonth: getCurrentMonthString(),
        settings: {
          currency: '₹',
          theme: 'system',
          confirmDelete: true,
          startDay: 1,
          defaultGoalColor: '#f8b518'
        }
      })
      await get().loadData()
    } catch (e) {
      console.error('Failed to wipe database collections:', e)
    }
  }
}))

export default useMoneyStore
