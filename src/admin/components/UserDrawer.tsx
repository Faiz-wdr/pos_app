import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FirestoreUser } from '../types'
import { PremiumBadge } from './PremiumBadge'
import { StatusBadge } from './StatusBadge'
import { ActionButton } from './ActionButton'
import { doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/core/firebase/firestore'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/core/firebase/auth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { 
  X, 
  User, 
  Cpu, 
  Cloud, 
  Key, 
  Trash2, 
  Sparkles,
  Monitor,
  Pencil,
  Ban,
  ShieldCheck
} from 'lucide-react'

interface UserDrawerProps {
  user: FirestoreUser | null
  onClose: () => void
  onActionComplete: () => void
}

export const UserDrawer: React.FC<UserDrawerProps> = ({
  user,
  onClose,
  onActionComplete
}) => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Edit form states
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editRole, setEditRole] = useState<'guest' | 'user' | 'super_admin'>('user')
  const [editIsPremium, setEditIsPremium] = useState(false)
  const [editStatus, setEditStatus] = useState<'active' | 'suspended'>('active')

  // Safe delete verification state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  if (!user) return null

  const isPremiumUser = !!(user.premium || user.isPremium)
  const allSystemModules = ['income', 'day-planner']

  const handleStartEditing = () => {
    setEditName(user.fullName || '')
    setEditEmail(user.email || '')
    setEditRole(user.role || 'user')
    setEditIsPremium(isPremiumUser)
    setEditStatus(user.status || 'active')
    setIsEditing(true)
    setSuccessMsg(null)
    setErrorMsg(null)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editName.trim()) {
      setErrorMsg('Full Name is required.')
      return
    }
    if (!editEmail.trim()) {
      setErrorMsg('Email address is required.')
      return
    }

    setLoadingAction('save-edit')
    try {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        fullName: editName.trim(),
        email: editEmail.trim(),
        role: editRole,
        isPremium: editIsPremium,
        premium: editIsPremium,
        status: editStatus
      })
      setSuccessMsg('User profile updated successfully')
      setIsEditing(false)
      onActionComplete()
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to update profile.')
    } finally {
      setLoadingAction(null)
    }
  }

  const handleTogglePremium = async () => {
    setLoadingAction('premium')
    try {
      const userRef = doc(db, 'users', user.uid)
      const targetState = !isPremiumUser
      await updateDoc(userRef, { 
        premium: targetState,
        isPremium: targetState 
      })
      setSuccessMsg(targetState ? 'Premium granted successfully' : 'Premium removed successfully')
      onActionComplete()
    } catch (e: any) {
      setErrorMsg(e.message)
    } finally {
      setLoadingAction(null)
    }
  }

  const handleToggleModule = async (moduleId: string) => {
    setLoadingAction(`module-${moduleId}`)
    try {
      const userRef = doc(db, 'users', user.uid)
      const currentModules = user.enabledModules || []
      const nextModules = currentModules.includes(moduleId)
        ? currentModules.filter(m => m !== moduleId)
        : [...currentModules, moduleId]
      await updateDoc(userRef, { enabledModules: nextModules })
      setSuccessMsg(`Module configuration updated`)
      onActionComplete()
    } catch (e: any) {
      setErrorMsg(e.message)
    } finally {
      setLoadingAction(null)
    }
  }

  const handleGrantAllModules = async () => {
    setLoadingAction('all-modules')
    try {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, { enabledModules: allSystemModules })
      setSuccessMsg('All modules granted successfully')
      onActionComplete()
    } catch (e: any) {
      setErrorMsg(e.message)
    } finally {
      setLoadingAction(null)
    }
  }

  const handleRevokeAllModules = async () => {
    setLoadingAction('all-modules')
    try {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, { enabledModules: [] })
      setSuccessMsg('All modules revoked successfully')
      onActionComplete()
    } catch (e: any) {
      setErrorMsg(e.message)
    } finally {
      setLoadingAction(null)
    }
  }

  const handleToggleSuspension = async () => {
    setLoadingAction('suspend')
    try {
      const userRef = doc(db, 'users', user.uid)
      const targetState = user.status === 'suspended' ? 'active' : 'suspended'
      await updateDoc(userRef, { status: targetState })
      setSuccessMsg(targetState === 'suspended' ? 'User suspended successfully' : 'User reactivated successfully')
      onActionComplete()
    } catch (e: any) {
      setErrorMsg(e.message)
    } finally {
      setLoadingAction(null)
    }
  }

  const handleResetPassword = async () => {
    if (!user.email) return
    setLoadingAction('password')
    try {
      await sendPasswordResetEmail(auth, user.email)
      setSuccessMsg(`Password reset link dispatched to ${user.email}`)
    } catch (e: any) {
      setErrorMsg(e.message)
    } finally {
      setLoadingAction(null)
    }
  }

  const handleDeleteProfile = async () => {
    if (deleteConfirmText.trim() !== user.email) {
      setErrorMsg('User email mismatch. Deletion cancelled.')
      return
    }

    setLoadingAction('delete')
    try {
      const userRef = doc(db, 'users', user.uid)
      await deleteDoc(userRef)
      setSuccessMsg('User profile successfully deleted.')
      onActionComplete()
      onClose()
    } catch (e: any) {
      setErrorMsg(e.message)
    } finally {
      setLoadingAction(null)
    }
  }

  const formatDate = (date: any) => {
    if (!date) return 'N/A'
    if (typeof date.toDate === 'function') return date.toDate().toLocaleString()
    return new Date(date).toLocaleString()
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black z-50 cursor-pointer"
      />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="fixed top-0 right-0 h-screen w-full sm:max-w-md bg-card border-l border-border z-50 flex flex-col shadow-2xl select-none text-left"
      >
        <div className="h-16 border-b border-border/60 flex items-center justify-between px-6 shrink-0 bg-muted/20">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-bold text-foreground">User Profile Overview</h3>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing && (
              <button
                onClick={handleStartEditing}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40 cursor-pointer flex items-center space-x-1 text-xs font-bold"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {successMsg && (
            <div className="p-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-[11px] leading-relaxed flex justify-between items-start">
              <span>{successMsg}</span>
              <button onClick={() => setSuccessMsg(null)} className="text-[10px] font-bold opacity-60 hover:opacity-100 ml-2">Dismiss</button>
            </div>
          )}
          {errorMsg && (
            <div className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-[11px] leading-relaxed flex justify-between items-start">
              <span>{errorMsg}</span>
              <button onClick={() => setErrorMsg(null)} className="text-[10px] font-bold opacity-60 hover:opacity-100 ml-2">Dismiss</button>
            </div>
          )}

          {/* User Profile Header Card */}
          <div className="flex items-center space-x-4 bg-muted/30 border border-border/40 p-4 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-muted border border-border/60 flex items-center justify-center text-muted-foreground shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <h4 className="text-sm font-bold text-foreground truncate">{user.fullName || 'Anonymous'}</h4>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              <div className="flex items-center space-x-1.5 pt-0.5">
                <StatusBadge lastActivity={user.lastActivity} status={user.status} />
                <PremiumBadge premium={isPremiumUser} />
              </div>
            </div>
          </div>

          {isEditing ? (
            /* Inline editing form */
            <form onSubmit={handleSaveEdit} className="space-y-4 animate-in fade-in duration-200">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1">
                Edit User details
              </h4>

              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block px-1">Full Name</label>
                  <Input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-10 text-xs bg-neutral-950 border-neutral-800 focus-visible:ring-1 focus-visible:ring-accent rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block px-1">Email Address</label>
                  <Input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="h-10 text-xs bg-neutral-950 border-neutral-800 focus-visible:ring-1 focus-visible:ring-accent rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block px-1">User Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as any)}
                    className="w-full h-10 px-3 bg-muted/65 border border-border/60 rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                  >
                    <option value="guest">Guest</option>
                    <option value="user">User</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block px-1">Account Plan</label>
                  <select
                    value={editIsPremium ? 'pro' : 'basic'}
                    onChange={(e) => setEditIsPremium(e.target.value === 'pro')}
                    className="w-full h-10 px-3 bg-muted/65 border border-border/60 rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                  >
                    <option value="basic">Basic Plan (Free)</option>
                    <option value="pro">Pro Plan (Premium)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block px-1">Account Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full h-10 px-3 bg-muted/65 border border-border/60 rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <Button
                  type="submit"
                  disabled={loadingAction === 'save-edit'}
                  className="flex-1 text-xs font-bold uppercase tracking-wider h-10 rounded-xl cursor-pointer"
                >
                  {loadingAction === 'save-edit' ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 text-xs font-bold uppercase tracking-wider h-10 rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            /* Details view */
            <>
              {/* Metadata Group */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1">
                  Profile Metadata
                </h4>
                
                <div className="grid grid-cols-1 gap-2.5 text-xs">
                  <div className="flex justify-between items-center bg-muted/15 p-2 rounded-lg border border-border/20">
                    <span className="text-muted-foreground">User UID</span>
                    <span className="font-mono text-[10px] text-foreground select-all">{user.uid}</span>
                  </div>
                  <div className="flex justify-between items-center bg-muted/15 p-2 rounded-lg border border-border/20">
                    <span className="text-muted-foreground">App Role</span>
                    <span className="font-bold text-foreground capitalize">{user.role}</span>
                  </div>
                  <div className="flex justify-between items-center bg-muted/15 p-2 rounded-lg border border-border/20">
                    <span className="text-muted-foreground">Account Status</span>
                    <span className={`font-bold uppercase text-[10px] ${user.status === 'suspended' ? 'text-red-500' : 'text-emerald-500'}`}>
                      {user.status || 'active'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-muted/15 p-2 rounded-lg border border-border/20">
                    <span className="text-muted-foreground">Created Date</span>
                    <span className="text-foreground">{formatDate(user.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-muted/15 p-2 rounded-lg border border-border/20">
                    <span className="text-muted-foreground">Last Login</span>
                    <span className="text-foreground">{formatDate(user.lastLogin)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-muted/15 p-2 rounded-lg border border-border/20">
                    <span className="text-muted-foreground">Last Active</span>
                    <span className="text-foreground">{formatDate(user.lastActivity)}</span>
                  </div>
                </div>
              </div>

              {/* Platform diagnostics */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1">
                  Platform Diagnostics
                </h4>
                <div className="grid grid-cols-1 gap-2.5 text-xs">
                  <div className="flex justify-between items-center bg-muted/15 p-2 rounded-lg border border-border/20">
                    <span className="text-muted-foreground flex items-center space-x-1.5">
                      <Monitor className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span>Device & Browser</span>
                    </span>
                    <span className="text-foreground font-semibold capitalize">
                      {user.device || 'unknown'} • {user.browser || 'unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-muted/15 p-2 rounded-lg border border-border/20">
                    <span className="text-muted-foreground flex items-center space-x-1.5">
                      <Cpu className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span>Client Code Version</span>
                    </span>
                    <span className="text-foreground font-semibold">
                      v{user.appVersion || '1.0.0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-muted/15 p-2 rounded-lg border border-border/20">
                    <span className="text-muted-foreground flex items-center space-x-1.5">
                      <Cloud className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span>Cloud Sync Connection</span>
                    </span>
                    <span className="text-emerald-500 font-bold flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Connected</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Enabled modules */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between border-b border-border/40 pb-1">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Module Access Toggles
                  </h4>
                  <div className="flex space-x-2 text-[9px] font-bold uppercase text-accent shrink-0">
                    <button onClick={handleGrantAllModules} className="hover:underline cursor-pointer">Grant All</button>
                    <span>•</span>
                    <button onClick={handleRevokeAllModules} className="hover:underline text-red-500 cursor-pointer">Revoke All</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {allSystemModules.map((mod) => {
                    const isEnabled = user.enabledModules?.includes(mod)
                    const isLoading = loadingAction === `module-${mod}`
                    return (
                      <button
                        key={mod}
                        disabled={isLoading}
                        onClick={() => handleToggleModule(mod)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col space-y-1 active:scale-[0.98] ${
                          isEnabled
                            ? 'bg-accent/10 border-accent/30 hover:bg-accent/15'
                            : 'bg-muted/10 border-border hover:bg-muted/20'
                        }`}
                      >
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isEnabled ? 'text-accent font-extrabold' : 'text-foreground'}`}>
                          {mod}
                        </span>
                        <span className="text-[8px] text-muted-foreground">
                          {isEnabled ? 'Access Granted' : 'Access Disabled'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Entitlements & Support */}
              <div className="space-y-3.5 pt-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1">
                  Account Entitlements
                </h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <ActionButton
                    onClick={handleTogglePremium}
                    loading={loadingAction === 'premium'}
                    variant={isPremiumUser ? 'outline' : 'primary'}
                    icon={Sparkles}
                    className={`w-full text-[9px] rounded-xl h-10 ${
                      isPremiumUser ? 'border-amber-500/30 text-amber-500 hover:bg-amber-500/10' : 'bg-accent text-black hover:bg-accent/90'
                    }`}
                  >
                    {isPremiumUser ? 'Revoke Premium' : 'Grant Premium'}
                  </ActionButton>
                  <ActionButton
                    onClick={handleResetPassword}
                    loading={loadingAction === 'password'}
                    variant="outline"
                    icon={Key}
                    className="w-full text-[9px] rounded-xl h-10"
                  >
                    Send Reset Link
                  </ActionButton>
                </div>
              </div>

              {/* Suspension Actions */}
              <div className="space-y-3.5 pt-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1">
                  Access Moderation
                </h4>
                <ActionButton
                  onClick={handleToggleSuspension}
                  loading={loadingAction === 'suspend'}
                  variant="outline"
                  icon={Ban}
                  className={`w-full text-[9px] rounded-xl h-10 ${
                    user.status === 'suspended' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-white' : 'bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-white'
                  }`}
                >
                  {user.status === 'suspended' ? 'Reactivate User Account' : 'Suspend User Account'}
                </ActionButton>
              </div>

              {/* Danger Actions / Delete Section */}
              <div className="space-y-3.5 pt-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-red-500 border-b border-red-500/20 pb-1">
                  Danger Zone
                </h4>
                {showDeleteConfirm ? (
                  <div className="p-3 border border-red-500/25 bg-red-500/5 rounded-xl space-y-3 animate-in fade-in duration-200">
                    <p className="text-[10px] text-red-500 font-semibold leading-normal">
                      WARNING: To delete user, type the email address <strong className="select-all">{user.email}</strong> to verify deletion.
                    </p>
                    <Input
                      type="text"
                      placeholder="Type email address"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      className="h-9 text-xs bg-neutral-950 border-neutral-800 focus-visible:ring-1 focus-visible:ring-red-500 rounded-xl text-white"
                    />
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleDeleteProfile}
                        disabled={deleteConfirmText.trim() !== user.email || loadingAction === 'delete'}
                        variant="danger"
                        className="flex-1 text-[10px] h-9 font-bold uppercase tracking-wider rounded-lg cursor-pointer"
                      >
                        {loadingAction === 'delete' ? 'Deleting...' : 'Confirm Delete'}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowDeleteConfirm(false)
                          setDeleteConfirmText('')
                        }}
                        variant="outline"
                        className="flex-1 text-[10px] h-9 font-bold uppercase tracking-wider rounded-lg cursor-pointer"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <ActionButton
                    onClick={() => setShowDeleteConfirm(true)}
                    icon={Trash2}
                    className="w-full text-[9px] rounded-xl h-10 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-transparent font-bold transition-all"
                  >
                    Delete Profile Registry
                  </ActionButton>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </>
  )
}

export default UserDrawer
