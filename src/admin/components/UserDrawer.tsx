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
import { 
  X, 
  User, 
  Cpu, 
  Cloud, 
  Key, 
  Trash2, 
  Sparkles,
  Layers,
  Monitor
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

  if (!user) return null

  const isPremiumUser = !!(user.premium || user.isPremium)

  const handleUpdateRole = async (newRole: 'guest' | 'user' | 'super_admin') => {
    setLoadingAction('role')
    try {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, { role: newRole })
      setSuccessMsg(`Role updated to ${newRole}`)
      onActionComplete()
    } catch (e: any) {
      setErrorMsg(e.message)
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
    if (!window.confirm(`Are you absolutely sure you want to delete ${user.fullName || 'this user'}'s profile registry? This action is permanent.`)) {
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

  const allSystemModules = ['clock', 'shopping', 'income', 'diet']

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
        className="fixed top-0 right-0 h-screen w-full sm:max-w-md bg-card border-l border-border z-50 flex flex-col shadow-2xl select-none"
      >
        <div className="h-16 border-b border-border/60 flex items-center justify-between px-6 shrink-0 bg-muted/20">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-bold text-foreground">User Overview</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
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

          <div className="flex items-center space-x-4 bg-muted/30 border border-border/40 p-4 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-muted border border-border/60 flex items-center justify-center text-muted-foreground shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <h4 className="text-sm font-bold text-foreground truncate">{user.fullName || 'Anonymous'}</h4>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              <div className="flex items-center space-x-1.5 pt-0.5">
                <StatusBadge lastActivity={user.lastActivity} />
                <PremiumBadge premium={isPremiumUser} />
              </div>
            </div>
          </div>

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
                <div className="flex items-center space-x-1.5">
                  <select
                    value={user.role}
                    onChange={(e) => handleUpdateRole(e.target.value as any)}
                    disabled={loadingAction === 'role'}
                    className="bg-transparent text-[11px] font-bold border-none focus:outline-none cursor-pointer text-foreground"
                  >
                    <option value="guest">Guest</option>
                    <option value="user">User</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
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
                  <span>Cloud Synchronization</span>
                </span>
                <span className="text-emerald-500 font-bold">Synchronized</span>
              </div>
            </div>
          </div>

          <div className="space-y-3.5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1 flex items-center justify-between">
              <span>Core Application Modules</span>
              <Layers className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            </h4>
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
                {isPremiumUser ? 'Revoke PRO' : 'Grant PRO'}
              </ActionButton>
              <ActionButton
                onClick={handleResetPassword}
                loading={loadingAction === 'password'}
                variant="outline"
                icon={Key}
                className="w-full text-[9px] rounded-xl h-10"
              >
                Send Password Reset
              </ActionButton>
            </div>
          </div>

          <div className="space-y-3.5 pt-4">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-red-500 border-b border-red-500/20 pb-1">
              Danger Actions
            </h4>
            <div className="grid grid-cols-1 gap-2.5">
              <ActionButton
                onClick={handleDeleteProfile}
                loading={loadingAction === 'delete'}
                icon={Trash2}
                className="w-full text-[9px] rounded-xl h-10 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-transparent font-bold transition-all"
              >
                Delete Profile Registry
              </ActionButton>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default UserDrawer
