import { useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createShoppingList } from '../services/shoppingService'

interface CreateListDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreated: (id: string) => void
}

export const CreateListDialog = ({ isOpen, onClose, onCreated }: CreateListDialogProps) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName || isSubmitting) return

    setIsSubmitting(true)
    try {
      const id = await createShoppingList(trimmedName, description.trim() || undefined)
      setName('')
      setDescription('')
      onCreated(id)
      onClose()
    } catch (err) {
      console.error('Failed to create shopping list:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create Shopping List"
      description="Enter a name and optional description for your new shopping session."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-left">
        <div className="space-y-1">
          <label htmlFor="list-name" className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
            List Name *
          </label>
          <Input
            id="list-name"
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Weekly Groceries, Party Supplies"
            className="w-full text-sm font-semibold"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="list-desc" className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
            Description
          </label>
          <textarea
            id="list-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional notes or details..."
            rows={3}
            className="w-full px-3.5 py-2.5 bg-card border border-border/80 rounded-xl text-sm font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-accent resize-none transition-colors"
          />
        </div>

        <div className="pt-2 flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="cursor-pointer font-bold text-xs rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!name.trim() || isSubmitting}
            className="cursor-pointer font-bold text-xs rounded-xl"
          >
            {isSubmitting ? 'Creating...' : 'Create & Open'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
export default CreateListDialog
