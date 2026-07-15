import React, { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { 
  Users, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react'
import { useAdminUsers } from '../hooks/useAdminUsers'
import { PageContainer } from '../components/PageContainer'
import { SectionTitle } from '../components/SectionTitle'
import { EmptyState } from '../components/EmptyState'
import { ActionButton } from '../components/ActionButton'
import { SearchBar } from '../components/SearchBar'
import { FilterBar } from '../components/FilterBar'
import { UserTable } from '../components/UserTable'
import { UserCard } from '../components/UserCard'
import { UserDrawer } from '../components/UserDrawer'
import { FirestoreUser } from '../types'

export const UsersPage: React.FC = () => {
  const {
    users,
    totalCount,
    rawCount,
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
    onResetFilters
  } = useAdminUsers()

  const [selectedUser, setSelectedUser] = useState<FirestoreUser | null>(null)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

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

  // Handle selected user profile updates
  const handleActionComplete = () => {
    // If the drawer is currently viewing a user, update their local selection details
    if (selectedUser) {
      const updated = users.find(u => u.uid === selectedUser.uid)
      if (updated) {
        setSelectedUser(updated)
      }
    }
  }

  const paginationStart = (currentPage - 1) * pageSize + 1
  const paginationEnd = Math.min(currentPage * pageSize, totalCount)

  return (
    <PageContainer>
      <SectionTitle
        title={`Users (${rawCount})`}
        subtitle="Manage member profiles, configure application access permissions, and revoke entitlements."
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
            placeholder="Search users by name, email, or UID..."
            className="max-w-none md:max-w-md flex-1"
          />
        </div>

        {/* Filter Bar (Desktop default, mobile collapsible) */}
        <div className={`${showMobileFilters ? 'block' : 'hidden md:block'}`}>
          <FilterBar
            roleFilter={roleFilter}
            setRoleFilter={(val) => { setRoleFilter(val); setCurrentPage(1); }}
            premiumFilter={premiumFilter}
            setPremiumFilter={(val) => { setPremiumFilter(val); setCurrentPage(1); }}
            statusFilter={statusFilter}
            setStatusFilter={(val) => { setStatusFilter(val); setCurrentPage(1); }}
            sortBy={sortBy}
            setSortBy={setSortBy}
            pageSize={pageSize}
            setPageSize={(val) => { setPageSize(val); setCurrentPage(1); }}
            onReset={onResetFilters}
          />
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
            title={searchTerm || roleFilter !== 'all' || premiumFilter !== 'all' || statusFilter !== 'all' ? "No Matches Found" : "No Registered Users"}
            description="Adjust your search criteria or reset filters to see user accounts."
            icon={Users}
            action={
              <ActionButton onClick={onResetFilters} icon={RotateCcw} variant="outline" className="rounded-xl">
                Clear Filters
              </ActionButton>
            }
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Desktop & Tablet Table Layout */}
          <div className="hidden sm:block">
            <UserTable 
              users={users} 
              onSelectUser={setSelectedUser} 
            />
          </div>

          {/* Mobile Card Grid Layout */}
          <div className="grid grid-cols-1 gap-3.5 sm:hidden">
            {users.map((user) => (
              <UserCard
                key={user.uid}
                user={user}
                onClick={() => setSelectedUser(user)}
              />
            ))}
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border/60 pt-4 px-2 select-none">
              <span className="text-[10px] text-muted-foreground">
                Showing <strong className="text-foreground">{paginationStart}</strong> to{' '}
                <strong className="text-foreground">{paginationEnd}</strong> of{' '}
                <strong className="text-foreground">{totalCount}</strong> users
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

      {/* User Details Sliding Drawer */}
      <AnimatePresence>
        {selectedUser && (
          <UserDrawer
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            onActionComplete={handleActionComplete}
          />
        )}
      </AnimatePresence>
    </PageContainer>
  )
}

export default UsersPage
