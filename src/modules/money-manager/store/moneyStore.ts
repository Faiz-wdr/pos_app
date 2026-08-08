import { create } from 'zustand'
import { db } from '../database/db'
import { Transaction, Budget, MoneySettings, SavingsGoal } from '../types'
import { auth } from '@/core/firebase/auth'
import { db as firestoreDb } from '@/core/firebase/firestore'
import { doc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore'
import { sanitizeForFirestore } from '../utils/firestoreUtils'

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
  addTransaction: (tx: Omit<Transaction, 'id' | 'uuid'>) => Promise<void>
  updateTransaction: (id: number, updates: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: number) => Promise<void>
  
  // Budget
  updateBudget: (amount: number) => Promise<void>
  
  // Goals
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'uuid'>) => Promise<void>
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

// Helpers for Firestore Syncing
const getUserId = () => auth.currentUser?.uid

const generateUUID = () => {
  return typeof crypto.randomUUID === 'function' 
    ? crypto.randomUUID() 
    : 'tx-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now()
}

const syncTransactionToFirestore = async (tx: Transaction) => {
  const userId = getUserId()
  if (!userId || !tx.uuid) return
  try {
    await setDoc(doc(firestoreDb, 'users', userId, 'money_manager', 'data', 'transactions', tx.uuid), sanitizeForFirestore(tx))
  } catch (e) {
    console.error('Error syncing transaction to firestore:', e)
  }
}

const deleteTransactionFromFirestore = async (uuid: string) => {
  const userId = getUserId()
  if (!userId) return
  try {
    await deleteDoc(doc(firestoreDb, 'users', userId, 'money_manager', 'data', 'transactions', uuid))
  } catch (e) {
    console.error('Error deleting transaction from firestore:', e)
  }
}

const syncBudgetToFirestore = async (budget: Budget) => {
  const userId = getUserId()
  if (!userId || !budget.id) return
  try {
    await setDoc(doc(firestoreDb, 'users', userId, 'money_manager', 'data', 'budgets', budget.id), sanitizeForFirestore(budget))
  } catch (e) {
    console.error('Error syncing budget to firestore:', e)
  }
}

const syncGoalToFirestore = async (goal: SavingsGoal) => {
  const userId = getUserId()
  if (!userId || !goal.uuid) return
  try {
    await setDoc(doc(firestoreDb, 'users', userId, 'money_manager', 'data', 'goals', goal.uuid), sanitizeForFirestore(goal))
  } catch (e) {
    console.error('Error syncing goal to firestore:', e)
  }
}

const deleteGoalFromFirestore = async (uuid: string) => {
  const userId = getUserId()
  if (!userId) return
  try {
    await deleteDoc(doc(firestoreDb, 'users', userId, 'money_manager', 'data', 'goals', uuid))
  } catch (e) {
    console.error('Error deleting goal from firestore:', e)
  }
}

const syncSettingsToFirestore = async (settings: MoneySettings) => {
  const userId = getUserId()
  if (!userId) return
  try {
    await setDoc(doc(firestoreDb, 'users', userId, 'money_manager', 'data', 'settings', 'current'), sanitizeForFirestore(settings))
  } catch (e) {
    console.error('Error syncing settings to firestore:', e)
  }
}

