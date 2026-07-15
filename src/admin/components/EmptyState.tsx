import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: LucideIcon
  action?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon,
  action
}) => {
  return (
    <Card className="bg-card border border-border/85 border-dashed rounded-2xl select-none">
      <CardContent className="flex flex-col items-center justify-center text-center py-12 px-6 space-y-4">
        {Icon && (
          <div className="p-3 bg-muted/65 text-muted-foreground rounded-2xl border border-border/30">
            <Icon className="w-6 h-6" />
          </div>
        )}
        <div className="space-y-1 max-w-sm">
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
          {description && <p className="text-xs text-muted-foreground leading-normal">{description}</p>}
        </div>
        {action && <div className="pt-2">{action}</div>}
      </CardContent>
    </Card>
  )
}

export default EmptyState
