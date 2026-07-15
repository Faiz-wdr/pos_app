import React from 'react'
import { Transaction } from '../types'
import { useMoneyStore } from '../store/moneyStore'
import { 
  Briefcase, 
  Laptop, 
  Gift, 
  Utensils, 
  Car, 
  ShoppingBag, 
  Receipt, 
  Home, 
  GraduationCap, 
  HeartPulse, 
  Film, 
  HelpCircle,
  Trash2
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useSettingsStore } from '@/core/settings/settingsStore'

// Map categories to icons
const getCategoryIcon = (category: string) => {
  const normalized = category.toLowerCase()
  switch (normalized) {
    // Income
    case 'salary': return Briefcase
    case 'freelance': return Laptop
    case 'gift': return Gift
    
    // Expenses
    case 'food': return Utensils
    case 'travel': return Car
    case 'shopping': return ShoppingBag
    case 'bills': return Receipt
    case 'rent': return Home
    case 'education': return GraduationCap
    case 'health': return HeartPulse
    case 'entertainment': return Film
    
    // Other
    case 'coins':
    case 'income-other':
    case 'other':
    default:
      return HelpCircle
  }
}

interface TransactionCardProps {
  transaction: Transaction
  onDelete?: () => void
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onDelete
}) => {
  const { settings, deleteTransaction } = useMoneyStore()
  const animationsEnabled = useSettingsStore((state) => state.animationsEnabled)
  const IconComponent = getCategoryIcon(transaction.category)
  
  const isIncome = transaction.type === 'income'

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (settings.confirmDelete) {
      if (!window.confirm('Are you sure you want to delete this transaction record?')) {
        return
      }
    }
    if (transaction.id !== undefined) {
      deleteTransaction(transaction.id)
      if (onDelete) onDelete()
    }
  }

  // Format Date (YYYY-MM-DD to DD MMM YYYY)
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  return (
    <motion.div
      layout={animationsEnabled}
      initial={animationsEnabled ? { opacity: 0, y: 8 } : { opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      exit={animationsEnabled ? { opacity: 0, scale: 0.95 } : { opacity: 1 }}
      className="p-4 bg-card/60 dark:bg-card/30 border border-border/50 rounded-2xl flex items-center justify-between space-x-3 text-left hover:border-border/80 transition-colors select-none"
    >
      <div className="flex items-center space-x-3.5 min-w-0">
        {/* Category Icon */}
        <div 
          className="p-3 rounded-xl border shrink-0 text-foreground"
          style={{
            backgroundColor: isIncome ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            borderColor: isIncome ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            color: isIncome ? '#10b981' : '#ef4444'
          }}
        >
          <IconComponent className="w-5 h-5" />
        </div>

        {/* Info */}
        <div className="min-w-0">
          <h4 className="text-xs font-bold text-foreground capitalize truncate">
            {transaction.category}
          </h4>
          <span className="text-[9px] font-semibold text-muted-foreground block mt-0.5">
            {formatDate(transaction.date)}
          </span>
          {transaction.notes && (
            <p className="text-[10px] text-muted-foreground truncate max-w-[160px] sm:max-w-xs mt-1 border-l-2 border-border/40 pl-1.5 italic">
              {transaction.notes}
            </p>
          )}
        </div>
      </div>

      {/* Amount and Action */}
      <div className="flex items-center space-x-3 shrink-0">
        <span 
          className="text-xs font-bold font-mono text-foreground"
          style={{ color: isIncome ? '#10b981' : '#ef4444' }}
        >
          {isIncome ? '+' : '-'}{settings.currency}{transaction.amount.toLocaleString()}
        </span>
        <button
          onClick={handleDelete}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-red-500 border border-transparent hover:border-border/40 cursor-pointer transition-colors active:scale-95"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

export default TransactionCard
