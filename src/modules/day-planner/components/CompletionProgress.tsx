import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/Card'
import { CheckCircle2, Sparkles } from 'lucide-react'

interface CompletionProgressProps {
  completed: number
  total: number
  percentage: number
}

export const CompletionProgress = ({ completed, total, percentage }: CompletionProgressProps) => {
  if (total === 0) return null

  return (
    <div className="bg-card/70 border border-border/60 shadow-xs rounded-xl px-3 py-2 flex items-center justify-between space-x-3 select-none">
      <div className="flex items-center space-x-2 shrink-0">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span className="text-[11px] font-bold text-foreground">
          {completed}/{total} Done
        </span>
        <span className="text-[10px] font-extrabold text-accent tabular-nums">
          ({percentage}%)
        </span>
      </div>

      {/* Slim Progress Bar */}
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', damping: 20, stiffness: 120 }}
          className="h-full bg-gradient-to-r from-emerald-500 to-accent rounded-full"
        />
      </div>
    </div>
  )
}

export default CompletionProgress
