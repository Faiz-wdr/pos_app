import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Save } from 'lucide-react'
import { useMoneyStore } from '../store/moneyStore'
import { ActionButton } from '@/admin/components/ActionButton'
import { Input } from '@/components/ui/Input'

interface BudgetModalProps {
  isOpen: boolean
  onClose: () => void
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose
}) => {
  const { budget, updateBudget, settings } = useMoneyStore()
  const [amount, setAmount] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setAmount(budget > 0 ? budget.toString() : '')
      setErrorMsg(null)
    }
  }, [isOpen, budget])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const numAmount = parseFloat(amount)

    if (isNaN(numAmount) || numAmount < 0) {
      setErrorMsg('Please input a valid budget amount.')
      return
    }

    try {
      await updateBudget(numAmount)
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update budget.')
    }
  }

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
        className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-card border-t border-border rounded-t-3xl z-50 flex flex-col shadow-2xl select-none"
      >
        {/* Handle bar */}
        <div className="w-12 h-1 bg-muted rounded-full mx-auto my-3 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-2 shrink-0">
          <h3 className="text-sm font-bold text-foreground">Configure Monthly Budget</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-left">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-[10px] leading-relaxed">
              {errorMsg}
            </div>
          )}

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Specify a target limit on your total monthly expenses. Setting a budget helps you visualize spent percentage bars on the main Dashboard.
          </p>

          {/* Amount Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block px-0.5">
              Monthly Limit ({settings.currency})
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-xl font-bold text-muted-foreground font-mono">
                {settings.currency}
              </span>
              <Input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 15000"
                autoFocus
                className="h-12 pl-8 text-lg font-bold font-mono bg-muted/20 border-border focus-visible:ring-accent rounded-xl"
              />
            </div>
          </div>

          {/* Submit */}
          <ActionButton
            type="submit"
            icon={Save}
            className="w-full h-11 bg-accent text-black hover:bg-accent/90 border-none font-bold uppercase tracking-wider text-xs shadow-md mt-4 rounded-xl cursor-pointer"
          >
            Save Budget
          </ActionButton>
        </form>
      </motion.div>
    </>
  )
}

export default BudgetModal
