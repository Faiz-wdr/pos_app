import { useState, useEffect, useMemo } from 'react'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '@/core/firebase/firestore'
import { FirestoreUser } from '../types'
import { getStatusFromLastActivity } from '../components/OnlineIndicator'

export const useAdminUsers = () => {
  const [rawUsers, setRawUsers] = useState<FirestoreUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter/Sort States
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [premiumFilter, setPremiumFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [pageSize, setPageSize] = useState(25)
  const [currentPage, setCurrentPage] = useState(1)

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
      setRawUsers(usersData)
      setLoading(false)
      setError(null)
    }, (err: any) => {
      console.error('Error fetching admin users:', err)
      setError('Permission Denied. Verify database rules and super admin credentials.')
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const filteredUsers = useMemo(() => {
    return rawUsers.filter(user => {
      const search = searchTerm.toLowerCase().trim()
      if (search) {
        const matchesName = user.fullName?.toLowerCase().includes(search)
        const matchesEmail = user.email?.toLowerCase().includes(search)
        const matchesUid = user.uid.toLowerCase().includes(search)
        if (!matchesName && !matchesEmail && !matchesUid) return false
      }

      if (roleFilter !== 'all' && user.role !== roleFilter) return false

      const isPremium = !!(user.premium || user.isPremium)
      if (premiumFilter === 'premium' && !isPremium) return false
      if (premiumFilter === 'free' && isPremium) return false

      const status = getStatusFromLastActivity(user.lastActivity)
      if (statusFilter === 'online' && status !== 'online') return false
      if (statusFilter === 'away' && status !== 'away') return false
      if (statusFilter === 'offline' && status !== 'offline') return false

      return true
    })
  }, [rawUsers, searchTerm, roleFilter, premiumFilter, statusFilter])

  const sortedUsers = useMemo(() => {
    const users = [...filteredUsers]
    
    users.sort((a, b) => {
      const getTime = (val: any) => {
        if (!val) return 0
        if (typeof val.toMillis === 'function') return val.toMillis()
        return new Date(val).getTime()
      }

      if (sortBy === 'newest') {
        return getTime(b.createdAt) - getTime(a.createdAt)
      }
      if (sortBy === 'oldest') {
        return getTime(a.createdAt) - getTime(b.createdAt)
      }
      if (sortBy === 'most_active') {
        return getTime(b.lastActivity) - getTime(a.lastActivity)
      }
      if (sortBy === 'alphabetical') {
        const nameA = a.fullName || ''
        const nameB = b.fullName || ''
        return nameA.localeCompare(nameB)
      }
      if (sortBy === 'premium_first') {
        const premiumA = a.premium || a.isPremium ? 1 : 0
        const premiumB = b.premium || b.isPremium ? 1 : 0
        return premiumB - premiumA
      }
      return 0
    })

    return users
  }, [filteredUsers, sortBy])

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return sortedUsers.slice(startIndex, startIndex + pageSize)
  }, [sortedUsers, currentPage, pageSize])

  const totalPages = Math.ceil(sortedUsers.length / pageSize)

  const handleResetFilters = () => {
    setSearchTerm('')
    setRoleFilter('all')
    setPremiumFilter('all')
    setStatusFilter('all')
    setSortBy('newest')
    setPageSize(25)
    setCurrentPage(1)
  }

  return {
    users: paginatedUsers,
    totalCount: sortedUsers.length,
    rawCount: rawUsers.length,
    loading,
    error,
    
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    premiumFilter,
    setPremiumFilter,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    totalPages,
    
    onResetFilters: handleResetFilters
  }
}

export default useAdminUsers
