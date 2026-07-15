import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon?: React.ComponentType<any>
  trend?: {
    value: number
    label: string
    isPositive: boolean
  }
  loading?: boolean
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  loading = false
}) => {
  if (loading) {
    return (
      <Card className="bg-card border border-border">
        <CardContent className="pt-6 space-y-3">
          <div className="flex justify-between items-center">
            <div className="h-3 w-20 bg-muted rounded-md animate-pulse" />
            <div className="h-7 w-7 bg-muted rounded-lg animate-pulse" />
          </div>
          <div className="h-7 w-28 bg-muted rounded-md animate-pulse" />
          <div className="h-3 w-36 bg-muted rounded-md animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border border-border transition-all duration-200">
      <CardContent className="pt-6 space-y-2">
        <div className="flex justify-between items-center select-none">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{title}</span>
          {Icon && (
            <div className="p-2 bg-muted/60 text-muted-foreground rounded-xl border border-border/40">
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>
        
        <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
        
        {trend && (
          <div className="flex items-center space-x-1.5 text-xs select-none">
            <span className={`flex items-center font-bold ${trend.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
              {trend.isPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 shrink-0" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5 shrink-0" />
              )}
              {trend.value}%
            </span>
            <span className="text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default StatCard
