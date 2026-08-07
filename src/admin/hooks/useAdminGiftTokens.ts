import { useState, useEffect, useMemo } from 'react'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '@/core/firebase/firestore'
import { GiftToken } from '../types'

export const useAdminGiftTokens = () => {
  const [rawTokens, setRawTokens] = useState<GiftToken[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filtering & Sorting State
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Redeemed'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'campaign'>('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)

  useEffect(() => {
    const tokensCol = collection(db, 'gift_tokens')
    const q = query(tokensCol, orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tokensData: GiftToken[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        tokensData.push({
          id: doc.id,
          token: data.token || doc.id,
          gift: data.gift || '',
          campaign: data.campaign || '',
          status: data.status || 'Pending',
          createdAt: data.createdAt,
          redeemedAt: data.redeemedAt || null,
          redeemedByUserId: data.redeemedByUserId || '',
          redeemedEmail: data.redeemedEmail || ''
        })
      })
      setRawTokens(tokensData)
      setLoading(false)
      setError(null)
    }, (err: any) => {
      console.error('Error fetching admin gift tokens:', err)
      setError('Permission Denied. Verify database rules and admin authorization.')
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // 1. Calculate Analytics (from all raw tokens)
  const analytics = useMemo(() => {
    const total = rawTokens.length
    const pending = rawTokens.filter(t => t.status === 'Pending').length
    const redeemed = rawTokens.filter(t => t.status === 'Redeemed').length
    const redemptionRate = total > 0 ? Math.round((redeemed / total) * 100) : 0

    return {
      total,
      pending,
      redeemed,
      redemptionRate
    }
  }, [rawTokens])

  // 2. Filter Tokens
  const filteredTokens = useMemo(() => {
    return rawTokens.filter(token => {
      // Status Filter
      if (statusFilter !== 'all' && token.status !== statusFilter) {
        return false
      }

      // Search Term Filter
      const search = searchTerm.toLowerCase().trim()
      if (search) {
        const matchesToken = token.token.toLowerCase().includes(search)
        const matchesCampaign = token.campaign.toLowerCase().includes(search)
        const matchesGift = token.gift.toLowerCase().includes(search)
        const matchesEmail = token.redeemedEmail?.toLowerCase().includes(search)
        if (!matchesToken && !matchesCampaign && !matchesGift && !matchesEmail) {
          return false
        }
      }

      return true
    })
  }, [rawTokens, statusFilter, searchTerm])

  // 3. Sort Tokens
  const sortedTokens = useMemo(() => {
    const tokens = [...filteredTokens]
    
    tokens.sort((a, b) => {
      const getTime = (val: any) => {
        if (!val) return 0
        return new Date(val).getTime()
      }

      if (sortBy === 'newest') {
        return getTime(b.createdAt) - getTime(a.createdAt)
      }
      if (sortBy === 'oldest') {
        return getTime(a.createdAt) - getTime(b.createdAt)
      }
      if (sortBy === 'campaign') {
        return a.campaign.localeCompare(b.campaign)
      }
      return 0
    })

    return tokens
  }, [filteredTokens, sortBy])

  // 4. Paginate Tokens
  const paginatedTokens = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return sortedTokens.slice(startIndex, startIndex + pageSize)
  }, [sortedTokens, currentPage, pageSize])

  const totalPages = Math.ceil(sortedTokens.length / pageSize)

  const handleResetFilters = () => {
    setStatusFilter('all')
    setSearchTerm('')
    setSortBy('newest')
    setCurrentPage(1)
  }

  return {
    tokens: paginatedTokens,
    totalCount: sortedTokens.length,
    rawCount: rawTokens.length,
    loading,
    error,
    analytics,

    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,

    onResetFilters: handleResetFilters
  }
}
export default useAdminGiftTokens
