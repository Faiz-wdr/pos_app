import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Copy, Edit, Trash2, Sparkles } from 'lucide-react'
import { PlannerTemplate } from '../types'
import { CategoryBadge } from './CategoryBadge'

interface TemplateCardProps {
  template: PlannerTemplate
  onApply: () => void
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
}

export const TemplateCard = ({
  template,
  onApply,
  onEdit,
  onDuplicate,
  onDelete
}: TemplateCardProps) => {
  return (
    <Card className="relative overflow-hidden bg-card/70 border-border/70 shadow-xs hover:bg-card transition-all duration-200 rounded-2xl select-none">
      <CardContent className="p-4 sm:p-5 space-y-3.5 text-left">
        <div className="flex items-start justify-between">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-extrabold text-foreground tracking-tight line-clamp-1">
                {template.name}
              </h3>
              <CategoryBadge category={template.category} />
            </div>
            {template.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 font-medium">
                {template.description}
              </p>
            )}
            <span className="text-[10px] text-muted-foreground/80 font-bold uppercase tracking-wider">
              {template.items?.length || 0} Routine Tasks
            </span>
          </div>

          {/* Icon action tools */}
          <div className="flex items-center space-x-1 shrink-0">
            <button
              onClick={onDuplicate}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              title="Duplicate template"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg hover:bg-muted text-blue-500 hover:bg-blue-500/10 transition-all cursor-pointer"
              title="Edit template"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg hover:bg-muted text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
              title="Delete template"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Task Items Preview */}
        {template.items && template.items.length > 0 && (
          <div className="bg-muted/40 p-2.5 rounded-xl space-y-1.5 border border-border/40">
            {template.items.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                <span className="truncate pr-2">• {item.title}</span>
                <span className="tabular-nums shrink-0">{item.startTime}</span>
              </div>
            ))}
            {template.items.length > 3 && (
              <p className="text-[10px] font-bold text-accent pt-0.5 text-right">
                +{template.items.length - 3} more tasks...
              </p>
            )}
          </div>
        )}

        {/* Apply Button */}
        <Button
          onClick={onApply}
          variant="secondary"
          className="w-full flex items-center justify-center h-9 text-xs font-bold rounded-xl border border-border/60 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-all shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
          Apply Template to Schedule
        </Button>
      </CardContent>
    </Card>
  )
}

export default TemplateCard
