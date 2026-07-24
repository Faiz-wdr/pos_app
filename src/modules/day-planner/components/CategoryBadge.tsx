import { TaskCategory } from '../types'
import { cn } from '@/shared/utils/cn'

interface CategoryBadgeProps {
  category: TaskCategory
  className?: string
  size?: 'sm' | 'md'
}

const CATEGORY_STYLES: Record<TaskCategory, { bg: string; text: string; border: string }> = {
  Personal: {
    bg: 'bg-purple-500/10 dark:bg-purple-500/15',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/20'
  },
  Study: {
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-500/20'
  },
  Work: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/20'
  },
  Health: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/20'
  },
  Family: {
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/20'
  },
  Other: {
    bg: 'bg-slate-500/10 dark:bg-slate-500/15',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-500/20'
  }
}

export const CategoryBadge = ({ category, className, size = 'sm' }: CategoryBadgeProps) => {
  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.Other

  return (
    <span
      className={cn(
        'inline-flex items-center font-bold border rounded-full uppercase tracking-wider select-none shrink-0',
        size === 'sm' ? 'text-[9px] px-2 py-0.5' : 'text-[10px] px-2.5 py-1',
        style.bg,
        style.text,
        style.border,
        className
      )}
    >
      {category}
    </span>
  )
}

export default CategoryBadge
