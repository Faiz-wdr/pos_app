import { useState } from 'react'
import { useAuth } from '@/core/firebase/hooks/useAuth'
import { User, LogOut } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getGravatarUrl } from '@/shared/utils/gravatar'

export const Profile = () => {
  const { user, isGuest, openAuthSheet, logout, loading } = useAuth()

  const [imgError, setImgError] = useState(false)

  // Helper to generate initials from full name
  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

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

  return (
    <div className="flex-1 flex flex-col space-y-5 pb-6 select-none text-left animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-foreground mt-0.5 tracking-tight">Profile</h1>
        </div>
      </div>

      {/* Profile Avatar Header */}
      <div className="flex items-center space-x-4 bg-card/30 border border-border/40 p-4 rounded-2xl">
        {(() => {
          const avatarSrc = user.photoURL || getGravatarUrl(user.email)
          if (avatarSrc && !imgError) {
            return (
              <img 
                src={avatarSrc} 
                alt={user.fullName || 'User'} 
                className="w-14 h-14 rounded-full border border-border/50 object-cover shrink-0"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
              />
            )
          }
          return (
            <div className="w-14 h-14 rounded-full bg-accent/10 border border-accent/25 flex items-center justify-center text-accent font-bold text-sm shrink-0 uppercase">
              {getInitials(user.fullName)}
            </div>
          )
        })()}
        <div className="min-w-0 flex-1 space-y-1">
          <h2 className="text-base font-bold text-foreground truncate">
            {user.fullName || 'Personal OS User'}
          </h2>
          <span className="inline-block text-[8px] font-bold tracking-wider uppercase bg-accent/15 text-accent px-2 py-0.5 rounded-md">
            {user.isPremium ? 'Pro Member' : 'Basic Member'}
          </span>
        </div>
      </div>

      {/* Account Info Details */}
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
