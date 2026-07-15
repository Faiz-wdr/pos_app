import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMoneyStore } from '../store/moneyStore'
import { BudgetModal } from '../components/BudgetModal'
import { Wallet, Settings, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { ActionButton } from '@/admin/components/ActionButton'
import { useSettingsStore } from '@/core/settings/settingsStore'

export const BudgetTab: React.FC = () => {
  const { transactions, budget, settings } = useMoneyStore()
  const animationsEnabled = useSettingsStore((state) => state.animationsEnabled)
  const [modalOpen, setModalOpen] = useState(false)

  // Calculate current month's expenses
  const currentMonthPrefix = useMemo(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    return `${y}-${m}`
  }, [])

  const spent = useMemo(() => {
    let sum = 0
    transactions.forEach((tx) => {
      if (tx.date.startsWith(currentMonthPrefix) && tx.type === 'expense') {
        sum += tx.amount
      }
    })
    return sum
  }, [transactions, currentMonthPrefix])

  const stats = useMemo(() => {
    const remaining = budget - spent
    const percentage = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0
    const rawPercentage = budget > 0 ? Math.round((spent / budget) * 100) : 0
    return {
      remaining,
      percentage,
      rawPercentage
    }
  }, [budget, spent])

  return (
    <div className="space-y-5 text-left">
      {/* Title Header */}
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Financial Threshold</span>
        <h2 className="text-xl font-bold text-foreground mt-0.5 tracking-tight">Monthly Budget</h2>
      </div>

      {budget === 0 ? (
        <Card className="border-dashed border-border/80 bg-muted/10">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-4 select-none">
            <div className="p-4 bg-accent/10 text-accent rounded-full border border-accent/25">
              <Wallet className="w-8 h-8 shrink-0" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-foreground">No Budget Threshold Configured</h4>
              <p className="text-[10px] text-muted-foreground max-w-[240px] mx-auto leading-normal">
                Setting a monthly budget limit helps you control overspending by visually tracking your daily outputs.
              </p>
            </div>
            <ActionButton
              onClick={() => setModalOpen(true)}
              icon={Wallet}
              className="bg-accent text-black hover:bg-accent/90 border-none font-bold uppercase tracking-wider text-[10px] rounded-xl h-10 px-5 cursor-pointer mt-2"
            >
              Set Monthly Limit
            </ActionButton>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Main Visual Card */}
          <motion.div
            initial={animationsEnabled ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-card/60 dark:bg-card/30 border border-border/60 rounded-3xl space-y-5 select-none"
          >
            {/* Limit Header */}
            <div className="flex justify-between items-start">
              <div className="space-y-0.5">
                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider block">Limit</span>
                <span className="text-lg font-bold text-foreground font-mono">
                  {settings.currency}{budget.toLocaleString()}
                </span>
              </div>
              <ActionButton
                onClick={() => setModalOpen(true)}
                icon={Settings}
                variant="outline"
                className="h-8 text-[9px] px-2.5 rounded-lg border border-border/60 hover:bg-muted"
              >
                Change Limit
              </ActionButton>
            </div>

            {/* Spent vs Remaining Grid */}
            <div className="grid grid-cols-2 gap-4 border-t border-border/40 pt-4">
              <div className="space-y-0.5">
                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider block">Spent So Far</span>
                <span className="text-sm font-bold text-red-500 font-mono">
                  {settings.currency}{spent.toLocaleString()}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider block">Money Remaining</span>
                <span 
                  className="text-sm font-bold font-mono"
                  style={{ color: stats.remaining >= 0 ? '#10b981' : '#ef4444' }}
                >
                  {stats.remaining >= 0 ? '' : '-'}{settings.currency}{Math.abs(stats.remaining).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Progress status bar */}
            <div className="space-y-2 border-t border-border/40 pt-4">
              <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                <span className="flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3 text-accent shrink-0" />
                  <span>Consumption Status ({stats.rawPercentage}%)</span>
                </span>
              </div>
              <div className="w-full bg-muted/60 dark:bg-muted/30 h-2.5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${stats.percentage}%`,
                    backgroundColor: stats.rawPercentage > 90 ? '#ef4444' : stats.rawPercentage > 75 ? '#f8b518' : '#3b82f6'
                  }}
                  initial={animationsEnabled ? { width: 0 } : { width: `${stats.percentage}%` }}
                  animate={{ width: `${stats.percentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          </motion.div>

          {/* Simple Guide advice */}
          <div className="p-4 bg-muted/20 border border-border/30 rounded-2xl">
            <h4 className="text-xs font-bold text-foreground flex items-center space-x-1.5 mb-1.5 select-none">
              <span className="text-accent">💡</span>
              <span>Friendly Advice</span>
            </h4>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              {stats.rawPercentage === 0 ? (
                'You haven\'t spent any money this month! Great start. Keep logging your daily expense transactions here.'
              ) : stats.rawPercentage > 100 ? (
                'Alert: You have crossed your monthly budget limit. Consider limiting entertainment or shopping for the next couple of weeks.'
              ) : stats.rawPercentage > 90 ? (
                'Warning: You have utilized over 90% of your monthly budget limit. Plan your remaining outputs carefully.'
              ) : stats.rawPercentage > 75 ? (
                'Attention: You have consumed over 75% of your target budget. Try tracking other category details.'
              ) : (
                'Good job! You are well within your monthly expense budget. Continuous tracking ensures budget discipline!'
              )}
            </p>
          </div>
        </div>
      )}

      {/* Slide-up Budget Editor Sheet */}
      <AnimatePresence>
        {modalOpen && (
          <BudgetModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default BudgetTab
