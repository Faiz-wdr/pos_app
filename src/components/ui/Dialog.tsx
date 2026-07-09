import * as React from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { useSettingsStore } from '@/core/settings/settingsStore'

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  title?: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export const Dialog = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className
}: DialogProps) => {
  const [mounted, setMounted] = React.useState(false)
  const animationsEnabled = useSettingsStore((state) => state.animationsEnabled)

  React.useEffect(() => {
    setMounted(true)
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!mounted) return null

  // Support responsive slide up on mobile, slight scale/fade on desktop
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640

  const getVariants = () => {
    if (!animationsEnabled) {
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
      }
    }

    if (isMobile) {
      return {
        hidden: { y: '100%', opacity: 1 },
        visible: { y: 0, opacity: 1 },
        exit: { y: '100%', opacity: 1 }
      }
    }

    return {
      hidden: { y: 20, opacity: 0, scale: 0.96 },
      visible: { y: 0, opacity: 1, scale: 1 },
      exit: { y: 20, opacity: 0, scale: 0.96 }
    }
  }

  const transition = animationsEnabled 
    ? { type: 'spring', damping: 26, stiffness: 280 } 
    : { duration: 0 }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={animationsEnabled ? { duration: 0.15 } : { duration: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 dark:bg-black/80"
          />

          {/* Dialog Container */}
          <motion.div
            role="dialog"
            aria-modal="true"
            variants={getVariants()}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={transition}
            className={cn(
              'relative z-10 w-full sm:max-w-lg bg-background border border-border shadow-2xl rounded-t-3xl sm:rounded-2xl flex flex-col max-h-[90vh] focus:outline-none overflow-hidden pb-4 sm:pb-6',
              className
            )}
          >
            {/* Drag Handle Bar on Mobile */}
            <div className="sm:hidden w-12 h-1 bg-border rounded-full mx-auto my-3 cursor-pointer shrink-0" onClick={onClose} />

            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-2 pb-4 sm:pt-6 shrink-0">
              <div className="flex flex-col space-y-1 pr-6">
                {title && <h2 className="text-base font-bold text-foreground leading-tight">{title}</h2>}
                {description && <p className="text-xs text-muted-foreground leading-normal">{description}</p>}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-card text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-accent"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="px-6 overflow-y-auto flex-1 select-text">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
export type { DialogProps }
