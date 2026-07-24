import { useState } from 'react'
import {
  MoreVertical,
  Trash2,
  Copy,
  Calendar,
  Repeat,
  Sparkles,
  Check
} from 'lucide-react'
import {
  clearTasksForDate,
  copyScheduleToDate,
  bulkSetScheduleRepeat,
  saveDateAsTemplate
} from '../services/plannerService'
import { getTomorrowKey } from '../utils/dateUtils'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface ScheduleActionsMenuProps {
  dateKey: string
  taskCount: number
  onActionComplete?: (message: string) => void
}

export const ScheduleActionsMenu = ({
  dateKey,
  taskCount,
  onActionComplete
}: ScheduleActionsMenuProps) => {
  const [menuOpen, setMenuOpen] = useState(false)

  // Dialog States
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false)
  const [copyDateOpen, setCopyDateOpen] = useState(false)
  const [targetCopyDate, setTargetCopyDate] = useState(getTomorrowKey())
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false)
  const [templateName, setTemplateName] = useState('')

  const handleClearAll = async () => {
    const count = await clearTasksForDate(dateKey)
    setClearConfirmOpen(false)
    setMenuOpen(false)
    onActionComplete?.(`Cleared ${count} tasks from schedule`)
  }

  const handleCopyToTomorrow = async () => {
    const tomorrowKey = getTomorrowKey()
    const count = await copyScheduleToDate(dateKey, tomorrowKey)
    setMenuOpen(false)
    onActionComplete?.(`Copied ${count} tasks to Tomorrow (${tomorrowKey})`)
  }

  const handleConfirmCopyToDate = async () => {
    if (!targetCopyDate) return
    const count = await copyScheduleToDate(dateKey, targetCopyDate)
    setCopyDateOpen(false)
    setMenuOpen(false)
    onActionComplete?.(`Copied ${count} tasks to ${targetCopyDate}`)
  }

  const handleSetRepeat = async (repeatOption: 'Daily' | 'Weekdays') => {
    const count = await bulkSetScheduleRepeat(dateKey, repeatOption)
    setMenuOpen(false)
    onActionComplete?.(`Updated repeat rule to "${repeatOption}" for ${count} tasks`)
  }

  const handleSaveAsTemplate = async () => {
    if (!templateName.trim()) return
    try {
      await saveDateAsTemplate(dateKey, templateName.trim())
      setSaveTemplateOpen(false)
      setMenuOpen(false)
      setTemplateName('')
      onActionComplete?.(`Saved schedule as template "${templateName.trim()}"`)
    } catch (err: any) {
      console.error(err)
    }
  }

  if (taskCount === 0) return null

  return (
    <div className="relative inline-block select-none">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        title="Schedule Options"
        aria-label="Schedule Options"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {/* Backdrop */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Action Dropdown Menu */}
      {menuOpen && (
        <div className="absolute right-0 mt-1 w-52 bg-card border border-border shadow-lg rounded-xl z-50 p-1 space-y-0.5 text-left animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50">
            Schedule Options
          </div>

          {/* Copy to Tomorrow */}
          <button
            type="button"
            onClick={handleCopyToTomorrow}
            className="w-full px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted rounded-lg flex items-center space-x-2 cursor-pointer transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>Copy to Tomorrow</span>
          </button>

          {/* Copy to Specific Date */}
          <button
            type="button"
            onClick={() => setCopyDateOpen(true)}
            className="w-full px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted rounded-lg flex items-center space-x-2 cursor-pointer transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>Copy to Target Date...</span>
          </button>

          {/* Repeat Options */}
          <button
            type="button"
            onClick={() => handleSetRepeat('Daily')}
            className="w-full px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted rounded-lg flex items-center space-x-2 cursor-pointer transition-colors"
          >
            <Repeat className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Repeat Everyday</span>
          </button>

          <button
            type="button"
            onClick={() => handleSetRepeat('Weekdays')}
            className="w-full px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted rounded-lg flex items-center space-x-2 cursor-pointer transition-colors"
          >
            <Repeat className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Repeat Weekdays</span>
          </button>

          {/* Save as Template */}
          <button
            type="button"
            onClick={() => {
              setTemplateName(`Schedule (${dateKey})`)
              setSaveTemplateOpen(true)
            }}
            className="w-full px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted rounded-lg flex items-center space-x-2 cursor-pointer transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
            <span>Save as Template</span>
          </button>

          <hr className="border-border/50 my-0.5" />

          {/* Clear All */}
          <button
            type="button"
            onClick={() => setClearConfirmOpen(true)}
            className="w-full px-2.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/10 rounded-lg flex items-center space-x-2 cursor-pointer transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" />
            <span>Clear All Tasks</span>
          </button>
        </div>
      )}

      {/* Clear All Confirm Dialog */}
      <Dialog
        isOpen={clearConfirmOpen}
        onClose={() => setClearConfirmOpen(false)}
        title="Clear Schedule?"
        description={`This will permanently remove all ${taskCount} tasks scheduled for ${dateKey}.`}
      >
        <div className="pt-3 flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setClearConfirmOpen(false)}
            className="cursor-pointer font-bold text-xs rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClearAll}
            className="cursor-pointer font-bold text-xs rounded-xl bg-red-500 hover:bg-red-600 text-white border-0"
          >
            Clear All
          </Button>
        </div>
      </Dialog>

      {/* Copy to Custom Date Dialog */}
      <Dialog
        isOpen={copyDateOpen}
        onClose={() => setCopyDateOpen(false)}
        title="Copy Timeline to Date"
        description="Duplicate all tasks from this timeline to another date."
      >
        <div className="space-y-4 pt-2 pb-2 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Select Target Date
            </label>
            <Input
              type="date"
              value={targetCopyDate}
              onChange={(e) => setTargetCopyDate(e.target.value)}
              className="font-semibold text-xs h-10 rounded-xl"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCopyDateOpen(false)}
              className="cursor-pointer font-bold text-xs rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleConfirmCopyToDate}
              className="cursor-pointer font-bold text-xs rounded-xl shadow-xs"
            >
              Copy Schedule
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Save as Template Dialog */}
      <Dialog
        isOpen={saveTemplateOpen}
        onClose={() => setSaveTemplateOpen(false)}
        title="Save Day as Template"
        description="Save all tasks in this timeline into your Template library for future use."
      >
        <div className="space-y-4 pt-2 pb-2 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Template Name *
            </label>
            <Input
              type="text"
              placeholder="e.g. My Perfect Monday, Exam Day Routine..."
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="font-semibold text-xs h-10 rounded-xl"
              autoFocus
              required
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setSaveTemplateOpen(false)}
              className="cursor-pointer font-bold text-xs rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSaveAsTemplate}
              disabled={!templateName.trim()}
              className="cursor-pointer font-bold text-xs rounded-xl shadow-xs"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              Save Template
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default ScheduleActionsMenu
