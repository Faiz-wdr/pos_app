import React from 'react'
import { 
  BarChart3, 
  Download, 
  Activity, 
  Users, 
  TrendingUp, 
  Percent, 
  Coins, 
  AlertOctagon, 
  ShieldAlert, 
  RefreshCw,
  Gauge
} from 'lucide-react'
import { useAdminAnalytics } from '../hooks/useAdminAnalytics'
import { PageContainer } from '../components/PageContainer'
import { SectionTitle } from '../components/SectionTitle'
import { StatCard } from '../components/StatCard'
import { ActionButton } from '../components/ActionButton'
import { DateFilter } from '../components/DateFilter'
import { AnalyticsChart } from '../components/AnalyticsChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export const AnalyticsPage: React.FC = () => {
  const { analytics, loading, error, dateFilter, setDateFilter, exportCSV } = useAdminAnalytics()

  if (error) {
    return (
      <PageContainer className="justify-center items-center h-[70vh]">
        <div className="text-center space-y-4 max-w-sm">
          <div className="p-4 bg-red-500/10 text-red-500 rounded-full border border-red-500/20 inline-block">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-sm font-bold text-foreground">Error Loading Analytics</h2>
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

  return (
    <PageContainer>
      <SectionTitle
        title="Analytics Panel"
        subtitle="Track active user conversion metrics, module interactions, browser types, and retention cycles."
        actions={
          <div className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto">
            <DateFilter value={dateFilter} onChange={setDateFilter} />
            <ActionButton 
              icon={Download} 
              onClick={() => exportCSV()} 
              variant="outline"
              className="rounded-xl h-9 whitespace-nowrap shrink-0"
            >
              Export Report
            </ActionButton>
          </div>
        }
      />

      {/* Stats Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Daily Actives (DAU)"
          value={loading ? '...' : analytics.dau}
          icon={Users}
          loading={loading}
        />
        <StatCard
          title="Weekly Actives (WAU)"
          value={loading ? '...' : analytics.wau}
          icon={Activity}
          loading={loading}
        />
        <StatCard
          title="Monthly Actives (MAU)"
          value={loading ? '...' : analytics.mau}
          icon={Gauge}
          loading={loading}
        />
        <StatCard
          title="Avg Session Duration"
          value={loading ? '...' : `${analytics.avgSession}m`}
          icon={Activity}
          loading={loading}
        />
        <StatCard
          title="Daily Total Sessions"
          value={loading ? '...' : analytics.avgDailySessions}
          icon={BarChart3}
          loading={loading}
        />
        <StatCard
          title="Premium Conversion"
          value={loading ? '...' : `${analytics.premiumConversion}%`}
          icon={Percent}
          loading={loading}
        />
        <StatCard
          title="Est. Revenue (INR)"
          value={loading ? '...' : `₹${analytics.revenue}`}
          icon={Coins}
          loading={loading}
        />
        <StatCard
          title="System Crashes"
          value={loading ? '...' : analytics.crashCount}
          icon={AlertOctagon}
          loading={loading}
        />
      </div>

      {/* Charts Responsive Layout Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        
        {/* User growth Trend */}
        <Card className="bg-card border border-border rounded-2xl select-none">
          <CardHeader className="pb-3 border-b border-border/40 select-none">
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span>User Base Growth Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <AnalyticsChart 
              type="line" 
              data={analytics.userGrowthTrend.map(t => ({ label: t.date, value: t.count }))} 
              accentColor="#f8b518" 
            />
          </CardContent>
        </Card>

        {/* Sessions Per Day */}
        <Card className="bg-card border border-border rounded-2xl select-none">
          <CardHeader className="pb-3 border-b border-border/40 select-none">
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center space-x-2">
              <Activity className="w-4 h-4 text-accent" />
              <span>Daily Interactive Sessions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <AnalyticsChart 
              type="bar" 
              data={analytics.sessionsTrend.map(t => ({ label: t.date, value: t.count }))} 
              accentColor="#f8b518" 
            />
          </CardContent>
        </Card>

        {/* Module Usage Breakdown */}
        <Card className="bg-card border border-border rounded-2xl select-none">
          <CardHeader className="pb-3 border-b border-border/40 select-none">
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-accent" />
              <span>Module Registration & Activations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <AnalyticsChart 
              type="bar" 
              data={Object.entries(analytics.moduleUsage).map(([k, v]) => ({ label: k, value: v }))} 
              accentColor="#3b82f6" 
            />
          </CardContent>
        </Card>

        {/* Retention breakdown */}
        <Card className="bg-card border border-border rounded-2xl select-none">
          <CardHeader className="pb-3 border-b border-border/40 select-none">
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center space-x-2">
              <Activity className="w-4 h-4 text-accent" />
              <span>Retention Indicators (%)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <AnalyticsChart 
              type="bar" 
              data={Object.entries(analytics.retention).map(([k, v]) => ({ label: k, value: v }))} 
              accentColor="#ef4444" 
            />
          </CardContent>
        </Card>

        {/* Device Categories Donut */}
        <Card className="bg-card border border-border rounded-2xl select-none">
          <CardHeader className="pb-3 border-b border-border/40 select-none">
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center space-x-2">
              <Activity className="w-4 h-4 text-accent" />
              <span>Device Form-Factors</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <AnalyticsChart 
              type="donut" 
              data={Object.entries(analytics.deviceDistribution).map(([k, v]) => ({ label: k, value: v }))} 
              accentColor="#10b981" 
            />
          </CardContent>
        </Card>

        {/* Version Distribution Donut */}
        <Card className="bg-card border border-border rounded-2xl select-none">
          <CardHeader className="pb-3 border-b border-border/40 select-none">
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center space-x-2">
              <Activity className="w-4 h-4 text-accent" />
              <span>Client Version Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <AnalyticsChart 
              type="donut" 
              data={Object.entries(analytics.versionDistribution).map(([k, v]) => ({ label: k, value: v }))} 
              accentColor="#8b5cf6" 
            />
          </CardContent>
        </Card>

      </div>
    </PageContainer>
  )
}

export default AnalyticsPage
