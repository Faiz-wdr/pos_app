import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Users, 
  Radio, 
  Sparkles, 
  UserCheck, 
  Layers, 
  GitBranch, 
  Activity, 
  ArrowRight,
  ShieldAlert,
  BarChart3,
  UserX,
  RefreshCw,
  Monitor
} from 'lucide-react'
import { useAdminDashboard } from '../hooks/useAdminDashboard'
import { PageContainer } from '../components/PageContainer'
import { SectionTitle } from '../components/SectionTitle'
import { StatCard } from '../components/StatCard'
import { EmptyState } from '../components/EmptyState'
import { ActionButton } from '../components/ActionButton'
import { ActivityCard } from '../components/ActivityCard'
import { OnlineIndicator } from '../components/OnlineIndicator'
import { RoleBadge } from '../components/RoleBadge'
import { PremiumBadge } from '../components/PremiumBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useSettingsStore } from '@/core/settings/settingsStore'

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { stats, recentUsers, onlineUsersList, activityLogs, loading, error } = useAdminDashboard()
  const animationsEnabled = useSettingsStore((state) => state.animationsEnabled)

  if (error) {
    return (
      <PageContainer className="justify-center items-center h-[70vh]">
        <div className="text-center space-y-4 max-w-sm">
          <div className="p-4 bg-red-500/10 text-red-500 rounded-full border border-red-500/20 inline-block">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-sm font-bold text-foreground">Failed to Load Dashboard Data</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">{error}</p>
          <ActionButton
            onClick={() => window.location.reload()}
            icon={RefreshCw}
            className="mx-auto rounded-xl"
          >
            Retry Connection
          </ActionButton>
        </div>
      </PageContainer>
    )
  }

  const quickActions = [
    { label: 'Manage Users', path: '/admin/users', icon: Users, desc: 'View profiles & adjust roles.' },
    { label: 'Configure Modules', path: '/admin/modules', icon: Layers, desc: 'Manage module feature keys.' },
    { label: 'Publish Update', path: '/admin/releases', icon: GitBranch, desc: 'Write PWA release changelogs.' },
    { label: 'Platform Analytics', path: '/admin/analytics', icon: BarChart3, desc: 'Inspect usage telemetry.' }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <PageContainer>
      <SectionTitle
        title="Dashboard Overview"
        subtitle="Live platform counters, active sessions, and telemetry overview."
        actions={
          <ActionButton
            icon={RefreshCw}
            onClick={() => window.location.reload()}
            variant="outline"
            className="rounded-xl h-9"
          >
            Reload Panel
          </ActionButton>
        }
      />

      {/* Row 1 Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial={animationsEnabled ? "hidden" : "show"}
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={itemVariants}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            loading={loading}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Online Users"
            value={stats.onlineUsers}
            icon={Radio}
            loading={loading}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Premium Upgrade Users"
            value={stats.premiumUsers}
            icon={Sparkles}
            loading={loading}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Registered Users"
            value={stats.registeredUsers}
            icon={UserCheck}
            loading={loading}
          />
        </motion.div>
      </motion.div>

      {/* Row 2 Fine Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial={animationsEnabled ? "hidden" : "show"}
        animate="show"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5"
      >
        <motion.div variants={itemVariants} className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Guest Users</span>
          <span className="text-lg font-bold text-foreground mt-1.5">{loading ? '...' : stats.guestUsers}</span>
        </motion.div>
        <motion.div variants={itemVariants} className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Today's Actives</span>
          <span className="text-lg font-bold text-foreground mt-1.5">{loading ? '...' : stats.activeToday}</span>
        </motion.div>
        <motion.div variants={itemVariants} className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">New Signups Today</span>
          <span className="text-lg font-bold text-foreground mt-1.5">{loading ? '...' : stats.newToday}</span>
        </motion.div>
        <motion.div variants={itemVariants} className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Modules Configured</span>
          <span className="text-lg font-bold text-foreground mt-1.5">{loading ? '...' : stats.modulesInstalled}</span>
        </motion.div>
        <motion.div variants={itemVariants} className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Admin Version</span>
          <span className="text-lg font-bold text-foreground mt-1.5">{loading ? '...' : `v${stats.appVersion}`}</span>
        </motion.div>
        <motion.div variants={itemVariants} className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Latest Release</span>
          <span className="text-lg font-bold text-foreground mt-1.5 truncate">{loading ? '...' : stats.latestRelease}</span>
        </motion.div>
      </motion.div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Center Columns: Recent Users and Activity */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Actions Grid */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1 text-left">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
              {quickActions.map((action, i) => {
                const Icon = action.icon
                return (
                  <Link
                    key={i}
                    to={action.path}
                    className="p-3 bg-card border border-border hover:border-accent/40 rounded-2xl text-left transition-all active:scale-[0.98] block group cursor-pointer"
                  >
                    <Icon className="w-5 h-5 text-accent mb-2 shrink-0 group-hover:scale-105 transition-transform" />
                    <h4 className="text-xs font-bold text-foreground truncate">{action.label}</h4>
                    <p className="text-[8px] text-muted-foreground leading-normal mt-0.5">{action.desc}</p>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Recent Users List */}
          <Card className="bg-card border border-border rounded-2xl">
            <CardHeader className="pb-2 border-b border-border/40 flex flex-row items-center justify-between select-none">
              <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center space-x-2">
                <Users className="w-4 h-4 text-accent" />
                <span>Recent Platform signups</span>
              </CardTitle>
              <ActionButton
                onClick={() => navigate('/admin/users')}
                icon={ArrowRight}
                variant="ghost"
                className="h-8 text-[9px] px-2.5 rounded-lg"
              >
                View All
              </ActionButton>
            </CardHeader>
            <CardContent className="pt-2 px-0 pb-1.5">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-10 bg-muted/60 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : recentUsers.length === 0 ? (
                <div className="py-6">
                  <EmptyState title="No Users Registered" icon={UserX} />
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {recentUsers.map((user) => {
                    const isPremium = !!(user.premium || user.isPremium)
                    return (
                      <div 
                        key={user.uid}
                        onClick={() => navigate(`/admin/users`)}
                        className="flex items-center justify-between px-6 py-3 hover:bg-muted/20 cursor-pointer transition-colors text-left"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border/40">
                            <Users className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-foreground truncate max-w-[120px] sm:max-w-[200px]">
                              {user.fullName || 'Anonymous User'}
                            </h4>
                            <p className="text-[9px] text-muted-foreground truncate max-w-[120px] sm:max-w-[200px]">{user.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <RoleBadge role={user.role} />
                          <PremiumBadge premium={isPremium} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Session Diagnostics & Online users */}
        <div className="space-y-6">
          {/* Active / Online Sessions */}
          <Card className="bg-card border border-border rounded-2xl flex flex-col h-full min-h-[350px]">
            <CardHeader className="pb-3 border-b border-border/40 select-none">
              <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center space-x-2">
                <Radio className="w-4 h-4 text-accent animate-pulse" />
                <span>Live Active Sessions ({onlineUsersList.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto px-4 py-2 mt-2">
              {loading ? (
                <div className="space-y-3 pt-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-10 bg-muted/60 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : onlineUsersList.length === 0 ? (
                <div className="py-12">
                  <EmptyState title="No Active Sessions" description="No users are currently interacting with the platform." icon={Radio} />
                </div>
              ) : (
                <div className="space-y-3.5">
                  {onlineUsersList.map((user) => (
                    <div 
                      key={user.uid}
                      className="p-3 bg-muted/30 border border-border/40 rounded-xl flex items-center justify-between text-left"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <OnlineIndicator lastActivity={user.lastActivity} />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-foreground truncate max-w-[120px]">{user.fullName || 'User'}</h4>
                          <span className="text-[8px] text-muted-foreground uppercase tracking-wider flex items-center mt-0.5">
                            <Monitor className="w-2.5 h-2.5 mr-1 shrink-0" />
                            <span>{user.device || 'web'} • v{user.appVersion}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-0.5 shrink-0 pl-1.5">
                        <span className="text-[8px] font-bold uppercase text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md border border-border/30">
                          {user.enabledModules?.[0] || 'Idle'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Activity Logs Timeline */}
      <div className="space-y-3 mt-6">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1 text-left">Activity Timeline</h3>
        <Card className="bg-card border border-border rounded-2xl">
          <CardContent className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted/60 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : activityLogs.length === 0 ? (
              <EmptyState title="No Platform Events" description="Platform audit logs will display here as activity increases." icon={Activity} />
            ) : (
              <div className="relative pl-6 border-l border-border/60 space-y-5">
                {activityLogs.map((activity) => (
                  <div key={activity.id} className="relative">
                    {/* Ring dot on timeline */}
                    <span className="absolute -left-[30px] top-3.5 w-2 h-2 rounded-full bg-accent ring-4 ring-card" />
                    <ActivityCard activity={activity} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </PageContainer>
  )
}

export default DashboardPage
