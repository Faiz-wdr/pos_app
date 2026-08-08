import React, { useState, useMemo } from 'react'
import { useMoneyStore } from '../store/moneyStore'
import { Transaction } from '../types'
import { TransactionCard } from '../components/TransactionCard'
import { SearchBar } from '@/admin/components/SearchBar'
import { TransactionModal } from '../components/TransactionModal'
import { 
  ArrowUpDown, 
  RotateCcw, 
  Search, 
  Calendar,
  Filter
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { ActionButton } from '@/admin/components/ActionButton'
import { AnimatePresence } from 'framer-motion'
import { Dropdown } from '../components/Dropdown'

export const TransactionsTab: React.FC = () => {
  const { transactions } = useMoneyStore()

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'this-week' | 'this-month' | 'this-year'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest')
  
  // Transaction to edit
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)

  // Filter calculations
  const filteredTransactions = useMemo(() => {
    let result = [...transactions]
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0] // YYYY-MM-DD

    // Start of week (Sunday)
    const sunday = new Date(now)
    sunday.setDate(now.getDate() - now.getDay())
    const startOfWeek = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate()).getTime()

    // Start of month (YYYY-MM)
    const thisMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    // Start of year (YYYY)
    const thisYearPrefix = String(now.getFullYear())

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

    // 3. Simple Date filter match: Today, This Week, This Month, This Year
    if (dateFilter === 'today') {
      result = result.filter(tx => tx.date === todayStr)
    } else if (dateFilter === 'this-week') {
      result = result.filter(tx => {
        const txTime = new Date(tx.date).getTime()
        return txTime >= startOfWeek
      })
    } else if (dateFilter === 'this-month') {
      result = result.filter(tx => tx.date.startsWith(thisMonthPrefix))
    } else if (dateFilter === 'this-year') {
      result = result.filter(tx => tx.date.startsWith(thisYearPrefix))
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
  }, [transactions, searchTerm, typeFilter, dateFilter, sortBy])

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
        <h2 className="text-xl font-bold text-foreground mt-0.5 tracking-tight">Transactions</h2>
      </div>

      {/* Search Bar */}
      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search source, notes, or amount..."
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

        {/* Date Filter Row (Today, This Week, This Month, This Year) */}
        <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider pt-2 border-t border-border/40">
          <span className="flex items-center space-x-1">
            <Calendar className="w-3 h-3 text-accent shrink-0" />
            <span>Date Range</span>
          </span>
          <div className="flex space-x-1 shrink-0 overflow-x-auto max-w-[200px] py-0.5 scrollbar-none">
            {[
              { label: 'All', value: 'all' },
              { label: 'Today', value: 'today' },
              { label: 'This Week', value: 'this-week' },
              { label: 'This Month', value: 'this-month' },
              { label: 'This Year', value: 'this-year' }
            ].map(d => (
              <button
                key={d.value}
                onClick={() => setDateFilter(d.value as any)}
                className={`px-2 py-0.5 rounded-md border text-[9px] uppercase tracking-wider cursor-pointer active:scale-95 whitespace-nowrap ${
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
          <Dropdown
            value={sortBy}
            onChange={(val) => setSortBy(val as any)}
            options={[
              { label: 'Newest First', value: 'newest' },
              { label: 'Oldest First', value: 'oldest' },
              { label: 'Highest Amount', value: 'highest' },
              { label: 'Lowest Amount', value: 'lowest' }
            ]}
            className="h-8 border-none bg-transparent hover:bg-muted/30"
          />
        </div>
      </div>

      {/* Main Results View */}
      {filteredTransactions.length === 0 ? (
        <Card className="border-dashed border-border/80 bg-muted/10">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-3.5 select-none">
            <Search className="w-8 h-8 text-muted-foreground/60 shrink-0" />
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-foreground">No Transactions Yet</h4>
              <p className="text-[10px] text-muted-foreground max-w-[220px] mx-auto leading-normal">
                Try adjusting the filters or add a new transaction to start logging activity.
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
              <TransactionCard 
                key={tx.id} 
                transaction={tx} 
                onEdit={() => setEditingTx(tx)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Editing Modal Overlay */}
      <AnimatePresence>
        {editingTx && (
          <TransactionModal
            isOpen={editingTx !== null}
            onClose={() => setEditingTx(null)}
            defaultType={editingTx.type}
            transactionToEdit={editingTx}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default TransactionsTab
