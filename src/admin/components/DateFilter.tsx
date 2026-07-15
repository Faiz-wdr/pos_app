import React from 'react'
import { Calendar } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

interface DateFilterProps {
  value: string
  onChange: (val: string) => void
  className?: string
}

export const DateFilter: React.FC<DateFilterProps> = ({
  value,
  onChange,
  className = ''
}) => {
  const options = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: '7 Days', value: '7days' },
    { label: '30 Days', value: '30days' },
    { label: '90 Days', value: '90days' }
  ]

  return (
    <div className={cn('bg-card border border-border/80 p-1.5 rounded-xl flex items-center space-x-1 select-none shrink-0 overflow-x-auto max-w-full', className)}>
      <Calendar className="w-3.5 h-3.5 text-muted-foreground ml-1.5 shrink-0" />
      <div className="flex space-x-1 pr-1 pl-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer active:scale-95 whitespace-nowrap',
              value === opt.value
                ? 'bg-accent text-accent-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default DateFilter
