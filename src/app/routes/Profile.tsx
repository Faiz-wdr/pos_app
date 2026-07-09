import { User, Mail, ShieldCheck, Calendar, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

export const Profile = () => {
  const user = {
    name: 'Faiz User',
    email: 'faiz@personalos.local',
    role: 'Administrator',
    joined: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long' }),
    tier: 'Developer Sandbox'
  }

  return (
    <div className="flex-1 flex flex-col space-y-6 pb-6 select-none">
      
      {/* Title */}
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</span>
        <h1 className="text-2xl font-black text-foreground mt-0.5 tracking-tight">Profile</h1>
      </div>

      {/* Avatar Card */}
      <Card className="bg-card/50 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-xl pointer-events-none" />
        <CardContent className="pt-6 flex flex-col items-center space-y-3">
          <div className="w-20 h-20 rounded-full bg-accent/10 border-2 border-accent flex items-center justify-center text-accent shadow-sm">
            <User className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground leading-snug">{user.name}</h2>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <span className="text-[10px] font-black tracking-wider uppercase bg-accent/15 text-accent px-3 py-1 rounded-full">
            {user.tier}
          </span>
        </CardContent>
      </Card>

      {/* Account Info Details */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">Details</h2>
        <Card className="bg-card/50">
          <CardContent className="pt-5 space-y-4 text-xs">
            {/* Row 1 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span className="font-semibold">Security Role</span>
              </div>
              <span className="font-bold text-foreground">{user.role}</span>
            </div>

            <hr className="border-border/60" />

            {/* Row 2 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Calendar className="w-4 h-4 text-accent" />
                <span className="font-semibold">Member Since</span>
              </div>
              <span className="font-bold text-foreground">{user.joined}</span>
            </div>

            <hr className="border-border/60" />

            {/* Row 3 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Mail className="w-4 h-4 text-accent" />
                <span className="font-semibold">Communication</span>
              </div>
              <span className="font-bold text-foreground">Local Only</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cloud Integration Promo Card */}
      <Card className="bg-card/30 border-dashed py-6">
        <CardContent className="pt-0 flex flex-col items-center justify-center text-center space-y-2">
          <div className="p-3 bg-muted rounded-xl text-muted-foreground">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <h3 className="text-xs font-bold text-foreground">Multi-Device Sync Ready</h3>
          <p className="text-[11px] text-muted-foreground max-w-[240px] leading-relaxed">
            Database sync capabilities are pre-wired. Connect a remote server in future modules to synchronize data in real-time.
          </p>
        </CardContent>
      </Card>

    </div>
  )
}
export default Profile
