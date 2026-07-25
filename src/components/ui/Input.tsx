import * as React from 'react'
import { cn } from '@/shared/utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'flex h-12 w-full rounded-xl border border-border bg-card/40 dark:bg-card/20 px-4 py-2 text-base sm:text-sm text-foreground transition-all placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-accent focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50 select-text',
          (type === 'date' || type === 'time') && 'dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-80 hover:[&::-webkit-calendar-picker-indicator]:opacity-100',
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'
