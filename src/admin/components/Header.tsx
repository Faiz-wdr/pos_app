import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, Sun, Moon, LogOut, Menu, User } from 'lucide-react'
import { useThemeStore } from '@/core/theme/themeStore'
import { useAdminStore } from '../stores/adminStore'
import { auth } from '@/core/firebase/auth'
import { SearchBar } from './SearchBar'

export const Header: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme: appTheme, setTheme: setAppTheme } = useThemeStore()
  const { notifications, toggleSidebar } = useAdminStore()
  const [search, setSearch] = useState('')

  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/admin') return 'Dashboard'
    if (path.startsWith('/admin/users')) return 'Users'
    if (path.startsWith('/admin/modules')) return 'Modules'
    if (path.startsWith('/admin/analytics')) return 'Analytics'
    if (path.startsWith('/admin/payments')) return 'Payments'
    if (path.startsWith('/admin/releases')) return 'Releases'
    if (path.startsWith('/admin/support')) return 'Support'
    if (path.startsWith('/admin/settings')) return 'Settings'
    return 'Admin Panel'
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const handleLogout = async () => {
    try {
      await auth.signOut()
      navigate('/admin/login')
    } catch (e) {
      console.error(e)
    }
  }

  const handleThemeToggle = () => {
    setAppTheme(appTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="h-16 bg-card border-b border-border/60 flex items-center justify-between px-4 sm:px-6 select-none shrink-0">
      <div className="flex items-center space-x-3.5">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground sm:hidden cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-sm font-bold text-foreground tracking-tight hidden sm:block">
          {getPageTitle()}
        </h2>
      </div>

      {/* Center Search Bar (Desktop only) */}
      <div className="hidden md:block flex-1 max-w-xs mx-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Quick search..." />
      </div>

      {/* Right Navigation Options */}
      <div className="flex items-center space-x-2 sm:space-x-3.5">
        {/* Theme Toggle */}
        <button
          onClick={handleThemeToggle}
          className="p-2 rounded-xl bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40 transition-all cursor-pointer"
          aria-label="Toggle color theme"
        >
          {appTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Icon Button */}
        <button
          className="p-2 rounded-xl bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40 transition-all relative cursor-pointer"
          aria-label="System notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full ring-2 ring-card animate-pulse" />
          )}
        </button>

        {/* User profile section */}
        <div className="flex items-center space-x-2.5 pl-1.5 sm:pl-2.5 border-l border-border/60">
          <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground border border-border/40">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden lg:flex flex-col text-left max-w-[100px]">
            <span className="text-[10px] font-bold text-foreground truncate">Super Admin</span>
            <span className="text-[8px] text-muted-foreground truncate">{auth.currentUser?.email || 'System'}</span>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
            aria-label="Logout"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
