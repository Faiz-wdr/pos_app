import { useState, useEffect } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { addShoppingItem, updateShoppingItem, addCustomUnit } from '../services/shoppingService'
import { ShoppingItem } from '../types'
import { useShoppingSettingsStore } from '../store/settingsStore'
import { useCustomUnits } from '../hooks/useShopping'

interface AddItemDrawerProps {
  isOpen: boolean
  onClose: () => void
  listId: string
  editItem?: ShoppingItem | null
}

const COMMON_UNITS = ['Piece', 'Kg', 'Gram', 'Pack', 'Box', 'Bottle']

export const AddItemDrawer = ({ isOpen, onClose, listId, editItem }: AddItemDrawerProps) => {
  const { defaultUnit, currency, showEstimatedPrice } = useShoppingSettingsStore()
  const customUnits = useCustomUnits() || []

  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [selectedUnit, setSelectedUnit] = useState('')
  const [customUnitInput, setCustomUnitInput] = useState('')
  const [showCustomUnitForm, setShowCustomUnitForm] = useState(false)
  const [expectedPrice, setExpectedPrice] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Populate data if editing
  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setName(editItem.name)
        setQuantity(editItem.quantity)
        setNotes(editItem.notes || '')
        setExpectedPrice(editItem.expectedPrice !== undefined ? String(editItem.expectedPrice) : '')

        if (COMMON_UNITS.includes(editItem.unit)) {
          setSelectedUnit(editItem.unit)
          setShowCustomUnitForm(false)
        } else {
          setSelectedUnit('Custom')
          setCustomUnitInput(editItem.unit)
          setShowCustomUnitForm(true)
        }
      } else {
        // Defaults for new item
        setName('')
        setQuantity(1)
        setNotes('')
        setExpectedPrice('')
        setSelectedUnit(defaultUnit)
        setCustomUnitInput('')
        setShowCustomUnitForm(!COMMON_UNITS.includes(defaultUnit))
      }
    }
  }, [isOpen, editItem, defaultUnit])

  const handleUnitSelect = (unit: string) => {
    setSelectedUnit(unit)
    if (unit === 'Custom') {
      setShowCustomUnitForm(true)
    } else {
      setShowCustomUnitForm(false)
    }
  }

  const handleQtyAdjust = (amount: number) => {
    setQuantity((q) => Math.max(1, q + amount))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName || isSubmitting) return

    setIsSubmitting(true)
    try {
      const finalUnit = selectedUnit === 'Custom' ? customUnitInput.trim() : selectedUnit
      const finalPrice = expectedPrice.trim() ? parseFloat(expectedPrice) : undefined

      if (selectedUnit === 'Custom' && finalUnit) {
        await addCustomUnit(finalUnit)
      }

      if (editItem) {
        // Edit item details
        await updateShoppingItem(editItem.id, {
          name: trimmedName,
          quantity,
          unit: finalUnit || 'Piece',
          expectedPrice: finalPrice,
          notes: notes.trim() || undefined
        })
      } else {
        // Add new item details
        await addShoppingItem({
          listId,
          name: trimmedName,
          quantity,
          unit: finalUnit || 'Piece',
          expectedPrice: finalPrice,
          notes: notes.trim() || undefined
        })
      }

      onClose()
    } catch (err) {
      console.error('Failed to save item:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const combinedUnits = Array.from(new Set([...COMMON_UNITS, ...customUnits]))

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={editItem ? 'Edit Item' : 'Quick Add Item'}
      description={editItem ? 'Modify details of your shopping item.' : 'Quickly add an item to your active shopping list.'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-left pb-2 select-none">
        
        {/* Name input */}
        <div className="space-y-1">
          <label htmlFor="item-name" className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
            Item Name *
          </label>
          <Input
            id="item-name"
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Milk, Apples, Bread"
            className="w-full font-semibold"
          />
        </div>

        {/* Quantity and Expected Price */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Quantity Selector */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Quantity
            </label>
            <div className="flex items-center space-x-2 bg-muted/60 border border-border/50 p-1.5 rounded-xl justify-between h-12">
              <button
                type="button"
                onClick={() => handleQtyAdjust(-1)}
                className="w-9 h-9 bg-background hover:bg-card border border-border text-foreground font-bold text-base rounded-lg flex items-center justify-center cursor-pointer active:scale-95 transition-all"
              >
                -
              </button>
              <span className="text-sm font-bold w-8 text-center tabular-nums">{quantity}</span>
              <button
                type="button"
                onClick={() => handleQtyAdjust(1)}
                className="w-9 h-9 bg-background hover:bg-card border border-border text-foreground font-bold text-base rounded-lg flex items-center justify-center cursor-pointer active:scale-95 transition-all"
              >
                +
              </button>
            </div>
          </div>

          {/* Expected Price */}
          {showEstimatedPrice && (
            <div className="space-y-1">
              <label htmlFor="item-price" className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Price ({currency})
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground text-xs font-bold pointer-events-none">
                  {currency}
                </span>
                <Input
                  id="item-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={expectedPrice}
                  onChange={(e) => setExpectedPrice(e.target.value)}
                  placeholder="Expected"
                  className="pl-7 font-semibold"
                />
              </div>
            </div>
          )}
        </div>

        {/* Units Chips */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
            Measurement Unit
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {combinedUnits.map((unit) => {
              const isSelected = selectedUnit === unit && !showCustomUnitForm
              return (
                <button
                  type="button"
                  key={unit}
                  onClick={() => handleUnitSelect(unit)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-accent text-accent-foreground border-accent'
                      : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-muted-foreground/30 active:scale-95'
                  }`}
                >
                  {unit}
                </button>
              )
            })}
            <button
              type="button"
              onClick={() => handleUnitSelect('Custom')}
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                showCustomUnitForm
                  ? 'bg-accent text-accent-foreground border-accent'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground active:scale-95'
              }`}
            >
              Other...
            </button>
          </div>
        </div>

        {/* Custom Unit Input */}
        {showCustomUnitForm && (
          <div className="space-y-1">
            <label htmlFor="custom-unit" className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Enter Custom Unit
            </label>
            <Input
              id="custom-unit"
              type="text"
              required
              value={customUnitInput}
              onChange={(e) => setCustomUnitInput(e.target.value)}
              placeholder="e.g. Tub, Dozen, Metres"
              className="w-full font-bold"
            />
          </div>
        )}

        {/* Optional Notes */}
        <div className="space-y-1">
          <label htmlFor="item-notes" className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
            Notes
          </label>
          <Input
            id="item-notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Brand, flavor, organic"
            className="w-full font-semibold"
          />
        </div>

        {/* Buttons */}
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
            disabled={!name.trim() || (selectedUnit === 'Custom' && !customUnitInput.trim()) || isSubmitting}
            className="cursor-pointer font-bold text-xs rounded-xl"
          >
            {isSubmitting ? 'Saving...' : editItem ? 'Save Changes' : 'Add Item'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
export default AddItemDrawer
