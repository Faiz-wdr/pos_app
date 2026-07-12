import { useState, useEffect } from 'react'
import { User, Calendar, Sparkles, LogOut, Mail, Pencil, Lock, AlertCircle, CheckCircle } from 'lucide-react'
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
      <div className="flex-1 flex flex-col space-y-6 pb-6 select-none text-left">
        {/* Title */}
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</span>
          <h1 className="text-2xl font-bold text-foreground mt-0.5 tracking-tight">Profile</h1>
        </div>

        {/* Guest Info Card */}
        <Card className="bg-card/50 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="pt-6 flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground shadow-xs">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground leading-snug">Guest User</h2>
              <p className="text-xs text-muted-foreground font-semibold">Not Signed In</p>
            </div>
            
            <Button
              onClick={() => openAuthSheet()}
              className="px-6 font-bold uppercase text-xs tracking-wider h-10 rounded-xl cursor-pointer"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>

        {/* Premium Benefits Card */}
        <div className="space-y-2.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">
            Premium Access
          </label>
          <Card className="bg-card/30 border-dashed py-6 border-border/80">
            <CardContent className="pt-0 flex flex-col items-center justify-center text-center space-y-3">
              <div className="p-3 bg-accent/10 rounded-2xl text-accent">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-foreground">Sign In to Sync & Save</h3>
                <p className="text-[11px] text-muted-foreground max-w-[240px] leading-relaxed">
                  Sign in to unlock Premium Modules and sync your data.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
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
        setFormError('Password must be at least 6 characters long.')
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
    <div className="flex-1 flex flex-col space-y-6 pb-6 select-none text-left">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</span>
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
            <Pencil className="w-3.5 h-3.5 text-accent" />
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

      {/* User Information Card */}
      <Card className="bg-card/50 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-xl pointer-events-none" />
        <CardContent className="pt-6 flex flex-col items-center space-y-3">
          <div className="w-18 h-18 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shadow-xs">
            <User className="w-9 h-9" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground leading-snug">
              {user.fullName || 'Personal OS User'}
            </h2>
            <p className="text-xs text-muted-foreground font-semibold tracking-wide mt-0.5">
              {user.email}
            </p>
          </div>
          <span className="text-[9px] font-bold tracking-wider uppercase bg-accent/15 text-accent px-3 py-1 rounded-full">
            Standard Member
          </span>
        </CardContent>
      </Card>

      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-4 animate-in fade-in duration-300">
          <div className="space-y-3.5">
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
                  className="pl-10"
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
                  className="pl-10"
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
                  className="w-full flex items-center justify-center space-x-2 text-xs font-bold uppercase tracking-wider py-2.5 rounded-xl cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-accent" />
                  <span>Change Password</span>
                </Button>
              ) : (
                <div className="space-y-3.5 border border-border/80 rounded-2xl p-4 bg-muted/20 animate-in fade-in duration-200">
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
                        <Lock className="w-4 h-4 text-accent" />
                      </div>
                      <Input
                        type="password"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
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
                        <Lock className="w-4 h-4 text-accent" />
                      </div>
                      <Input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
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
              {loading ? 'Saving...' : 'Save Changes'}
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
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">Details</label>
          <Card className="bg-card/50">
            <CardContent className="pt-5 space-y-4 text-xs font-semibold">
              {/* Email Address */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <Mail className="w-4 h-4 text-accent" />
                  <span>Email Address</span>
                </div>
                <span className="text-foreground">{user.email}</span>
              </div>

              <hr className="border-border/60" />

              {/* Created At */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <Calendar className="w-4 h-4 text-accent" />
                  <span>Account Created</span>
                </div>
                <span className="text-foreground">{createdDate}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Purchased Modules Section */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">
          Purchased Modules
        </label>
        <Card className="bg-card/45 border-dashed">
          <CardContent className="pt-5 pb-5 text-center text-xs text-muted-foreground font-semibold">
            No Modules Purchased Yet (Empty)
          </CardContent>
        </Card>
      </div>

      {/* Cloud Sync / Coming Soon section */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">
          Database Backup
        </label>
        <Card className="bg-card/30 border-dashed relative overflow-hidden">
          <CardContent className="pt-4 pb-4 flex items-center justify-between px-5">
            <div className="flex items-center space-x-3 text-left">
              <div className="p-2 bg-accent/10 rounded-xl text-accent">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground leading-none">Cloud Sync</h4>
                <p className="text-[10px] text-muted-foreground mt-1 font-semibold">Automatic real-time back ups</p>
              </div>
            </div>
            <span className="text-[9px] bg-muted text-muted-foreground font-bold uppercase px-2 py-0.5 rounded-full tracking-wider border border-border">
              Coming Soon
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Logout Action */}
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
  )
}

export default Profile
