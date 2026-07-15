import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMoneyStore } from '@/modules/money-manager/store/moneyStore'
import { TabNavigation } from '@/modules/money-manager/components/TabNavigation'
import { DashboardTab } from '@/modules/money-manager/pages/DashboardTab'
import { TransactionsTab } from '@/modules/money-manager/pages/TransactionsTab'
import { ReportsTab } from '@/modules/money-manager/pages/ReportsTab'
import { BudgetTab } from '@/modules/money-manager/pages/BudgetTab'
import { SettingsTab } from '@/modules/money-manager/pages/SettingsTab'
import { useSettingsStore } from '@/core/settings/settingsStore'

export const IncomeModulePage: React.FC = () => {
  const { loadData, loading } = useMoneyStore()
  const animationsEnabled = useSettingsStore((state) => state.animationsEnabled)
  const [activeTab, setActiveTab] = useState<string>('dashboard')

  // Load offline tables from IndexedDB
  useEffect(() => {
    loadData()
  }, [loadData])

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardTab 
            onNavigateToHistory={() => setActiveTab('transactions')} 
          />
        )
      case 'transactions':
        return <TransactionsTab />
      case 'reports':
        return <ReportsTab />
      case 'budget':
        return <BudgetTab />
      case 'settings':
        return <SettingsTab />
      default:
        return <DashboardTab onNavigateToHistory={() => setActiveTab('transactions')} />
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-20 select-none">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin mb-4" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Loading Wallet...
        </span>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col justify-between min-h-[75vh] md:max-w-xl md:mx-auto w-full">
      {/* Scrollable Main Viewport */}
      <div className="flex-1 pb-20 px-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={animationsEnabled ? { opacity: 0, x: -4 } : { opacity: 1, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={animationsEnabled ? { opacity: 0, x: 4 } : { opacity: 1 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
            className="h-full"
          >
            {renderActiveTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Tab Navigation Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border/40">
        <TabNavigation activeTab={activeTab} onChange={setActiveTab} />
      </div>
    </div>
  )
}

export default IncomeModulePage
