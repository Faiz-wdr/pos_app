import React from 'react'
import { cn } from '@/shared/utils/cn'

interface RoleBadgeProps {
  role: 'guest' | 'user' | 'super_admin'
  className?: string
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className = '' }) => {
  const styles = {
    super_admin: 'bg-amber-500/15 text-amber-500 border-amber-500/25',
    user: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    guest: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/10'
  }

  const labels = {
    super_admin: 'Super Admin',
    user: 'User',
    guest: 'Guest'
  }

  return (
    <span className={cn(
      'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border leading-none inline-block select-none',
      styles[role] || styles.user,
      className
    )}>
      {labels[role] || role}
    </span>
  )
}

export default RoleBadge
