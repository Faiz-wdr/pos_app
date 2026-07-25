import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MoreVertical, User, Settings, Sliders } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ModuleOptionsMenuProps {
  onOpenModuleSettings?: () => void
  moduleSettingsLabel?: string
}

export const ModuleOptionsMenu = ({
  onOpenModuleSettings,
  moduleSettingsLabel = 'Module Preferences'
}: ModuleOptionsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const menuRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative inline-block text-left select-none" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-1.5 sm:p-2 rounded-full hover:bg-card border border-border/20 text-muted-foreground hover:text-foreground transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-accent"
        aria-label="Module options menu"
      >
        <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 mt-2 w-48 rounded-2xl bg-card border border-border shadow-xl py-1.5 z-50 overflow-hidden select-none"
          >
            {onOpenModuleSettings && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    onOpenModuleSettings()
                  }}
                  className="w-full flex items-center px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted/70 transition-colors cursor-pointer text-left space-x-2.5"
                >
                  <Sliders className="w-4 h-4 text-accent shrink-0" />
                  <span className="truncate">{moduleSettingsLabel}</span>
                </button>
                <hr className="my-1 border-border/50" />
              </>
            )}

            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                navigate('/profile')
              }}
              className="w-full flex items-center px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted/70 transition-colors cursor-pointer text-left space-x-2.5"
            >
              <User className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>Profile</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                navigate('/settings')
              }}
              className="w-full flex items-center px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted/70 transition-colors cursor-pointer text-left space-x-2.5"
            >
              <Settings className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>App Settings</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ModuleOptionsMenu
