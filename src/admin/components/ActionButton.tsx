import React from 'react'
import { Button, ButtonProps } from '@/components/ui/Button'
import { Loader2 } from 'lucide-react'

interface ActionButtonProps extends ButtonProps {
  loading?: boolean
  icon?: React.ComponentType<any>
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  loading = false,
  icon: Icon,
  disabled,
  className = '',
  ...props
}) => {
  return (
    <Button
      disabled={disabled || loading}
      className={`rounded-xl font-bold uppercase text-[10px] tracking-wider h-10 px-4 flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-[0.98] ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        Icon && <Icon className="w-3.5 h-3.5 shrink-0" />
      )}
      <span>{children}</span>
    </Button>
  )
}

export default ActionButton
