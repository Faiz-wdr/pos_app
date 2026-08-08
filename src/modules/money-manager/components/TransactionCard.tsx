import React, { useState } from 'react'
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
  Trash2,
  Edit2
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useSettingsStore } from '@/core/settings/settingsStore'
import { ConfirmDialog } from './ConfirmDialog'

// Map categories to icons
const getCategoryIcon = (category: string) => {
  const normalized = category.toLowerCase()
  switch (normalized) {
    // Income
    case 'salary': return Briefcase
    case 'freelance': return Laptop
    case 'business': return Briefcase
    case 'gift': return Gift
    
    // Expenses
    case 'food': return Utensils
    case 'transport': return Car
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
  onEdit?: () => void
  onDelete?: () => void
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onEdit,
  onDelete
}) => {
  const { settings, deleteTransaction } = useMoneyStore()
  const animationsEnabled = useSettingsStore((state) => state.animationsEnabled)
  const IconComponent = getCategoryIcon(transaction.category)
  
  const [confirmOpen, setConfirmOpen] = useState(false)
  const isIncome = transaction.type === 'income'

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (settings.confirmDelete) {
      setConfirmOpen(true)
    } else {
      handleConfirmDelete()
    }
  }

  const handleConfirmDelete = () => {
    if (transaction.id !== undefined) {
      deleteTransaction(transaction.id)
      if (onDelete) onDelete()
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEdit) onEdit()
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
    <>
      <motion.div
        layout={animationsEnabled}
        initial={animationsEnabled ? { opacity: 0, y: 8 } : { opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        exit={animationsEnabled ? { opacity: 0, scale: 0.95 } : { opacity: 1 }}
        onClick={() => { if (onEdit) onEdit() }}
        className={`p-4 bg-card/60 dark:bg-card/30 border border-border/50 rounded-2xl flex items-center justify-between space-x-3 text-left hover:border-border/80 transition-colors select-none ${onEdit ? 'cursor-pointer' : ''}`}
      >
        <div className="flex items-center space-x-3.5 min-w-0 flex-1">
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
          <div className="min-w-0 flex-1">
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
        <div className="flex items-center space-x-2 shrink-0">
          <span 
            className="text-xs font-bold font-mono text-foreground mr-1"
            style={{ color: isIncome ? '#10b981' : '#ef4444' }}
          >
            {isIncome ? '+' : '-'}{settings.currency}{transaction.amount.toLocaleString()}
          </span>
          
          {/* Edit Button */}
          {onEdit && (
            <button
              onClick={handleEdit}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-blue-500 border border-transparent hover:border-border/40 cursor-pointer transition-colors active:scale-95"
              title="Edit transaction"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Delete Button */}
          <button
            onClick={handleDeleteClick}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-red-500 border border-transparent hover:border-border/40 cursor-pointer transition-colors active:scale-95"
            title="Delete transaction"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>

      {/* Styled Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Transaction"
        message="Are you sure you want to permanently delete this transaction record? This cannot be undone."
        confirmText="Delete"
      />
    </>
  )
}

export default TransactionCard
