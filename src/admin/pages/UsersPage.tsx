import React, { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { 
  Users, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert,
  RefreshCw,
  SlidersHorizontal,
  Plus
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
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

// Firebase Imports
import { initializeApp, deleteApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/core/firebase/firestore'

const createAuthUserWithoutSigningIn = async (email: string, pass: string) => {
  const tempAppName = `temp-user-creator-${Date.now()}`
  const tempApp = initializeApp({
    apiKey: "AIzaSyD9bkARaHWCzpNQlXUZEYHDCAl29qhyVQA",
    authDomain: "personal-os-4e81b.firebaseapp.com",
    projectId: "personal-os-4e81b",
    storageBucket: "personal-os-4e81b.firebasestorage.app",
    messagingSenderId: "589567833064",
    appId: "1:589567833064:web:3351f204cf389488de2a5d",
    measurementId: "G-HS9E0ZKXGL"
  }, tempAppName)
  
  const tempAuth = getAuth(tempApp)
  try {
    const cred = await createUserWithEmailAndPassword(tempAuth, email, pass)
    return cred.user
  } finally {
    await deleteApp(tempApp)
  }
}

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

  // Add User State
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [newFullName, setNewFullName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState<'guest' | 'user' | 'super_admin'>('user')
  const [newIsPremium, setNewIsPremium] = useState(false)
  const [newEnabledModules, setNewEnabledModules] = useState<string[]>([])
  
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  const allSystemModules = ['income', 'day-planner']

  const handleToggleModuleSelection = (mod: string) => {
    if (newEnabledModules.includes(mod)) {
      setNewEnabledModules(newEnabledModules.filter(m => m !== mod))
    } else {
      setNewEnabledModules([...newEnabledModules, mod])
    }
  }

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)

    if (!newFullName.trim()) {
      setFormError('Full Name is required.')
      return
    }
    if (!newEmail.trim()) {
      setFormError('Email is required.')
      return
    }
    if (!newPassword || newPassword.length < 6) {
      setFormError('Password must be at least 6 characters.')
      return
    }

    setFormLoading(true)
    try {
      const authUser = await createAuthUserWithoutSigningIn(newEmail.trim(), newPassword)
      
      const userRef = doc(db, 'users', authUser.uid)
      await setDoc(userRef, {
        uid: authUser.uid,
        fullName: newFullName.trim(),
        email: newEmail.trim().toLowerCase(),
        role: newRole,
        isPremium: newIsPremium,
        premium: newIsPremium,
        enabledModules: newEnabledModules,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        lastActivity: serverTimestamp(),
        status: 'active',
        appVersion: '1.0.0',
        device: 'unknown',
        browser: 'unknown'
      })

      setFormSuccess('User profile successfully created!')
      setNewFullName('')
      setNewEmail('')
      setNewPassword('')
      setNewRole('user')
      setNewIsPremium(false)
      setNewEnabledModules([])

      setTimeout(() => {
        setAddUserOpen(false)
        setFormSuccess(null)
      }, 1500)
    } catch (err: any) {
      console.error('Error creating user profile:', err)
      setFormError(err.message || 'Error occurred during user creation.')
    } finally {
      setFormLoading(false)
    }
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

  const handleActionComplete = () => {
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
              onClick={() => setAddUserOpen(true)}
              icon={Plus}
              variant="primary"
              className="rounded-xl h-9"
            >
              Add User
            </ActionButton>
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

      {/* Add User Dialog */}
      <Dialog
        isOpen={addUserOpen}
        onClose={() => {
          if (!formLoading) setAddUserOpen(false)
        }}
        title="Add User Account"
      >
        <form onSubmit={handleAddUserSubmit} className="space-y-4 pt-2 text-left">
          {formError && (
            <div className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-semibold leading-relaxed">
              {formError}
            </div>
          )}
          {formSuccess && (
            <div className="p-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-xs font-semibold leading-relaxed">
              {formSuccess}
            </div>
          )}

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block px-1">Full Name</label>
              <Input
                type="text"
                required
                disabled={formLoading}
                placeholder="John Doe"
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                className="h-10 text-xs bg-neutral-950 border-neutral-800 focus-visible:ring-1 focus-visible:ring-accent rounded-xl text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block px-1">Email Address</label>
              <Input
                type="email"
                required
                disabled={formLoading}
                placeholder="john@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="h-10 text-xs bg-neutral-950 border-neutral-800 focus-visible:ring-1 focus-visible:ring-accent rounded-xl text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block px-1">Password</label>
              <Input
                type="password"
                required
                disabled={formLoading}
                placeholder="••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-10 text-xs bg-neutral-950 border-neutral-800 focus-visible:ring-1 focus-visible:ring-accent rounded-xl text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block px-1">User Role</label>
              <select
                disabled={formLoading}
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="w-full h-10 px-3 bg-muted/65 border border-border/60 rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
              >
                <option value="guest">Guest</option>
                <option value="user">User</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block px-1">Account Plan</label>
              <select
                disabled={formLoading}
                value={newIsPremium ? 'pro' : 'basic'}
                onChange={(e) => setNewIsPremium(e.target.value === 'pro')}
                className="w-full h-10 px-3 bg-muted/65 border border-border/60 rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
              >
                <option value="basic">Basic (Free)</option>
                <option value="pro">Pro (Premium)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block px-1">Enabled Modules Access</label>
              <div className="grid grid-cols-2 gap-2 bg-muted/20 p-2 border border-border/40 rounded-xl">
                {allSystemModules.map((mod) => {
                  const isChecked = newEnabledModules.includes(mod)
                  return (
                    <label key={mod} className="flex items-center space-x-2 p-1.5 cursor-pointer text-xs font-semibold">
                      <input
                        type="checkbox"
                        disabled={formLoading}
                        checked={isChecked}
                        onChange={() => handleToggleModuleSelection(mod)}
                        className="rounded border-neutral-800 text-accent focus:ring-accent bg-neutral-950"
                      />
                      <span className="capitalize">{mod}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-2">
            <Button
              type="submit"
              disabled={formLoading}
              className="flex-1 text-xs font-bold uppercase tracking-wider h-10 rounded-xl cursor-pointer"
            >
              {formLoading ? 'Creating User...' : 'Add Account'}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={formLoading}
              onClick={() => setAddUserOpen(false)}
              className="flex-1 text-xs font-bold uppercase tracking-wider h-10 rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Dialog>

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
