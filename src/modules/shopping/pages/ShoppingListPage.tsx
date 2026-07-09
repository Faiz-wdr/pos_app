import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Search, ArrowUpDown,
  ShoppingBag, ClipboardCheck, ArrowUp, ArrowDown, Sparkles
} from 'lucide-react'
import { useShoppingList, useShoppingItems } from '../hooks/useShopping'
import { useSearchSort } from '../hooks/useSearchSort'
import { useShoppingSettingsStore } from '../store/settingsStore'
import { 
  updateShoppingItem, deleteShoppingItem, addShoppingItem, 
  completeShoppingList, createTemplateFromList, addCustomUnit
} from '../services/shoppingService'
import SwipeableItem from '../components/SwipeableItem'
import AddItemDrawer from '../components/AddItemDrawer'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Dialog } from '@/components/ui/Dialog'
import { db } from '../database/db'


export const ShoppingListPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!id) {
    return <div className="p-5 text-center font-bold">List ID is required</div>
  }

  // Modals state
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBy, setFilterBy] = useState<'all' | 'remaining' | 'purchased'>('all')

  // Inline rename & quick add state
  const [isEditingName, setIsEditingName] = useState(false)
  const [tempName, setTempName] = useState('')
  const [newItemName, setNewItemName] = useState('')

  // Custom dialogs state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    description: string
    onConfirm: () => void
    confirmText?: string
    variant?: 'primary' | 'danger'
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  })

  const [promptDialog, setPromptDialog] = useState<{
    isOpen: boolean
    title: string
    description: string
    value: string
    placeholder?: string
    onConfirm: (val: string) => void
  }>({
    isOpen: false,
    title: '',
    description: '',
    value: '',
    onConfirm: () => {},
  })

  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean
    title: string
    description: string
  }>({
    isOpen: false,
    title: '',
    description: ''
  })

  // Core settings store
  const { 
    defaultSort, currency, showEstimatedPrice, 
    showActualPrice, confirmDelete, defaultUnit 
  } = useShoppingSettingsStore()
  const [sortBy, setSortBy] = useState(defaultSort)
  const animationsEnabled = useSettingsStore((state) => state.animationsEnabled)

  // DB queries
  const list = useShoppingList(id)
  const items = useShoppingItems(id) || []

  // Custom search/sort hook
  const processedItems = useSearchSort({
    items,
    searchQuery,
    sortBy,
    filterBy
  })

  // Calculate pricing summaries
  const totalItems = items.length
  const purchasedCount = items.filter((i) => i.purchased).length
  const remainingCount = totalItems - purchasedCount

  const estimatedTotal = items.reduce((sum, item) => {
    return sum + (item.quantity * (item.expectedPrice || 0))
  }, 0)

  const actualTotal = items.reduce((sum, item) => {
    const price = item.purchased 
      ? (item.actualPrice !== undefined ? item.actualPrice : (item.expectedPrice || 0))
      : (item.expectedPrice || 0)
    return sum + (item.quantity * price)
  }, 0)

  const budgetDiff = estimatedTotal - actualTotal

  // Actions
  const handleSaveName = async () => {
    const trimmed = tempName.trim()
    if (trimmed && list) {
      await db.shoppingLists.update(id, { name: trimmed })
    }
    setIsEditingName(false)
  }

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newItemName.trim()
    if (!trimmed) return

    let finalName = trimmed
    let qty = 1
    let unit = defaultUnit || 'Piece'
    let price: number | undefined = undefined

    if (trimmed.includes(',')) {
      const parts = trimmed.split(',')
      finalName = parts[0]?.trim() || ''
      
      const parsedQty = parseFloat(parts[1]?.trim() || '')
      if (!isNaN(parsedQty)) {
        qty = parsedQty
      }

      const parsedUnit = parts[2]?.trim()
      if (parsedUnit) {
        const lower = parsedUnit.toLowerCase()
        if (lower === 'ltr' || lower === 'liters' || lower === 'litre' || lower === 'litres') {
          unit = 'litre'
        } else if (lower === 'pcs' || lower === 'pc' || lower === 'piece' || lower === 'pieces') {
          unit = 'Piece'
        } else if (lower === 'kg' || lower === 'kgs' || lower === 'kilogram' || lower === 'kilograms') {
          unit = 'Kg'
        } else if (lower === 'gm' || lower === 'gms' || lower === 'g' || lower === 'gram' || lower === 'grams') {
          unit = 'Gram'
        } else if (lower === 'pkt' || lower === 'pkts' || lower === 'pack' || lower === 'packs') {
          unit = 'Pack'
        } else if (lower === 'box' || lower === 'boxes') {
          unit = 'Box'
        } else if (lower === 'bot' || lower === 'bottle' || lower === 'bottles') {
          unit = 'Bottle'
        } else {
          unit = parsedUnit
          // Register custom unit asynchronously in background
          await addCustomUnit(parsedUnit)
        }
      }

      const parsedPrice = parseFloat(parts[3]?.trim() || '')
      if (!isNaN(parsedPrice)) {
        price = parsedPrice
      }
    }

    if (!finalName) return

    await addShoppingItem({
      listId: id,
      name: finalName,
      quantity: qty,
      unit: unit,
      expectedPrice: price
    })
    setNewItemName('')
  }

  const handleTogglePurchase = async (itemId: string, currentStatus: boolean) => {
    // If marking purchased, we can default actualPrice to expectedPrice
    const item = items.find((i) => i.id === itemId)
    if (!item) return

    const updates: any = { purchased: !currentStatus }
    if (!currentStatus) {
      // Toggled to purchased
      updates.actualPrice = item.actualPrice !== undefined ? item.actualPrice : (item.expectedPrice || 0)
    }

    await updateShoppingItem(itemId, updates)
  }

  const handleUpdateActualPrice = async (itemId: string, priceStr: string) => {
    const price = priceStr.trim() ? parseFloat(priceStr) : undefined
    await updateShoppingItem(itemId, { actualPrice: price })
  }

  const handleDeleteItem = (itemId: string, name: string) => {
    if (confirmDelete) {
      setConfirmDialog({
        isOpen: true,
        title: 'Delete Item',
        description: `Are you sure you want to delete "${name}"?`,
        confirmText: 'Delete',
        variant: 'danger',
        onConfirm: async () => {
          await deleteShoppingItem(itemId)
        }
      })
    } else {
      deleteShoppingItem(itemId).catch(console.error)
    }
  }

  const handleDuplicateItem = async (item: any) => {
    await addShoppingItem({
      listId: item.listId,
      name: `${item.name} (Copy)`,
      quantity: item.quantity,
      unit: item.unit,
      expectedPrice: item.expectedPrice,
      notes: item.notes
    })
  }

  const handleManualReorder = async (itemId: string, direction: 'up' | 'down') => {
    const currentItem = items.find((i) => i.id === itemId)
    if (!currentItem) return

    const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder)
    const index = sorted.findIndex((i) => i.id === itemId)

    if (direction === 'up' && index > 0) {
      const prevItem = sorted[index - 1]
      await updateShoppingItem(currentItem.id, { sortOrder: prevItem.sortOrder })
      await updateShoppingItem(prevItem.id, { sortOrder: currentItem.sortOrder })
    } else if (direction === 'down' && index < sorted.length - 1) {
      const nextItem = sorted[index + 1]
      await updateShoppingItem(currentItem.id, { sortOrder: nextItem.sortOrder })
      await updateShoppingItem(nextItem.id, { sortOrder: currentItem.sortOrder })
    }
  }

  const handleSaveAsTemplate = () => {
    if (!list) return
    setPromptDialog({
      isOpen: true,
      title: 'Save as Template',
      description: 'Save this list configuration as a reusable grocery template:',
      value: `${list.name} Template`,
      placeholder: 'Template Name',
      onConfirm: async (val) => {
        try {
          await createTemplateFromList(id, val)
          setAlertDialog({
            isOpen: true,
            title: 'Template Saved',
            description: `"${val}" has been successfully saved to your templates library.`
          })
        } catch (err) {
          console.error(err)
        }
      }
    })
  }

  const handleCompleteSession = async () => {
    if (!list) return
    
    const completeAction = async () => {
      try {
        await completeShoppingList(id)
        navigate('/modules/shopping')
      } catch (err) {
        console.error(err)
      }
    }

    if (totalItems > 0 && remainingCount > 0) {
      setConfirmDialog({
        isOpen: true,
        title: 'Finish Shopping?',
        description: `You still have ${remainingCount} items remaining. Finish shopping and archive this list?`,
        confirmText: 'Finish & Archive',
        variant: 'primary',
        onConfirm: completeAction
      })
    } else {
      await completeAction()
    }
  }

  if (!list) {
    return (
      <div className="flex-1 flex items-center justify-center p-5 text-center font-bold text-muted-foreground">
        Loading shopping session...
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col justify-between w-full h-full relative select-none pb-28 overflow-hidden text-left">
      
      {/* Top Controls Header */}
      <header className="flex items-center justify-between w-full px-5 py-4 shrink-0 bg-background/90 dark:bg-background/80 backdrop-blur-xs border-b border-border/40 z-30 select-none">
        <Link 
          to="/modules/shopping" 
          className="p-2 rounded-full hover:bg-card border border-border/20 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          aria-label="Back to shopping dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="flex flex-col items-center max-w-[50%] select-text">
          {isEditingName ? (
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              autoFocus
              className="bg-card border border-border px-2 py-0.5 rounded-lg text-xs font-black text-foreground text-center focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            />
          ) : (
            <h1 
              onClick={() => { setTempName(list.name); setIsEditingName(true); }}
              className="text-sm font-black text-foreground tracking-tight leading-tight line-clamp-1 cursor-pointer hover:text-accent flex items-center space-x-1"
              title="Click to rename list"
            >
              <span>{list.name}</span>
            </h1>
          )}
          <span className="text-[10px] font-bold text-muted-foreground mt-0.5 uppercase tracking-wider select-none">
            {purchasedCount}/{totalItems} items
          </span>
        </div>

        <button
          onClick={handleSaveAsTemplate}
          className="p-2 rounded-full hover:bg-card border border-border/20 text-accent hover:text-accent/80 transition-all cursor-pointer flex items-center space-x-1 focus-visible:outline-2 focus-visible:outline-accent"
          title="Save as Template"
        >
          <Sparkles className="w-4 h-4" />
        </button>
      </header>

      {/* Main Items View */}
      <div className="flex-1 flex flex-col px-5 pt-4 overflow-y-auto select-text">
        
        {/* Search, Sort, Filter Segment */}
        <div className="space-y-3.5 mb-4 shrink-0 select-none">
          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border/80 rounded-xl text-base sm:text-sm font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-accent transition-colors"
            />
          </div>

          {/* Inline filters */}
          <div className="flex items-center justify-between">
            {/* Filter Toggle Switcher */}
            <div className="flex bg-muted/60 p-0.5 rounded-lg border border-border/60 text-[10px] font-bold">
              <button
                onClick={() => setFilterBy('all')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  filterBy === 'all' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterBy('remaining')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  filterBy === 'remaining' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground'
                }`}
              >
                Remaining
              </button>
              <button
                onClick={() => setFilterBy('purchased')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  filterBy === 'purchased' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground'
                }`}
              >
                Purchased
              </button>
            </div>

            {/* Sort Toggle Selector */}
            <div className="flex items-center space-x-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-muted border border-border/60 rounded-lg px-2 py-0.5 text-[10px] font-black text-foreground cursor-pointer focus-visible:outline-2 focus-visible:outline-accent hover:border-muted-foreground/30 transition-all select-none"
              >
                <option value="manual">Manual Order</option>
                <option value="alpha">Alphabetical</option>
                <option value="purchased-last">Unpurchased First</option>
                <option value="recent">Recently Added</option>
              </select>
            </div>
          </div>

          {/* Inline Quick Adder form */}
          <form onSubmit={handleQuickAdd} className="flex space-x-2 select-text">
            <input
              type="text"
              placeholder="Quick add product name..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="flex-1 px-3.5 py-2 bg-card border border-border/80 rounded-xl text-base sm:text-sm font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-accent transition-colors"
            />
            <Button
              type="submit"
              variant="primary"
              disabled={!newItemName.trim()}
              className="px-4 font-black text-xs rounded-xl h-10 cursor-pointer shrink-0"
            >
              Add
            </Button>
          </form>
        </div>

        {/* Dynamic Items list */}
        {processedItems.length === 0 ? (
          <div className="flex-1 flex items-center justify-center select-none py-10">
            <Card className="border-dashed border-border bg-transparent shadow-none w-full py-8 text-center">
              <CardContent className="pt-0 flex flex-col items-center justify-center space-y-2">
                <ShoppingBag className="w-5 h-5 text-muted-foreground/60" />
                <span className="text-xs font-bold text-foreground">No Items Found</span>
                <span className="text-[11px] text-muted-foreground max-w-[200px] leading-relaxed">
                  {searchQuery.trim() 
                    ? 'No shopping items match your query.' 
                    : 'Tap the "+" button below to add your first grocery item!'}
                </span>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-3 pb-8">
            <AnimatePresence initial={false}>
              {processedItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout={animationsEnabled}
                  initial={animationsEnabled ? { opacity: 0, scale: 0.96 } : { opacity: 1, scale: 1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={animationsEnabled ? { opacity: 0, scale: 0.96 } : { opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                >
                  <SwipeableItem
                    purchased={item.purchased}
                    onDelete={() => handleDeleteItem(item.id, item.name)}
                    onEdit={() => { setEditItem(item); setDrawerOpen(true); }}
                    onDuplicate={() => handleDuplicateItem(item)}
                    onTogglePurchase={() => handleTogglePurchase(item.id, item.purchased)}
                  >
                    {/* Item Card Body */}
                    <div className="flex items-center justify-between w-full pr-1.5 select-none">
                      
                      {/* Checkbox trigger circle */}
                      <div className="flex items-center space-x-3.5 flex-1 select-text">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleTogglePurchase(item.id, item.purchased)
                          }}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                            item.purchased 
                              ? 'bg-emerald-500 border-emerald-500 text-white' 
                              : 'border-border bg-card hover:border-accent active:scale-95'
                          }`}
                        >
                          {item.purchased && <Check className="w-3.5 h-3.5 stroke-[3.5]" />}
                        </button>

                        <div className="flex flex-col text-left">
                          <span 
                            onClick={() => { setEditItem(item); setDrawerOpen(true); }}
                            className={`text-sm font-bold leading-tight cursor-pointer ${
                              item.purchased 
                                ? 'line-through text-muted-foreground/60 opacity-60 font-semibold' 
                                : 'text-foreground hover:text-accent'
                            }`}
                          >
                            {item.name}
                          </span>
                          
                          <span className="text-[10px] text-muted-foreground font-semibold mt-0.5 uppercase tracking-wider">
                            {item.quantity} {item.unit}
                            {item.notes && <span className="lowercase font-bold text-muted-foreground/75 ml-1.5">({item.notes})</span>}
                          </span>
                        </div>
                      </div>

                      {/* Pricing column and manual sorting controls */}
                      <div className="flex items-center space-x-3 shrink-0">
                        {/* Inline actual price input if purchased */}
                        {showActualPrice && item.purchased && (
                          <div className="flex items-center space-x-1 select-text">
                            <span className="text-[10px] font-bold text-muted-foreground">Paid:</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="Price"
                              value={item.actualPrice !== undefined ? item.actualPrice : ''}
                              onChange={(e) => handleUpdateActualPrice(item.id, e.target.value)}
                              className="w-14 px-1.5 py-0.5 bg-muted/60 border border-border/50 text-[11px] font-bold rounded-lg text-foreground focus:ring-0 focus:outline-none tabular-nums text-right"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        )}

                        {/* Display expected price details */}
                        {!item.purchased && showEstimatedPrice && item.expectedPrice !== undefined && (
                          <span className="text-xs font-extrabold text-foreground/80 tabular-nums">
                            {currency}{(item.quantity * item.expectedPrice).toFixed(2)}
                          </span>
                        )}

                        {/* Manual reorder arrows */}
                        {sortBy === 'manual' && filterBy === 'all' && (
                          <div className="flex flex-col items-center space-y-1 bg-muted/30 p-1 rounded-lg border border-border/30">
                            <button
                              onClick={() => handleManualReorder(item.id, 'up')}
                              className="p-0.5 text-muted-foreground hover:text-foreground cursor-pointer"
                              title="Move item up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleManualReorder(item.id, 'down')}
                              className="p-0.5 text-muted-foreground hover:text-foreground cursor-pointer"
                              title="Move item down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  </SwipeableItem>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>



      {/* Sticky Bottom Summary Bar */}
      <footer className="absolute bottom-0 left-0 right-0 z-35 bg-background border-t border-border/80 px-5 pt-3 pb-4 space-y-3.5 shrink-0 select-none shadow-2xl">
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          {/* Estimated price */}
          {showEstimatedPrice && (
            <div className="flex flex-col">
              <span className="text-muted-foreground text-[9px] font-bold uppercase tracking-wider">Estimated</span>
              <span className="font-extrabold text-foreground mt-0.5 tabular-nums">{currency}{estimatedTotal.toFixed(2)}</span>
            </div>
          )}

          {/* Actual price */}
          {showActualPrice && (
            <div className="flex flex-col">
              <span className="text-muted-foreground text-[9px] font-bold uppercase tracking-wider">Actual Cost</span>
              <span className="font-black text-accent mt-0.5 tabular-nums">{currency}{actualTotal.toFixed(2)}</span>
            </div>
          )}

          {/* Difference */}
          {showEstimatedPrice && showActualPrice && (
            <div className="flex flex-col">
              <span className="text-muted-foreground text-[9px] font-bold uppercase tracking-wider">Difference</span>
              <span className={`font-black mt-0.5 tabular-nums ${
                budgetDiff >= 0 ? 'text-emerald-500' : 'text-red-500'
              }`}>
                {budgetDiff >= 0 ? '+' : ''}{currency}{budgetDiff.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Complete session */}
        <Button
          onClick={handleCompleteSession}
          variant="primary"
          className="w-full h-11 text-xs font-black uppercase tracking-wider rounded-2xl cursor-pointer"
        >
          <ClipboardCheck className="w-4 h-4 mr-2" />
          Finish Shopping
        </Button>
      </footer>

      {/* Add/Edit drawer overlay */}
      <AddItemDrawer 
        isOpen={drawerOpen} 
        onClose={() => { setDrawerOpen(false); setEditItem(null); }} 
        listId={id} 
        editItem={editItem}
      />

      {/* Custom Confirm Dialog */}
      <Dialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
      >
        <div className="pt-2 flex justify-end space-x-3 select-none">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
            className="cursor-pointer font-bold text-xs rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={confirmDialog.variant === 'danger' ? 'secondary' : 'primary'}
            className={`cursor-pointer font-black text-xs rounded-xl ${
              confirmDialog.variant === 'danger' ? 'bg-red-500 hover:bg-red-600 text-white border-0' : ''
            }`}
            onClick={() => {
              confirmDialog.onConfirm()
              setConfirmDialog(prev => ({ ...prev, isOpen: false }))
            }}
          >
            {confirmDialog.confirmText || 'Confirm'}
          </Button>
        </div>
      </Dialog>

      {/* Custom Prompt Dialog */}
      <Dialog
        isOpen={promptDialog.isOpen}
        onClose={() => setPromptDialog(prev => ({ ...prev, isOpen: false }))}
        title={promptDialog.title}
        description={promptDialog.description}
      >
        <div className="space-y-4 pt-2 text-left pb-2 select-none">
          <Input
            type="text"
            value={promptDialog.value}
            onChange={(e) => setPromptDialog(prev => ({ ...prev, value: e.target.value }))}
            placeholder={promptDialog.placeholder}
            className="w-full font-semibold"
            autoFocus
          />
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setPromptDialog(prev => ({ ...prev, isOpen: false }))}
              className="cursor-pointer font-bold text-xs rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={!promptDialog.value.trim()}
              onClick={() => {
                promptDialog.onConfirm(promptDialog.value.trim())
                setPromptDialog(prev => ({ ...prev, isOpen: false }))
              }}
              className="cursor-pointer font-black text-xs rounded-xl"
            >
              Submit
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Custom Alert Dialog */}
      <Dialog
        isOpen={alertDialog.isOpen}
        onClose={() => setAlertDialog(prev => ({ ...prev, isOpen: false }))}
        title={alertDialog.title}
        description={alertDialog.description}
      >
        <div className="pt-2 flex justify-end select-none">
          <Button
            type="button"
            variant="primary"
            onClick={() => setAlertDialog(prev => ({ ...prev, isOpen: false }))}
            className="cursor-pointer font-black text-xs rounded-xl px-5"
          >
            OK
          </Button>
        </div>
      </Dialog>
    </div>
  )
}

// Simple imported helper workaround to fix checkmark import
import { Check } from 'lucide-react'
import { useSettingsStore } from '@/core/settings/settingsStore'

export default ShoppingListPage
