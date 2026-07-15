import React from 'react'
import { getStatusFromLastActivity } from './OnlineIndicator'
import { cn } from '@/shared/utils/cn'

interface StatusBadgeProps {
  lastActivity: any
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ lastActivity, className = '' }) => {
  const status = getStatusFromLastActivity(lastActivity)

  const badges = {
    online: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    away: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    offline: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/10'
  }

  const labels = {
    online: 'Online',
    away: 'Away',
    offline: 'Offline'
  }

  return (
    <span className={cn(
      'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border leading-none inline-block select-none',
      badges[status],
      className
    )}>
      {labels[status]}
    </span>
  )
}

export default StatusBadge
