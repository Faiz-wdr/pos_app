import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Calendar, Save, Trash2, Archive } from 'lucide-react'
import { useMoneyStore } from '../store/moneyStore'
import { SavingsGoal } from '../types'
import { ActionButton } from '@/admin/components/ActionButton'
import { Input } from '@/components/ui/Input'

interface GoalModalProps {
  isOpen: boolean
  onClose: () => void
  goalToEdit?: SavingsGoal | null
}

const iconOptions = [
  { name: 'Laptop', label: 'Tech/Mac' },
  { name: 'Smartphone', label: 'Phone' },
  { name: 'Compass', label: 'Travel' },
  { name: 'Heart', label: 'Wedding/Health' },
  { name: 'Moon', label: 'Umrah/Faith' },
  { name: 'Home', label: 'Emergency Fund' },
  { name: 'Gift', label: 'Gifts' },
  { name: 'Sparkles', label: 'Future Goal' }
]

const colorOptions = [
  '#f8b518', // Accent yellow
  '#3b82f6', // Blue
  '#10b981', // Emerald green
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f97316'  // Orange
]

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  goalToEdit = null
}) => {
  const { addGoal, updateGoal, deleteGoal, settings } = useMoneyStore()
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [currentAmount, setCurrentAmount] = useState('0')
  const [targetDate, setTargetDate] = useState('')
  const [icon, setIcon] = useState('Sparkles')
  const [color, setColor] = useState('#f8b518')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      if (goalToEdit) {
        setName(goalToEdit.name)
        setTargetAmount(goalToEdit.targetAmount.toString())
        setCurrentAmount(goalToEdit.currentAmount.toString())
        setTargetDate(goalToEdit.targetDate || '')
        setIcon(goalToEdit.icon)
        setColor(goalToEdit.color)
      } else {
        setName('')
        setTargetAmount('')
        setCurrentAmount('0')
        setTargetDate('')
        setIcon('Sparkles')
        setColor(settings.defaultGoalColor || '#f8b518')
      }
      setErrorMsg(null)
    }
  }, [isOpen, goalToEdit, settings])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const targetVal = parseFloat(targetAmount)
    const currentVal = parseFloat(currentAmount)

    if (!name.trim()) {
      setErrorMsg('Please enter a goal name.')
      return
    }

    if (isNaN(targetVal) || targetVal <= 0) {
      setErrorMsg('Please enter a valid target amount greater than zero.')
      return
    }

    if (isNaN(currentVal) || currentVal < 0) {
      setErrorMsg('Please enter a valid saved amount.')
      return
    }

    const payload = {
      name: name.trim(),
      targetAmount: targetVal,
      currentAmount: currentVal,
      targetDate: targetDate || undefined,
      icon,
      color,
      archived: false
    }

    try {
      if (goalToEdit && goalToEdit.id !== undefined) {
        await updateGoal(goalToEdit.id, payload)
      } else {
        await addGoal(payload)
      }
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save goal.')
    }
  }

  const handleDelete = async () => {
    if (!goalToEdit || goalToEdit.id === undefined) return
    
    if (settings.confirmDelete) {
      if (!window.confirm(`Are you sure you want to delete the goal "${goalToEdit.name}"?`)) {
        return
      }
    }

    try {
      await deleteGoal(goalToEdit.id)
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message)
    }
  }

  const handleArchive = async () => {
    if (!goalToEdit || goalToEdit.id === undefined) return
    try {
      await updateGoal(goalToEdit.id, { archived: true })
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black z-50 cursor-pointer"
      />

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-card border-t border-border rounded-t-3xl z-50 flex flex-col max-h-[85vh] shadow-2xl select-none"
      >
        <div className="w-12 h-1 bg-muted rounded-full mx-auto my-3 shrink-0" />

        <div className="flex items-center justify-between px-6 pb-2 shrink-0">
          <h3 className="text-sm font-bold text-foreground">
            {goalToEdit ? 'Configure Goal' : 'Create Savings Goal'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 pb-8 pt-2 space-y-4 text-left">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-[10px] leading-relaxed">
              {errorMsg}
            </div>
          )}

          {/* Goal Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block px-0.5">
              Goal Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. MacBook Air"
              autoFocus
              className="h-10 bg-muted/20 border-border focus-visible:ring-accent rounded-xl text-xs"
            />
          </div>

          {/* Target Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block px-0.5">
                Target ({settings.currency})
              </label>
              <Input
                type="number"
                min="1"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="e.g. 80000"
                className="h-10 bg-muted/20 border-border focus-visible:ring-accent rounded-xl text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block px-0.5">
                Saved Initial ({settings.currency})
              </label>
              <Input
                type="number"
                min="0"
                value={currentAmount}
                disabled={!!goalToEdit}
                onChange={(e) => setCurrentAmount(e.target.value)}
                placeholder="0"
                className="h-10 bg-muted/20 border-border focus-visible:ring-accent rounded-xl text-xs font-mono disabled:opacity-60"
              />
            </div>
          </div>

          {/* Target Date */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block px-0.5">
              Target Date (Optional)
            </label>
            <div className="relative flex items-center">
              <Calendar className="absolute left-4 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="h-10 pl-11 bg-muted/20 border-border focus-visible:ring-accent rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Color Options */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block px-0.5">
              Theme Color
            </label>
            <div className="flex flex-wrap gap-2.5">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full border border-border/40 cursor-pointer active:scale-90 transition-all flex items-center justify-center shrink-0"
                  style={{ backgroundColor: c }}
                >
                  {color === c && (
                    <span className="w-2.5 h-2.5 bg-neutral-950 dark:bg-white rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Selector Grid */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block px-0.5">
              Select Icon
            </label>
            <div className="grid grid-cols-4 gap-2">
              {iconOptions.map((opt) => {
                const isSelected = icon === opt.name
                return (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => setIcon(opt.name)}
                    className={`py-2 px-1 rounded-xl border text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-all active:scale-95 text-center ${
                      isSelected
                        ? 'bg-accent/15 border-accent text-accent'
                        : 'bg-muted/15 border-border/60 text-muted-foreground'
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 flex flex-col space-y-2.5">
            <ActionButton
              type="submit"
              icon={Save}
              className="w-full h-11 bg-accent text-black hover:bg-accent/90 border-none font-bold uppercase tracking-wider text-xs shadow-md rounded-xl cursor-pointer"
            >
              {goalToEdit ? 'Save Goal' : 'Create Goal'}
            </ActionButton>
            
            {goalToEdit && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleArchive}
                  className="h-10 bg-muted/30 hover:bg-muted/50 border border-border text-foreground rounded-xl flex items-center justify-center space-x-2 text-[10px] uppercase font-bold tracking-wider cursor-pointer transition-colors"
                >
                  <Archive className="w-4 h-4" />
                  <span>Archive Goal</span>
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="h-10 bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 text-red-500 rounded-xl flex items-center justify-center space-x-2 text-[10px] uppercase font-bold tracking-wider cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Goal</span>
                </button>
              </div>
            )}
          </div>
        </form>
      </motion.div>
    </>
  )
}

export default GoalModal
