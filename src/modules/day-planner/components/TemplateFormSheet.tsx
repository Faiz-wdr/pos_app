import { useState, useEffect } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Plus, Trash2 } from 'lucide-react'
import { PlannerTemplate, TemplateItem, TaskCategory } from '../types'

interface TemplateFormSheetProps {
  isOpen: boolean
  onClose: () => void
  templateToEdit?: PlannerTemplate | null
  onSave: (templateData: Omit<PlannerTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void
}

const CATEGORIES: TaskCategory[] = ['Personal', 'Study', 'Work', 'Health', 'Family', 'Other']

export const TemplateFormSheet = ({
  isOpen,
  onClose,
  templateToEdit,
  onSave
}: TemplateFormSheetProps) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<TaskCategory>('Personal')
  const [items, setItems] = useState<TemplateItem[]>([
    { title: '', startTime: '09:00', endTime: '10:00', category: 'Personal', repeat: 'Daily', reminder: '10 Minutes Before' }
  ])

  useEffect(() => {
    if (templateToEdit) {
      setName(templateToEdit.name)
      setDescription(templateToEdit.description || '')
      setCategory(templateToEdit.category)
      setItems(templateToEdit.items && templateToEdit.items.length > 0 ? templateToEdit.items : [
        { title: '', startTime: '09:00', endTime: '10:00', category: 'Personal', repeat: 'Daily', reminder: '10 Minutes Before' }
      ])
    } else {
      setName('')
      setDescription('')
      setCategory('Personal')
      setItems([
        { title: '', startTime: '09:00', endTime: '10:00', category: 'Personal', repeat: 'Daily', reminder: '10 Minutes Before' }
      ])
    }
  }, [templateToEdit, isOpen])

  const handleAddItem = () => {
    setItems([
      ...items,
      { title: '', startTime: '10:00', endTime: '11:00', category: category, repeat: 'Daily', reminder: '10 Minutes Before' }
    ])
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: keyof TemplateItem, value: any) => {
    const next = [...items]
    next[index] = { ...next[index], [field]: value }
    setItems(next)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const validItems = items.filter((i) => i.title.trim().length > 0)
    if (validItems.length === 0) return

    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      category,
      items: validItems
    })

    onClose()
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={templateToEdit ? 'Edit Template' : 'Create Template'}
      description="Define reusable routine task sets you can apply to any date."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1 pb-4 text-left select-none">
        {/* Name Input */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Template Name *
          </label>
          <Input
            type="text"
            placeholder="e.g. Study Day Routine, Gym Routine..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="font-semibold text-sm h-11 rounded-xl"
            autoFocus
            required
          />
        </div>

        {/* Description & Category */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Description (Optional)
            </label>
            <Input
              type="text"
              placeholder="Short note..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="font-medium text-xs h-10 rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Primary Category
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

        {/* Template Routine Tasks Section */}
        <div className="space-y-2 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Routine Tasks ({items.length})
            </label>
            <Button
              type="button"
              onClick={handleAddItem}
              variant="secondary"
              size="sm"
              className="h-7 text-[10px] font-bold rounded-lg cursor-pointer"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Task
            </Button>
          </div>

          <div className="space-y-2.5 max-h-[35vh] overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div key={idx} className="p-3 bg-muted/40 border border-border/50 rounded-xl space-y-2">
                <div className="flex items-center justify-between space-x-2">
                  <Input
                    type="text"
                    placeholder={`Task ${idx + 1} Title`}
                    value={item.title}
                    onChange={(e) => handleItemChange(idx, 'title', e.target.value)}
                    className="font-semibold text-xs h-9 rounded-lg flex-1"
                    required
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="time"
                    value={item.startTime}
                    onChange={(e) => handleItemChange(idx, 'startTime', e.target.value)}
                    className="font-semibold text-[11px] h-8 rounded-lg"
                  />
                  <Input
                    type="time"
                    value={item.endTime}
                    onChange={(e) => handleItemChange(idx, 'endTime', e.target.value)}
                    className="font-semibold text-[11px] h-8 rounded-lg"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
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
            disabled={!name.trim() || items.every((i) => !i.title.trim())}
            className="cursor-pointer font-bold text-xs rounded-xl h-10 px-5 shadow-sm"
          >
            {templateToEdit ? 'Update Template' : 'Save Template'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

export default TemplateFormSheet
