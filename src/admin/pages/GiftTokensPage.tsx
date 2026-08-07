import React, { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { 
  Gift, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert,
  RefreshCw,
  CheckCircle,
  Clock,
  Percent,
  SlidersHorizontal
} from 'lucide-react'
import { useAdminGiftTokens } from '../hooks/useAdminGiftTokens'
import { PageContainer } from '../components/PageContainer'
import { SectionTitle } from '../components/SectionTitle'
import { EmptyState } from '../components/EmptyState'
import { ActionButton } from '../components/ActionButton'
import { SearchBar } from '../components/SearchBar'
import { GiftTokenDrawer } from '../components/GiftTokenDrawer'
import { GiftToken } from '../types'
import { Card, CardContent } from '@/components/ui/Card'

export const GiftTokensPage: React.FC = () => {
  const {
    tokens,
    totalCount,
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
    onResetFilters
  } = useAdminGiftTokens()

  const [selectedToken, setSelectedToken] = useState<GiftToken | null>(null)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const formatDate = (dateStr: any) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (error) {
    return (
      <PageContainer className="justify-center items-center h-[70vh]">
        <div className="text-center space-y-4 max-w-sm">
          <div className="p-4 bg-red-500/10 text-red-500 rounded-full border border-red-500/20 inline-block">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-sm font-bold text-foreground">Database Error</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">{error}</p>
          <ActionButton
            onClick={() => window.location.reload()}
            icon={RefreshCw}
            className="mx-auto rounded-xl"
          >
            Retry Query
          </ActionButton>
        </div>
      </PageContainer>
    )
  }

  const paginationStart = (currentPage - 1) * pageSize + 1
  const paginationEnd = Math.min(currentPage * pageSize, totalCount)

  return (
    <PageContainer>
      <SectionTitle
        title="Gift Tokens"
        subtitle="Issue lifetime Pro memberships to users, monitor redemption rates, and manage promotional campaigns."
        actions={
          <div className="flex space-x-2.5">
            <ActionButton
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              icon={SlidersHorizontal}
              variant="outline"
              className="md:hidden rounded-xl h-9"
            >
              Filters
            </ActionButton>
            <ActionButton
              onClick={onResetFilters}
              icon={RotateCcw}
              variant="outline"
              className="rounded-xl h-9 hidden sm:flex"
            >
              Reset
            </ActionButton>
          </div>
        }
      />

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tokens */}
        <Card className="bg-card/45 border-border/50 rounded-2xl overflow-hidden shadow-xs relative">
          <CardContent className="p-5 flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/15 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Total Tokens</span>
              <span className="text-xl font-black text-foreground mt-0.5 block">{analytics.total}</span>
            </div>
          </CardContent>
        </Card>

        {/* Pending Tokens */}
        <Card className="bg-card/45 border-border/50 rounded-2xl overflow-hidden shadow-xs relative">
          <CardContent className="p-5 flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/15 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Pending</span>
              <span className="text-xl font-black text-foreground mt-0.5 block">{analytics.pending}</span>
            </div>
          </CardContent>
        </Card>

        {/* Redeemed Tokens */}
        <Card className="bg-card/45 border-border/50 rounded-2xl overflow-hidden shadow-xs relative">
          <CardContent className="p-5 flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/15 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Redeemed</span>
              <span className="text-xl font-black text-foreground mt-0.5 block">{analytics.redeemed}</span>
            </div>
          </CardContent>
        </Card>

        {/* Redemption Rate */}
        <Card className="bg-card/45 border-border/50 rounded-2xl overflow-hidden shadow-xs relative">
          <CardContent className="p-5 flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/15 flex items-center justify-center shrink-0">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Redeem Rate</span>
              <span className="text-xl font-black text-foreground mt-0.5 block">{analytics.redemptionRate}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar Section */}
      <div className="space-y-4">
        {/* Search */}
        <div className="flex items-center space-x-3.5">
          <SearchBar 
            value={searchTerm} 
            onChange={(val) => {
              setSearchTerm(val)
              setCurrentPage(1)
            }} 
            placeholder="Search tokens by code, campaign, gift, or email..."
            className="max-w-none md:max-w-md flex-1"
          />
        </div>

        {/* Filter Bar */}
        <div className={`${showMobileFilters ? 'block' : 'hidden md:block'}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-card/30 border border-border/40 rounded-2xl select-none">
            {/* Status Filter Buttons */}
            <div className="flex items-center space-x-2">
              <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider px-1">Status:</span>
              {(['all', 'Pending', 'Redeemed'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setStatusFilter(filter)
                    setCurrentPage(1)
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    statusFilter === filter
                      ? 'bg-accent text-accent-foreground shadow-xs'
                      : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Sort & PageSize */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Sort dropdown */}
              <div className="flex items-center space-x-2">
                <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider select-none">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="h-8 px-2.5 bg-muted/65 border border-border/60 rounded-lg text-[10px] font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="campaign">Campaign A-Z</option>
                </select>
              </div>

              {/* PageSize dropdown */}
              <div className="flex items-center space-x-2">
                <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider select-none">Size:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="h-8 px-2.5 bg-muted/65 border border-border/60 rounded-lg text-[10px] font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                >
                  <option value="15">15 rows</option>
                  <option value="30">30 rows</option>
                  <option value="50">50 rows</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table or Grid Viewport */}
      {loading ? (
        <div className="space-y-4 pt-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 bg-muted/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : totalCount === 0 ? (
        <div className="py-16">
          <EmptyState
            title={searchTerm || statusFilter !== 'all' ? "No Matches Found" : "No Gift Tokens Created"}
            description="Adjust your filters or generate new gift tokens from your portfolio website."
            icon={Gift}
            action={
              <ActionButton onClick={onResetFilters} icon={RotateCcw} variant="outline" className="rounded-xl">
                Clear Filters
              </ActionButton>
            }
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tokens Table (Desktop/Tablet) */}
          <div className="hidden sm:block overflow-hidden border border-border/40 bg-card/20 rounded-2xl">
            <table className="w-full text-left border-collapse select-none">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-[10px] font-black uppercase text-muted-foreground tracking-wider h-11">
                  <th className="px-5 font-bold">Token</th>
                  <th className="px-4 font-bold">Gift</th>
                  <th className="px-4 font-bold">Campaign</th>
                  <th className="px-4 font-bold">Status</th>
                  <th className="px-4 font-bold">Redeemed By</th>
                  <th className="px-4 font-bold">Created Date</th>
                  <th className="px-5 font-bold text-right">Redeemed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 text-xs font-semibold text-foreground">
                {tokens.map((token) => (
                  <tr
                    key={token.id}
                    onClick={() => setSelectedToken(token)}
                    className="hover:bg-muted/40 cursor-pointer active:bg-muted/60 transition-colors h-14"
                  >
                    <td className="px-5 font-mono text-[11px] font-bold text-accent truncate max-w-[120px]">
                      {token.token}
                    </td>
                    <td className="px-4 capitalize truncate max-w-[100px]">{token.gift}</td>
                    <td className="px-4 truncate max-w-[100px]">{token.campaign}</td>
                    <td className="px-4">
                      <span className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        token.status === 'Redeemed' 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/5' 
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/5'
                      }`}>
                        {token.status}
                      </span>
                    </td>
                    <td className="px-4 truncate max-w-[140px] text-muted-foreground">
                      {token.redeemedEmail || '-'}
                    </td>
                    <td className="px-4 text-muted-foreground">{formatDate(token.createdAt)}</td>
                    <td className="px-5 text-right text-muted-foreground">{formatDate(token.redeemedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tokens Cards (Mobile) */}
          <div className="grid grid-cols-1 gap-3.5 sm:hidden">
            {tokens.map((token) => (
              <Card
                key={token.id}
                onClick={() => setSelectedToken(token)}
                className="bg-card border-border/50 rounded-2xl hover:border-accent active:scale-[0.98] transition-all cursor-pointer shadow-xs select-none"
              >
                <CardContent className="p-4 space-y-3.5 text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-accent font-black truncate max-w-[160px]">
                      {token.token}
                    </span>
                    <span className={`inline-block text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${
                      token.status === 'Redeemed' 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/5' 
                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/5'
                    }`}>
                      {token.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-border/40 pt-2.5">
                    <div>
                      <span className="text-muted-foreground uppercase font-bold block">Gift</span>
                      <span className="text-foreground font-black capitalize mt-0.5 block">{token.gift}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground uppercase font-bold block">Campaign</span>
                      <span className="text-foreground font-black mt-0.5 block">{token.campaign}</span>
                    </div>
                  </div>

                  {token.status === 'Redeemed' && (
                    <div className="bg-muted/15 p-2 rounded-xl border border-border/20 text-[10px] space-y-0.5">
                      <span className="text-muted-foreground uppercase font-bold block">Claimed By:</span>
                      <span className="text-foreground truncate block font-bold">{token.redeemedEmail}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border/60 pt-4 px-2 select-none">
              <span className="text-[10px] text-muted-foreground">
                Showing <strong className="text-foreground">{paginationStart}</strong> to{' '}
                <strong className="text-foreground">{paginationEnd}</strong> of{' '}
                <strong className="text-foreground">{totalCount}</strong> tokens
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-border/50 bg-card hover:bg-muted text-muted-foreground disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <span className="text-[10px] font-bold text-foreground bg-muted px-2.5 py-1 rounded-lg">
                  {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-border/50 bg-card hover:bg-muted text-muted-foreground disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gift Token Details sliding panel drawer */}
      <AnimatePresence>
        {selectedToken && (
          <GiftTokenDrawer
            token={selectedToken}
            onClose={() => setSelectedToken(null)}
          />
        )}
      </AnimatePresence>
    </PageContainer>
  )
}

export default GiftTokensPage
