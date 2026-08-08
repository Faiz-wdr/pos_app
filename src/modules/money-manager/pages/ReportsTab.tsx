import React, { useState, useMemo } from 'react'
import { useMoneyStore } from '../store/moneyStore'
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar,
  Activity
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { motion } from 'framer-motion'

export const ReportsTab: React.FC = () => {
  const { transactions, settings, budget } = useMoneyStore()
  
  // Filter range: 'weekly' | 'monthly' | 'yearly'
  const [range, setRange] = useState<'weekly' | 'monthly' | 'yearly'>('monthly')

  // 1. Calculate transactions for range
  const filteredTxs = useMemo(() => {
    const now = new Date()
    
    // Start of week (Sunday)
    const sunday = new Date(now)
    sunday.setDate(now.getDate() - now.getDay())
    const startOfWeek = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate()).getTime()
    
    // Start of month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
    
    // Start of year
    const startOfYear = new Date(now.getFullYear(), 0, 1).getTime()

    return (transactions || []).filter(tx => {
      if (!tx.date) return false
      const txTime = new Date(tx.date).getTime()
      
      switch (range) {
        case 'weekly':
          return txTime >= startOfWeek
        case 'monthly':
          return txTime >= startOfMonth
        case 'yearly':
          return txTime >= startOfYear
        default:
          return true
      }
    })
  }, [transactions, range])

  // 2. Metrics Summaries (Income, Expenses, Savings, Budget Usage)
  const summaries = useMemo(() => {
    let income = 0
    let expenses = 0

    filteredTxs.forEach(tx => {
      if (tx.type === 'income') {
        income += tx.amount
      } else {
        expenses += tx.amount
      }
    })

    const savings = income - expenses

    // Range budget limit calculations
    let rangeBudgetLimit = 0
    if (budget > 0) {
      if (range === 'weekly') {
        rangeBudgetLimit = Math.round(budget * (7 / 30))
      } else if (range === 'monthly') {
        rangeBudgetLimit = budget
      } else if (range === 'yearly') {
        rangeBudgetLimit = budget * 12
      }
    }

    const budgetUsagePercentage = rangeBudgetLimit > 0 
      ? Math.min(100, Math.round((expenses / rangeBudgetLimit) * 100)) 
      : 0
    
    const rawBudgetUsage = rangeBudgetLimit > 0 
      ? Math.round((expenses / rangeBudgetLimit) * 100) 
      : 0

    return {
      income,
      expenses,
      savings,
      rangeBudgetLimit,
      budgetUsagePercentage,
      rawBudgetUsage
    }
  }, [filteredTxs, range, budget])

  // 3. Line Chart Data (Expense comparison over last 6 months)
  const monthlyComparisonData = useMemo(() => {
    const months = []
    const now = new Date()
    
    // Generate last 6 months keys YYYY-MM
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleDateString(undefined, { month: 'short' })
      months.push({ key: monthKey, label })
    }

    // Compute expenses for each month
    return months.map(m => {
      const total = (transactions || [])
        .filter(tx => tx.type === 'expense' && tx.date && tx.date.startsWith(m.key))
        .reduce((sum, tx) => sum + tx.amount, 0)
      return { label: m.label, amount: total }
    })
  }, [transactions])

  const minAmt = useMemo(() => {
    if (monthlyComparisonData.length === 0) return 0
    return Math.min(...monthlyComparisonData.map(d => d.amount))
  }, [monthlyComparisonData])

  const maxAmt = useMemo(() => {
    if (monthlyComparisonData.length === 0) return 100
    const maxVal = Math.max(...monthlyComparisonData.map(d => d.amount))
    return maxVal === minAmt ? maxVal + 100 : maxVal
  }, [monthlyComparisonData, minAmt])

  // Generate SVG path coordinates
  const svgDimensions = { width: 400, height: 160, padding: 25 }
  const trendPoints = useMemo(() => {
    if (monthlyComparisonData.length <= 1) return []
    const { width, height, padding } = svgDimensions
    
    return monthlyComparisonData.map((d, i) => {
      const x = padding + (i * (width - padding * 2)) / (monthlyComparisonData.length - 1)
      const ratio = (d.amount - minAmt) / (maxAmt - minAmt || 1)
      const y = height - padding - ratio * (height - padding * 2)
      return { x, y, label: d.label, value: d.amount }
    })
  }, [monthlyComparisonData, minAmt, maxAmt])

  const linePathD = useMemo(() => {
    if (trendPoints.length === 0) return ''
    return trendPoints.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')
  }, [trendPoints])

  return (
    <div className="space-y-5 text-left pb-10 select-none">
      
      {/* Title Header */}
      <div className="flex flex-col border-b border-border/40 pb-3">
        <h2 className="text-xl font-bold text-foreground mt-0.5 tracking-tight">Reports</h2>
      </div>

      {/* Range Selection Pills */}
      <div className="bg-card border border-border/80 p-1 rounded-xl flex items-center space-x-1 max-w-xs">
        <Calendar className="w-3.5 h-3.5 text-muted-foreground ml-2 shrink-0" />
        <div className="flex space-x-1 flex-1">
          {[
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' },
            { label: 'Yearly', value: 'yearly' }
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value as any)}
              className={`flex-1 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer active:scale-95 whitespace-nowrap ${
                range === opt.value
                  ? 'bg-accent text-accent-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <Card className="bg-card/60 dark:bg-card/30 border border-border/50 p-4 flex flex-col justify-between">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>Total Income</span>
          </span>
          <span className="text-sm font-bold text-foreground font-mono mt-1.5">
            {settings.currency}{summaries.income.toLocaleString()}
          </span>
        </Card>

        {/* Total Expenses */}
        <Card className="bg-card/60 dark:bg-card/30 border border-border/50 p-4 flex flex-col justify-between">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center space-x-1">
            <TrendingDown className="w-3.5 h-3.5 text-red-500" />
            <span>Total Expenses</span>
          </span>
          <span className="text-sm font-bold text-foreground font-mono mt-1.5">
            {settings.currency}{summaries.expenses.toLocaleString()}
          </span>
        </Card>

        {/* Total Savings */}
        <Card className="bg-card/60 dark:bg-card/30 border border-border/50 p-4 flex flex-col justify-between">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center space-x-1">
            <Wallet className="w-3.5 h-3.5 text-blue-500" />
            <span>Total Savings</span>
          </span>
          <span 
            className="text-sm font-bold font-mono mt-1.5"
            style={{ color: summaries.savings >= 0 ? '#10b981' : '#ef4444' }}
          >
            {settings.currency}{summaries.savings.toLocaleString()}
          </span>
        </Card>

        {/* Budget Usage */}
        <Card className="bg-card/60 dark:bg-card/30 border border-border/50 p-4 flex flex-col justify-between">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center space-x-1">
            <Activity className="w-3.5 h-3.5 text-accent" />
            <span>Budget Usage</span>
          </span>
          <span className="text-sm font-bold text-foreground font-mono mt-1.5">
            {summaries.rangeBudgetLimit > 0 ? `${summaries.rawBudgetUsage}%` : 'N/A'}
          </span>
        </Card>
      </div>

      {/* Budget Limit Progress Bar inside range if budget set */}
      {summaries.rangeBudgetLimit > 0 && (
        <Card className="bg-card/60 dark:bg-card/30 border border-border/50 p-4 space-y-2">
          <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
            <span>Range Budget Limit Consumption</span>
            <span>
              {settings.currency}{summaries.expenses.toLocaleString()} / {settings.currency}{summaries.rangeBudgetLimit.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-muted/60 dark:bg-muted/30 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${summaries.budgetUsagePercentage}%` }}
            />
          </div>
        </Card>
      )}

      {/* Monthly Comparison Line Chart (Only 1 Chart as specified) */}
      <Card className="bg-card/60 dark:bg-card/30 border border-border/50 p-4.5 space-y-4">
        <div className="flex items-center space-x-1.5 border-b border-border/40 pb-2">
          <Activity className="w-4 h-4 text-accent shrink-0" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Monthly Expenses Comparison
          </h3>
        </div>

        {/* SVG Graph Viewport */}
        <div className="w-full max-w-lg aspect-[5/2.2] relative bg-muted/10 rounded-2xl border border-border/20 overflow-hidden flex flex-col justify-end p-2.5">
          {trendPoints.length <= 1 ? (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
              Not enough transaction history to map trends.
            </div>
          ) : (
            <>
              <svg 
                viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`} 
                className="w-full h-full overflow-visible"
              >
                {/* Grid guidelines */}
                <line x1={svgDimensions.padding} y1={svgDimensions.padding} x2={svgDimensions.width - svgDimensions.padding} y2={svgDimensions.padding} stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1={svgDimensions.padding} y1={svgDimensions.height - svgDimensions.padding} x2={svgDimensions.width - svgDimensions.padding} y2={svgDimensions.height - svgDimensions.padding} stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3 3" />

                {/* Line path */}
                <motion.path
                  d={linePathD}
                  fill="none"
                  stroke="#f8b518"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                />
                
                {/* Data points */}
                {trendPoints.map((p, idx) => (
                  <g key={idx}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="4"
                      fill="var(--color-card)"
                      stroke="#f8b518"
                      strokeWidth="2.5"
                      className="transition-all hover:r-5 cursor-pointer"
                    />
                    {/* Amount labels above points */}
                    <text
                      x={p.x}
                      y={p.y - 8}
                      textAnchor="middle"
                      className="text-[8px] font-bold font-mono fill-foreground"
                    >
                      {settings.currency}{Math.round(p.value).toLocaleString()}
                    </text>
                  </g>
                ))}
              </svg>

              {/* X-Axis Month Labels */}
              <div className="w-full flex justify-between px-4 pt-2 text-[8px] font-bold text-muted-foreground uppercase tracking-wider border-t border-border/20 mt-1">
                {trendPoints.map((p, idx) => (
                  <span key={idx} className="text-center w-8 truncate">
                    {p.label}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </Card>

    </div>
  )
}

export default ReportsTab
