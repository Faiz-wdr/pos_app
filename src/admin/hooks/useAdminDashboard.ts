import { useState, useEffect, useMemo } from 'react'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '@/core/firebase/firestore'
import { FirestoreUser, ActivityLog } from '../types'
import { getStatusFromLastActivity } from '../components/OnlineIndicator'
import { releaseNotes } from '@/config/releases'

declare const __APP_VERSION__: string

export const useAdminDashboard = () => {
  const [users, setUsers] = useState<FirestoreUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const usersCol = collection(db, 'users')
    const q = query(usersCol, orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData: FirestoreUser[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        usersData.push({
          uid: doc.id,
          fullName: data.fullName || null,
          email: data.email || null,
          role: data.role || 'user',
          premium: data.premium ?? data.isPremium ?? false,
          isPremium: data.premium ?? data.isPremium ?? false,
          enabledModules: data.enabledModules || [],
          createdAt: data.createdAt,
          lastLogin: data.lastLogin,
          lastActivity: data.lastActivity,
          appVersion: data.appVersion || '1.0.0',
          device: data.device || 'unknown',
          browser: data.browser || 'unknown'
        })
      })
      setUsers(usersData)
      setLoading(false)
    }, (err: any) => {
      console.error('Error fetching admin dashboard statistics:', err)
      setError(err.message || 'Permission Denied.')
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const stats = useMemo(() => {
    const total = users.length
    const guests = users.filter(u => u.role === 'guest').length
    const registered = total - guests
    const premium = users.filter(u => u.premium || u.isPremium).length
    const online = users.filter(u => getStatusFromLastActivity(u.lastActivity) === 'online').length
    
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    
    const activeToday = users.filter(u => {
      if (!u.lastActivity) return false
      const ms = u.lastActivity.toMillis ? u.lastActivity.toMillis() : new Date(u.lastActivity).getTime()
      return ms >= todayStart.getTime()
    }).length

    const newToday = users.filter(u => {
      if (!u.createdAt) return false
      const ms = u.createdAt.toMillis ? u.createdAt.toMillis() : new Date(u.createdAt).getTime()
      return ms >= todayStart.getTime()
    }).length

    const totalModulesInstalled = users.reduce((acc, u) => acc + (u.enabledModules?.length || 0), 0)
    const appVer = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0'
    const latestRelease = releaseNotes.version || 'v1.0.0'

    return {
      totalUsers: total,
      guestUsers: guests,
      registeredUsers: registered,
      premiumUsers: premium,
      onlineUsers: online,
      activeToday,
      newToday,
      modulesInstalled: totalModulesInstalled,
      appVersion: appVer,
      latestRelease
    }
  }, [users])

  const recentUsers = useMemo(() => {
    return users.slice(0, 5)
  }, [users])

  const onlineUsersList = useMemo(() => {
    return users
      .filter(u => getStatusFromLastActivity(u.lastActivity) !== 'offline')
      .sort((a, b) => {
        const getMs = (t: any) => t?.toMillis ? t.toMillis() : new Date(t).getTime()
        return getMs(b.lastActivity) - getMs(a.lastActivity)
      })
  }, [users])

  const activityLogs = useMemo((): ActivityLog[] => {
    const logs: ActivityLog[] = []

    users.forEach(user => {
      if (user.createdAt) {
        logs.push({
          id: `signup-${user.uid}`,
          type: 'signup',
          title: 'New User Registered',
          description: `${user.fullName || 'Anonymous User'} completed setup.`,
          timestamp: user.createdAt,
          userEmail: user.email || undefined
        })
      }

      if (user.premium || user.isPremium) {
        logs.push({
          id: `premium-${user.uid}`,
          type: 'premium_purchase',
          title: 'Premium Activated',
          description: `${user.fullName || 'User'} unlocked PRO entitlements.`,
          timestamp: user.lastLogin || user.createdAt,
          userEmail: user.email || undefined
        })
      }

      if (user.enabledModules && user.enabledModules.length > 0) {
        user.enabledModules.forEach(mod => {
          logs.push({
            id: `module-${mod}-${user.uid}`,
            type: 'module_open',
            title: 'Module Configured',
            description: `${user.fullName || 'User'} active module: ${mod}.`,
            timestamp: user.lastActivity || user.lastLogin,
            userEmail: user.email || undefined
          })
        })
      }
    })

    logs.sort((a, b) => {
      const getMs = (t: any) => t?.toMillis ? t.toMillis() : new Date(t).getTime()
      return getMs(b.timestamp) - getMs(a.timestamp)
    })

    if (logs.length === 0) {
      logs.push({
        id: 'placeholder-system',
        type: 'app_update',
        title: 'Platform Boot Complete',
        description: 'Super Admin foundation initialized successfully.',
        timestamp: new Date().toISOString()
      })
    }

    return logs.slice(0, 15)
  }, [users])

  return {
    stats,
    recentUsers,
    onlineUsersList,
    activityLogs,
    loading,
    error
  }
}

export default useAdminDashboard
