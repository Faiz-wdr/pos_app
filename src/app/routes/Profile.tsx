import { User, Calendar, Sparkles, LogOut, Phone, Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/core/firebase/hooks/useAuth'

export const Profile = () => {
  const { user, isGuest, openAuthSheet, logout, loading } = useAuth()

  // GUEST MODE VIEW
  if (isGuest || !user) {
    return (
      <div className="flex-1 flex flex-col space-y-6 pb-6 select-none text-left">
        {/* Title */}
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</span>
          <h1 className="text-2xl font-black text-foreground mt-0.5 tracking-tight">Profile</h1>
        </div>

        {/* Guest Info Card */}
        <Card className="bg-card/50 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="pt-6 flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground shadow-xs">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground leading-snug">Guest User</h2>
              <p className="text-xs text-muted-foreground font-semibold">Not Signed In</p>
            </div>
            
            <Button
              onClick={() => openAuthSheet()}
              className="px-6 font-black uppercase text-xs tracking-wider h-10 rounded-xl cursor-pointer"
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
                <h3 className="text-xs font-bold text-foreground">Sign In for Remote Sync</h3>
                <p className="text-[11px] text-muted-foreground max-w-[240px] leading-relaxed">
                  Sign in with your mobile number to unlock premium features, automated database backups, and multi-device cloud sync.
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

  return (
    <div className="flex-1 flex flex-col space-y-6 pb-6 select-none text-left">
      {/* Title */}
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</span>
        <h1 className="text-2xl font-black text-foreground mt-0.5 tracking-tight">Profile</h1>
      </div>

      {/* User Information Card */}
      <Card className="bg-card/50 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-xl pointer-events-none" />
        <CardContent className="pt-6 flex flex-col items-center space-y-3">
          <div className="w-18 h-18 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shadow-xs">
            <User className="w-9 h-9" />
          </div>
          <div>
            <h2 className="text-base font-black text-foreground leading-snug">
              {user.displayName || 'Personal OS User'}
            </h2>
            <p className="text-xs text-muted-foreground font-semibold tracking-wide">
              {user.phoneNumber}
            </p>
          </div>
          <span className="text-[9px] font-black tracking-wider uppercase bg-accent/15 text-accent px-3 py-1 rounded-full">
            Standard Member
          </span>
        </CardContent>
      </Card>

      {/* Account Info Details */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">Details</label>
        <Card className="bg-card/50">
          <CardContent className="pt-5 space-y-4 text-xs">
            {/* User ID */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Shield className="w-4 h-4 text-accent" />
                <span className="font-semibold">User ID</span>
              </div>
              <span className="font-mono text-[10px] text-foreground font-bold tracking-tight bg-muted/60 px-2 py-0.5 rounded-sm">
                {user.uid}
              </span>
            </div>

            <hr className="border-border/60" />

            {/* Created At */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Calendar className="w-4 h-4 text-accent" />
                <span className="font-semibold">Account Created</span>
              </div>
              <span className="font-bold text-foreground">{createdDate}</span>
            </div>

            <hr className="border-border/60" />

            {/* Phone Verification status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Phone className="w-4 h-4 text-accent" />
                <span className="font-semibold">Auth Status</span>
              </div>
              <span className="font-bold text-green-500 flex items-center space-x-1">
                <span>Verified</span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchased Modules Section */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">
          Purchased Modules
        </label>
        <Card className="bg-card/45 border-dashed">
          <CardContent className="pt-5 pb-5 text-center text-xs text-muted-foreground font-medium">
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
                <p className="text-[10px] text-muted-foreground mt-1">Automatic real-time back ups</p>
              </div>
            </div>
            <span className="text-[9px] bg-muted text-muted-foreground font-black uppercase px-2 py-0.5 rounded-full tracking-wider border border-border">
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
        className="w-full flex items-center justify-center space-x-2 font-black uppercase text-xs tracking-wider h-11 rounded-xl cursor-pointer bg-red-500/5 hover:bg-red-500/10 text-red-500 border border-red-500/10 active:scale-[0.98] transition-all"
      >
        <LogOut className="w-4 h-4" />
        <span>{loading ? 'Logging out...' : 'Logout'}</span>
      </Button>
    </div>
  )
}

export default Profile
