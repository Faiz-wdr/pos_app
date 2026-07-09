import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Copy, ShoppingBag, Check, X } from 'lucide-react'
import { useShoppingList, useShoppingItems } from '../hooks/useShopping'
import { useShoppingSettingsStore } from '../store/settingsStore'
import { duplicateShoppingList } from '../services/shoppingService'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export const HistoryDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!id) {
    return <div className="p-5 text-center font-bold">List ID is required</div>
  }

  // DB queries
  const list = useShoppingList(id)
  const items = useShoppingItems(id) || []
  const { currency, showEstimatedPrice, showActualPrice } = useShoppingSettingsStore()

  // Calculations
  const totalItems = items.length
  const purchasedCount = items.filter((i) => i.purchased).length
  const remainingCount = totalItems - purchasedCount
  const pct = totalItems > 0 ? Math.round((purchasedCount / totalItems) * 100) : 0

  const estimatedTotal = items.reduce((sum, item) => {
    return sum + (item.quantity * (item.expectedPrice || 0))
  }, 0)

  const actualTotal = items.reduce((sum, item) => {
    const price = item.purchased 
      ? (item.actualPrice !== undefined ? item.actualPrice : (item.expectedPrice || 0))
      : (item.expectedPrice || 0)
    return sum + (item.quantity * price)
  }, 0)

  const handleDuplicate = async () => {
    try {
      const newListId = await duplicateShoppingList(id)
      navigate(`/modules/shopping/list/${newListId}`)
    } catch (err) {
      console.error(err)
    }
  }

  if (!list) {
    return (
      <div className="flex-1 flex items-center justify-center p-5 text-center font-bold text-muted-foreground">
        Loading historical details...
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col justify-between w-full h-full relative select-none pb-20 overflow-hidden text-left">
      
      {/* Top Header Controls Bar */}
      <header className="flex items-center justify-between w-full px-5 py-4 shrink-0 bg-background/90 dark:bg-background/80 backdrop-blur-xs border-b border-border/40 z-30 select-none">
        <Link 
          to="/modules/shopping" 
          className="p-2 rounded-full hover:bg-card border border-border/20 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          aria-label="Back to shopping dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="flex flex-col items-center max-w-[50%]">
          <h1 className="text-sm font-black text-foreground tracking-tight leading-tight line-clamp-1">{list.name}</h1>
          <span className="text-[10px] font-bold text-muted-foreground mt-0.5 uppercase tracking-wider">
            Completed {new Date(list.updatedAt).toLocaleDateString()}
          </span>
        </div>

        <button
          onClick={handleDuplicate}
          className="p-2 rounded-full hover:bg-card border border-border/20 text-accent hover:text-accent/80 transition-all cursor-pointer"
          title="Duplicate to new active list"
        >
          <Copy className="w-5 h-5" />
        </button>
      </header>

      {/* Main content body */}
      <div className="flex-1 flex flex-col px-5 pt-4 overflow-y-auto select-text">
        
        {/* Summary card section */}
        <div className="space-y-4 mb-5 shrink-0">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase">
            <span>Historical Stats</span>
            <span>{pct}% Completed</span>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-muted/30 dark:bg-muted/10 p-3 rounded-2xl border border-border/20 text-center text-xs">
            <div className="flex flex-col">
              <span className="text-muted-foreground font-bold text-[9px] uppercase tracking-wider">Total Items</span>
              <span className="font-extrabold text-foreground mt-0.5">{totalItems}</span>
            </div>
            <div className="flex flex-col border-x border-border/40">
              <span className="text-muted-foreground font-bold text-[9px] uppercase tracking-wider">Purchased</span>
              <span className="font-extrabold text-emerald-500 mt-0.5">{purchasedCount}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground font-bold text-[9px] uppercase tracking-wider">Remaining</span>
              <span className="font-extrabold text-red-500 mt-0.5">{remainingCount}</span>
            </div>
          </div>

          {/* Pricing detail cards */}
          <div className="grid grid-cols-2 gap-3 text-xs font-semibold select-none pt-1">
            <Card className="bg-muted/20 border-border/50 p-3 flex flex-col items-center">
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Budget Estimate</span>
              <span className="font-bold text-foreground mt-0.5 tabular-nums">{currency}{estimatedTotal.toFixed(2)}</span>
            </Card>
            <Card className="bg-accent/5 border-accent/25 p-3 flex flex-col items-center">
              <span className="text-[9px] text-accent uppercase tracking-wider">Actual Spent</span>
              <span className="font-black text-accent mt-0.5 tabular-nums">{currency}{actualTotal.toFixed(2)}</span>
            </Card>
          </div>
        </div>

        <hr className="border-border/60 mb-4" />

        {/* Read-Only Items List */}
        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center select-none py-10">
            <Card className="border-dashed border-border bg-transparent shadow-none w-full py-8 text-center">
              <CardContent className="pt-0 flex flex-col items-center justify-center space-y-2">
                <ShoppingBag className="w-5 h-5 text-muted-foreground/60" />
                <span className="text-xs font-bold text-foreground">No Items Recorded</span>
                <span className="text-[11px] text-muted-foreground max-w-[200px]">
                  This completed session was empty.
                </span>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-2.5 pb-8 select-none">
            {items.map((item) => (
              <div 
                key={item.id}
                className="flex items-center justify-between p-3.5 bg-muted/40 dark:bg-card/20 rounded-xl border border-border/40"
              >
                <div className="flex items-center space-x-3.5 flex-1 min-w-0 pr-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    item.purchased 
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' 
                      : 'border-border bg-card text-muted-foreground'
                  }`}>
                    {item.purchased ? <Check className="w-3 h-3 stroke-[3]" /> : <X className="w-2.5 h-2.5" />}
                  </div>

                  <div className="flex flex-col text-left min-w-0">
                    <span className={`text-sm font-semibold truncate leading-tight ${
                      item.purchased ? 'line-through text-muted-foreground/75 opacity-70' : 'text-foreground'
                    }`}>
                      {item.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold mt-0.5 uppercase tracking-wider">
                      {item.quantity} {item.unit}
                      {item.notes && <span className="lowercase font-bold text-muted-foreground/70 ml-1">({item.notes})</span>}
                    </span>
                  </div>
                </div>

                <div className="flex items-center shrink-0 text-xs">
                  {item.purchased && showActualPrice && item.actualPrice !== undefined ? (
                    <span className="font-extrabold text-emerald-500 tabular-nums">
                      {currency}{(item.quantity * item.actualPrice).toFixed(2)}
                    </span>
                  ) : showEstimatedPrice && item.expectedPrice !== undefined ? (
                    <span className="font-semibold text-muted-foreground tabular-nums">
                      {currency}{(item.quantity * item.expectedPrice).toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-[10px]">--</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer duplicate button */}
      <footer className="absolute bottom-0 left-0 right-0 z-35 bg-background border-t border-border/80 px-5 py-4 shrink-0 select-none shadow-2xl">
        <Button
          onClick={handleDuplicate}
          variant="primary"
          className="w-full h-11 text-xs font-black uppercase tracking-wider rounded-2xl cursor-pointer"
        >
          <Copy className="w-4 h-4 mr-2" />
          Duplicate to Active List
        </Button>
      </footer>

    </div>
  )
}
export default HistoryDetailPage
