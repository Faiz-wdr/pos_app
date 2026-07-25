import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BellRing, Check, X, Clock } from 'lucide-react'
import { useReminderAlertStore } from '../store/reminderAlertStore'
import { toggleTaskCompleted } from '../services/plannerService'
import { stopTaskAlarm } from '../services/audioService'

export const TaskReminderAlertModal: React.FC = () => {
  const { activeTask, dismissAlert } = useReminderAlertStore()

  if (!activeTask) return null

  const handleDismiss = () => {
    stopTaskAlarm()
    dismissAlert()
  }

  const handleMarkDone = async () => {
    stopTaskAlarm()
    if (activeTask.id) {
      await toggleTaskCompleted(activeTask.id)
    }
    dismissAlert()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 select-none"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="bg-card border border-border/80 w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center space-y-4"
        >
          {/* Pulsing ring animation */}
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            className="w-20 h-20 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center text-accent shadow-xl"
          >
            <BellRing className="w-10 h-10 animate-bounce" />
          </motion.div>

          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent flex items-center justify-center space-x-1">
              <Clock className="w-3 h-3 mr-1" />
              Task Reminder • {activeTask.startTime}
            </span>
            <h2 className="text-xl font-extrabold text-foreground tracking-tight leading-tight">
              {activeTask.title}
            </h2>
            {activeTask.notes && (
              <p className="text-xs text-muted-foreground max-w-xs mt-1 leading-relaxed">
                {activeTask.notes}
              </p>
            )}
          </div>

          <div className="flex w-full space-x-2.5 pt-2">
            <button
              onClick={handleMarkDone}
              className="flex-1 py-3 bg-accent text-accent-foreground font-bold text-xs rounded-2xl flex items-center justify-center space-x-1.5 cursor-pointer shadow-md hover:opacity-90 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Mark Done</span>
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 py-3 bg-muted border border-border/60 hover:bg-card text-foreground font-bold text-xs rounded-2xl flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <X className="w-4 h-4" />
              <span>Dismiss</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default TaskReminderAlertModal
