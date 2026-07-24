import { CalendarCheck, Sparkles, Plus, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface EmptyStateProps {
  type: 'today' | 'tomorrow' | 'date' | 'templates'
  onAction?: () => void
  actionLabel?: string
}

export const EmptyState = ({ type, onAction, actionLabel }: EmptyStateProps) => {
  const getConfig = () => {
    switch (type) {
      case 'today':
        return {
          icon: CalendarCheck,
          title: 'No Tasks Scheduled Today',
          description: 'Your day is currently empty. Tap Quick Add or apply a template to plan your day.',
          btnText: actionLabel || 'Add Today’s First Task'
        }
      case 'tomorrow':
        return {
          icon: CalendarCheck,
          title: 'No Tasks Planned for Tomorrow',
          description: 'Planning ahead reduces morning stress. Add your key tasks before sleeping.',
          btnText: actionLabel || 'Plan Tomorrow'
        }
      case 'date':
        return {
          icon: Calendar,
          title: 'No Tasks on Selected Date',
          description: 'No scheduled tasks found for this date. Create a task or pick a template.',
          btnText: actionLabel || 'Add Task for Date'
        }
      case 'templates':
        return {
          icon: Sparkles,
          title: 'No Custom Templates',
          description: 'Templates help you instantly load common routines like Morning or Workday schedules.',
          btnText: actionLabel || 'Create First Template'
        }
    }
  }

  const config = getConfig()
  const Icon = config.icon

  return (
    <div className="flex-1 flex items-center justify-center select-none py-10 px-4">
      <Card className="border-dashed border-border/70 bg-card/30 shadow-none w-full max-w-sm py-10 rounded-2xl">
        <CardContent className="pt-0 flex flex-col items-center justify-center text-center space-y-3.5">
          <div className="p-4 bg-accent/10 text-accent rounded-2xl">
            <Icon className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-foreground tracking-tight">{config.title}</h3>
            <p className="text-xs text-muted-foreground max-w-[260px] mx-auto leading-relaxed">
              {config.description}
            </p>
          </div>

          {onAction && (
            <Button
              onClick={onAction}
              variant="secondary"
              className="text-xs font-bold px-5 h-9 rounded-xl border border-border mt-2 cursor-pointer hover:bg-card active:scale-[0.98] transition-all"
            >
              <Plus className="w-3.5 h-3.5 mr-1 text-accent" />
              {config.btnText}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default EmptyState
