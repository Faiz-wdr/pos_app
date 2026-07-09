import { useState } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { Check, Edit, Trash2, Copy, X } from 'lucide-react'

interface SwipeableItemProps {
  children: React.ReactNode
  onDelete: () => void
  onEdit: () => void
  onDuplicate: () => void
  onTogglePurchase: () => void
  purchased: boolean
}

export const SwipeableItem = ({
  children,
  onDelete,
  onEdit,
  onDuplicate,
  onTogglePurchase,
  purchased
}: SwipeableItemProps) => {
  const controls = useAnimation()
  const [isOpenLeft, setIsOpenLeft] = useState(false)

  const handleDragEnd = async (_: any, info: any) => {
    const swipeThreshold = 65
    
    // Swipe Right (Toggle Purchase Completion)
    if (info.offset.x > swipeThreshold) {
      if ('vibrate' in navigator) {
        navigator.vibrate(35)
      }
      onTogglePurchase()
      controls.start({ x: 0 })
    } 
    // Swipe Left (Show actions: edit, duplicate, delete)
    else if (info.offset.x < -swipeThreshold) {
      setIsOpenLeft(true)
      controls.start({ x: -130 })
    } 
    // Snap back to default center
    else {
      setIsOpenLeft(false)
      controls.start({ x: 0 })
    }
  }

  const closeActions = () => {
    setIsOpenLeft(false)
    controls.start({ x: 0 })
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-muted/40 border border-border/40 select-none">
      
      {/* Background Actions Layer */}
      <div className="absolute inset-0 flex justify-between items-center text-xs font-bold pointer-events-none">
        
        {/* Swipe Right Indicator (Purchase Toggle) */}
        <div className="flex items-center pl-4 bg-emerald-500/10 dark:bg-emerald-500/5 text-emerald-500 h-full w-1/2 justify-start">
          <Check className="w-5 h-5 mr-2" />
          <span>{purchased ? 'Restoring' : 'Purchasing'}</span>
        </div>

        {/* Swipe Left Buttons (Actions Tray) */}
        <div className="flex items-center justify-end h-full w-1/2 bg-red-500/5 dark:bg-red-500/2 pointer-events-auto">
          {/* Duplicate Action */}
          <button
            onClick={() => {
              onDuplicate()
              closeActions()
            }}
            className="flex flex-col items-center justify-center bg-muted/80 text-muted-foreground hover:text-foreground w-11 h-full cursor-pointer transition-colors"
            title="Duplicate item"
          >
            <Copy className="w-4 h-4" />
          </button>
          
          {/* Edit Action */}
          <button
            onClick={() => {
              onEdit()
              closeActions()
            }}
            className="flex flex-col items-center justify-center bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 w-11 h-full cursor-pointer transition-colors"
            title="Edit item"
          >
            <Edit className="w-4 h-4" />
          </button>
          
          {/* Delete Action */}
          <button
            onClick={() => {
              onDelete()
              closeActions()
            }}
            className="flex flex-col items-center justify-center bg-red-500/10 hover:bg-red-500/25 text-red-500 w-11 h-full cursor-pointer transition-colors"
            title="Delete item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Swipe Overlay Handle wrapper */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -140, right: 100 }}
        dragElastic={{ left: 0.15, right: 0.4 }}
        onDragEnd={handleDragEnd}
        animate={controls}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative bg-background p-4 w-full h-full flex items-center cursor-grab active:cursor-grabbing border-l-4 border-l-border"
        style={{
          borderLeftColor: purchased ? '#10b981' : '#f8b518'
        }}
      >
        {children}

        {/* Action Close indicator if left menu is active */}
        {isOpenLeft && (
          <button
            onClick={closeActions}
            className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground cursor-pointer rounded-full bg-muted/40"
            title="Cancel actions"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </motion.div>
    </div>
  )
}
export default SwipeableItem
