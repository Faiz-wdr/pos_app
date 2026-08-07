import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Layers, 
  Settings 
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { cn } from '@/shared/utils/cn'

export const AdminLayout: React.FC = () => {
  const mobileMenuItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Modules', path: '/admin/modules', icon: Layers },
    { label: 'Settings', path: '/admin/settings', icon: Settings }
  ]

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground antialiased transition-colors duration-300">
      {/* Permanent/Collapsible Left Sidebar (Desktop/Tablet) */}
      <Sidebar />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <Header />

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-8 pb-20 sm:pb-6 select-text">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation (Visible on mobile viewports only) */}
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border/60 flex items-center justify-around px-2 z-40 select-none">
          {mobileMenuItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-[10px] font-bold transition-all cursor-pointer active:scale-95 text-muted-foreground',
                    isActive ? 'text-accent font-extrabold' : 'hover:text-foreground'
                  )
                }
              >
                <Icon className="w-5 h-5 mb-0.5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export default AdminLayout
