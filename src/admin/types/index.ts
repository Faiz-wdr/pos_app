export type AdminTheme = 'light' | 'dark' | 'system'

export interface AdminNotification {
  id: string
  title: string
  message: string
  read: boolean
  timestamp: string
}

export interface AdminSidebarItem {
  label: string
  path: string
  icon: string
}

export interface FirestoreUser {
  uid: string
  fullName: string | null
  email: string | null
  role: 'guest' | 'user' | 'super_admin'
  premium?: boolean
  isPremium?: boolean // bridging fields for backward/forward compatibility
  enabledModules?: string[]
  createdAt: any // Timestamp or ISO string
  lastLogin: any // Timestamp or ISO string
  lastActivity: any // Timestamp or ISO string
  appVersion?: string
  device?: 'mobile' | 'tablet' | 'desktop'
  browser?: string
}

export interface ActivityLog {
  id: string
  type: 'signup' | 'premium_purchase' | 'module_open' | 'clock_use' | 'app_update' | 'other'
  title: string
  description: string
  timestamp: any
  userEmail?: string
}
