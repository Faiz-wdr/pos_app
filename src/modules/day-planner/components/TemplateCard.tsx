import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Copy, Edit, Trash2, ChevronDown } from 'lucide-react'
import { PlannerTemplate } from '../types'
import { CategoryBadge } from './CategoryBadge'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card 
      onClick={() => setIsExpanded(!isExpanded)}
      className="relative overflow-hidden bg-card/70 border border-border/40 shadow-xs hover:bg-card transition-all duration-200 rounded-2xl select-none cursor-pointer"
    >
      <CardContent className="p-4 text-left">
        {/* Collapsed Header Info Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0 flex-1">
            <h3 className="text-xs font-extrabold text-foreground tracking-tight truncate max-w-[200px]">
              {template.name}
            </h3>
            <CategoryBadge category={template.category} />
            <span className="text-[10px] text-muted-foreground/80 font-bold uppercase tracking-wider shrink-0">
              • {template.items?.length || 0} Tasks
            </span>
          </div>

          {/* Action buttons toolbar */}
          <div 
            className="flex items-center space-x-1 shrink-0" 
            onClick={(e) => e.stopPropagation()}
          >
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
            
            {/* Collapse/Expand toggle chevron */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-all ml-0.5 cursor-pointer"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </motion.div>
            </button>
          </div>
        </div>

        {/* Slide-down Expandable Body Area */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-border/40 space-y-3" onClick={(e) => e.stopPropagation()}>
                {template.description && (
                  <p className="text-[11px] font-medium text-muted-foreground leading-normal">
                    {template.description}
                  </p>
                )}

                {template.items && template.items.length > 0 && (
                  <div className="bg-muted/40 p-3 rounded-xl space-y-2 border border-border/30 max-h-[220px] overflow-y-auto">
                    {template.items.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground border-b border-border/20 last:border-0 pb-1.5 last:pb-0"
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="text-foreground truncate font-bold">{item.title}</span>
                          {item.notes && <span className="text-[9px] text-muted-foreground/80 font-normal truncate mt-0.5">{item.notes}</span>}
                        </div>
                        <span className="tabular-nums shrink-0 text-accent font-bold pl-2">
                          {item.startTime} - {item.endTime}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  onClick={onApply}
                  variant="secondary"
                  className="w-full flex items-center justify-center h-8.5 text-[11px] font-bold rounded-xl border border-border/60 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-all shadow-xs"
                >
                  Apply Routine to Schedule
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

export default TemplateCard
