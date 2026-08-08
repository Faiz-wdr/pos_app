import { useEffect } from 'react'
import { useAuth } from '@/core/firebase/hooks/useAuth'
import { db as firestoreDb } from '@/core/firebase/firestore'
import { collection, onSnapshot, doc, getDocs, setDoc } from 'firebase/firestore'
import { db as dexieDb } from '../database/db'
import { Transaction, Budget, MoneySettings, SavingsGoal } from '../types'
import { sanitizeForFirestore } from '../utils/firestoreUtils'
import { useMoneyStore } from '../store/moneyStore'

// Helper to generate UUID
const generateUUID = () => {
  return typeof crypto.randomUUID === 'function' 
    ? crypto.randomUUID() 
    : 'tx-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now()
}

export const useMoneyManagerSync = () => {
  const { user } = useAuth()
  const loadData = useMoneyStore((state) => state.loadData)

  useEffect(() => {
    if (!user) return

    let unsubscribeTxs: (() => void) | null = null
    let unsubscribeGoals: (() => void) | null = null
    let unsubscribeBudgets: (() => void) | null = null
    let unsubscribeSettings: (() => void) | null = null
    let active = true

    const syncMoneyManager = async () => {
      try {
        const userId = user.uid

        // Ensure all local transactions have UUIDs and timestamps
        const localTxs = await dexieDb.transactions.toArray()
        for (const tx of localTxs) {
          let updated = false
          if (!tx.uuid) {
            tx.uuid = generateUUID()
            updated = true
          }
          if (!tx.createdAt) {
            tx.createdAt = Date.now()
            tx.updatedAt = Date.now()
            updated = true
          }
          if (updated) {
            await dexieDb.transactions.put(tx)
          }
        }

        // Ensure all local goals have UUIDs and timestamps
        const localGoals = await dexieDb.goals.toArray()
        for (const goal of localGoals) {
          let updated = false
          if (!goal.uuid) {
            goal.uuid = generateUUID()
            updated = true
          }
          if (!goal.createdAt) {
            goal.createdAt = Date.now()
            goal.updatedAt = Date.now()
            updated = true
          }
          if (updated) {
            await dexieDb.goals.put(goal)
          }
        }

        // 1. Initial Sync for Transactions
        const freshLocalTxs = await dexieDb.transactions.toArray()
        const localTxsMap = new Map(freshLocalTxs.map(t => [t.uuid!, t]))

        const txsColRef = collection(firestoreDb, 'users', userId, 'money_manager', 'data', 'transactions')
        const firestoreTxsSnapshot = await getDocs(txsColRef)
        const firestoreTxsMap = new Map<string, Transaction>()

        for (const docSnap of firestoreTxsSnapshot.docs) {
          firestoreTxsMap.set(docSnap.id, docSnap.data() as Transaction)
        }

        // Bidirectional merge for transactions
        for (const [uuid, localTx] of localTxsMap) {
          const remoteTx = firestoreTxsMap.get(uuid)
          if (!remoteTx) {
            await setDoc(doc(firestoreDb, 'users', userId, 'money_manager', 'data', 'transactions', uuid), sanitizeForFirestore(localTx))
          } else if ((localTx.updatedAt || 0) > (remoteTx.updatedAt || 0)) {
            await setDoc(doc(firestoreDb, 'users', userId, 'money_manager', 'data', 'transactions', uuid), sanitizeForFirestore(localTx))
          } else if ((remoteTx.updatedAt || 0) > (localTx.updatedAt || 0)) {
            // Find local ID if exists to update
            const existing = freshLocalTxs.find(t => t.uuid === uuid)
            await dexieDb.transactions.put({ ...remoteTx, id: existing?.id })
          }
        }

        for (const [uuid, remoteTx] of firestoreTxsMap) {
          if (!localTxsMap.has(uuid)) {
            await dexieDb.transactions.put(remoteTx)
          }
        }

        // 2. Initial Sync for Goals
        const freshLocalGoals = await dexieDb.goals.toArray()
        const localGoalsMap = new Map(freshLocalGoals.map(g => [g.uuid!, g]))

        const goalsColRef = collection(firestoreDb, 'users', userId, 'money_manager', 'data', 'goals')
        const firestoreGoalsSnapshot = await getDocs(goalsColRef)
        const firestoreGoalsMap = new Map<string, SavingsGoal>()

        for (const docSnap of firestoreGoalsSnapshot.docs) {
          firestoreGoalsMap.set(docSnap.id, docSnap.data() as SavingsGoal)
        }

        // Bidirectional merge for goals
        for (const [uuid, localGoal] of localGoalsMap) {
          const remoteGoal = firestoreGoalsMap.get(uuid)
          if (!remoteGoal) {
            await setDoc(doc(firestoreDb, 'users', userId, 'money_manager', 'data', 'goals', uuid), sanitizeForFirestore(localGoal))
          } else if ((localGoal.updatedAt || 0) > (remoteGoal.updatedAt || 0)) {
            await setDoc(doc(firestoreDb, 'users', userId, 'money_manager', 'data', 'goals', uuid), sanitizeForFirestore(localGoal))
          } else if ((remoteGoal.updatedAt || 0) > (localGoal.updatedAt || 0)) {
            const existing = freshLocalGoals.find(g => g.uuid === uuid)
            await dexieDb.goals.put({ ...remoteGoal, id: existing?.id })
          }
        }

        for (const [uuid, remoteGoal] of firestoreGoalsMap) {
          if (!localGoalsMap.has(uuid)) {
            await dexieDb.goals.put(remoteGoal)
          }
        }

        // 3. Initial Sync for Budgets
        const localBudgets = await dexieDb.budget.toArray()
        const localBudgetsMap = new Map(localBudgets.map(b => [b.id!, b]))

        const budgetsColRef = collection(firestoreDb, 'users', userId, 'money_manager', 'data', 'budgets')
        const firestoreBudgetsSnapshot = await getDocs(budgetsColRef)
        const firestoreBudgetsMap = new Map<string, Budget>()

        for (const docSnap of firestoreBudgetsSnapshot.docs) {
          firestoreBudgetsMap.set(docSnap.id, docSnap.data() as Budget)
        }

        // Bidirectional merge for budgets
        for (const [month, localBudget] of localBudgetsMap) {
          const remoteBudget = firestoreBudgetsMap.get(month)
          if (!remoteBudget) {
            await setDoc(doc(firestoreDb, 'users', userId, 'money_manager', 'data', 'budgets', month), sanitizeForFirestore(localBudget))
          } else if ((localBudget.updatedAt || 0) > (remoteBudget.updatedAt || 0)) {
            await setDoc(doc(firestoreDb, 'users', userId, 'money_manager', 'data', 'budgets', month), sanitizeForFirestore(localBudget))
          } else if ((remoteBudget.updatedAt || 0) > (localBudget.updatedAt || 0)) {
            await dexieDb.budget.put(remoteBudget)
          }
        }

        for (const [month, remoteBudget] of firestoreBudgetsMap) {
          if (!localBudgetsMap.has(month)) {
            await dexieDb.budget.put(remoteBudget)
          }
        }

        // 4. Initial Sync for Settings
        const localSettingsList = await dexieDb.settings.toArray()
        const localSettings = localSettingsList.find(s => s.id === 'current')

        const settingsDocRef = doc(firestoreDb, 'users', userId, 'money_manager', 'data', 'settings', 'current')
        const firestoreSettingsSnapshot = await getDocs(collection(firestoreDb, 'users', userId, 'money_manager', 'data', 'settings'))
        const remoteSettings = firestoreSettingsSnapshot.docs.find(d => d.id === 'current')?.data() as MoneySettings | undefined

        if (localSettings) {
          if (!remoteSettings) {
            await setDoc(settingsDocRef, sanitizeForFirestore(localSettings))
          } else if ((localSettings.updatedAt || 0) > (remoteSettings.updatedAt || 0)) {
            await setDoc(settingsDocRef, sanitizeForFirestore(localSettings))
          } else if ((remoteSettings.updatedAt || 0) > (localSettings.updatedAt || 0)) {
            await dexieDb.settings.put(remoteSettings)
          }
        } else if (remoteSettings) {
          await dexieDb.settings.put(remoteSettings)
        }

        // Reload data in the Zustand store
        await loadData()

        if (!active) return

        // 5. Setup Live Listeners for remote changes
        unsubscribeTxs = onSnapshot(txsColRef, (snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            const txData = change.doc.data() as Transaction
            const txUuid = change.doc.id
            if (change.type === 'added' || change.type === 'modified') {
              const localTxsList = await dexieDb.transactions.toArray()
              const existing = localTxsList.find(t => t.uuid === txUuid)
              if (!existing || (txData.updatedAt || 0) > (existing.updatedAt || 0)) {
                await dexieDb.transactions.put({ ...txData, id: existing?.id })
                await loadData()
              }
            } else if (change.type === 'removed') {
              const localTxsList = await dexieDb.transactions.toArray()
              const existing = localTxsList.find(t => t.uuid === txUuid)
              if (existing) {
                await dexieDb.transactions.delete(existing.id!)
                await loadData()
              }
            }
          })
        })

        unsubscribeGoals = onSnapshot(goalsColRef, (snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            const goalData = change.doc.data() as SavingsGoal
            const goalUuid = change.doc.id
            if (change.type === 'added' || change.type === 'modified') {
              const localGoalsList = await dexieDb.goals.toArray()
              const existing = localGoalsList.find(g => g.uuid === goalUuid)
              if (!existing || (goalData.updatedAt || 0) > (existing.updatedAt || 0)) {
                await dexieDb.goals.put({ ...goalData, id: existing?.id })
                await loadData()
              }
            } else if (change.type === 'removed') {
              const localGoalsList = await dexieDb.goals.toArray()
              const existing = localGoalsList.find(g => g.uuid === goalUuid)
              if (existing) {
                await dexieDb.goals.delete(existing.id!)
                await loadData()
              }
            }
          })
        })

        unsubscribeBudgets = onSnapshot(budgetsColRef, (snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            const budgetData = change.doc.data() as Budget
            const budgetMonth = change.doc.id
            if (change.type === 'added' || change.type === 'modified') {
              const localBudget = await dexieDb.budget.get(budgetMonth)
              if (!localBudget || (budgetData.updatedAt || 0) > (localBudget.updatedAt || 0)) {
                await dexieDb.budget.put(budgetData)
                await loadData()
              }
            } else if (change.type === 'removed') {
              const localBudget = await dexieDb.budget.get(budgetMonth)
              if (localBudget) {
                await dexieDb.budget.delete(budgetMonth)
                await loadData()
              }
            }
          })
        })

        unsubscribeSettings = onSnapshot(collection(firestoreDb, 'users', userId, 'money_manager', 'data', 'settings'), (snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            if (change.doc.id !== 'current') return
            const settingsData = change.doc.data() as MoneySettings
            if (change.type === 'added' || change.type === 'modified') {
              const localSetting = await dexieDb.settings.get('current')
              if (!localSetting || (settingsData.updatedAt || 0) > (localSetting.updatedAt || 0)) {
                await dexieDb.settings.put(settingsData)
                await loadData()
              }
            }
          })
        })

      } catch (e) {
        console.error('Error in Money Manager Firestore sync:', e)
      }
    }

    syncMoneyManager()

    return () => {
      active = false
      if (unsubscribeTxs) unsubscribeTxs()
      if (unsubscribeGoals) unsubscribeGoals()
      if (unsubscribeBudgets) unsubscribeBudgets()
      if (unsubscribeSettings) unsubscribeSettings()
    }
  }, [user])
}
