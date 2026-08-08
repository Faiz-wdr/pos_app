import React from 'react'
import { motion } from 'framer-motion'
import { X, PiggyBank, Plus } from 'lucide-react'
import { SavingsGoal } from '../types'
import { useMoneyStore } from '../store/moneyStore'

interface GoalsListModalProps {
  isOpen: boolean
  onClose: () => void
  goals: SavingsGoal[]
  onOpenGoalAction: (goal: SavingsGoal, mode: 'deposit' | 'withdraw') => void
  onEditGoal: (goal: SavingsGoal) => void
  onCompleteGoal: (goal: SavingsGoal) => void
  onCreateGoal: () => void
}

export const GoalsListModal: React.FC<GoalsListModalProps> = ({
  isOpen,
  onClose,
  goals,
  onOpenGoalAction,
  onEditGoal,
  onCompleteGoal,
  onCreateGoal
}) => {
  const { settings } = useMoneyStore()

  if (!isOpen) return null

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
        className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-card border-t border-border rounded-t-3xl z-50 flex flex-col max-h-[80vh] shadow-2xl select-none"
      >
        {/* Handle bar */}
        <div className="w-12 h-1 bg-muted rounded-full mx-auto my-3 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-3 shrink-0">
          <div className="flex items-center space-x-2">
            <PiggyBank className="w-5 h-5 text-accent" />
            <h3 className="text-sm font-bold text-foreground">All Savings Goals</h3>
          </div>
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => { onClose(); onCreateGoal(); }}
              className="flex items-center space-x-1 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-accent border border-accent/20 rounded-lg hover:bg-accent/5 cursor-pointer active:scale-95 transition-all"
            >
              <Plus className="w-3 h-3" />
              <span>Create</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-8 pt-2 space-y-4 text-left">
          {goals.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No savings goals created. Add targets like Emergency Fund, Bike, or Travel.
            </div>
          ) : (
            <div className="space-y-3.5">
              {goals.map((goal) => {
                const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0
                const remaining = Math.max(0, goal.targetAmount - goal.currentAmount)

                return (
                  <div
                    key={goal.id}
                    className="p-4 bg-muted/15 border border-border/40 rounded-2xl flex flex-col justify-between space-y-3.5"
                  >
                    {/* Goal Header */}
                    <div className="flex items-start justify-between space-x-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-foreground truncate">{goal.name}</h4>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5 block">
                          Saved: {settings.currency}{goal.currentAmount.toLocaleString()} / {settings.currency}{goal.targetAmount.toLocaleString()}
                        </span>
                        {goal.targetDate && (
                          <span className="text-[8px] text-muted-foreground block mt-1">
                            Target Date: {new Date(goal.targetDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono font-bold text-foreground shrink-0 bg-muted px-2 py-0.5 rounded-lg border border-border/20">
                        {pct}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full bg-muted/50 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[8px] text-muted-foreground block text-right font-semibold">
                        {remaining > 0 ? `Remaining: ${settings.currency}${remaining.toLocaleString()}` : 'Target Met! 🎉'}
                      </span>
                    </div>

                    {/* Actions toolbar */}
                    <div className="flex space-x-2 pt-1 border-t border-border/20">
                      <button
                        onClick={() => onOpenGoalAction(goal, 'deposit')}
                        className="flex-1 h-7 rounded-lg bg-accent text-accent-foreground font-bold text-[8px] uppercase tracking-wider flex items-center justify-center cursor-pointer transition-all active:scale-95"
                      >
                        Deposit
                      </button>
                      <button
                        onClick={() => onOpenGoalAction(goal, 'withdraw')}
                        className="flex-1 h-7 rounded-lg border border-border/60 hover:bg-muted text-foreground font-bold text-[8px] uppercase tracking-wider flex items-center justify-center cursor-pointer transition-all active:scale-95"
                      >
                        Withdraw
                      </button>
                      <button
                        onClick={() => onEditGoal(goal)}
                        className="h-7 px-3.5 rounded-lg border border-border/60 hover:bg-muted text-foreground font-bold text-[8px] uppercase tracking-wider flex items-center justify-center cursor-pointer transition-all active:scale-95"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onCompleteGoal(goal)}
                        className="h-7 px-3 rounded-lg border border-border/60 hover:bg-muted text-emerald-500 font-bold text-[8px] uppercase tracking-wider flex items-center justify-center cursor-pointer transition-all active:scale-95"
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>
    </>
  )
}

export default GoalsListModal
