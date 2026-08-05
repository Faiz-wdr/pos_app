import { useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Switch } from '@/components/ui/Switch'
import { useShoppingSettingsStore } from '../store/settingsStore'
import { ShoppingSortType } from '../types'
import { ChevronRight } from 'lucide-react'

interface ShoppingSettingsDialogProps {
  isOpen: boolean
  onClose: () => void
}

export const ShoppingSettingsDialog = ({ isOpen, onClose }: ShoppingSettingsDialogProps) => {
  const {
    defaultSort, setDefaultSort,
    defaultUnit, setDefaultUnit,
    currency, setCurrency,
    showEstimatedPrice, setShowEstimatedPrice,
    showActualPrice, setShowActualPrice,
    confirmDelete, setConfirmDelete
  } = useShoppingSettingsStore()

  // Sub-dialog selector states
  const [activeSubDialog, setActiveSubDialog] = useState<'currency' | 'sort' | 'unit' | null>(null)

  const currencyOptions = [
    { value: '$', label: 'Dollar ($)' },
    { value: '€', label: 'Euro (€)' },
    { value: '£', label: 'Pound (£)' },
    { value: '₹', label: 'Rupee (₹)' },
    { value: '¥', label: 'Yen/Yuan (¥)' }
  ]

  const sortOptions: { value: ShoppingSortType; label: string }[] = [
    { value: 'manual', label: 'Manual Drag & Drop' },
    { value: 'alpha', label: 'Alphabetical (A-Z)' },
    { value: 'purchased-last', label: 'Unpurchased First' },
    { value: 'recent', label: 'Recently Added First' }
  ]

  const unitOptions = [
    'Piece', 'Kg', 'Gram', 'Liter', 'ml', 'Pack', 'Bottle', 'Box', 'Dozen', 'Meter', 'Feet'
  ]

  const getCurrencyLabel = (val: string) => {
    const opt = currencyOptions.find(o => o.value === val)
    return opt ? opt.label : val
  }

  const getSortLabel = (val: ShoppingSortType) => {
    const opt = sortOptions.find(o => o.value === val)
    return opt ? opt.label : val
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Shopping Settings"
    >
      <div className="space-y-4 pt-2 pb-1 select-none text-left">
        
        {/* General Options Card */}
        <div className="bg-card/30 border border-border/40 rounded-2xl overflow-hidden divide-y divide-border/30">
          {/* Default Currency */}
          <div 
            onClick={() => setActiveSubDialog('currency')}
            className="flex justify-between items-center h-12 px-4 hover:bg-muted/40 transition-colors cursor-pointer"
          >
            <span className="text-xs font-bold text-foreground">Default Currency</span>
            <div className="flex items-center space-x-1.5 text-muted-foreground">
              <span className="text-xs font-medium">{getCurrencyLabel(currency)}</span>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </div>
          </div>

          {/* Default Sorting */}
          <div 
            onClick={() => setActiveSubDialog('sort')}
            className="flex justify-between items-center h-12 px-4 hover:bg-muted/40 transition-colors cursor-pointer"
          >
            <span className="text-xs font-bold text-foreground">List Sorting</span>
            <div className="flex items-center space-x-1.5 text-muted-foreground">
              <span className="text-xs font-medium">{getSortLabel(defaultSort)}</span>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </div>
          </div>

          {/* Default Unit */}
          <div 
            onClick={() => setActiveSubDialog('unit')}
            className="flex justify-between items-center h-12 px-4 hover:bg-muted/40 transition-colors cursor-pointer"
          >
            <span className="text-xs font-bold text-foreground">Default Quantity Unit</span>
            <div className="flex items-center space-x-1.5 text-muted-foreground">
              <span className="text-xs font-medium">{defaultUnit}</span>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </div>
          </div>
        </div>

        {/* Switches Card */}
        <div className="bg-card/30 border border-border/40 rounded-2xl overflow-hidden divide-y divide-border/30">
          {/* Show Estimated Price */}
          <div className="flex items-center justify-between h-12 px-4">
            <span className="text-xs font-bold text-foreground">Show Estimated Price</span>
            <Switch checked={showEstimatedPrice} onCheckedChange={setShowEstimatedPrice} />
          </div>

          {/* Show Actual Price */}
          <div className="flex items-center justify-between h-12 px-4">
            <span className="text-xs font-bold text-foreground">Show Actual Price</span>
            <Switch checked={showActualPrice} onCheckedChange={setShowActualPrice} />
          </div>

          {/* Confirm Delete */}
          <div className="flex items-center justify-between h-12 px-4">
            <span className="text-xs font-bold text-foreground">Confirm Deletions</span>
            <Switch checked={confirmDelete} onCheckedChange={setConfirmDelete} />
          </div>
        </div>

      </div>

      {/* Sub-Dialog: Currency */}
      <Dialog
        isOpen={activeSubDialog === 'currency'}
        onClose={() => setActiveSubDialog(null)}
        title="Default Currency"
      >
        <div className="space-y-1.5 pt-2">
          {currencyOptions.map((opt) => {
            const isSelected = currency === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setCurrency(opt.value)
                  setActiveSubDialog(null)
                }}
                className={`w-full flex items-center justify-between h-12 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-accent bg-accent/5 text-foreground' 
                    : 'border-border/60 bg-card/40 text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-accent" />}
              </button>
            )
          })}
        </div>
      </Dialog>

      {/* Sub-Dialog: Sort */}
      <Dialog
        isOpen={activeSubDialog === 'sort'}
        onClose={() => setActiveSubDialog(null)}
        title="List Sorting"
      >
        <div className="space-y-1.5 pt-2">
          {sortOptions.map((opt) => {
            const isSelected = defaultSort === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setDefaultSort(opt.value)
                  setActiveSubDialog(null)
                }}
                className={`w-full flex items-center justify-between h-12 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-accent bg-accent/5 text-foreground' 
                    : 'border-border/60 bg-card/40 text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-accent" />}
              </button>
            )
          })}
        </div>
      </Dialog>

      {/* Sub-Dialog: Unit */}
      <Dialog
        isOpen={activeSubDialog === 'unit'}
        onClose={() => setActiveSubDialog(null)}
        title="Default Quantity Unit"
      >
        <div className="space-y-1.5 pt-2 max-h-[50vh] overflow-y-auto pr-1">
          {unitOptions.map((unit) => {
            const isSelected = defaultUnit === unit
            return (
              <button
                key={unit}
                onClick={() => {
                  setDefaultUnit(unit)
                  setActiveSubDialog(null)
                }}
                className={`w-full flex items-center justify-between h-12 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-accent bg-accent/5 text-foreground' 
                    : 'border-border/60 bg-card/40 text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                }`}
              >
                <span>{unit}</span>
                {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-accent" />}
              </button>
            )
          })}
        </div>
      </Dialog>

    </Dialog>
  )
}
export default ShoppingSettingsDialog