const wipeMoneyManagerFirestoreData = async () => {
  const userId = getUserId()
  if (!userId) return
  try {
    await deleteDoc(doc(firestoreDb, 'users', userId, 'money_manager', 'data', 'settings', 'current'))
    
    const txsColRef = collection(firestoreDb, 'users', userId, 'money_manager', 'data', 'transactions')
    const txsSnapshot = await getDocs(txsColRef)
    for (const d of txsSnapshot.docs) {
      await deleteDoc(doc(firestoreDb, 'users', userId, 'money_manager', 'data', 'transactions', d.id))
    }

    const goalsColRef = collection(firestoreDb, 'users', userId, 'money_manager', 'data', 'goals')
    const goalsSnapshot = await getDocs(goalsColRef)
    for (const d of goalsSnapshot.docs) {
      await deleteDoc(doc(firestoreDb, 'users', userId, 'money_manager', 'data', 'goals', d.id))
    }

    const budgetsColRef = collection(firestoreDb, 'users', userId, 'money_manager', 'data', 'budgets')
    const budgetsSnapshot = await getDocs(budgetsColRef)
    for (const d of budgetsSnapshot.docs) {
      await deleteDoc(doc(firestoreDb, 'users', userId, 'money_manager', 'data', 'budgets', d.id))
    }
  } catch (e) {
    console.error('Error wiping Money Manager firestore data:', e)
  }
}

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
    defaultGoalColor: '#f8b518',
    defaultBudget: 0
  },
  loading: true,

  loadData: async () => {
    set({ loading: true })
    try {
      const month = get().selectedMonth

      // 1. Fetch transactions
      const txs = await db.transactions.toArray()
      
      // 2. Fetch budget for selectedMonth
      let currentBudget = 0
      const dbBudget = await db.budget.get(month)
      if (dbBudget) {
        currentBudget = dbBudget.amount
      } else {
        const oldBudget = await db.budget.get('monthly')
        if (oldBudget) {
          currentBudget = oldBudget.amount
          const newB = { id: month, amount: currentBudget, createdAt: Date.now(), updatedAt: Date.now() }
          await db.budget.put(newB)
          await syncBudgetToFirestore(newB)
        } else {
          const newB = { id: month, amount: 0, createdAt: Date.now(), updatedAt: Date.now() }
          await db.budget.put(newB)
          await syncBudgetToFirestore(newB)
        }
      }

      // 3. Fetch goals
      const dbGoals = await db.goals.toArray()

      // 4. Fetch settings
      let currentSettings: MoneySettings = {
        currency: '₹',
        theme: 'system',
        confirmDelete: true,
        startDay: 1,
        defaultGoalColor: '#f8b518',
        defaultBudget: 0
      }
      const dbSettings = await db.settings.get('current')
      if (dbSettings) {
        currentSettings = { ...currentSettings, ...dbSettings }
      } else {
        const newSettings = { id: 'current', ...currentSettings, createdAt: Date.now(), updatedAt: Date.now() }
        await db.settings.put(newSettings)
        await syncSettingsToFirestore(newSettings)
      }

      set({
        transactions: txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        goals: dbGoals,
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
      let currentBudget = 0
      const dbBudget = await db.budget.get(month)
      if (dbBudget) {
        currentBudget = dbBudget.amount
      } else {
        const newB = { id: month, amount: 0, createdAt: Date.now(), updatedAt: Date.now() }
        await db.budget.put(newB)
        await syncBudgetToFirestore(newB)
      }
      
      set({ budget: currentBudget, loading: false })
    } catch (e) {
      console.error('Error switching month data:', e)
      set({ loading: false })
    }
  },

  addTransaction: async (tx) => {
    try {
      const uuid = generateUUID()
      const newTxItem: Transaction = {
        ...tx,
        uuid,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      const id = await db.transactions.add(newTxItem)
      const finalTx = { id, ...newTxItem }
      
      set((state) => {
        const next = [finalTx, ...state.transactions]
        return {
          transactions: next.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        }
      })

      await syncTransactionToFirestore(finalTx)
    } catch (e) {
      console.error('Failed to save transaction:', e)
    }
  },

  updateTransaction: async (id, updates) => {
    try {
      const existing = get().transactions.find(t => t.id === id)
      if (!existing) return

      const updatedItem = {
        ...existing,
        ...updates,
        updatedAt: Date.now()
      }

      await db.transactions.update(id, updatedItem)
      
      set((state) => ({
        transactions: state.transactions.map((tx) => (tx.id === id ? updatedItem : tx))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      }))

      await syncTransactionToFirestore(updatedItem)
    } catch (e) {
      console.error('Failed to update transaction:', e)
    }
  },

  deleteTransaction: async (id) => {
    try {
      const existing = get().transactions.find(t => t.id === id)
      await db.transactions.delete(id)
      
      set((state) => ({
        transactions: state.transactions.filter((tx) => tx.id !== id)
      }))

      if (existing?.uuid) {
        await deleteTransactionFromFirestore(existing.uuid)
      }
    } catch (e) {
      console.error('Failed to delete transaction:', e)
    }
  },

  updateBudget: async (amount) => {
    const month = get().selectedMonth
    try {
      const newB = { id: month, amount, createdAt: Date.now(), updatedAt: Date.now() }
      await db.budget.put(newB)
      set({ budget: amount })
      await syncBudgetToFirestore(newB)
    } catch (e) {
      console.error('Failed to update budget limit:', e)
    }
  },

  addGoal: async (goal) => {
    try {
      const uuid = generateUUID()
      const newGoalItem: SavingsGoal = {
        ...goal,
        uuid,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      const id = await db.goals.add(newGoalItem)
      const finalGoal = { id, ...newGoalItem }
      
      set((state) => ({
        goals: [...state.goals, finalGoal]
      }))

      await syncGoalToFirestore(finalGoal)
    } catch (e) {
      console.error('Failed to add savings goal:', e)
    }
  },

  updateGoal: async (id, updates) => {
    try {
      const existing = get().goals.find(g => g.id === id)
      if (!existing) return

      const updatedGoal = {
        ...existing,
        ...updates,
        updatedAt: Date.now()
      }

      await db.goals.update(id, updatedGoal)
      
      set((state) => ({
        goals: state.goals.map((g) => (g.id === id ? updatedGoal : g))
      }))

      await syncGoalToFirestore(updatedGoal)
    } catch (e) {
      console.error('Failed to update savings goal:', e)
    }
  },

  deleteGoal: async (id) => {
    try {
      const existing = get().goals.find(g => g.id === id)
      await db.goals.delete(id)
      
      set((state) => ({
        goals: state.goals.filter((g) => g.id !== id)
      }))

      if (existing?.uuid) {
        await deleteGoalFromFirestore(existing.uuid)
      }
    } catch (e) {
      console.error('Failed to delete savings goal:', e)
    }
  },

  addSavingsToGoal: async (id, amount) => {
    try {
      const goal = get().goals.find((g) => g.id === id)
      if (!goal) return
      
      const newAmount = goal.currentAmount + amount
      const updatedGoal = {
        ...goal,
        currentAmount: newAmount,
        updatedAt: Date.now()
      }

      await db.goals.update(id, { currentAmount: newAmount, updatedAt: Date.now() })
      
      set((state) => ({
        goals: state.goals.map((g) => (g.id === id ? updatedGoal : g))
      }))

      await syncGoalToFirestore(updatedGoal)
    } catch (e) {
      console.error('Failed to deposit savings:', e)
    }
  },

  withdrawSavingsFromGoal: async (id, amount) => {
    try {
      const goal = get().goals.find((g) => g.id === id)
      if (!goal) return
      
      const newAmount = Math.max(0, goal.currentAmount - amount)
      const updatedGoal = {
        ...goal,
        currentAmount: newAmount,
        updatedAt: Date.now()
      }

      await db.goals.update(id, { currentAmount: newAmount, updatedAt: Date.now() })

      set((state) => ({
        goals: state.goals.map((g) => (g.id === id ? updatedGoal : g))
      }))

      await syncGoalToFirestore(updatedGoal)
    } catch (e) {
      console.error('Failed to withdraw savings:', e)
    }
  },

  updateSettings: async (updates) => {
    try {
      const nextSettings = { 
        ...get().settings, 
        ...updates,
        updatedAt: Date.now()
      }
      await db.settings.put({ id: 'current', ...nextSettings })
      set({ settings: nextSettings })
      await syncSettingsToFirestore(nextSettings)
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
      
      if (!parsed.transactions || !parsed.budget || !parsed.goals) {
        return { success: false, error: 'Invalid backup file structure.' }
      }

      await db.transactions.clear()
      await db.budget.clear()
      await db.goals.clear()
      await db.settings.clear()

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

      // Sync imported data to Firestore
      const userId = getUserId()
      if (userId) {
        for (const tx of parsed.transactions) {
          await syncTransactionToFirestore(tx)
        }
        for (const b of parsed.budget) {
          await syncBudgetToFirestore(b)
        }
        for (const g of parsed.goals) {
          await syncGoalToFirestore(g)
        }
        if (parsed.settings) {
          await syncSettingsToFirestore(parsed.settings)
        }
      }

      await get().loadData()
      return { success: true }
    } catch (e: any) {
      console.error('Failed to import database backup:', e)
      return { success: false, error: e.message || 'Parsing error.' }
    }
  },

  resetAllData: async () => {
    try {
      await wipeMoneyManagerFirestoreData()
      
      await db.transactions.clear()
      await db.budget.clear()
      await db.goals.clear()
      await db.settings.clear()
      
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
          defaultGoalColor: '#f8b518',
          defaultBudget: 0
        }
      })
      await get().loadData()
    } catch (e) {
      console.error('Failed to wipe database collections:', e)
    }
  }
}))

export default useMoneyStore
