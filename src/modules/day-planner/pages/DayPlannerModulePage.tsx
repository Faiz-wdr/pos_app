import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Sun, Moon, Calendar, Sparkles, Settings } from 'lucide-react'
import { TodayPage } from './TodayPage'
import { TomorrowPage } from './TomorrowPage'
import { CalendarPage } from './CalendarPage'
import { TemplatesPage } from './TemplatesPage'
import { SettingsPage } from './SettingsPage'
import { cn } from '@/shared/utils/cn'
import { useNavigationStore } from '@/core/navigation/navigationStore'

type PlannerTab = 'today' | 'tomorrow' | 'calendar' | 'templates' | 'settings'

const TABS: { id: PlannerTab; label: string; icon: any }[] = [
  { id: 'today', label: 'Today', icon: Sun },
  { id: 'tomorrow', label: 'Tomorrow', icon: Moon },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'templates', label: 'Templates', icon: Sparkles },
  { id: 'settings', label: 'Settings', icon: Settings }
]

export const DayPlannerModulePage = () => {
  const [activeTab, setActiveTab] = useState<PlannerTab>('today')
  const setHideSystemNav = useNavigationStore((state) => state.setHideSystemNav)

  useEffect(() => {
    setHideSystemNav(true)
    return () => {
      setHideSystemNav(false)
    }
  }, [setHideSystemNav])

  const renderTabContent = () => {
    switch (activeTab) {
      case 'today':
        return <TodayPage />
      case 'tomorrow':
        return <TomorrowPage />
      case 'calendar':
        return <CalendarPage />
      case 'templates':
        return <TemplatesPage />
      case 'settings':
        return <SettingsPage />
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-between w-full h-full relative select-none pb-0 overflow-hidden">
      {/* Top Header Navigation Bar (Left-Aligned Text, No Icon) */}
      <header className="flex items-center w-full px-4 py-2.5 shrink-0 bg-background/90 dark:bg-background/80 backdrop-blur-xs border-b border-border/40 z-30 select-none space-x-2.5">
        <Link
          to="/modules"
          className="p-1.5 rounded-full hover:bg-card border border-border/20 text-muted-foreground hover:text-foreground transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-accent shrink-0"
          aria-label="Back to POS modules"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <span className="text-sm font-extrabold text-foreground tracking-tight">
          Day Planner
        </span>
      </header>

      {/* Main Tab Screen Content Area */}
      <div className="flex-1 flex flex-col px-4 pt-3 overflow-y-auto select-text">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="flex-1 flex flex-col w-full"
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Module Specific Bottom Navigation Bar (5 tabs) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 border-t border-border pb-safe flex items-center justify-around h-16 sm:h-18 select-none">
        <div className="w-full max-w-md mx-auto flex items-center justify-around px-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex flex-col items-center justify-center w-14 h-12 transition-colors cursor-pointer group focus-visible:outline-2 focus-visible:outline-accent"
                aria-label={tab.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-accent/10 rounded-xl"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon
                  className={cn(
                    'w-5 h-5 transition-colors duration-200 z-10',
                    isActive ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />
                <span
                  className={cn(
                    'text-[10px] font-bold mt-1 transition-colors duration-200 z-10',
                    isActive ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                >
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default DayPlannerModulePage
