import React from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary'
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}) => {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4 pt-2 text-left">
        <div className="flex items-start space-x-3 p-3 bg-muted/20 border border-border/40 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            {message}
          </p>
        </div>
        
        <div className="flex space-x-3 justify-end pt-1">
          <Button variant="secondary" onClick={onClose} className="h-9 text-xs rounded-xl cursor-pointer">
            {cancelText}
          </Button>
          <Button 
            variant={variant} 
            onClick={handleConfirm} 
            className="h-9 text-xs rounded-xl cursor-pointer font-bold"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

export default ConfirmDialog
