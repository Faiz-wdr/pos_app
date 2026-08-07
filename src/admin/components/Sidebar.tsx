import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Layers, 
  BarChart3, 
  CreditCard, 
  GitBranch, 
  LifeBuoy, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useAdminStore } from '../stores/adminStore'
import { cn } from '@/shared/utils/cn'

export const Sidebar: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useAdminStore()

  const menuItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Modules', path: '/admin/modules', icon: Layers },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Payments', path: '/admin/payments', icon: CreditCard },
    { label: 'Releases', path: '/admin/releases', icon: GitBranch },
    { label: 'Support', path: '/admin/support', icon: LifeBuoy },
    { label: 'Settings', path: '/admin/settings', icon: Settings }
  ]

  return (
    <aside
      className={cn(
        'hidden sm:flex flex-col bg-card border-r border-border shrink-0 select-none transition-all duration-300 relative',
        sidebarOpen ? 'w-64' : 'w-20'
      )}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-border/60 shrink-0">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center font-black text-black text-sm shrink-0 shadow-xs">
            OS
          </div>
          {sidebarOpen && (
            <span className="font-bold text-sm tracking-tight text-foreground truncate">
              Admin Hub
            </span>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center space-x-3.5 px-3 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer group active:scale-[0.98]',
                  isActive
                    ? 'bg-accent text-accent-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-105" />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* Sidebar Footer Collapse Toggle */}
      <div className="p-4 border-t border-border/60 flex justify-end shrink-0">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50 transition-all cursor-pointer"
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
