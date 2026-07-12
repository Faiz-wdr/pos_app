import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Settings, Clock, Hourglass, BellRing } from 'lucide-react'
import { useNavigationStore } from '@/core/navigation/navigationStore'
import { useClockStore } from '../store/clockStore'
import { useTimerStore } from '../store/timerStore'
import { useAutoHide } from '../hooks/useAutoHide'
import { useWakeLock } from '@/shared/hooks/useWakeLock'
import { startAlarm, stopAlarm } from '../services/audio'
import ClockSettingsDialog from '../components/ClockSettingsDialog'
import TimerDisplay from '../components/TimerDisplay'
import TimerPresets from '../components/TimerPresets'
import { THEMES } from '../components/themes'
import { useDeviceOrientation } from '../hooks/useDeviceOrientation'
import { useClockTime } from '../hooks/useClockTime'
import { Maximize, Minimize } from 'lucide-react'
import { ClockTheme } from '../types'

const THEME_KEYS: ClockTheme[] = ['modern-digital', 'minimal-digital', 'classic-analog', 'calendar-analog']

type SubTab = 'clock' | 'timer'

export const ClockModulePage = () => {
  const [activeTab, setActiveTab] = useState<SubTab>('clock')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [isFullscreenMode, setIsFullscreenMode] = useState(!!document.fullscreenElement)

  // Core hook selectors
  const isLandscape = useDeviceOrientation()
  const time = useClockTime()

  // Core stores
  const setIsFullscreen = useNavigationStore((state) => state.setIsFullscreen)
  const setHideSystemNav = useNavigationStore((state) => state.setHideSystemNav)
  const animationsEnabled = useSettingsStore((state) => state.animationsEnabled)
  const { 
    theme, 
    setTheme,
    keepAwake, 
    autoHideControls,
    showSeconds,
    use24Hour,
    dateFormat
  } = useClockStore()

  const handleNextTheme = () => {
    const currentIndex = THEME_KEYS.indexOf(theme)
    const nextIndex = (currentIndex + 1) % THEME_KEYS.length
    setTheme(THEME_KEYS[nextIndex])
  }

  const handlePrevTheme = () => {
    const currentIndex = THEME_KEYS.indexOf(theme)
    const prevIndex = (currentIndex - 1 + THEME_KEYS.length) % THEME_KEYS.length
    setTheme(THEME_KEYS[prevIndex])
  }
  const { isCompleted, dismissCompleted, tick, syncBackground, isRunning } = useTimerStore()

  const isDeskModeActive = isLandscape
  const ActiveThemeComponent = THEMES[theme] || THEMES['modern-digital']

  useEffect(() => {
    if (!isDeskModeActive && document.fullscreenElement) {
      document.exitFullscreen().catch(console.warn)
    }
  }, [isDeskModeActive])

  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreenMode(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFSChange)
    return () => document.removeEventListener('fullscreenchange', handleFSChange)
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (e) {
      console.warn('Fullscreen toggle failed:', e)
    }
  }

  // Custom Hooks
  const { isVisible: controlsVisible, showControls } = useAutoHide((autoHideControls || isDeskModeActive) && !settingsOpen, 5000)
  const { request: requestWakeLock, release: releaseWakeLock } = useWakeLock()

  // Fullscreen expansion setup on mount
  useEffect(() => {
    setIsFullscreen(true)
    return () => {
      setIsFullscreen(false)
      setHideSystemNav(false)
      stopAlarm()
    }
  }, [setIsFullscreen, setHideSystemNav])

  // Sync controls concealment with core navigation store
  useEffect(() => {
    // Hide POS bottom nav if controls are hidden, or show if controls are visible
    setHideSystemNav(!controlsVisible || isDeskModeActive)
  }, [controlsVisible, isDeskModeActive, setHideSystemNav])

  // Wake lock lifecycle
  useEffect(() => {
    if (keepAwake) {
      requestWakeLock()
    } else {
      releaseWakeLock()
    }
    return () => {
      releaseWakeLock()
    }
  }, [keepAwake, requestWakeLock, releaseWakeLock])

  // Timer interval updates (tick every second)
  useEffect(() => {
    let interval: any = null
    if (isRunning) {
      interval = setInterval(() => {
        tick()
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, tick])

  // Tab visibility changes sync (timer background recovery)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncBackground()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [syncBackground])

  // Notification requesting
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Alarm sound & vibration loop on countdown completion
  useEffect(() => {
    if (isCompleted) {
      startAlarm()
      
      // Dispatch browser notifications safely to prevent mobile PWA constructor failures
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          if (navigator.serviceWorker) {
            navigator.serviceWorker.ready.then((registration) => {
              registration.showNotification('Timer Finished!', {
                body: 'Your countdown timer has completed.',
                icon: '/favicon.svg'
              })
            }).catch((err) => {
              console.warn('Service Worker notification failed:', err)
              try {
                new Notification('Timer Finished!', {
                  body: 'Your countdown timer has completed.',
                  icon: '/favicon.svg'
                })
              } catch (e) {
                console.warn('Notification constructor fallback failed:', e)
              }
            })
          } else {
            try {
              new Notification('Timer Finished!', {
                body: 'Your countdown timer has completed.',
                icon: '/favicon.svg'
              })
            } catch (e) {
              console.warn('Notification constructor failed:', e)
            }
          }
        } catch (err) {
          console.warn('Browser notification trigger failed:', err)
        }
      }

      // Device vibration feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([400, 200, 400, 200, 400])
      }
    } else {
      stopAlarm()
    }
    return () => {
      stopAlarm()
    }
  }, [isCompleted])

  const handleDismissAlarm = () => {
    dismissCompleted()
    stopAlarm()
  }

  // Anim configurations
  const transition = animationsEnabled ? { duration: 0.15 } : { duration: 0 }

  return (
    <div 
      className="flex-1 flex flex-col justify-between w-full h-full relative select-none overflow-hidden"
      onClick={showControls}
      style={activeTab === 'clock' ? { backgroundColor: '#000000' } : {}}
    >
      {/* Top Header Section */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.header
            initial={animationsEnabled ? { y: -40, opacity: 0 } : { y: 0, opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={animationsEnabled ? { y: -40, opacity: 0 } : { y: -40, opacity: 0 }}
            transition={transition}
            className={`flex items-center justify-between w-full px-5 py-4 shrink-0 backdrop-blur-md z-30 select-none absolute top-0 left-0 right-0 transition-colors duration-300 ${
              activeTab === 'clock' 
                ? 'bg-black/40 border-b border-white/5' 
                : 'bg-background/90 dark:bg-background/80 border-b border-border/40'
            }`}
          >
            <Link 
              to="/modules" 
              className="p-2 rounded-full hover:bg-card border border-border/20 text-muted-foreground hover:text-foreground transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-accent"
              aria-label="Back to modules list"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

             {/* Sub Tabs Segment Switcher */}
            <div className="flex bg-muted/70 p-1 rounded-xl border border-border/50">
              <button
                onClick={() => setActiveTab('clock')}
                className={`flex items-center px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'clock'
                    ? 'bg-accent text-accent-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Clock className="w-3.5 h-3.5 mr-1" />
                Clock
              </button>
              <button
                onClick={() => setActiveTab('timer')}
                className={`flex items-center px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'timer'
                    ? 'bg-accent text-accent-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Hourglass className="w-3.5 h-3.5 mr-1" />
                Timer
              </button>
            </div>

            <div className="flex items-center">
              <button
                onClick={() => setSettingsOpen(true)}
                className="p-2 rounded-full hover:bg-card border border-border/20 text-muted-foreground hover:text-foreground transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-accent"
                aria-label="Clock configuration settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Main Content Viewport */}
      <div className={`flex-1 flex items-center justify-center w-full px-5 transition-all duration-300 ${
        isDeskModeActive ? 'mt-0' : 'mt-16 landscape:mt-0'
      }`}>
        <AnimatePresence mode="wait">
          {activeTab === 'clock' ? (
            <motion.div
              key={theme + (isDeskModeActive ? '-landscape' : '-portrait')}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.4}
              onDragEnd={(_e, info) => {
                const swipeThreshold = 50
                if (info.offset.x < -swipeThreshold) {
                  handleNextTheme()
                } else if (info.offset.x > swipeThreshold) {
                  handlePrevTheme()
                }
              }}
              initial={animationsEnabled ? { opacity: 0, scale: 0.96 } : { opacity: 1, scale: 1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={animationsEnabled ? { opacity: 0, scale: 0.96 } : { opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none"
            >
              <ActiveThemeComponent
                time={time}
                showSeconds={showSeconds}
                use24Hour={use24Hour}
                dateFormat={dateFormat}
                isLandscapeMode={isDeskModeActive}
              />
            </motion.div>
          ) : (
            <motion.div
              key="timer"
              initial={animationsEnabled ? { opacity: 0, scale: 0.98 } : { opacity: 1, scale: 1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={animationsEnabled ? { opacity: 0, scale: 0.98 } : { opacity: 0, scale: 0.98 }}
              transition={transition}
              className="w-full max-w-sm flex flex-col items-center justify-center space-y-5"
            >
              <TimerDisplay />
              <TimerPresets />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fullscreen Completion Alert Overlay */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-5 select-none"
          >
            {/* Pulsing ring animation */}
            <motion.div
              animate={animationsEnabled ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
              className="w-24 h-24 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center text-accent mb-6 shadow-2xl"
            >
              <BellRing className="w-12 h-12" />
            </motion.div>

            <h1 className="text-3xl font-bold text-white tracking-tight uppercase">Timer Completed</h1>
            <p className="text-sm text-neutral-400 mt-2 text-center max-w-[240px]">
              Dismiss the alert to stop alarm sounds and vibration alerts.
            </p>

            <motion.button
              onClick={handleDismissAlarm}
              whileTap={animationsEnabled ? { scale: 0.98 } : {}}
              className="mt-10 px-8 py-3.5 bg-accent text-accent-foreground font-bold rounded-2xl cursor-pointer text-sm shadow-xl focus-visible:outline-2 focus-visible:outline-accent uppercase tracking-wider"
            >
              Dismiss Alarm
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Fullscreen button for Desk Mode */}
      <AnimatePresence>
        {isDeskModeActive && controlsVisible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={toggleFullscreen}
            className="absolute bottom-6 right-6 z-30 p-3 rounded-full bg-neutral-900/80 border border-neutral-700/60 text-white shadow-xl cursor-pointer hover:bg-neutral-800 transition-all active:scale-95"
            aria-label="Toggle Fullscreen"
          >
            {isFullscreenMode ? (
              <Minimize className="w-5 h-5" />
            ) : (
              <Maximize className="w-5 h-5" />
            )}
          </motion.button>
        )}
      </AnimatePresence>



      {/* Settings Overlay dialog */}
      <ClockSettingsDialog isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}

// Simple imported helper workaround to fix useSettingsStore missing import
import { useSettingsStore } from '@/core/settings/settingsStore'

export default ClockModulePage
