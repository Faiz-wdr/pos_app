import React from 'react'
import { LayoutDashboard, History, BarChart3, Wallet, Settings } from 'lucide-react'

interface TabNavigationProps {
  activeTab: string
  onChange: (tab: string) => void
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onChange
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'History', icon: History },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'budget', label: 'Budget', icon: Wallet },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  return (
    <div className="w-full bg-card border-t border-border shrink-0 select-none pb-safe-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex-1 flex flex-col items-center justify-center h-full space-y-1 text-muted-foreground hover:text-foreground cursor-pointer transition-colors active:scale-95"
              style={{ color: isActive ? '#f8b518' : undefined }}
            >
              <Icon className="w-5 h-5 transition-transform duration-200" style={{ transform: isActive ? 'scale(1.1)' : 'scale(1)' }} />
              <span className={`text-[8px] font-bold uppercase tracking-wider leading-none transition-all ${
                isActive ? 'font-extrabold text-foreground' : ''
              }`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default TabNavigation
