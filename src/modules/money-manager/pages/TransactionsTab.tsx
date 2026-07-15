import React, { useState, useMemo } from 'react'
import { useMoneyStore } from '../store/moneyStore'
import { TransactionCard } from '../components/TransactionCard'
import { SearchBar } from '@/admin/components/SearchBar'
import { 
  ArrowUpDown, 
  RotateCcw, 
  Search, 
  Calendar,
  Filter
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { ActionButton } from '@/admin/components/ActionButton'

export const TransactionsTab: React.FC = () => {
  const { transactions } = useMoneyStore()

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'this-month' | 'last-month'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest')

  // Date filters ranges YYYY-MM
  const monthRanges = useMemo(() => {
    const now = new Date()
    
    // This month prefix
    const thisMonthY = now.getFullYear()
    const thisMonthM = String(now.getMonth() + 1).padStart(2, '0')
    const thisMonthPrefix = `${thisMonthY}-${thisMonthM}`

    // Last month prefix
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthY = lastMonthDate.getFullYear()
    const lastMonthM = String(lastMonthDate.getMonth() + 1).padStart(2, '0')
    const lastMonthPrefix = `${lastMonthY}-${lastMonthM}`

    return {
      thisMonthPrefix,
      lastMonthPrefix
    }
  }, [])

  // Filter & sort calculations
  const filteredTransactions = useMemo(() => {
    let result = [...transactions]

    // 1. Search term match
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim()
      result = result.filter(tx => 
        tx.category.toLowerCase().includes(term) ||
        tx.notes?.toLowerCase().includes(term) ||
        tx.amount.toString().includes(term)
      )
    }

    // 2. Type filter match
    if (typeFilter !== 'all') {
      result = result.filter(tx => tx.type === typeFilter)
    }

    // 3. Date filter match
    if (dateFilter === 'this-month') {
      result = result.filter(tx => tx.date.startsWith(monthRanges.thisMonthPrefix))
    } else if (dateFilter === 'last-month') {
      result = result.filter(tx => tx.date.startsWith(monthRanges.lastMonthPrefix))
    }

    // 4. Sort logic
    result.sort((a, b) => {
      const timeA = new Date(a.date).getTime()
      const timeB = new Date(b.date).getTime()

      if (sortBy === 'newest') return timeB - timeA
      if (sortBy === 'oldest') return timeA - timeB
      if (sortBy === 'highest') return b.amount - a.amount
      if (sortBy === 'lowest') return a.amount - b.amount
      return 0
    })

    return result
  }, [transactions, searchTerm, typeFilter, dateFilter, sortBy, monthRanges])

  const handleResetFilters = () => {
    setSearchTerm('')
    setTypeFilter('all')
    setDateFilter('all')
    setSortBy('newest')
  }

  return (
    <div className="space-y-4 text-left">
      {/* Title Header */}
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Transaction Log</span>
        <h2 className="text-xl font-bold text-foreground mt-0.5 tracking-tight">History</h2>
      </div>

      {/* Search Bar */}
      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search category, notes, or amount..."
        className="bg-card border-border/80 focus-visible:ring-accent"
      />

      {/* Filter Options */}
      <div className="space-y-2.5 bg-card/40 dark:bg-card/20 border border-border/40 p-3 rounded-2xl">
        {/* Type Filter Row */}
        <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          <span className="flex items-center space-x-1">
            <Filter className="w-3 h-3 text-accent shrink-0" />
            <span>Type</span>
          </span>
          <div className="flex space-x-1">
            {['all', 'income', 'expense'].map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t as any)}
                className={`px-2 py-0.5 rounded-md border text-[9px] uppercase tracking-wider cursor-pointer active:scale-95 ${
                  typeFilter === t
                    ? 'bg-accent border-accent text-black font-extrabold'
                    : 'bg-muted/30 border-border/50 text-muted-foreground'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Date Filter Row */}
        <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider pt-2 border-t border-border/40">
          <span className="flex items-center space-x-1">
            <Calendar className="w-3 h-3 text-accent shrink-0" />
            <span>Date Range</span>
          </span>
          <div className="flex space-x-1">
            {[
              { label: 'All', value: 'all' },
              { label: 'This Month', value: 'this-month' },
              { label: 'Last Month', value: 'last-month' }
            ].map(d => (
              <button
                key={d.value}
                onClick={() => setDateFilter(d.value as any)}
                className={`px-2 py-0.5 rounded-md border text-[9px] uppercase tracking-wider cursor-pointer active:scale-95 ${
                  dateFilter === d.value
                    ? 'bg-accent border-accent text-black font-extrabold'
                    : 'bg-muted/30 border-border/50 text-muted-foreground'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort By Row */}
        <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider pt-2 border-t border-border/40">
          <span className="flex items-center space-x-1">
            <ArrowUpDown className="w-3 h-3 text-accent shrink-0" />
            <span>Sort By</span>
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent border-none text-[10px] font-bold text-foreground focus:outline-none uppercase tracking-wider cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Amount</option>
            <option value="lowest">Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Main Results View */}
      {filteredTransactions.length === 0 ? (
        <Card className="border-dashed border-border/80 bg-muted/10">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-3.5 select-none">
            <Search className="w-8 h-8 text-muted-foreground/60 shrink-0" />
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-foreground">No Matches Found</h4>
              <p className="text-[10px] text-muted-foreground max-w-[220px] mx-auto leading-normal">
                Try widening your search terms or adjusting the income/expense and date filter pills.
              </p>
            </div>
            <ActionButton
              onClick={handleResetFilters}
              icon={RotateCcw}
              variant="outline"
              className="h-8 text-[9px] px-3.5 rounded-xl border border-border/60 hover:bg-muted"
            >
              Reset Filters
            </ActionButton>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2.5 pt-1">
          <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-muted-foreground px-1">
            <span>Results ({filteredTransactions.length})</span>
            <span>Sorted by {sortBy}</span>
          </div>
          <div className="space-y-2.5">
            {filteredTransactions.map((tx) => (
              <TransactionCard key={tx.id} transaction={tx} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TransactionsTab
