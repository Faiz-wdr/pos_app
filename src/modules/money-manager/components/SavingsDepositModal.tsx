import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, ArrowUpRight, ArrowDownRight, Save } from 'lucide-react'
import { useMoneyStore } from '../store/moneyStore'
import { SavingsGoal } from '../types'
import { ActionButton } from '@/admin/components/ActionButton'
import { Input } from '@/components/ui/Input'

interface SavingsDepositModalProps {
  isOpen: boolean
  onClose: () => void
  goal: SavingsGoal | null
  defaultMode?: 'deposit' | 'withdraw'
}

export const SavingsDepositModal: React.FC<SavingsDepositModalProps> = ({
  isOpen,
  onClose,
  goal,
  defaultMode = 'deposit'
}) => {
  const { addSavingsToGoal, withdrawSavingsFromGoal, settings } = useMoneyStore()
  const [mode, setMode] = useState<'deposit' | 'withdraw'>(defaultMode)
  const [amount, setAmount] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode)
      setAmount('')
      setErrorMsg(null)
    }
  }, [isOpen, defaultMode])

  if (!isOpen || !goal) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const numAmount = parseFloat(amount)

    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than zero.')
      return
    }

    if (mode === 'withdraw' && numAmount > goal.currentAmount) {
      setErrorMsg(`Withdrawal exceeds current savings balance (${settings.currency}${goal.currentAmount}).`)
      return
    }

    try {
      if (mode === 'deposit') {
        if (goal.id !== undefined) {
          await addSavingsToGoal(goal.id, numAmount)
        }
      } else {
        if (goal.id !== undefined) {
          await withdrawSavingsFromGoal(goal.id, numAmount)
        }
      }
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update goal savings.')
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black z-50 cursor-pointer"
      />

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-card border-t border-border rounded-t-3xl z-50 flex flex-col shadow-2xl select-none"
      >
        <div className="w-12 h-1 bg-muted rounded-full mx-auto my-3 shrink-0" />

        <div className="flex items-center justify-between px-6 pb-2 shrink-0">
          <div className="flex flex-col text-left">
            <h3 className="text-sm font-bold text-foreground">Update Savings</h3>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block mt-0.5">
              Goal: {goal.name}
            </span>
          </div>
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

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2.5 p-1 bg-muted/30 border border-border/40 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('deposit')}
              className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                mode === 'deposit'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Deposit</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('withdraw')}
              className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                mode === 'withdraw'
                  ? 'bg-red-500 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Withdraw</span>
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
                min="0.01"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
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
            Confirm {mode === 'deposit' ? 'Deposit' : 'Withdrawal'}
          </ActionButton>
        </form>
      </motion.div>
    </>
  )
}

export default SavingsDepositModal
