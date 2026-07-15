import React from 'react'
import { cn } from '@/shared/utils/cn'
import { Crown } from 'lucide-react'

interface PremiumBadgeProps {
  premium: boolean
  className?: string
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({ premium, className = '' }) => {
  return (
    <span className={cn(
      'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border leading-none inline-flex items-center space-x-1 select-none',
      premium 
        ? 'bg-accent/15 text-accent border-accent/25' 
        : 'bg-neutral-500/10 text-neutral-400 border-neutral-500/10',
      className
    )}>
      {premium && <Crown className="w-2.5 h-2.5 shrink-0" />}
      <span>{premium ? 'PRO' : 'FREE'}</span>
    </span>
  )
}

export default PremiumBadge
