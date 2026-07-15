import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Calendar, Edit3, Save } from 'lucide-react'
import { useMoneyStore } from '../store/moneyStore'
import { ActionButton } from '@/admin/components/ActionButton'
import { Input } from '@/components/ui/Input'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  defaultType?: 'income' | 'expense'
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'expense'
}) => {
  const { addTransaction, settings } = useMoneyStore()
  const [type, setType] = useState<'income' | 'expense'>(defaultType)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Reset/Initialize values when opening
  useEffect(() => {
    if (isOpen) {
      setType(defaultType)
      setAmount('')
      setCategory('')
      setDate(new Date().toISOString().split('T')[0])
      setNotes('')
      setErrorMsg(null)
    }
  }, [isOpen, defaultType])

  if (!isOpen) return null

  const incomeCategories = ['Salary', 'Freelance', 'Gift', 'Other']
  const expenseCategories = [
    'Food',
    'Travel',
    'Shopping',
    'Bills',
    'Rent',
    'Education',
    'Health',
    'Entertainment',
    'Other'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const numAmount = parseFloat(amount)
    
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Please input a valid amount greater than zero.')
      return
    }

    if (!category) {
      setErrorMsg(`Please select a ${type === 'income' ? 'source' : 'category'}.`)
      return
    }

    if (!date) {
      setErrorMsg('Please choose a date.')
      return
    }

    try {
      await addTransaction({
        amount: numAmount,
        type,
        category,
        date,
        notes: notes.trim() || undefined
      })
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save transaction records.')
    }
  }

  const activeCategories = type === 'income' ? incomeCategories : expenseCategories

  return (
    <>
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black z-50 cursor-pointer"
      />

      {/* Slide-up sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-card border-t border-border rounded-t-3xl z-50 flex flex-col max-h-[85vh] shadow-2xl select-none"
      >
        {/* Handle bar */}
        <div className="w-12 h-1 bg-muted rounded-full mx-auto my-3 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-2 shrink-0">
          <h3 className="text-sm font-bold text-foreground">Add Transaction</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 pb-8 pt-2 space-y-5 text-left">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-[10px] leading-relaxed">
              {errorMsg}
            </div>
          )}

          {/* Type Tabs */}
          <div className="grid grid-cols-2 gap-2.5 p-1 bg-muted/30 border border-border/40 rounded-xl">
            <button
              type="button"
              onClick={() => { setType('expense'); setCategory(''); }}
              className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-red-500 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => { setType('income'); setCategory(''); }}
              className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Income
            </button>
          </div>

          {/* Amount Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block px-0.5">
              Amount ({settings.currency})
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-xl font-bold text-muted-foreground font-mono">
                {settings.currency}
              </span>
              <Input
                type="number"
                inputMode="decimal"
                pattern="[0-9]*"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                autoFocus
                className="h-12 pl-8 text-lg font-bold font-mono bg-muted/20 border-border focus-visible:ring-accent rounded-xl"
              />
            </div>
          </div>

          {/* Category Chips Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block px-0.5">
              Select {type === 'income' ? 'Source' : 'Category'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {activeCategories.map((cat) => {
                const isSelected = category === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`py-2.5 px-1 rounded-xl border text-center font-bold text-[10px] uppercase tracking-wider cursor-pointer transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-accent/15 border-accent text-accent font-extrabold'
                        : 'bg-muted/15 border-border/60 hover:bg-muted/40 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Date Picker */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block px-0.5">
              Transaction Date
            </label>
            <div className="relative flex items-center">
              <Calendar className="absolute left-4 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 pl-11 bg-muted/20 border-border focus-visible:ring-accent rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Notes Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block px-0.5">
              Notes (Optional)
            </label>
            <div className="relative flex items-center">
              <Edit3 className="absolute left-4 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Dinner with teammates"
                className="h-10 pl-11 bg-muted/20 border-border focus-visible:ring-accent rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Submit */}
          <ActionButton
            type="submit"
            icon={Save}
            className="w-full h-11 bg-accent text-black hover:bg-accent/90 border-none font-bold uppercase tracking-wider text-xs shadow-md mt-4 rounded-xl cursor-pointer"
          >
            Save Transaction
          </ActionButton>
        </form>
      </motion.div>
    </>
  )
}

export default TransactionModal
