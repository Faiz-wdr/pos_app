import { useState, useEffect } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PlannerTask, TaskCategory, RepeatOption, ReminderOption, CustomDay } from '../types'
import { usePlannerSettingsStore } from '../store/plannerSettingsStore'
import { getTodayKey } from '../utils/dateUtils'

import { applyPresetRoutineToDate } from '../services/plannerService'

interface TaskFormSheetProps {
  isOpen: boolean
  onClose: () => void
  taskToEdit?: PlannerTask | null
  initialDateKey?: string
  onSave: (taskData: Omit<PlannerTask, 'id' | 'createdAt' | 'updatedAt'>) => void
}

const CATEGORIES: TaskCategory[] = ['Personal', 'Study', 'Work', 'Health', 'Family', 'Other']
const REPEAT_OPTIONS: RepeatOption[] = ['Never', 'Daily', 'Weekdays', 'Weekends', 'Weekly', 'Monthly', 'Yearly', 'Custom Days']
const REMINDER_OPTIONS: ReminderOption[] = ['At Time', '5 Minutes Before', '10 Minutes Before', '30 Minutes Before', '1 Hour Before', '1 Day Before']
const ALL_CUSTOM_DAYS: CustomDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const TaskFormSheet = ({
  isOpen,
  onClose,
  taskToEdit,
  initialDateKey,
  onSave
}: TaskFormSheetProps) => {
  const { defaultCategory, defaultReminder } = usePlannerSettingsStore()

  const [title, setTitle] = useState('')
  const [date, setDate] = useState(initialDateKey || getTodayKey())
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [category, setCategory] = useState<TaskCategory>(defaultCategory)
  const [repeat, setRepeat] = useState<RepeatOption>('Never')
  const [customDays, setCustomDays] = useState<CustomDay[]>([])
  const [reminder, setReminder] = useState<ReminderOption>(defaultReminder)
  const [notes, setNotes] = useState('')
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title)
      setDate(taskToEdit.date)
      setStartTime(taskToEdit.startTime)
      setEndTime(taskToEdit.endTime)
      setCategory(taskToEdit.category)
      setRepeat(taskToEdit.repeat)
      setCustomDays(taskToEdit.customDays || [])
      setReminder(taskToEdit.reminder)
      setNotes(taskToEdit.notes || '')
      setCompleted(taskToEdit.completed)
    } else {
      setTitle('')
      setDate(initialDateKey || getTodayKey())
      setStartTime('09:00')
      setEndTime('10:00')
      setCategory(defaultCategory)
      setRepeat('Never')
      setCustomDays([])
      setReminder(defaultReminder)
      setNotes('')
      setCompleted(false)
    }
  }, [taskToEdit, initialDateKey, isOpen, defaultCategory, defaultReminder])

  const toggleCustomDay = (day: CustomDay) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onSave({
      title: title.trim(),
      date,
      startTime,
      endTime,
      category,
      repeat,
      customDays: repeat === 'Custom Days' ? customDays : undefined,
      reminder,
      notes: notes.trim() || undefined,
      completed
    })

    onClose()
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? 'Edit Task' : 'Quick Add Task'}
      description={taskToEdit ? 'Update details for your scheduled task.' : undefined}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1 pb-4 text-left select-none">
        {/* Prebuilt 1-Day Routine Selector */}
        {!taskToEdit && (
          <div className="space-y-1.5 p-3 rounded-xl bg-muted/30 border border-border/50">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Routine Preset
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={async () => {
                  await applyPresetRoutineToDate('Student', date)
                  onClose()
                }}
                className="py-2 px-3 text-xs font-bold rounded-xl bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all cursor-pointer text-center flex items-center justify-center"
              >
                Student
              </button>

              <button
                type="button"
                onClick={async () => {
                  await applyPresetRoutineToDate('Freelancer', date)
                  onClose()
                }}
                className="py-2 px-3 text-xs font-bold rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20 transition-all cursor-pointer text-center flex items-center justify-center"
              >
                Freelancer
              </button>
            </div>
          </div>
        )}
        {/* Title Input */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Task Title *
          </label>
          <Input
            type="text"
            placeholder="e.g. Morning Workout, College Lecture..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-semibold text-sm h-11 rounded-xl"
            autoFocus
            required
          />
        </div>

        {/* Date & Category Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Date
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="font-semibold text-xs h-10 rounded-xl"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TaskCategory)}
              className="w-full h-10 px-3 font-semibold text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Start Time & End Time */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Start Time
            </label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="font-semibold text-xs h-10 rounded-xl"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              End Time
            </label>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="font-semibold text-xs h-10 rounded-xl"
              required
            />
          </div>
        </div>

        {/* Repeat & Reminder Options */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Repeat
            </label>
            <select
              value={repeat}
              onChange={(e) => setRepeat(e.target.value as RepeatOption)}
              className="w-full h-10 px-3 font-semibold text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {REPEAT_OPTIONS.map((rep) => (
                <option key={rep} value={rep}>
                  {rep}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Reminder
            </label>
            <select
              value={reminder}
              onChange={(e) => setReminder(e.target.value as ReminderOption)}
              className="w-full h-10 px-3 font-semibold text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {REMINDER_OPTIONS.map((rem) => (
                <option key={rem} value={rem}>
                  {rem}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Days (shown only if Repeat is Custom Days) */}
        {repeat === 'Custom Days' && (
          <div className="space-y-1.5 pt-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Select Days
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_CUSTOM_DAYS.map((day) => {
                const isSelected = customDays.includes(day)
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleCustomDay(day)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-accent text-accent-foreground shadow-xs'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {day.substring(0, 3)}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Notes (Optional) */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Notes (Optional)
          </label>
          <Input
            type="text"
            placeholder="Add details, links, or location..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="font-medium text-xs h-10 rounded-xl"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-3 flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="cursor-pointer font-bold text-xs rounded-xl h-10 px-4"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!title.trim()}
            className="cursor-pointer font-bold text-xs rounded-xl h-10 px-5 shadow-sm"
          >
            {taskToEdit ? 'Update Task' : 'Save Task'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

export default TaskFormSheet
