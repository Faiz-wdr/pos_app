import React from 'react'
import { ActivityLog } from '../types'
import { 
  UserPlus, 
  CreditCard, 
  Layers, 
  Clock, 
  GitBranch, 
  AlertCircle 
} from 'lucide-react'
import { cn } from '@/shared/utils/cn'

interface ActivityCardProps {
  activity: ActivityLog
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
  const getIcon = () => {
    switch (activity.type) {
      case 'signup':
        return { icon: UserPlus, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' }
      case 'premium_purchase':
        return { icon: CreditCard, color: 'text-accent bg-accent/10 border-accent/20' }
      case 'module_open':
        return { icon: Layers, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' }
      case 'clock_use':
        return { icon: Clock, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' }
      case 'app_update':
        return { icon: GitBranch, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' }
      default:
        return { icon: AlertCircle, color: 'text-neutral-500 bg-neutral-500/10 border-neutral-500/20' }
    }
  }

  const { icon: Icon, color: colorClasses } = getIcon()

  const formatTime = (ts: any) => {
    if (!ts) return ''
    if (typeof ts.toDate === 'function') {
      return ts.toDate().toLocaleString()
    }
    return new Date(ts).toLocaleString()
  }

  return (
    <div className="flex items-start space-x-3.5 select-none text-left py-2.5">
      <div className={cn('p-2 rounded-xl border shrink-0', colorClasses)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0 space-y-0.5">
        <h4 className="text-xs font-bold text-foreground truncate">{activity.title}</h4>
        <p className="text-[10px] text-muted-foreground leading-normal">{activity.description}</p>
        <div className="flex items-center space-x-2 mt-1">
          {activity.userEmail && (
            <span className="text-[8px] font-semibold text-muted-foreground uppercase bg-muted px-1.5 py-0.5 rounded-md truncate max-w-[120px]">
              {activity.userEmail}
            </span>
          )}
          <span className="text-[8px] text-muted-foreground">{formatTime(activity.timestamp)}</span>
        </div>
      </div>
    </div>
  )
}

export default ActivityCard
