import { useState } from 'react'
import { Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getTodayKey, getTomorrowKey, formatDisplayDate, getGreeting } from '../utils/dateUtils'
import { useTasksForDate, useDayProgress } from '../hooks/useDayPlanner'
import { createTask, updateTask, deleteTask, toggleTaskCompleted } from '../services/plannerService'
import { usePlannerSettingsStore } from '../store/plannerSettingsStore'
import { PlannerTask } from '../types'
import TaskCard from '../components/TaskCard'
import CompletionProgress from '../components/CompletionProgress'
import EmptyState from '../components/EmptyState'
import TaskFormSheet from '../components/TaskFormSheet'
import ScheduleActionsMenu from '../components/ScheduleActionsMenu'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export const TodayPage = () => {
  const todayKey = getTodayKey()
  const [activeDateKey, setActiveDateKey] = useState(todayKey)
  const { dayName, formattedDate } = formatDisplayDate(activeDateKey)
  const greeting = getGreeting()
  const { showCompletedTasks } = usePlannerSettingsStore()

  const tasks = useTasksForDate(activeDateKey)
  const progress = useDayProgress(activeDateKey)

  const [formSheetOpen, setFormSheetOpen] = useState(false)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState<PlannerTask | null>(null)
  const [showCompletedList, setShowCompletedList] = useState(true)

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; title: string }>({
    isOpen: false,
    id: '',
    title: ''
  })

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  if (!tasks || !progress) {
    return (
      <div className="flex-1 flex flex-col space-y-4 p-4 animate-pulse">
        <div className="w-48 h-6 bg-muted rounded-xl" />
        <div className="w-full h-24 bg-muted rounded-2xl" />
        <div className="w-full h-16 bg-muted rounded-2xl" />
      </div>
    )
  }

  const activeTasks = tasks.filter((t) => !t.completed)
  const completedTasks = tasks.filter((t) => t.completed)

  const handleOpenAdd = () => {
    setTaskToEdit(null)
    setFormSheetOpen(true)
  }

  const handleOpenEdit = (task: PlannerTask) => {
    setTaskToEdit(task)
    setFormSheetOpen(true)
  }

  const handleSaveTask = async (data: Omit<PlannerTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (taskToEdit) {
      await updateTask(taskToEdit.id, data)
    } else {
      await createTask(data)
    }
  }

  const handleDeleteRequest = (id: string, title: string) => {
    setDeleteConfirm({ isOpen: true, id, title })
  }

  const handleConfirmDelete = async () => {
    if (deleteConfirm.id) {
      await deleteTask(deleteConfirm.id)
    }
    setDeleteConfirm({ isOpen: false, id: '', title: '' })
  }

  return (
    <div className="flex-1 flex flex-col space-y-3 pb-24 text-left select-none relative">
      {/* Header Greeting & Clickable Date Header */}
      <div className="flex flex-col">
        <button
          type="button"
          onClick={() => setDatePickerOpen(true)}
          className="group flex items-center space-x-1 text-[10px] font-bold text-accent uppercase tracking-wider cursor-pointer hover:opacity-90 w-fit"
          title="Click to select any date"
        >
          <span>{dayName}, {formattedDate}</span>
          <ChevronDown className="w-3 h-3 text-accent shrink-0 opacity-70 group-hover:opacity-100" />
        </button>
        <h1 className="text-lg font-extrabold text-foreground tracking-tight leading-none mt-0.5">
          {greeting}
        </h1>
      </div>

      {/* Completion Progress Bar */}
      <CompletionProgress
        completed={progress.completed}
        total={progress.total}
        percentage={progress.percentage}
      />

      {/* Timeline Section */}
      <div className="flex-1 flex flex-col space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Timeline ({activeTasks.length})
          </h2>
          <ScheduleActionsMenu
            dateKey={activeDateKey}
            taskCount={tasks.length}
            onActionComplete={showToast}
          />
        </div>

        {activeTasks.length === 0 && completedTasks.length === 0 ? (
          <EmptyState type="today" onAction={handleOpenAdd} />
        ) : (
          <div className="w-full rounded-2xl border border-[#D9D9D9] dark:border-[#27272a] bg-card/60 overflow-hidden shadow-xs">
            {/* Timeline Table Header */}
            <div className="flex items-center justify-between bg-muted/40 px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-[#D9D9D9] dark:border-[#27272a]">
              <div className="w-[80px] sm:w-[95px] shrink-0 text-left">Time</div>
              <div className="flex-1 px-3 text-left">Task Details</div>
              <div className="shrink-0 text-right pr-1">Category</div>
            </div>

            <AnimatePresence initial={false}>
              {activeTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <TaskCard
                    task={task}
                    onToggleComplete={() => toggleTaskCompleted(task.id)}
                    onEdit={() => handleOpenEdit(task)}
                    onDelete={() => handleDeleteRequest(task.id, task.title)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Completed Tasks Collapsible Section */}
        {showCompletedTasks && completedTasks.length > 0 && (
          <div className="pt-4 space-y-3 border-t border-border/50">
            <button
              onClick={() => setShowCompletedList(!showCompletedList)}
              className="flex items-center justify-between w-full text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer px-1"
            >
              <span>Completed Tasks ({completedTasks.length})</span>
              {showCompletedList ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showCompletedList && (
              <div className="w-full rounded-2xl border border-[#D9D9D9] dark:border-[#27272a] bg-card/60 overflow-hidden shadow-xs">
                {completedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={() => toggleTaskCompleted(task.id)}
                    onEdit={() => handleOpenEdit(task)}
                    onDelete={() => handleDeleteRequest(task.id, task.title)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) for Quick Add - Fixed Above Bottom Navigation Bar */}
      <div className="fixed bottom-20 right-5 z-50">
        <button
          onClick={handleOpenAdd}
          className="w-12 h-12 rounded-full bg-accent text-accent-foreground shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer focus-visible:outline-2 focus-visible:outline-accent"
          aria-label="Quick Add Task"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>
      </div>

      {/* Task Form Bottom Sheet */}
      <TaskFormSheet
        isOpen={formSheetOpen}
        onClose={() => setFormSheetOpen(false)}
        taskToEdit={taskToEdit}
        initialDateKey={activeDateKey}
        onSave={handleSaveTask}
      />

      {/* Select Date Dialog */}
      <Dialog
        isOpen={datePickerOpen}
        onClose={() => setDatePickerOpen(false)}
        title="Jump to Date"
        description="Select any date to view and manage its timeline schedule."
      >
        <div className="space-y-4 pt-2 pb-2 text-left">
          {/* Quick Presets */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Quick Switch
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveDateKey(todayKey)
                  setDatePickerOpen(false)
                }}
                className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  activeDateKey === todayKey
                    ? 'bg-accent text-accent-foreground border-accent'
                    : 'bg-muted/50 border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveDateKey(getTomorrowKey())
                  setDatePickerOpen(false)
                }}
                className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  activeDateKey === getTomorrowKey()
                    ? 'bg-accent text-accent-foreground border-accent'
                    : 'bg-muted/50 border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                Tomorrow
              </button>
            </div>
          </div>

          {/* Custom Date Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Or Choose Custom Date
            </label>
            <Input
              type="date"
              value={activeDateKey}
              onChange={(e) => {
                if (e.target.value) {
                  setActiveDateKey(e.target.value)
                  setDatePickerOpen(false)
                }
              }}
              className="font-semibold text-xs h-10 rounded-xl"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDatePickerOpen(false)}
              className="cursor-pointer font-bold text-xs rounded-xl"
            >
              Close
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '', title: '' })}
        title="Delete Task"
        description={`Are you sure you want to delete "${deleteConfirm.title}"?`}
      >
        <div className="pt-2 flex justify-end space-x-3 select-none">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setDeleteConfirm({ isOpen: false, id: '', title: '' })}
            className="cursor-pointer font-bold text-xs rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="cursor-pointer font-bold text-xs rounded-xl bg-red-500 hover:bg-red-600 text-white border-0"
            onClick={handleConfirmDelete}
          >
            Delete
          </Button>
        </div>
      </Dialog>

      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background text-xs font-bold px-4 py-2 rounded-full shadow-lg pointer-events-none select-none"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TodayPage
