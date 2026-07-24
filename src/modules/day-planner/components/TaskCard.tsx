import { motion, useAnimation } from 'framer-motion'
import { Check, Clock, Trash2, Edit } from 'lucide-react'
import { PlannerTask } from '../types'
import { CategoryBadge } from './CategoryBadge'
import { formatTime, calculateDuration } from '../utils/dateUtils'
import { usePlannerSettingsStore } from '../store/plannerSettingsStore'
import { cn } from '@/shared/utils/cn'

interface TaskCardProps {
  task: PlannerTask
  onToggleComplete: () => void
  onEdit: () => void
  onDelete: () => void
}

export const TaskCard = ({ task, onToggleComplete, onEdit, onDelete }: TaskCardProps) => {
  const { timeFormat } = usePlannerSettingsStore()
  const controls = useAnimation()

  const formattedStartTime = formatTime(task.startTime, timeFormat)
  const durationStr = calculateDuration(task.startTime, task.endTime)

  const handleDragEnd = async (_: any, info: any) => {
    const swipeThreshold = 65

    // Swipe Right (Toggle completion status)
    if (info.offset.x > swipeThreshold) {
      if ('vibrate' in navigator) {
        navigator.vibrate(35)
      }
      onToggleComplete()
      controls.start({ x: 0 })
    }
    // Swipe Left (Show Edit & Delete actions)
    else if (info.offset.x < -swipeThreshold) {
      controls.start({ x: -100 })
    }
    // Snap back
    else {
      controls.start({ x: 0 })
    }
  }

  const closeActions = () => {
    controls.start({ x: 0 })
  }

  return (
    <div className="relative w-full overflow-hidden select-none">
      {/* Background Swipe Actions Layer */}
      <div className="absolute inset-0 flex justify-between items-center text-xs font-bold pointer-events-none">
        {/* Swipe Right Action Indicator */}
        <div className="flex items-center pl-4 bg-emerald-500/10 dark:bg-emerald-500/5 text-emerald-500 h-full w-1/2 justify-start">
          <Check className="w-5 h-5 mr-2 stroke-[2.5]" />
          <span>{task.completed ? 'Mark Active' : 'Complete Task'}</span>
        </div>

        {/* Swipe Left Action Buttons */}
        <div className="flex items-center justify-end h-full w-1/2 bg-red-500/5 pointer-events-auto">
          <button
            onClick={() => {
              onEdit()
              closeActions()
            }}
            className="flex items-center justify-center bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 w-12 h-full cursor-pointer transition-colors"
            title="Edit task"
            aria-label="Edit task"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              onDelete()
              closeActions()
            }}
            className="flex items-center justify-center bg-red-500/10 hover:bg-red-500/25 text-red-500 w-12 h-full cursor-pointer transition-colors"
            title="Delete task"
            aria-label="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -110, right: 90 }}
        dragElastic={{ left: 0.15, right: 0.35 }}
        onDragEnd={handleDragEnd}
        animate={controls}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative bg-card w-full flex items-stretch cursor-pointer transition-colors z-10 border-b border-[#D9D9D9] dark:border-[#27272a]"
      >
        {/* Column 1: Time & Duration Column (Table Cell with Right Border) */}
        <div className="w-[80px] sm:w-[95px] px-3 py-3 border-r border-[#D9D9D9] dark:border-[#27272a] bg-muted/20 flex flex-col justify-center shrink-0">
          <span className={cn(
            'text-xs font-normal text-muted-foreground tabular-nums tracking-tight',
            task.completed ? 'line-through opacity-60' : ''
          )}>
            {formattedStartTime}
          </span>
          {durationStr && (
            <span className="text-[10px] text-muted-foreground/60 font-normal flex items-center mt-0.5">
              <Clock className="w-2.5 h-2.5 mr-0.5 shrink-0" />
              <span>{durationStr}</span>
            </span>
          )}
        </div>

        {/* Column 2: Task Details Column (Minimal) */}
        <div className="flex-1 min-w-0 px-3.5 py-3 flex items-center">
          {/* Title & Notes */}
          <div className="flex flex-col min-w-0 space-y-0.5 flex-1">
            <h3 className={cn(
              'text-xs sm:text-sm font-bold tracking-tight whitespace-normal break-words leading-snug',
              task.completed ? 'text-muted-foreground line-through' : 'text-foreground'
            )}>
              {task.title}
            </h3>
            {task.notes && (
              <p className="text-[10px] sm:text-[11px] text-muted-foreground/80 font-medium whitespace-normal break-words leading-tight mt-0.5">
                {task.notes}
              </p>
            )}
          </div>
        </div>

        {/* Column 3: Category Badge (Minimal) */}
        <div className="px-3 py-3 flex items-center justify-end shrink-0">
          <CategoryBadge category={task.category} className={task.completed ? 'opacity-70' : ''} />
        </div>
      </motion.div>
    </div>
  )
}

export default TaskCard
