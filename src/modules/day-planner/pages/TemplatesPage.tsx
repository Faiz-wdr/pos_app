import { useState } from 'react'
import { Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAllTemplates } from '../hooks/useDayPlanner'
import {
  createTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
  applyTemplateToDate
} from '../services/plannerService'
import { PlannerTemplate } from '../types'
import { getTodayKey, getTomorrowKey } from '../utils/dateUtils'
import TemplateCard from '../components/TemplateCard'
import EmptyState from '../components/EmptyState'
import TemplateFormSheet from '../components/TemplateFormSheet'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export const TemplatesPage = () => {
  const templates = useAllTemplates()

  const [formSheetOpen, setFormSheetOpen] = useState(false)
  const [templateToEdit, setTemplateToEdit] = useState<PlannerTemplate | null>(null)

  // Apply template dialog state
  const [applyDialog, setApplyDialog] = useState<{
    isOpen: boolean
    template: PlannerTemplate | null
    targetDateKey: string
  }>({
    isOpen: false,
    template: null,
    targetDateKey: getTodayKey()
  })

  // Delete confirm dialog
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: ''
  })

  // Notification message
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  if (!templates) {
    return (
      <div className="flex-1 flex flex-col space-y-4 p-4 animate-pulse">
        <div className="w-48 h-6 bg-muted rounded-xl" />
        <div className="w-full h-32 bg-muted rounded-2xl" />
        <div className="w-full h-32 bg-muted rounded-2xl" />
      </div>
    )
  }

  const handleOpenAdd = () => {
    setTemplateToEdit(null)
    setFormSheetOpen(true)
  }

  const handleOpenEdit = (t: PlannerTemplate) => {
    setTemplateToEdit(t)
    setFormSheetOpen(true)
  }

  const handleSaveTemplate = async (data: Omit<PlannerTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (templateToEdit) {
      await updateTemplate(templateToEdit.id, data)
      showToast(`Updated template "${data.name}"`)
    } else {
      await createTemplate(data)
      showToast(`Created template "${data.name}"`)
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateTemplate(id)
      showToast('Template duplicated successfully')
    } catch (e) {
      console.error(e)
    }
  }

  const handleDeleteRequest = (id: string, name: string) => {
    setDeleteConfirm({ isOpen: true, id, name })
  }

  const handleConfirmDelete = async () => {
    if (deleteConfirm.id) {
      await deleteTemplate(deleteConfirm.id)
      showToast(`Deleted template "${deleteConfirm.name}"`)
    }
    setDeleteConfirm({ isOpen: false, id: '', name: '' })
  }

  const handleOpenApply = (t: PlannerTemplate) => {
    setApplyDialog({
      isOpen: true,
      template: t,
      targetDateKey: getTodayKey()
    })
  }

  const handleConfirmApply = async () => {
    if (!applyDialog.template) return
    const addedCount = await applyTemplateToDate(
      applyDialog.template.id,
      applyDialog.targetDateKey
    )
    showToast(`Added ${addedCount} tasks to schedule for ${applyDialog.targetDateKey}`)
    setApplyDialog({ isOpen: false, template: null, targetDateKey: getTodayKey() })
  }

  return (
    <div className="flex-1 flex flex-col space-y-3 pb-24 text-left select-none relative">
      {/* Header & New Template Button */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
            Reusable Routines
          </span>
          <h1 className="text-lg font-extrabold text-foreground tracking-tight leading-none mt-0.5">
            Schedule Templates
          </h1>
        </div>

        <Button
          onClick={handleOpenAdd}
          size="sm"
          variant="primary"
          className="rounded-xl h-9 font-bold text-xs cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4 mr-1" />
          New Template
        </Button>
      </div>

      {/* Templates List Grid */}
      {templates.length === 0 ? (
        <EmptyState type="templates" onAction={handleOpenAdd} />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence initial={false}>
            {templates.map((tpl) => (
              <motion.div
                key={tpl.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <TemplateCard
                  template={tpl}
                  onApply={() => handleOpenApply(tpl)}
                  onEdit={() => handleOpenEdit(tpl)}
                  onDuplicate={() => handleDuplicate(tpl.id)}
                  onDelete={() => handleDeleteRequest(tpl.id, tpl.name)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Form Sheet for Create / Edit Template */}
      <TemplateFormSheet
        isOpen={formSheetOpen}
        onClose={() => setFormSheetOpen(false)}
        templateToEdit={templateToEdit}
        onSave={handleSaveTemplate}
      />

      {/* Apply Template Dialog */}
      <Dialog
        isOpen={applyDialog.isOpen}
        onClose={() => setApplyDialog({ isOpen: false, template: null, targetDateKey: getTodayKey() })}
        title="Apply Template to Day"
        description={`Instantly populate tasks from "${applyDialog.template?.name}" to your schedule.`}
      >
        <div className="space-y-4 pt-2 pb-2 text-left select-none">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setApplyDialog((prev) => ({ ...prev, targetDateKey: getTodayKey() }))}
              className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                applyDialog.targetDateKey === getTodayKey()
                  ? 'bg-accent text-accent-foreground border-accent'
                  : 'bg-muted/50 border-border text-muted-foreground'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setApplyDialog((prev) => ({ ...prev, targetDateKey: getTomorrowKey() }))}
              className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                applyDialog.targetDateKey === getTomorrowKey()
                  ? 'bg-accent text-accent-foreground border-accent'
                  : 'bg-muted/50 border-border text-muted-foreground'
              }`}
            >
              Tomorrow
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Or Choose Target Date
            </label>
            <Input
              type="date"
              value={applyDialog.targetDateKey}
              onChange={(e) => setApplyDialog((prev) => ({ ...prev, targetDateKey: e.target.value }))}
              className="font-semibold text-xs h-10 rounded-xl"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setApplyDialog({ isOpen: false, template: null, targetDateKey: getTodayKey() })}
              className="cursor-pointer font-bold text-xs rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleConfirmApply}
              className="cursor-pointer font-bold text-xs rounded-xl shadow-xs"
            >
              Apply to Schedule
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '', name: '' })}
        title="Delete Template"
        description={`Are you sure you want to delete template "${deleteConfirm.name}"?`}
      >
        <div className="pt-2 flex justify-end space-x-3 select-none">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setDeleteConfirm({ isOpen: false, id: '', name: '' })}
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

export default TemplatesPage
