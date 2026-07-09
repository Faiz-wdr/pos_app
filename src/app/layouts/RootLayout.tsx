import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BottomNav } from '@/components/BottomNav'
import { useNavigationStore } from '@/core/navigation/navigationStore'
import { useSettingsStore } from '@/core/settings/settingsStore'
import { cn } from '@/shared/utils/cn'

export const RootLayout = () => {
  const location = useLocation()
  const setActiveTab = useNavigationStore((state) => state.setActiveTab)
  const hideSystemNav = useNavigationStore((state) => state.hideSystemNav)
  const isFullscreen = useNavigationStore((state) => state.isFullscreen)
  const animationsEnabled = useSettingsStore((state) => state.animationsEnabled)

  useEffect(() => {
    const path = location.pathname
    if (path === '/') {
      setActiveTab('home')
    } else if (path.startsWith('/modules')) {
      setActiveTab('modules')
    } else if (path.startsWith('/settings')) {
      setActiveTab('settings')
    } else if (path.startsWith('/profile')) {
      setActiveTab('profile')
    }
  }, [location.pathname, setActiveTab])

  return (
    <div className="min-h-screen bg-background/50 dark:bg-black/90 flex flex-col justify-between transition-colors duration-300">
      {/* Containerizing layout as mobile device mock on wide viewports, edge-to-edge on mobile */}
      <main
        className={cn(
          'w-full mx-auto min-h-screen bg-background flex flex-col relative border-x border-border/60 dark:border-border/30 shadow-2xl transition-all duration-300',
          isFullscreen ? 'max-w-none border-x-0' : 'max-w-md',
          hideSystemNav ? 'pb-0' : 'pb-16 sm:pb-18'
        )}
      >
        {/* Page transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={animationsEnabled ? { opacity: 0, y: 6 } : { opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={animationsEnabled ? { opacity: 0, y: -6 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className={cn(
              'flex-1 flex flex-col w-full transition-all duration-300',
              hideSystemNav ? 'px-0 pt-0 pb-0' : 'px-5 pt-6 pb-4'
            )}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>

        {!hideSystemNav && <BottomNav />}
      </main>
    </div>
  )
}
export default RootLayout
