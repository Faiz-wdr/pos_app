import React, { useState, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useMoneyStore } from '../store/moneyStore'
import { SavingsGoal } from '../types'
import { ArrowLeft, CheckCircle2, RotateCcw, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { GoalModal } from '../components/GoalModal'
import { SavingsDepositModal } from '../components/SavingsDepositModal'
import { ConfirmDialog } from '../components/ConfirmDialog'

interface GoalsTabProps {
  onBack: () => void
}

export const GoalsTab: React.FC<GoalsTabProps> = ({ onBack }) => {
  const { goals, settings, updateGoal, deleteGoal } = useMoneyStore()

  // Modal triggers
  const [activeModal, setActiveModal] = useState<'goal' | 'savings' | null>(null)
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null)
  const [savingsMode, setSavingsMode] = useState<'deposit' | 'withdraw'>('deposit')

  // Custom Confirm Dialogs states
  const [goalToComplete, setGoalToComplete] = useState<SavingsGoal | null>(null)
  const [goalToDelete, setGoalToDelete] = useState<SavingsGoal | null>(null)

  const activeGoals = useMemo(() => {
    return goals.filter(g => !g.archived)
  }, [goals])

  const completedGoals = useMemo(() => {
    return goals.filter(g => g.archived)
  }, [goals])

  const handleOpenGoalSavings = (goal: SavingsGoal, mode: 'deposit' | 'withdraw') => {
    setSelectedGoal(goal)
    setSavingsMode(mode)
    setActiveModal('savings')
  }

  const handleConfirmCompleteGoal = async () => {
    if (goalToComplete) {
      await updateGoal(goalToComplete.id!, { archived: true })
      setGoalToComplete(null)
    }
  }

  const handleConfirmDeleteGoal = async () => {
    if (goalToDelete) {
      await deleteGoal(goalToDelete.id!)
      setGoalToDelete(null)
    }
  }

  const handleReopenGoal = async (goal: SavingsGoal) => {
    await updateGoal(goal.id!, { archived: false })
  }

  return (
    <div className="space-y-5 text-left pb-20 select-none">
      {/* Header title with back button */}
      <div className="flex items-center space-x-3 border-b border-border/40 pb-3">
        <button
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-muted border border-border/20 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-xl font-bold text-foreground mt-0.5 tracking-tight">Savings Goals</h2>
      </div>

      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Active Targets ({activeGoals.length})
        </span>
        <button
          onClick={() => { setSelectedGoal(null); setActiveModal('goal'); }}
          className="text-[10px] font-bold uppercase tracking-wider text-accent cursor-pointer hover:underline"
        >
          + Create Goal
        </button>
      </div>

      {/* Active Goals list */}
      {activeGoals.length === 0 ? (
        <Card className="border-dashed border-border/80 bg-muted/10">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-3.5 select-none">
            <span className="text-xs text-muted-foreground">No Active Savings Goals.</span>
            <p className="text-[9px] text-muted-foreground/80 max-w-[200px] mx-auto leading-normal">
              Establish financial targets like Travel, Emergency Fund, or Gadgets.
            </p>
            <button
              onClick={() => { setSelectedGoal(null); setActiveModal('goal'); }}
              className="h-8.5 px-4 bg-accent text-accent-foreground font-bold text-[10px] uppercase tracking-wider rounded-xl cursor-pointer hover:bg-accent/90 transition-all active:scale-95"
            >
              + Create Goal
            </button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3.5">
          {activeGoals.map((goal) => {
            const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount)

            return (
              <div
                key={goal.id}
                className="p-4.5 bg-card/60 dark:bg-card/35 border border-border/50 rounded-2xl flex flex-col justify-between space-y-4"
              >
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

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="w-full bg-muted/60 dark:bg-muted/30 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[8px] text-muted-foreground block text-right font-semibold">
                    {remaining > 0 ? `Remaining: ${settings.currency}${remaining.toLocaleString()}` : 'Target Met! 🎉'}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex space-x-2 border-t border-border/40 pt-3">
                  <button
                    onClick={() => handleOpenGoalSavings(goal, 'deposit')}
                    className="flex-1 h-8 rounded-lg bg-accent text-accent-foreground font-bold text-[9px] uppercase tracking-wider flex items-center justify-center cursor-pointer transition-all active:scale-95"
                  >
                    Deposit
                  </button>
                  <button
                    onClick={() => handleOpenGoalSavings(goal, 'withdraw')}
                    className="flex-1 h-8 rounded-lg border border-border/60 hover:bg-muted text-foreground font-bold text-[9px] uppercase tracking-wider flex items-center justify-center cursor-pointer transition-all active:scale-95"
                  >
                    Withdraw
                  </button>
                  <button
                    onClick={() => { setSelectedGoal(goal); setActiveModal('goal'); }}
                    className="h-8 px-3 rounded-lg border border-border/60 hover:bg-muted text-foreground font-bold text-[8px] uppercase tracking-wider flex items-center justify-center cursor-pointer transition-all active:scale-95"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setGoalToComplete(goal)}
                    className="h-8 px-3 rounded-lg border border-border/60 hover:bg-muted text-emerald-500 font-bold text-[8px] uppercase tracking-wider flex items-center justify-center cursor-pointer transition-all active:scale-95"
                  >
                    Done
                  </button>
                  <button
                    onClick={() => setGoalToDelete(goal)}
                    className="h-8 px-3 rounded-lg border border-border/60 hover:bg-muted text-red-500 font-bold text-[8px] uppercase tracking-wider flex items-center justify-center cursor-pointer transition-all active:scale-95"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Completed Goals list */}
      {completedGoals.length > 0 && (
        <div className="space-y-3.5 pt-4">
          <div className="px-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Completed Goals ({completedGoals.length})
            </span>
          </div>

          <div className="space-y-3">
            {completedGoals.map((goal) => (
              <div
                key={goal.id}
                className="p-4 bg-muted/10 border border-border/30 rounded-2xl flex items-center justify-between opacity-75 hover:opacity-100 transition-opacity text-left"
              >
                <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-foreground truncate">{goal.name}</h4>
                    <span className="text-[9px] font-semibold text-muted-foreground block mt-0.5">
                      Target Met: {settings.currency}{goal.targetAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {/* Reopen Button */}
                  <button
                    onClick={() => handleReopenGoal(goal)}
                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-accent border border-transparent hover:border-border/40 cursor-pointer transition-colors active:scale-95"
                    title="Re-open goal"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => setGoalToDelete(goal)}
                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-red-500 border border-transparent hover:border-border/40 cursor-pointer transition-colors active:scale-95"
                    title="Delete goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sheet modals overlays */}
      <AnimatePresence>
        {activeModal === 'goal' && (
          <GoalModal
            isOpen={activeModal !== null}
            onClose={() => { setActiveModal(null); setSelectedGoal(null); }}
            goalToEdit={selectedGoal}
          />
        )}

        {activeModal === 'savings' && selectedGoal && (
          <SavingsDepositModal
            isOpen={activeModal !== null}
            onClose={() => { setActiveModal(null); setSelectedGoal(null); }}
            goal={selectedGoal}
            defaultMode={savingsMode}
          />
        )}

        {goalToComplete && (
          <ConfirmDialog
            isOpen={goalToComplete !== null}
            onClose={() => setGoalToComplete(null)}
            onConfirm={handleConfirmCompleteGoal}
            title="Complete Goal"
            message={`Are you sure you want to mark "${goalToComplete.name}" as completed? It will be archived.`}
            confirmText="Yes, Complete"
            variant="primary"
          />
        )}

        {goalToDelete && (
          <ConfirmDialog
            isOpen={goalToDelete !== null}
            onClose={() => setGoalToDelete(null)}
            onConfirm={handleConfirmDeleteGoal}
            title="Delete Goal"
            message={`Are you sure you want to permanently delete "${goalToDelete.name}"? This cannot be undone.`}
            confirmText="Delete"
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default GoalsTab
