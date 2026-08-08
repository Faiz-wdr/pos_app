import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMoneyStore } from '../store/moneyStore'
import { SavingsGoal } from '../types'
import { TransactionCard } from '../components/TransactionCard'
import { BudgetModal } from '../components/BudgetModal'
import { GoalModal } from '../components/GoalModal'
import { SavingsDepositModal } from '../components/SavingsDepositModal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Dropdown } from '../components/Dropdown'
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { useSettingsStore } from '@/core/settings/settingsStore'

const formatMonthLabel = (monthStr: string) => {
  try {
    const [y, m] = monthStr.split('-').map(Number)
    const date = new Date(y, m - 1, 1)
    return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  } catch {
    return monthStr
  }
}

interface DashboardTabProps {
  onNavigateToHistory: () => void
  onNavigateToGoals: () => void
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  onNavigateToHistory,
  onNavigateToGoals
}) => {
  const { 
    transactions, 
    budget, 
    goals, 
    selectedMonth, 
    setSelectedMonth, 
    settings,
    updateGoal,
    deleteGoal
  } = useMoneyStore()
  
  const animationsEnabled = useSettingsStore((state) => state.animationsEnabled)

  // Modals state
  const [activeModal, setActiveModal] = useState<'budget' | 'goal' | 'savings' | null>(null)
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null)
  const [savingsMode, setSavingsMode] = useState<'deposit' | 'withdraw'>('deposit')

  // Custom Confirm Dialogs states
  const [goalToComplete, setGoalToComplete] = useState<SavingsGoal | null>(null)
  const [goalToDelete, setGoalToDelete] = useState<SavingsGoal | null>(null)

  // Generate Month list from transactions
  const uniqueMonths = useMemo(() => {
    const months = new Set<string>()
    const now = new Date()
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    months.add(currentMonthStr)
    
    transactions.forEach((tx) => {
      if (tx.date && tx.date.length >= 7) {
        months.add(tx.date.substring(0, 7))
      }
    })
    
    return Array.from(months).sort().reverse()
  }, [transactions])

  const monthOptions = useMemo(() => {
    return uniqueMonths.map((m) => ({
      label: formatMonthLabel(m),
      value: m
    }))
  }, [uniqueMonths])

  // Calculations for selected month
  const stats = useMemo(() => {
    let income = 0
    let expenses = 0
    const selectedPrefix = selectedMonth || ''

    const txsList = transactions || []
    txsList.forEach((tx) => {
      if (tx.date && tx.date.startsWith(selectedPrefix)) {
        if (tx.type === 'income') {
          income += tx.amount
        } else {
          expenses += tx.amount
        }
      }
    })

    // Lifetime balance calculation
    let lifetimeIncome = 0
    let lifetimeExpenses = 0
    txsList.forEach((tx) => {
      if (tx.type === 'income') {
        lifetimeIncome += tx.amount
      } else {
        lifetimeExpenses += tx.amount
      }
    })
    const balance = lifetimeIncome - lifetimeExpenses
    const savings = income - expenses
    const budgetPercentage = budget > 0 ? Math.min(100, Math.round((expenses / budget) * 100)) : 0

    // Budget status check
    let budgetStatus: 'Safe' | 'Near Limit' | 'Exceeded' = 'Safe'
    if (budget > 0) {
      const ratio = expenses / budget
      if (ratio > 1) {
        budgetStatus = 'Exceeded'
      } else if (ratio >= 0.75) {
        budgetStatus = 'Near Limit'
      }
    }

    return {
      income,
      expenses,
      balance,
      savings,
      budgetPercentage,
      budgetStatus
    }
  }, [transactions, selectedMonth, budget])

  // Support TWO active goals on Home Overview
  const activeGoals = useMemo(() => {
    return goals.filter(g => !g.archived).slice(0, 2)
  }, [goals])

  const handleOpenGoalSavings = (goal: SavingsGoal, mode: 'deposit' | 'withdraw') => {
    setSelectedGoal(goal)
    setSavingsMode(mode)
    setActiveModal('savings')
  }

  const handleConfirmCompleteGoal = async () => {
    if (goalToComplete) {
      await updateGoal(goalToComplete.id!, { archived: true })
      setGoalToComplete(null)
    }
  }

  const handleConfirmDeleteGoal = async () => {
    if (goalToDelete) {
      await deleteGoal(goalToDelete.id!)
      setGoalToDelete(null)
    }
  }

  // Filtered transactions for selected month
  const monthTransactions = useMemo(() => {
    return transactions.filter(t => t.date && t.date.startsWith(selectedMonth))
  }, [transactions, selectedMonth])

  return (
    <div className="space-y-5 text-left pb-8 select-none">
      
      {/* Overview Header Tab */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-foreground mt-0.5 tracking-tight">Overview</h2>
        </div>
        <div>
          <Dropdown
            value={selectedMonth}
            onChange={setSelectedMonth}
            options={monthOptions}
          />
        </div>
      </div>

      {/* Balance, Income, Expense, Savings Cards (Two in one line) */}
      <div className="grid grid-cols-2 gap-4">
        {/* Current Balance */}
        <Card className="bg-card/60 dark:bg-card/30 border border-border/55 p-4 flex flex-col justify-between">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Current Balance</span>
          <span 
            className="text-2xl font-bold font-mono tracking-tight mt-1"
            style={{ color: stats.balance >= 0 ? '#10b981' : '#ef4444' }}
          >
            {settings.currency}{stats.balance.toLocaleString()}
          </span>
        </Card>

        {/* Savings */}
        <Card className="bg-card/60 dark:bg-card/30 border border-border/55 p-4 flex flex-col justify-between">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Savings</span>
          <span 
            className="text-2xl font-bold font-mono tracking-tight mt-1"
            style={{ color: stats.savings >= 0 ? '#10b981' : '#ef4444' }}
          >
            {settings.currency}{stats.savings.toLocaleString()}
          </span>
        </Card>

        {/* Income */}
        <Card className="bg-card/60 dark:bg-card/30 border border-border/55 p-4 flex flex-col justify-between">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center space-x-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
            <span>Income</span>
          </span>
          <span className="text-lg font-bold text-foreground font-mono mt-1">
            {settings.currency}{stats.income.toLocaleString()}
          </span>
        </Card>

        {/* Expense */}
        <Card className="bg-card/60 dark:bg-card/30 border border-border/55 p-4 flex flex-col justify-between">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center space-x-1">
            <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
            <span>Expenses</span>
          </span>
          <span className="text-lg font-bold text-foreground font-mono mt-1">
            {settings.currency}{stats.expenses.toLocaleString()}
          </span>
        </Card>
      </div>

      {/* Monthly Budget Progress */}
      {budget > 0 && (
        <Card className="bg-card/60 dark:bg-card/30 border border-border/50 p-4.5 space-y-3">
          <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
            <span className="flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5 text-accent shrink-0" />
              <span>Budget Usage ({stats.budgetPercentage}%)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span>Status:</span>
              <span 
                style={{
                  color: stats.budgetStatus === 'Exceeded' ? '#ef4444' : stats.budgetStatus === 'Near Limit' ? '#f8b518' : '#10b981'
                }}
              >
                {stats.budgetStatus}
              </span>
            </span>
          </div>

          <div className="w-full bg-muted/60 dark:bg-muted/30 h-2 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                width: `${stats.budgetPercentage}%`,
                backgroundColor: stats.budgetStatus === 'Exceeded' ? '#ef4444' : stats.budgetStatus === 'Near Limit' ? '#f8b518' : '#3b82f6'
              }}
              initial={animationsEnabled ? { width: 0 } : { width: `${stats.budgetPercentage}%` }}
              animate={{ width: `${stats.budgetPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>

          <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-muted-foreground pt-0.5">
            <span>Spent: {settings.currency}{stats.expenses.toLocaleString()}</span>
            <span>Limit: {settings.currency}{budget.toLocaleString()}</span>
          </div>
        </Card>
      )}

      {/* Savings Goals Widget (Supports up to 2 active goals as a list, view all redirects) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Active Savings Goals
          </label>
          <div className="flex space-x-2.5">
            <button
              onClick={() => { setSelectedGoal(null); setActiveModal('goal'); }}
              className="text-[9px] font-bold uppercase tracking-wider text-accent cursor-pointer hover:underline"
            >
              + Create
            </button>
            {goals.length > 0 && (
              <button
                onClick={onNavigateToGoals}
                className="text-[9px] font-bold uppercase tracking-wider text-accent cursor-pointer hover:underline"
              >
                View All
              </button>
            )}
          </div>
        </div>

        {activeGoals.length === 0 ? (
          <Card className="border-dashed border-border/80 bg-muted/10">
            <CardContent className="py-8 text-center flex flex-col items-center justify-center space-y-3 select-none">
              <span className="text-[11px] text-muted-foreground">No active savings goal set.</span>
              <button
                onClick={() => { setSelectedGoal(null); setActiveModal('goal'); }}
                className="h-8.5 px-4 bg-accent text-accent-foreground font-bold text-[10px] uppercase tracking-wider rounded-xl cursor-pointer hover:bg-accent/90 transition-all active:scale-95 flex items-center justify-center"
              >
                + Create Goal
              </button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {activeGoals.map((goal) => {
              const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0
              const remaining = Math.max(0, goal.targetAmount - goal.currentAmount)

              return (
                <div
                  key={goal.id}
                  className="p-3.5 bg-card/60 dark:bg-card/30 border border-border/50 rounded-2xl flex flex-col justify-between space-y-3 text-left"
                >
                  <div className="flex items-start justify-between space-x-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-foreground truncate">{goal.name}</h4>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5 block">
                        Saved: {settings.currency}{goal.currentAmount.toLocaleString()} / {settings.currency}{goal.targetAmount.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-foreground shrink-0 bg-muted px-2 py-0.5 rounded-lg border border-border/20">
                      {pct}%
                    </span>
                  </div>

                  {/* Goal Progress Line */}
                  <div className="space-y-1">
                    <div className="w-full bg-muted/60 dark:bg-muted/30 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[8px] text-muted-foreground block text-right font-semibold">
                      {remaining > 0 ? `Remaining: ${settings.currency}${remaining.toLocaleString()}` : 'Target Met! 🎉'}
                    </span>
                  </div>

                  {/* Inline Action list links */}
                  <div className="flex justify-end space-x-3 text-[9px] font-bold uppercase tracking-wider pt-1.5 border-t border-border/20">
                    <button
                      onClick={() => handleOpenGoalSavings(goal, 'deposit')}
                      className="text-accent cursor-pointer hover:underline"
                    >
                      Deposit
                    </button>
                    <button
                      onClick={() => handleOpenGoalSavings(goal, 'withdraw')}
                      className="text-accent cursor-pointer hover:underline"
                    >
                      Withdraw
                    </button>
                    <button
                      onClick={() => { setSelectedGoal(goal); setActiveModal('goal'); }}
                      className="text-muted-foreground cursor-pointer hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setGoalToComplete(goal)}
                      className="text-emerald-500 cursor-pointer hover:underline"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent Activity List (Last 5 Transactions) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Recent Transactions
          </label>
          {monthTransactions.length > 5 && (
            <button
              onClick={onNavigateToHistory}
              className="text-[9px] font-bold uppercase tracking-wider text-accent cursor-pointer hover:underline"
            >
              View All
            </button>
          )}
        </div>

        {monthTransactions.length === 0 ? (
          <Card className="border-dashed border-border/80 bg-muted/10">
            <CardContent className="py-10 flex flex-col items-center justify-center text-center space-y-2 select-none">
              <span className="text-xs text-muted-foreground">No Transactions Yet</span>
              <p className="text-[9px] text-muted-foreground/80 max-w-[200px] mx-auto leading-normal">
                Log your first income or expense transaction to start monitoring cash flows.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {monthTransactions.slice(0, 5).map((tx) => (
              <TransactionCard key={tx.id} transaction={tx} />
            ))}
          </div>
        )}
      </div>

      {/* Dialogue Sheets overlays */}
      <AnimatePresence>
        {activeModal === 'budget' && (
          <BudgetModal
            isOpen={activeModal !== null}
            onClose={() => setActiveModal(null)}
          />
        )}

        {activeModal === 'goal' && (
          <GoalModal
            isOpen={activeModal !== null}
            onClose={() => { setActiveModal(null); setSelectedGoal(null); }}
            goalToEdit={selectedGoal}
          />
        )}

        {activeModal === 'savings' && selectedGoal && (
          <SavingsDepositModal
            isOpen={activeModal !== null}
            onClose={() => { setActiveModal(null); setSelectedGoal(null); }}
            goal={selectedGoal}
            defaultMode={savingsMode}
          />
        )}

        {goalToComplete && (
          <ConfirmDialog
            isOpen={goalToComplete !== null}
            onClose={() => setGoalToComplete(null)}
            onConfirm={handleConfirmCompleteGoal}
            title="Complete Goal"
            message={`Are you sure you want to mark "${goalToComplete.name}" as completed? It will be archived.`}
            confirmText="Yes, Complete"
            variant="primary"
          />
        )}

        {goalToDelete && (
          <ConfirmDialog
            isOpen={goalToDelete !== null}
            onClose={() => setGoalToDelete(null)}
            onConfirm={handleConfirmDeleteGoal}
            title="Delete Goal"
            message={`Are you sure you want to permanently delete "${goalToDelete.name}"? This cannot be undone.`}
            confirmText="Delete"
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default DashboardTab
