import { useState, useEffect } from 'react'
import { User, LogOut, Mail, Pencil, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/core/firebase/hooks/useAuth'

export const Profile = () => {
  const { user, isGuest, openAuthSheet, logout, loading, updateProfile } = useAuth()

  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [showPasswordFields, setShowPasswordFields] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Synchronize state with user data
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '')
      setEmail(user.email || '')
    }
  }, [user])

  // GUEST MODE VIEW
  if (isGuest || !user) {
    return (
      <div className="flex-1 flex flex-col space-y-5 pb-6 select-none text-left animate-in fade-in duration-200">
        {/* Title */}
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-foreground mt-0.5 tracking-tight">Profile</h1>
        </div>

        {/* Guest Info Card */}
        <Card className="bg-card/30 border border-border/40 rounded-2xl overflow-hidden relative">
          <CardContent className="p-6 flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted border border-border/60 flex items-center justify-center text-muted-foreground shadow-sm">
              <User className="w-8 h-8" />
            </div>
            <div className="text-center">
              <h2 className="text-base font-bold text-foreground leading-snug">Guest User</h2>
            </div>
            
            <Button
              onClick={() => openAuthSheet()}
              className="px-6 font-bold uppercase text-xs tracking-wider h-10 rounded-xl cursor-pointer"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // AUTHENTICATED USER PROFILE VIEW
  const createdDate = new Date(user.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSuccessMsg(null)

    if (!fullName.trim()) {
      setFormError('Full name is required.')
      return
    }
    if (!email.trim()) {
      setFormError('Email address is required.')
      return
    }

    if (showPasswordFields) {
      if (!password) {
        setFormError('New password is required.')
        return
      }
      if (password.length < 6) {
        setFormError('Password must be at least 6 characters.')
        return
      }
      if (password !== confirmPassword) {
        setFormError('Passwords do not match.')
        return
      }
    }

    try {
      await updateProfile(
        fullName.trim(),
        email.trim(),
        showPasswordFields ? password : undefined
      )
      setSuccessMsg('Profile updated successfully!')
      setIsEditing(false)
      setShowPasswordFields(false)
      setPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setFormError(err.message || 'Failed to update profile. Please try again.')
    }
  }

  return (
    <div className="flex-1 flex flex-col space-y-5 pb-6 select-none text-left animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-foreground mt-0.5 tracking-tight">Profile</h1>
        </div>
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsEditing(true)
              setFullName(user.fullName || '')
              setEmail(user.email || '')
              setShowPasswordFields(false)
              setPassword('')
              setConfirmPassword('')
              setFormError(null)
              setSuccessMsg(null)
            }}
            className="flex items-center space-x-1.5 font-bold uppercase text-[10px] tracking-wider rounded-xl cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </Button>
        )}
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl p-3.5 text-xs flex items-center space-x-2 font-semibold animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Profile Avatar Header */}
      <div className="flex items-center space-x-4 bg-card/30 border border-border/40 p-4 rounded-2xl">
        <div className="w-14 h-14 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center text-accent shrink-0">
          <User className="w-7 h-7" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <h2 className="text-base font-bold text-foreground truncate">
            {user.fullName || 'Personal OS User'}
          </h2>
          <span className="inline-block text-[8px] font-bold tracking-wider uppercase bg-accent/15 text-accent px-2 py-0.5 rounded-md">
            {user.isPremium ? 'Pro Member' : 'Basic Member'}
          </span>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-4 animate-in fade-in duration-300">
          <div className="space-y-4">
            {formError && (
              <div className="bg-red-500/10 border border-red-500/25 text-red-500 rounded-xl p-3.5 text-xs flex items-center space-x-2 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <User className="w-4 h-4" />
                </div>
                <Input
                  type="text"
                  required
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 h-11 bg-neutral-950 border-neutral-800 focus-visible:ring-1 focus-visible:ring-accent rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Mail className="w-4 h-4" />
                </div>
                <Input
                  type="email"
                  required
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 bg-neutral-950 border-neutral-800 focus-visible:ring-1 focus-visible:ring-accent rounded-xl text-xs text-white"
                />
              </div>
            </div>

            {/* Expandable Password Section */}
            <div className="pt-2">
              {!showPasswordFields ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPasswordFields(true)}
                  className="w-full flex items-center justify-center space-x-2 text-xs font-bold uppercase tracking-wider h-11 rounded-xl cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Change Password</span>
                </Button>
              ) : (
                <div className="space-y-4 border border-border/40 rounded-2xl p-4 bg-card/25 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Change Password</span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordFields(false)
                        setPassword('')
                        setConfirmPassword('')
                      }}
                      className="text-xs font-semibold text-accent hover:underline cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                        <Lock className="w-4 h-4" />
                      </div>
                      <Input
                        type="password"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-11 bg-neutral-950 border-neutral-800 focus-visible:ring-1 focus-visible:ring-accent rounded-xl text-xs text-white"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                        <Lock className="w-4 h-4" />
                      </div>
                      <Input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 h-11 bg-neutral-950 border-neutral-800 focus-visible:ring-1 focus-visible:ring-accent rounded-xl text-xs text-white"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 font-bold uppercase text-xs tracking-wider h-11 rounded-xl cursor-pointer"
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => {
                setIsEditing(false)
                setFormError(null)
              }}
              className="flex-1 font-bold uppercase text-xs tracking-wider h-11 rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        /* Account Info Details */
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">Account Details</label>
          <Card className="bg-card/30 border border-border/40 rounded-2xl overflow-hidden">
            <CardContent className="p-0 divide-y divide-border/30">
              {/* Email Address */}
              <div className="flex items-center justify-between h-12 px-4">
                <span className="text-xs font-bold text-foreground">Email Address</span>
                <span className="text-xs font-semibold text-muted-foreground">{user.email}</span>
              </div>

              {/* Membership Plan */}
              <div className="flex items-center justify-between h-12 px-4">
                <span className="text-xs font-bold text-foreground">Membership Plan</span>
                <span className="text-xs font-semibold text-muted-foreground">{user.isPremium ? 'Pro' : 'Basic'}</span>
              </div>

              {/* Created At */}
              <div className="flex items-center justify-between h-12 px-4">
                <span className="text-xs font-bold text-foreground">Account Created</span>
                <span className="text-xs font-semibold text-muted-foreground">{createdDate}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Logout Action */}
      <div className="pt-2">
        <Button
          variant="secondary"
          onClick={logout}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 font-bold uppercase text-xs tracking-wider h-11 rounded-xl cursor-pointer bg-red-500/5 hover:bg-red-500/10 text-red-500 border border-red-500/10 active:scale-[0.98] transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>{loading ? 'Logging out...' : 'Logout'}</span>
        </Button>
      </div>
    </div>
  )
}

export default Profile
