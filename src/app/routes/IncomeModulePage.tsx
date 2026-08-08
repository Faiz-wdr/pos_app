import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { ModuleOptionsMenu } from '@/components/ModuleOptionsMenu'
import { useNavigationStore } from '@/core/navigation/navigationStore'
import { useMoneyManagerSync } from '@/modules/money-manager/hooks/useMoneyManagerSync'
import { useMoneyStore } from '@/modules/money-manager/store/moneyStore'
import { TabNavigation } from '@/modules/money-manager/components/TabNavigation'
import { DashboardTab } from '@/modules/money-manager/pages/DashboardTab'
import { TransactionsTab } from '@/modules/money-manager/pages/TransactionsTab'
import { ReportsTab } from '@/modules/money-manager/pages/ReportsTab'
import { SettingsTab } from '@/modules/money-manager/pages/SettingsTab'
import { GoalsTab } from '@/modules/money-manager/pages/GoalsTab'
import { TransactionModal } from '@/modules/money-manager/components/TransactionModal'
import { AnimatePresence } from 'framer-motion'

export const IncomeModulePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [activeModal, setActiveModal] = useState<'income' | 'expense' | null>(null)
  
  const setHideSystemNav = useNavigationStore((state) => state.setHideSystemNav)
  const loadData = useMoneyStore((state) => state.loadData)

  // Start bidirectional cloud sync
  useMoneyManagerSync()

  useEffect(() => {
    setHideSystemNav(true)
    loadData() // Initial offline load
    return () => {
      setHideSystemNav(false)
    }
  }, [setHideSystemNav, loadData])

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <DashboardTab 
            onNavigateToHistory={() => setActiveTab('transactions')} 
            onNavigateToGoals={() => setActiveTab('goals')}
          />
        )
      case 'goals':
        return <GoalsTab onBack={() => setActiveTab('overview')} />
      case 'transactions':
        return <TransactionsTab />
      case 'reports':
        return <ReportsTab />
      case 'settings':
        return <SettingsTab />
      default:
        return (
          <DashboardTab 
            onNavigateToHistory={() => setActiveTab('transactions')} 
            onNavigateToGoals={() => setActiveTab('goals')}
          />
        )
    }
  }

  // Highlight Overview tab when viewing subpage Goals
  const navActiveTab = activeTab === 'goals' ? 'overview' : activeTab

  return (
    <div className="flex-1 flex flex-col justify-between w-full h-full relative select-none pb-0 overflow-hidden">
      {/* Top Header Navigation Bar */}
      <header className="flex items-center justify-between w-full px-4 py-2.5 shrink-0 bg-background/90 dark:bg-background/80 backdrop-blur-xs border-b border-border/40 z-30 select-none">
        <div className="flex items-center space-x-2.5">
          <Link
            to="/modules"
            className="p-1.5 rounded-full hover:bg-card border border-border/20 text-muted-foreground hover:text-foreground transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-accent shrink-0"
            aria-label="Back to POS modules"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center space-x-1.5">
            <span className="text-sm font-extrabold text-foreground tracking-tight">
              Money Manager
            </span>
            <span className="text-[8px] bg-accent/20 text-accent font-extrabold uppercase px-1.5 py-0.5 rounded-md tracking-wide select-none">
              PRO
            </span>
          </div>
        </div>

        <ModuleOptionsMenu />
      </header>

      {/* Main Tab Screen Content Area */}
      <div className="flex-1 flex flex-col px-4 pt-3 pb-36 overflow-y-auto select-text">
        <div className="flex-1 flex flex-col w-full">
          {renderTabContent()}
        </div>
      </div>

      {/* Fixed bottom actions bar (Just above bottom navigation bar) on Overview Tab */}
      {activeTab === 'overview' && (
        <div className="fixed bottom-16 left-0 right-0 z-30 px-4 py-3 bg-background/95 dark:bg-background/90 backdrop-blur-xs border-t border-border/30 max-w-lg mx-auto flex space-x-3.5 select-none">
          <button
            onClick={() => setActiveModal('income')}
            className="flex-1 flex items-center justify-center h-11 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/20 text-emerald-500 rounded-2xl font-bold text-xs cursor-pointer active:scale-[0.98] transition-all space-x-1.5"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Income</span>
          </button>
          <button
            onClick={() => setActiveModal('expense')}
            className="flex-1 flex items-center justify-center h-11 bg-red-500/15 hover:bg-red-500/25 border border-red-500/20 text-red-500 rounded-2xl font-bold text-xs cursor-pointer active:scale-[0.98] transition-all space-x-1.5"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Expense</span>
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <TabNavigation activeTab={navActiveTab} onChange={setActiveTab} />
      </div>

      {/* Transaction Modal Overlay */}
      <AnimatePresence>
        {activeModal && (
          <TransactionModal
            isOpen={activeModal !== null}
            onClose={() => setActiveModal(null)}
            defaultType={activeModal}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default IncomeModulePage
