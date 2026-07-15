import React from 'react'
import { cn } from '@/shared/utils/cn'

export const getStatusFromLastActivity = (lastActivity: any): 'online' | 'away' | 'offline' => {
  if (!lastActivity) return 'offline'
  
  let ms = 0
  if (typeof lastActivity.toMillis === 'function') {
    ms = lastActivity.toMillis()
  } else if (lastActivity instanceof Date) {
    ms = lastActivity.getTime()
  } else if (typeof lastActivity === 'string') {
    ms = new Date(lastActivity).getTime()
  } else if (lastActivity.seconds) {
    ms = lastActivity.seconds * 1000
  } else {
    return 'offline'
  }

  const diffMinutes = (Date.now() - ms) / 1000 / 60
  if (diffMinutes < 2) return 'online'
  if (diffMinutes <= 10) return 'away'
  return 'offline'
}

interface OnlineIndicatorProps {
  lastActivity: any
  showText?: boolean
  className?: string
}

export const OnlineIndicator: React.FC<OnlineIndicatorProps> = ({
  lastActivity,
  showText = false,
  className = ''
}) => {
  const status = getStatusFromLastActivity(lastActivity)

  const colors = {
    online: 'bg-emerald-500 ring-emerald-500/20 dark:ring-emerald-500/10',
    away: 'bg-amber-500 ring-amber-500/20 dark:ring-amber-500/10',
    offline: 'bg-neutral-400 ring-neutral-400/20 dark:ring-neutral-400/10'
  }

  const labels = {
    online: 'Online',
    away: 'Away',
    offline: 'Offline'
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <span className={cn('w-2 h-2 rounded-full ring-4 shrink-0', colors[status])} />
      {showText && (
        <span className="text-xs font-semibold text-muted-foreground select-none">
          {labels[status]}
        </span>
      )}
    </div>
  )
}

export default OnlineIndicator
