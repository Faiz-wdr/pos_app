import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { safeStorage } from '@/core/storage/storage'
import { AdminTheme, AdminNotification } from '../types'

interface AdminState {
  sidebarOpen: boolean
  activeTab: string
  theme: AdminTheme
  notifications: AdminNotification[]
  
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setActiveTab: (tab: string) => void
  setTheme: (theme: AdminTheme) => void
  
  markAllNotificationsRead: () => void
  clearAllNotifications: () => void
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      activeTab: 'dashboard',
      theme: 'system',
      notifications: [
        {
          id: '1',
          title: 'System Alert',
          message: 'Super Admin foundation has been successfully deployed.',
          read: false,
          timestamp: new Date().toLocaleTimeString()
        }
      ],

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setActiveTab: (activeTab) => set({ activeTab }),
      setTheme: (theme) => set({ theme }),
      
      markAllNotificationsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      })),
      clearAllNotifications: () => set({ notifications: [] })
    }),
    {
      name: 'pos-admin-settings',
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        theme: state.theme
      })
    }
  )
)

export default useAdminStore
