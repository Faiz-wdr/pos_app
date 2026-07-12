import { Dialog } from '@/components/ui/Dialog'
import { Switch } from '@/components/ui/Switch'
import { useShoppingSettingsStore } from '../store/settingsStore'
import { ShoppingSortType } from '../types'

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
    'Piece',
    'Kg',
    'Gram',
    'Liter',
    'ml',
    'Pack',
    'Bottle',
    'Box',
    'Dozen',
    'Meter',
    'Feet'
  ]

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Shopping List Settings"
      description="Configure default behaviors, currency symbols, and price layouts."
    >
      <div className="space-y-5 pt-2 pb-1 select-none text-left">
        
        {/* Currency setting */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Currency Symbol</label>
          <div className="grid grid-cols-5 gap-1.5 bg-muted/65 p-1 rounded-xl border border-border/50">
            {currencyOptions.map((opt) => {
              const isSelected = currency === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setCurrency(opt.value)}
                  className={`py-2 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-accent text-accent-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground active:scale-[0.98]'
                  }`}
                >
                  {opt.value}
                </button>
              )
            })}
          </div>
        </div>

        <hr className="border-border/60" />

        {/* Default Sort */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Default Sorting</label>
          <div className="flex flex-col space-y-1.5">
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDefaultSort(opt.value)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  defaultSort === opt.value 
                    ? 'border-accent bg-accent/5 text-foreground' 
                    : 'border-border bg-card/45 text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{opt.label}</span>
                {defaultSort === opt.value && (
                  <span className="w-2 h-2 rounded-full bg-accent" />
                )}
              </button>
            ))}
          </div>
        </div>

        <hr className="border-border/60" />

        {/* Default Unit */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Default Unit</label>
          <select
            value={defaultUnit}
            onChange={(e) => setDefaultUnit(e.target.value)}
            className="w-full px-3 py-2.5 bg-card border border-border/80 rounded-xl text-xs font-bold text-foreground focus-visible:outline-2 focus-visible:outline-accent"
          >
            {unitOptions.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>

        <hr className="border-border/60" />

        {/* Pricing Switches */}
        <div className="space-y-3.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Pricing & Safeties</label>

          {/* Show Expected Price */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-0.5">
              <span className="text-sm font-semibold">Show Estimated Price</span>
              <span className="text-xs text-muted-foreground">Enable budgeted price inputs</span>
            </div>
            <Switch checked={showEstimatedPrice} onCheckedChange={setShowEstimatedPrice} />
          </div>

          {/* Show Actual Price */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-0.5">
              <span className="text-sm font-semibold">Show Actual Price</span>
              <span className="text-xs text-muted-foreground">Enable checkout price inputs</span>
            </div>
            <Switch checked={showActualPrice} onCheckedChange={setShowActualPrice} />
          </div>

          {/* Confirm Delete */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-0.5">
              <span className="text-sm font-semibold">Confirm Deletions</span>
              <span className="text-xs text-muted-foreground">Request confirmation pop-ups</span>
            </div>
            <Switch checked={confirmDelete} onCheckedChange={setConfirmDelete} />
          </div>
        </div>

      </div>
    </Dialog>
  )
}
export default ShoppingSettingsDialog
