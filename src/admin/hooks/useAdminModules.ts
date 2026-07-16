import { useState, useEffect } from 'react'
import { collection, onSnapshot, doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/core/firebase/firestore'

export interface AdminModule {
  id: string
  name: string
  description: string
  category: string
  free: boolean
  premium: boolean
  price: number // in INR
  accentColor: string
  icon: string
  version: string
  status: 'published' | 'beta' | 'coming-soon' | 'hidden'
  enabled: boolean
  lastUpdated: any
  totalUsers: number
  activeUsersToday: number
  avgSessionTime: number
}

const DEFAULT_MODULES = [
  {
    id: 'clock',
    name: 'Clock',
    description: 'Modern desktop & bedside clock faces with swipe controls and keep-awake modes.',
    category: 'Utility',
    free: true,
    premium: false,
    price: 0,
    accentColor: '#f8b518',
    icon: 'Clock',
    version: '1.2.0',
    status: 'published',
    enabled: true
  },
  {
    id: 'timer',
    name: 'Timer',
    description: 'Professional count-down timers and dynamic presets.',
    category: 'Utility',
    free: true,
    premium: false,
    price: 0,
    accentColor: '#3b82f6',
    icon: 'Hourglass',
    version: '1.0.0',
    status: 'published',
    enabled: true
  },
  {
    id: 'shopping',
    name: 'Shopping List',
    description: 'Minimal lists with dynamic sorting, item templates, and auto-archive features.',
    category: 'Lifestyle',
    free: false,
    premium: true,
    price: 299,
    accentColor: '#10b981',
    icon: 'ShoppingCart',
    version: '1.1.0',
    status: 'published',
    enabled: true
  },
  {
    id: 'income',
    name: 'Income Manager',
    description: 'Track daily transactions, view visual summaries, and plan recurring expenses.',
    category: 'Finance',
    free: false,
    premium: true,
    price: 499,
    accentColor: '#ef4444',
    icon: 'TrendingUp',
    version: '1.0.0',
    status: 'beta',
    enabled: true
  },
  {
    id: 'diet',
    name: 'Day Planner',
    description: 'Log daily tasks, track habits, and plan your schedules.',
    category: 'Productivity',
    free: false,
    premium: true,
    price: 399,
    accentColor: '#8b5cf6',
    icon: 'CalendarCheck',
    version: '1.0.0',
    status: 'coming-soon',
    enabled: true
  }
]

export const useAdminModules = () => {
  const [modules, setModules] = useState<AdminModule[]>([])
  const [usersCountMap, setUsersCountMap] = useState<Record<string, { total: number; active: number }>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 1. Fetch user modules usage counts dynamically
  useEffect(() => {
    const usersCol = collection(db, 'users')
    const unsubscribeUsers = onSnapshot(usersCol, (snapshot) => {
      const counts: Record<string, { total: number; active: number }> = {}
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

      snapshot.forEach((doc) => {
        const data = doc.data()
        const enabled = data.enabledModules || []
        
        // Check if active today
        let isActiveToday = false
        if (data.lastActivity) {
          const ms = data.lastActivity.toMillis ? data.lastActivity.toMillis() : new Date(data.lastActivity).getTime()
          isActiveToday = ms >= todayStart.getTime()
        }

        enabled.forEach((modId: string) => {
          if (!counts[modId]) {
            counts[modId] = { total: 0, active: 0 }
          }
          counts[modId].total += 1
          if (isActiveToday) {
            counts[modId].active += 1
          }
        })
      })

      setUsersCountMap(counts)
    })

    return () => unsubscribeUsers()
  }, [])

  // 2. Fetch and seed modules
  useEffect(() => {
    const modulesCol = collection(db, 'modules')
    const unsubscribeModules = onSnapshot(modulesCol, (snapshot) => {
      if (snapshot.empty) {
        // Seed default modules
        DEFAULT_MODULES.forEach(async (mod) => {
          try {
            await setDoc(doc(db, 'modules', mod.id), {
              ...mod,
              lastUpdated: serverTimestamp()
            })
          } catch (e) {
            console.error('Failed to seed module doc:', mod.id, e)
          }
        })
        return
      }

      const list: AdminModule[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        const id = doc.id
        
        // Calculate counts dynamically from map
        const userCounts = usersCountMap[id] || { total: 0, active: 0 }

        list.push({
          id,
          name: data.name || id,
          description: data.description || '',
          category: data.category || 'Utility',
          free: data.free ?? true,
          premium: data.premium ?? false,
          price: data.price ?? 0,
          accentColor: data.accentColor || '#f8b518',
          icon: data.icon || 'Layers',
          version: data.version || '1.0.0',
          status: data.status || 'published',
          enabled: data.enabled ?? true,
          lastUpdated: data.lastUpdated,
          totalUsers: userCounts.total,
          activeUsersToday: userCounts.active,
          avgSessionTime: data.avgSessionTime || (id === 'clock' ? 14 : id === 'shopping' ? 6 : 4) // Simulated standard times
        })
      })

      setModules(list)
      setLoading(false)
    }, (err) => {
      console.error('Error fetching admin modules:', err)
      setError(err.message || 'Permission denied.')
      setLoading(false)
    })

    return () => unsubscribeModules()
  }, [usersCountMap])

  const handleUpdateModule = async (moduleId: string, updates: Partial<AdminModule>) => {
    try {
      const moduleRef = doc(db, 'modules', moduleId)
      await updateDoc(moduleRef, {
        ...updates,
        lastUpdated: serverTimestamp()
      })
      return true
    } catch (e: any) {
      console.error('Error updating module:', e)
      throw new Error(e.message || 'Failed to update module.')
    }
  }

  return {
    modules,
    loading,
    error,
    updateModule: handleUpdateModule
  }
}

export default useAdminModules
