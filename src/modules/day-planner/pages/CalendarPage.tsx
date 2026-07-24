import { useState } from 'react'
import { Plus, Calendar as CalendarIcon, Sun, Moon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getTodayKey, getTomorrowKey, formatDisplayDate } from '../utils/dateUtils'
import { useTasksForDate, useDayProgress } from '../hooks/useDayPlanner'
import { createTask, updateTask, deleteTask, toggleTaskCompleted } from '../services/plannerService'
import { PlannerTask } from '../types'
import CalendarView from '../components/CalendarView'
import TaskCard from '../components/TaskCard'
import CompletionProgress from '../components/CompletionProgress'
import EmptyState from '../components/EmptyState'
import TaskFormSheet from '../components/TaskFormSheet'
import ScheduleActionsMenu from '../components/ScheduleActionsMenu'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'

export const CalendarPage = () => {
  const [selectedDateKey, setSelectedDateKey] = useState(getTodayKey())
  const { dayName, formattedDate } = formatDisplayDate(selectedDateKey)

  const tasks = useTasksForDate(selectedDateKey)
  const progress = useDayProgress(selectedDateKey)

  const [formSheetOpen, setFormSheetOpen] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState<PlannerTask | null>(null)

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; title: string }>({
    isOpen: false,
    id: '',
    title: ''
  })

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

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
      showToast(`Updated "${data.title}"`)
    } else {
      await createTask(data)
      showToast(`Added "${data.title}"`)
    }
  }

  const handleDeleteRequest = (id: string, title: string) => {
    setDeleteConfirm({ isOpen: true, id, title })
  }

  const handleConfirmDelete = async () => {
    if (deleteConfirm.id) {
      await deleteTask(deleteConfirm.id)
      showToast(`Deleted task "${deleteConfirm.title}"`)
    }
    setDeleteConfirm({ isOpen: false, id: '', title: '' })
  }

  const todayKey = getTodayKey()
  const tomorrowKey = getTomorrowKey()

  return (
    <div className="flex-1 flex flex-col space-y-3 pb-24 text-left select-none relative">
      {/* Page Title & Quick Jump Chips */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
            Calendar View
          </span>
          <h1 className="text-lg font-extrabold text-foreground tracking-tight leading-none mt-0.5">
            Select & View Plans
          </h1>
        </div>

        {/* Quick Date Switcher Chips */}
        <div className="flex items-center space-x-1.5 bg-muted/60 p-1 rounded-xl border border-[#D9D9D9] dark:border-[#27272a]">
          <button
            type="button"
            onClick={() => setSelectedDateKey(todayKey)}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center space-x-1 ${
              selectedDateKey === todayKey
                ? 'bg-accent text-accent-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sun className="w-3 h-3" />
            <span>Today</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedDateKey(tomorrowKey)}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center space-x-1 ${
              selectedDateKey === tomorrowKey
                ? 'bg-accent text-accent-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Moon className="w-3 h-3" />
            <span>Tomorrow</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid Component */}
      <CalendarView
        selectedDateKey={selectedDateKey}
        onSelectDate={(dKey) => setSelectedDateKey(dKey)}
      />

      {/* Completion Progress for Selected Date */}
      {progress && (
        <CompletionProgress
          completed={progress.completed}
          total={progress.total}
          percentage={progress.percentage}
        />
      )}

      {/* Selected Day Timeline Section */}
      <div className="flex-1 flex flex-col space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <div className="flex flex-col">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Timeline for {dayName}
            </h2>
            <span className="text-[11px] font-extrabold text-foreground">
              {formattedDate}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <ScheduleActionsMenu
              dateKey={selectedDateKey}
              taskCount={tasks?.length || 0}
              onActionComplete={showToast}
            />
            <Button
              onClick={handleOpenAdd}
              size="sm"
              variant="primary"
              className="rounded-xl h-8 text-[11px] font-bold cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Task
            </Button>
          </div>
        </div>

        {!tasks || tasks.length === 0 ? (
          <EmptyState type="date" onAction={handleOpenAdd} />
        ) : (
          <div className="w-full rounded-2xl border border-[#D9D9D9] dark:border-[#27272a] bg-card/60 overflow-hidden shadow-xs">
            {/* Timeline Table Header */}
            <div className="flex items-center justify-between bg-muted/40 px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-[#D9D9D9] dark:border-[#27272a]">
              <div className="w-[80px] sm:w-[95px] shrink-0 text-left">Time</div>
              <div className="flex-1 px-3 text-left">Task Details</div>
              <div className="shrink-0 text-right pr-1">Category</div>
            </div>

            <AnimatePresence initial={false}>
              {tasks.map((task) => (
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
        initialDateKey={selectedDateKey}
        onSave={handleSaveTask}
      />

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

export default CalendarPage
