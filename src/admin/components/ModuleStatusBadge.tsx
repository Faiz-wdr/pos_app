import React from 'react'
import { cn } from '@/shared/utils/cn'

interface ModuleStatusBadgeProps {
  status: 'published' | 'beta' | 'coming-soon' | 'hidden'
  className?: string
}

export const ModuleStatusBadge: React.FC<ModuleStatusBadgeProps> = ({ status, className = '' }) => {
  const styles = {
    published: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25',
    beta: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'coming-soon': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    hidden: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/10'
  }

  const labels = {
    published: 'Published',
    beta: 'Beta',
    'coming-soon': 'Coming Soon',
    hidden: 'Hidden'
  }

  return (
    <span className={cn(
      'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border leading-none inline-block select-none',
      styles[status] || styles.published,
      className
    )}>
      {labels[status] || status}
    </span>
  )
}

export default ModuleStatusBadge
