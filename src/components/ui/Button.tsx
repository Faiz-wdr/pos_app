import * as React from 'react'
import { cn } from '@/shared/utils/cn'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-semibold transition-all focus-visible:outline-2 focus-visible:outline-accent active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
          // Variants
          variant === 'primary' && 'bg-accent text-accent-foreground shadow-sm hover:brightness-105 active:brightness-95',
          variant === 'secondary' && 'bg-card text-foreground border border-border hover:brightness-[1.03] dark:hover:brightness-[1.1] active:scale-[0.98]',
          variant === 'outline' && 'border border-border text-foreground hover:bg-muted active:scale-[0.98]',
          variant === 'ghost' && 'text-foreground hover:bg-muted active:scale-[0.98]',
          variant === 'danger' && 'bg-red-600 text-white shadow-sm hover:bg-red-700 active:brightness-95',
          // Sizes (touch-friendly targets minimum 44px height for main buttons)
          size === 'sm' && 'h-9 px-3 text-xs rounded-lg',
          size === 'md' && 'h-11 px-5 text-sm',
          size === 'lg' && 'h-14 px-8 text-base rounded-2xl',
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
