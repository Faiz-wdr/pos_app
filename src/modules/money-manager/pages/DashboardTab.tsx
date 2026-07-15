import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMoneyStore } from '../store/moneyStore'
import { SavingsGoal } from '../types'
import { TransactionCard } from '../components/TransactionCard'
import { TransactionModal } from '../components/TransactionModal'
import { BudgetModal } from '../components/BudgetModal'
import { GoalModal } from '../components/GoalModal'
import { SavingsDepositModal } from '../components/SavingsDepositModal'
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Plus, 
  Minus, 
  ArrowRight,
  TrendingUp,
  Target,
  Sparkles,
  Heart,
  PiggyBank,
  CheckCircle,
  Lightbulb
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { useSettingsStore } from '@/core/settings/settingsStore'

// Map goal icon string to Lucide icon
const getGoalIcon = (iconName: string) => {
  switch (iconName) {
    case 'Laptop': return Sparkles
    case 'Smartphone': return Target
    case 'Compass': return PiggyBank
    case 'Heart': return Heart
    case 'Home': return PiggyBank
    case 'Gift': return PiggyBank
    case 'Moon': return PiggyBank
    case 'Sparkles':
    default:
      return Sparkles
  }
}

interface DashboardTabProps {
  onNavigateToHistory: () => void
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  onNavigateToHistory
}) => {
  const { 
    transactions, 
    budget, 
    goals, 
    selectedMonth, 
    setSelectedMonth, 
    settings,
    addSavingsToGoal
  } = useMoneyStore()
  const animationsEnabled = useSettingsStore((state) => state.animationsEnabled)

  // Modals state
  const [activeModal, setActiveModal] = useState<'income' | 'expense' | 'budget' | 'goal' | 'savings' | null>(null)
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null)
  const [savingsMode, setSavingsMode] = useState<'deposit' | 'withdraw'>('deposit')
  const [showAllGoals, setShowAllGoals] = useState(false)

  // 1. Generate unique list of months from transactions for Month Switcher
  const uniqueMonths = useMemo(() => {
    const months = new Set<string>()
    // Always include current month
    const now = new Date()
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    months.add(currentMonthStr)
    
    transactions.forEach((tx) => {
      if (tx.date && tx.date.length >= 7) {
        months.add(tx.date.substring(0, 7)) // YYYY-MM
      }
    })
    
    return Array.from(months).sort().reverse()
  }, [transactions])

  // 2. Calculations for selected month
  const stats = useMemo(() => {
    let income = 0
    let expenses = 0
    let lastMonthExpenses = 0
    const categoryTotals: Record<string, number> = {}

    // Date prefix for selected month YYYY-MM
    const selectedPrefix = selectedMonth || ''

    // Date prefix for last month YYYY-MM
    let prevPrefix = ''
    if (selectedPrefix && selectedPrefix.includes('-')) {
      const [year, month] = selectedPrefix.split('-').map(Number)
      const prevMonthDate = new Date(year, month - 2, 1)
      prevPrefix = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`
    }

    let monthTxsCount = 0

    const txsList = transactions || []
    txsList.forEach((tx) => {
      if (tx.date && tx.date.startsWith(selectedPrefix)) {
        monthTxsCount++
        if (tx.type === 'income') {
          income += tx.amount
        } else {
          expenses += tx.amount
          categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount
        }
      } else if (tx.date.startsWith(prevPrefix)) {
        if (tx.type === 'expense') {
          lastMonthExpenses += tx.amount
        }
      }
    })

    const remaining = income - expenses
    const budgetPercentage = budget > 0 ? Math.min(100, Math.round((expenses / budget) * 100)) : 0
    const rawBudgetPct = budget > 0 ? Math.round((expenses / budget) * 100) : 0

    // Highest category spending
    let highestCat = 'N/A'
    let highestCatAmt = 0
    Object.entries(categoryTotals).forEach(([cat, val]) => {
      if (val > highestCatAmt) {
        highestCatAmt = val
        highestCat = cat
      }
    })

    // Financial Health Score calculation
    let budgetScore = 50
    if (budget > 0) {
      if (expenses <= budget) {
        budgetScore = 50
      } else {
        budgetScore = Math.max(0, 50 - Math.round(((expenses - budget) / budget) * 50))
      }
    } else {
      budgetScore = 40 // Default baseline points if no budget is configured
    }

    const savingsRate = income > 0 ? Math.max(0, (remaining / income)) : 0
    const savingsScore = Math.min(35, Math.round((savingsRate / 0.2) * 35))

    const consistencyScore = Math.min(15, Math.round((monthTxsCount / 4) * 15))
    
    const healthScore = budgetScore + savingsScore + consistencyScore
    let healthStatus = 'Needs Improvement'
    let healthExplanation = 'Try tracking more transactions or setting a monthly budget limit.'
    
    if (healthScore >= 85) {
      healthStatus = 'Excellent'
      healthExplanation = 'Outstanding! You saved efficiently and stayed within budget guidelines.'
    } else if (healthScore >= 60) {
      healthStatus = 'Good'
      healthExplanation = 'Solid financial management. Mind your highest spending categories.'
    } else {
      if (expenses > budget && budget > 0) {
        healthExplanation = 'You exceeded your budget. Try limiting discretionary categories.'
      } else if (remaining < 0) {
        healthExplanation = 'Your expenses exceeded your income. Look into trimming output costs.'
      }
    }

    return {
      income,
      expenses,
      remaining,
      budgetPercentage,
      rawBudgetPct,
      lastMonthExpenses,
      highestCat,
      highestCatAmt,
      healthScore,
      healthStatus,
      healthExplanation,
      txsCount: monthTxsCount
    }
  }, [transactions, selectedMonth, budget])

  // Limit display to 3 goals unless "View All" is toggled
  const visibleGoals = useMemo(() => {
    return showAllGoals ? goals : goals.slice(0, 3)
  }, [goals, showAllGoals])

  const handleOpenGoalSavings = (goal: SavingsGoal, mode: 'deposit' | 'withdraw') => {
    setSelectedGoal(goal)
    setSavingsMode(mode)
    setActiveModal('savings')
  }

  const handleQuickAddSavings = async (goalId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const quickAmount = settings.currency === '₹' ? 500 : 10
    await addSavingsToGoal(goalId, quickAmount)
  }

  const formatMonthLabel = (monthStr: string) => {
    try {
      const [y, m] = monthStr.split('-').map(Number)
      const date = new Date(y, m - 1, 1)
      return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    } catch {
      return monthStr
    }
  }

  return (
    <div className="space-y-5 text-left pb-8 select-none">
      
      {/* Month Switcher Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Overview Dashboard</span>
          <h2 className="text-xl font-bold text-foreground tracking-tight mt-0.5">Money Manager</h2>
        </div>
        <div className="relative">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="h-9 px-3 bg-muted/40 border border-border/60 hover:bg-muted text-xs font-bold text-foreground rounded-xl focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
          >
            {uniqueMonths.map((m) => (
              <option key={m} value={m}>
                {formatMonthLabel(m)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Financial Health Score Widget */}
      <motion.div
        initial={animationsEnabled ? { opacity: 0, scale: 0.98 } : { opacity: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-4 bg-muted/20 border border-border/40 rounded-2xl flex items-center justify-between space-x-4"
      >
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center space-x-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
            <CheckCircle className="w-3.5 h-3.5 text-accent shrink-0" />
            <span>Health Score</span>
          </div>
          <h4 className="text-xs font-bold text-foreground flex items-center space-x-1.5">
            <span>Status:</span>
            <span style={{ color: stats.healthScore >= 85 ? '#10b981' : stats.healthScore >= 60 ? '#f8b518' : '#ef4444' }}>
              {stats.healthStatus}
            </span>
          </h4>
          <p className="text-[10px] text-muted-foreground leading-normal mt-0.5 line-clamp-2">
            {stats.healthExplanation}
          </p>
        </div>
        <div className="relative w-14 h-14 shrink-0 flex items-center justify-center rounded-full border-2 border-border bg-card shadow-xs">
          <span className="text-sm font-bold font-mono text-foreground leading-none">{stats.healthScore}</span>
          <span className="text-[7px] text-muted-foreground font-bold absolute bottom-2">/100</span>
        </div>
      </motion.div>

      {/* Large Summary Card */}
      <div className="relative overflow-hidden bg-card/60 dark:bg-card/30 border border-border/80 p-5 rounded-3xl space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex flex-col space-y-0.5">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Money Remaining</span>
            <span 
              className="text-2xl font-bold font-mono tracking-tight"
              style={{ color: stats.remaining >= 0 ? '#10b981' : '#ef4444' }}
            >
              {stats.remaining >= 0 ? '' : '-'}{settings.currency}{Math.abs(stats.remaining).toLocaleString()}
            </span>
          </div>
          <span className="text-[9px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border/30">
            {formatMonthLabel(selectedMonth)}
          </span>
        </div>

        {/* Income vs Expense Grid */}
        <div className="grid grid-cols-2 gap-3.5 border-t border-border/40 pt-4">
          <div className="flex flex-col space-y-0.5">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center space-x-1">
              <ArrowUpRight className="w-3 h-3 text-emerald-500 shrink-0" />
              <span>Income</span>
            </span>
            <span className="text-sm font-bold text-foreground font-mono">
              {settings.currency}{stats.income.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col space-y-0.5">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center space-x-1">
              <ArrowDownRight className="w-3 h-3 text-red-500 shrink-0" />
              <span>Expenses</span>
            </span>
            <span className="text-sm font-bold text-foreground font-mono">
              {settings.currency}{stats.expenses.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Budget progress bar */}
        {budget > 0 && (
          <div className="space-y-2 border-t border-border/40 pt-4">
            <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
              <span className="flex items-center space-x-1">
                <TrendingUp className="w-3 h-3 text-accent shrink-0" />
                <span>Budget Consumption ({stats.rawBudgetPct}%)</span>
              </span>
              <span>{settings.currency}{stats.expenses.toLocaleString()} / {settings.currency}{budget.toLocaleString()}</span>
            </div>
            <div className="w-full bg-muted/60 dark:bg-muted/30 h-2 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${stats.budgetPercentage}%`,
                  backgroundColor: stats.rawBudgetPct > 90 ? '#ef4444' : stats.rawBudgetPct > 75 ? '#f8b518' : '#3b82f6'
                }}
                initial={animationsEnabled ? { width: 0 } : { width: `${stats.budgetPercentage}%` }}
                animate={{ width: `${stats.budgetPercentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Friendly Monthly Insights */}
      {stats.txsCount > 0 && (
        <div className="p-4 bg-accent/5 border border-accent/15 rounded-2xl space-y-2.5">
          <div className="flex items-center space-x-1.5 text-[9px] font-bold text-accent uppercase tracking-widest select-none">
            <Lightbulb className="w-3.5 h-3.5 text-accent shrink-0" />
            <span>Encouraging Insights</span>
          </div>
          <ul className="text-[10px] text-muted-foreground space-y-1.5 leading-relaxed pl-1.5 list-disc">
            {stats.lastMonthExpenses > 0 && (
              <li>
                {stats.expenses < stats.lastMonthExpenses ? (
                  `You spent ${settings.currency}${(stats.lastMonthExpenses - stats.expenses).toLocaleString()} less than last month. Wonderful savings rate!`
                ) : (
                  `You spent ${settings.currency}${(stats.expenses - stats.lastMonthExpenses).toLocaleString()} more than last month. Let's aim to optimize discretionary bills.`
                )}
              </li>
            )}
            {stats.highestCatAmt > 0 && (
              <li>
                <span className="capitalize">{stats.highestCat}</span> was your highest expense category this month, totaling {settings.currency}{stats.highestCatAmt.toLocaleString()}.
              </li>
            )}
            {stats.income > 0 && (
              <li>
                You saved Z% of your monthly cash intake: <strong className="text-foreground">{Math.round((stats.remaining / stats.income) * 100)}%</strong>. That is a solid safety buffer!
              </li>
            )}
            {budget > 0 && (
              <li>
                {stats.expenses <= budget ? (
                  'You remained within your monthly target budget limit. Congratulations!'
                ) : (
                  `You exceeded your monthly budget by ${settings.currency}${(stats.expenses - budget).toLocaleString()}. Consider reviewing category lists.`
                )}
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Quick Add buttons */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setActiveModal('expense')}
          className="flex flex-col items-center justify-center p-3 bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 text-red-500 rounded-2xl cursor-pointer active:scale-[0.98] transition-all space-y-1"
        >
          <Minus className="w-4 h-4" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Expense</span>
        </button>
        <button
          onClick={() => setActiveModal('income')}
          className="flex flex-col items-center justify-center p-3 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15 text-emerald-500 rounded-2xl cursor-pointer active:scale-[0.98] transition-all space-y-1"
        >
          <Plus className="w-4 h-4" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Income</span>
        </button>
        <button
          onClick={() => setActiveModal('budget')}
          className="flex flex-col items-center justify-center p-3 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/15 text-blue-500 rounded-2xl cursor-pointer active:scale-[0.98] transition-all space-y-1"
        >
          <Wallet className="w-4 h-4" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Budget</span>
        </button>
      </div>

      {/* Savings Goals Widget */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-1.5">
            <PiggyBank className="w-4 h-4 text-accent" />
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Savings Goals
            </label>
          </div>
          <div className="flex space-x-2.5">
            <button
              onClick={() => setActiveModal('goal')}
              className="text-[9px] font-bold uppercase tracking-wider text-accent cursor-pointer hover:underline"
            >
              + Create
            </button>
            {goals.length > 3 && (
              <button
                onClick={() => setShowAllGoals(!showAllGoals)}
                className="text-[9px] font-bold uppercase tracking-wider text-accent cursor-pointer hover:underline"
              >
                {showAllGoals ? 'Show Less' : 'View All'}
              </button>
            )}
          </div>
        </div>

        {goals.length === 0 ? (
          <Card className="border-dashed border-border/80 bg-muted/10">
            <CardContent className="py-8 text-center space-y-2 text-xs text-muted-foreground select-none">
              No savings goals created. Add targets like Umrah, Laptop, or Emergency Fund.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {visibleGoals.map((goal) => {
              const Icon = getGoalIcon(goal.icon)
              const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0
              const remaining = Math.max(0, goal.targetAmount - goal.currentAmount)

              return (
                <div
                  key={goal.id}
                  onClick={() => { setSelectedGoal(goal); setActiveModal('goal'); }}
                  className="p-4 bg-card/60 dark:bg-card/35 border border-border/50 rounded-2xl hover:border-border/80 cursor-pointer transition-colors relative group select-none text-left flex flex-col justify-between space-y-3.5"
                >
                  {/* Goal Header */}
                  <div className="flex items-start justify-between space-x-2">
                    <div 
                      className="p-2.5 rounded-xl border shrink-0 text-white"
                      style={{
                        backgroundColor: `${goal.color}15`,
                        borderColor: `${goal.color}25`,
                        color: goal.color
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-foreground truncate">{goal.name}</h4>
                      <span className="text-[8px] font-semibold text-muted-foreground uppercase tracking-widest mt-0.5 block">
                        Saved: {settings.currency}{goal.currentAmount.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-foreground shrink-0">{pct}%</span>
                  </div>

                  {/* Progress Line */}
                  <div className="space-y-1">
                    <div className="w-full bg-muted/60 dark:bg-muted/30 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: goal.color }}
                      />
                    </div>
                    <span className="text-[8px] text-muted-foreground block text-right font-semibold">
                      {remaining > 0 ? `Remaining: ${settings.currency}${remaining.toLocaleString()}` : 'Goal Met! 🎉'}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex space-x-2 border-t border-border/40 pt-2.5 shrink-0">
                    <button
                      onClick={(e) => handleQuickAddSavings(goal.id!, e)}
                      className="flex-1 h-7 rounded-lg bg-accent text-accent-foreground font-bold text-[8px] uppercase tracking-wider flex items-center justify-center cursor-pointer transition-all active:scale-95"
                    >
                      +{settings.currency}{settings.currency === '₹' ? '500' : '10'}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenGoalSavings(goal, 'deposit'); }}
                      className="flex-1 h-7 rounded-lg border border-border/60 hover:bg-muted text-foreground font-bold text-[8px] uppercase tracking-wider flex items-center justify-center cursor-pointer transition-all active:scale-95"
                    >
                      Add
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenGoalSavings(goal, 'withdraw'); }}
                      className="h-7 w-7 rounded-lg border border-border/60 hover:bg-muted text-red-500 font-bold text-[8px] uppercase tracking-wider flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0"
                    >
                      -
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent Activity List */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Recent Activities
          </label>
          {transactions.length > 5 && (
            <button
              onClick={onNavigateToHistory}
              className="text-[9px] font-bold uppercase tracking-wider text-accent flex items-center space-x-1 cursor-pointer hover:underline"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {transactions.length === 0 ? (
          <Card className="border-dashed border-border/80 bg-muted/10">
            <CardContent className="py-8 flex flex-col items-center justify-center text-center space-y-2 select-none">
              <Wallet className="w-8 h-8 text-muted-foreground/60 shrink-0" />
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-foreground">No Transactions Yet</h4>
                <p className="text-[10px] text-muted-foreground max-w-[200px] mx-auto leading-normal">
                  Log your first income or expense transaction to start monitoring cash flows.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {(transactions || []).filter(t => t.date && selectedMonth && t.date.startsWith(selectedMonth)).slice(0, 5).map((tx) => (
              <TransactionCard key={tx.id} transaction={tx} />
            ))}
          </div>
        )}
      </div>

      {/* Dialogue Sheets overlays */}
      <AnimatePresence>
        {(activeModal === 'income' || activeModal === 'expense') && (
          <TransactionModal
            isOpen={activeModal !== null}
            onClose={() => setActiveModal(null)}
            defaultType={activeModal}
          />
        )}

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
      </AnimatePresence>
    </div>
  )
}

export default DashboardTab
