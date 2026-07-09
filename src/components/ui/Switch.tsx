import * as React from 'react'
import { cn } from '@/shared/utils/cn'

export interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked, onCheckedChange, disabled = false, ...props }, ref) => {
    return (
      <button
        type="button"
        role="switch"
        ref={ref}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onCheckedChange(!checked)}
        className={cn(
          'peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50 select-none',
          checked ? 'bg-accent' : 'bg-border dark:bg-neutral-800',
          className
        )}
        {...props}
      >
        <span
          className={cn(
            'pointer-events-none block h-5.5 w-5.5 rounded-full shadow-md transition-transform duration-200 ease-out',
            checked 
              ? 'translate-x-5 bg-accent-foreground' 
              : 'translate-x-0 bg-white dark:bg-neutral-400'
          )}
        />
      </button>
    )
  }
)
Switch.displayName = 'Switch'
