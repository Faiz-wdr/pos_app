import React, { useState, useMemo } from 'react'
import { useMoneyStore } from '../store/moneyStore'
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar,
  PieChart as PieIcon,
  Activity,
  ArrowRightLeft
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { motion } from 'framer-motion'

export const ReportsTab: React.FC = () => {
  const { transactions, settings } = useMoneyStore()
  
  // Filter selected range: 'today' | 'week' | 'month' | 'last-month' | '3months' | '6months'
  const [range, setRange] = useState<'today' | 'week' | 'month' | 'last-month' | '3months' | '6months'>('month')

  const filterOptions = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'Last Month', value: 'last-month' },
    { label: '3 Months', value: '3months' },
    { label: '6 Months', value: '6months' }
  ]

  // 1. Filtered Transactions list based on range
  const filteredTxs = useMemo(() => {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    
    // Start of week (Sunday)
    const sunday = new Date(now)
    sunday.setDate(now.getDate() - now.getDay())
    const startOfWeek = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate()).getTime()
    
    // Start of month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
    
    // Last month
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const startOfLastMonth = lastMonthDate.getTime()
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).getTime()
    
    // 3 Months
    const startOf3Months = new Date(now.getFullYear(), now.getMonth() - 3, 1).getTime()
    
    // 6 Months
    const startOf6Months = new Date(now.getFullYear(), now.getMonth() - 6, 1).getTime()

    return (transactions || []).filter(tx => {
      if (!tx.date) return false
      const txTime = new Date(tx.date).getTime()
      
      switch (range) {
        case 'today':
          return txTime >= startOfToday
        case 'week':
          return txTime >= startOfWeek
        case 'month':
          return txTime >= startOfMonth
        case 'last-month':
          return txTime >= startOfLastMonth && txTime <= endOfLastMonth
        case '3months':
          return txTime >= startOf3Months
        case '6months':
          return txTime >= startOf6Months
        default:
          return true
      }
    })
  }, [transactions, range])

  // 2. Metrics Summaries
  const summaries = useMemo(() => {
    let income = 0
    let expenses = 0
    const categoryTotals: Record<string, number> = {}

    filteredTxs.forEach(tx => {
      if (tx.type === 'income') {
        income += tx.amount
      } else {
        expenses += tx.amount
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount
      }
    })

    const saved = income - expenses
    const savingsRate = income > 0 ? Math.max(0, Math.round((saved / income) * 100)) : 0

    // Average daily spending (approximate)
    const daysCount = range === 'today' ? 1 : range === 'week' ? 7 : range === 'month' || range === 'last-month' ? 30 : range === '3months' ? 90 : 180
    const avgDaily = Math.round(expenses / daysCount)

    // Highest Spending Category
    let highestCat = 'N/A'
    let highestAmt = 0
    Object.entries(categoryTotals).forEach(([cat, val]) => {
      if (val > highestAmt) {
        highestAmt = val
        highestCat = cat
      }
    })

    return {
      income,
      expenses,
      saved,
      savingsRate,
      avgDaily,
      highestCat,
      highestAmt,
      categoryTotals
    }
  }, [filteredTxs, range])

  // 3. Custom Line Trend Chart Data calculations
  const lineChartData = useMemo(() => {
    const dateMap: Record<string, number> = {}
    filteredTxs.forEach(tx => {
      if (tx.type === 'expense') {
        const dateLabel = new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        dateMap[dateLabel] = (dateMap[dateLabel] || 0) + tx.amount
      }
    })

    const sorted = Object.entries(dateMap).map(([date, amount]) => ({
      date,
      amount
    }))

    return sorted.reverse().slice(-7) // Show last 7 data points for clean rendering
  }, [filteredTxs])

  const minAmt = useMemo(() => {
    if (lineChartData.length === 0) return 0
    return Math.min(...lineChartData.map(d => d.amount))
  }, [lineChartData])

  const maxAmt = useMemo(() => {
    if (lineChartData.length === 0) return 100
    const maxVal = Math.max(...lineChartData.map(d => d.amount))
    return maxVal === minAmt ? maxVal + 100 : maxVal
  }, [lineChartData, minAmt])

  // Generate SVG path coordinates
  const svgDimensions = { width: 400, height: 160, padding: 25 }
  const trendPoints = useMemo(() => {
    if (lineChartData.length <= 1) return []
    const { width, height, padding } = svgDimensions
    
    return lineChartData.map((d, i) => {
      const x = padding + (i * (width - padding * 2)) / (lineChartData.length - 1)
      const ratio = (d.amount - minAmt) / (maxAmt - minAmt || 1)
      const y = height - padding - ratio * (height - padding * 2)
      return { x, y, label: d.date, value: d.amount }
    })
  }, [lineChartData, minAmt, maxAmt])

  const linePathD = useMemo(() => {
    if (trendPoints.length === 0) return ''
    return trendPoints.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')
  }, [trendPoints])

  // Custom Category Breakdown List
  const categoryBreakdown = useMemo(() => {
    return Object.entries(summaries.categoryTotals)
      .map(([name, value]) => ({
        name,
        value,
        percentage: summaries.expenses > 0 ? Math.round((value / summaries.expenses) * 100) : 0
      }))
      .sort((a, b) => b.value - a.value)
  }, [summaries.categoryTotals, summaries.expenses])

  const chartColors = ['#f8b518', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#f97316', '#a855f7', '#64748b']

  return (
    <div className="space-y-5 text-left pb-10 select-none">
      {/* Title Header */}
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Visual Summaries</span>
        <h2 className="text-xl font-bold text-foreground mt-0.5 tracking-tight">Financial Reports</h2>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-card border border-border/80 p-1.5 rounded-xl flex items-center space-x-1 shrink-0 overflow-x-auto max-w-full">
        <Calendar className="w-3.5 h-3.5 text-muted-foreground ml-1.5 shrink-0" />
        <div className="flex space-x-1 pr-1 pl-1">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value as any)}
              className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer active:scale-95 whitespace-nowrap ${
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
        <Card className="bg-card/40">
          <CardContent className="pt-4 flex flex-col justify-between">
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest flex items-center space-x-1">
              <TrendingUp className="w-3 h-3 text-emerald-500 shrink-0" />
              <span>Total Income</span>
            </span>
            <span className="text-sm font-bold text-foreground font-mono mt-1">
              {settings?.currency || '₹'}{summaries.income.toLocaleString()}
            </span>
          </CardContent>
        </Card>
        <Card className="bg-card/40">
          <CardContent className="pt-4 flex flex-col justify-between">
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest flex items-center space-x-1">
              <TrendingDown className="w-3 h-3 text-red-500 shrink-0" />
              <span>Total Expenses</span>
            </span>
            <span className="text-sm font-bold text-foreground font-mono mt-1">
              {settings?.currency || '₹'}{summaries.expenses.toLocaleString()}
            </span>
          </CardContent>
        </Card>
        <Card className="bg-card/40">
          <CardContent className="pt-4 flex flex-col justify-between">
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest flex items-center space-x-1">
              <Wallet className="w-3 h-3 text-blue-500 shrink-0" />
              <span>Net Saved</span>
            </span>
            <span 
              className="text-sm font-bold font-mono mt-1"
              style={{ color: summaries.saved >= 0 ? '#10b981' : '#ef4444' }}
            >
              {summaries.saved >= 0 ? '' : '-'}{settings?.currency || '₹'}{Math.abs(summaries.saved).toLocaleString()}
            </span>
          </CardContent>
        </Card>
        <Card className="bg-card/40">
          <CardContent className="pt-4 flex flex-col justify-between">
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest flex items-center space-x-1">
              <Activity className="w-3 h-3 text-accent shrink-0" />
              <span>Savings Rate</span>
            </span>
            <span className="text-sm font-bold text-foreground font-mono mt-1">
              {summaries.savingsRate}%
            </span>
          </CardContent>
        </Card>
      </div>

      {filteredTxs.length === 0 ? (
        <Card className="border-dashed border-border/80 bg-muted/10">
          <CardContent className="py-16 text-center space-y-2 text-xs text-muted-foreground select-none">
            No transactions logged for this date range. Start logging transactions to view reports.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Income vs Expenses Bar Chart */}
          <Card className="bg-card/40">
            <CardHeader className="pb-2 border-b border-border/40 select-none">
              <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center space-x-2">
                <ArrowRightLeft className="w-4 h-4 text-accent" />
                <span>Income vs Expenses Comparison</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              {/* Income Bar row */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-emerald-500 uppercase tracking-wider">Total Income</span>
                  <span className="font-mono text-foreground">{settings?.currency || '₹'}{summaries.income.toLocaleString()}</span>
                </div>
                <div className="w-full bg-muted/50 h-3.5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: summaries.income > 0 ? '100%' : '0%' }}
                    transition={{ duration: 0.7 }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
              </div>

              {/* Expense Bar row */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-red-500 uppercase tracking-wider">Total Expenses</span>
                  <span className="font-mono text-foreground">
                    {settings?.currency || '₹'}{summaries.expenses.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-muted/50 h-3.5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ 
                      width: summaries.income > 0 
                        ? `${Math.min(100, Math.round((summaries.expenses / summaries.income) * 100))}%` 
                        : summaries.expenses > 0 ? '100%' : '0%'
                    }}
                    transition={{ duration: 0.7 }}
                    className="h-full bg-red-500 rounded-full"
                  />
                </div>
              </div>
              
              {summaries.income > 0 && (
                <p className="text-[9px] text-muted-foreground leading-normal italic text-right">
                  Expenses consume {Math.round((summaries.expenses / summaries.income) * 100)}% of your range income.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Category Share List */}
          <Card className="bg-card/40">
            <CardHeader className="pb-2 border-b border-border/40 select-none">
              <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center space-x-2">
                <PieIcon className="w-4 h-4 text-accent" />
                <span>Expenses Category Breakdown</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
              {categoryBreakdown.length === 0 ? (
                <p className="text-[10px] text-muted-foreground py-4 text-center">No expense logs registered.</p>
              ) : (
                categoryBreakdown.map((item, index) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="capitalize text-foreground flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
                        <span>{item.name}</span>
                      </span>
                      <span className="font-mono text-muted-foreground">
                        {settings?.currency || '₹'}{item.value.toLocaleString()} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted/40 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full"
                        style={{ 
                          width: `${item.percentage}%`,
                          backgroundColor: chartColors[index % chartColors.length]
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Spending Trend Custom SVG Line Chart */}
          {trendPoints.length > 0 && (
            <Card className="bg-card/40 lg:col-span-2">
              <CardHeader className="pb-2 border-b border-border/40 select-none">
                <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-accent" />
                  <span>Spending Trend Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex flex-col items-center">
                {/* SVG Graph Viewport */}
                <div className="w-full max-w-lg aspect-[5/2] relative bg-muted/10 rounded-2xl border border-border/20 overflow-hidden">
                  <svg 
                    viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`} 
                    className="w-full h-full overflow-visible"
                  >
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
                    {/* Data circle points */}
                    {trendPoints.map((p, idx) => (
                      <g key={idx}>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="3.5"
                          fill="var(--color-card)"
                          stroke="#f8b518"
                          strokeWidth="2"
                          className="transition-all hover:r-5 cursor-pointer"
                        />
                      </g>
                    ))}
                  </svg>
                </div>
                
                {/* Custom X-Axis Labels row */}
                <div className="w-full flex justify-between px-4 pt-2.5 text-[8px] font-bold text-muted-foreground uppercase tracking-wider">
                  {trendPoints.map((p, idx) => (
                    <span key={idx} className="text-center w-8 truncate">
                      {p.label}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      )}
    </div>
  )
}

export default ReportsTab
