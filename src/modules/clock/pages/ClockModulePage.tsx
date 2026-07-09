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
import DigitalClock from '../components/DigitalClock'
import AnalogClock from '../components/AnalogClock'
import ClockSettingsDialog from '../components/ClockSettingsDialog'
import TimerDisplay from '../components/TimerDisplay'
import TimerPresets from '../components/TimerPresets'

type SubTab = 'clock' | 'timer'

export const ClockModulePage = () => {
  const [activeTab, setActiveTab] = useState<SubTab>('clock')
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Core stores
  const setIsFullscreen = useNavigationStore((state) => state.setIsFullscreen)
  const setHideSystemNav = useNavigationStore((state) => state.setHideSystemNav)
  const animationsEnabled = useSettingsStore((state) => state.animationsEnabled)
  const { clockType, keepAwake, autoHideControls } = useClockStore()
  const { isCompleted, dismissCompleted, tick, syncBackground, isRunning } = useTimerStore()

  // Custom Hooks
  const { isVisible: controlsVisible, showControls } = useAutoHide(autoHideControls && !settingsOpen, 5000)
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
    setHideSystemNav(!controlsVisible)
  }, [controlsVisible, setHideSystemNav])

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
      
      // Dispatch browser notifications
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Timer Finished!', {
          body: 'Your countdown timer has completed.',
          icon: '/favicon.svg'
        })
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
    >
      {/* Top Header Section */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.header
            initial={animationsEnabled ? { y: -40, opacity: 0 } : { y: 0, opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={animationsEnabled ? { y: -40, opacity: 0 } : { y: -40, opacity: 0 }}
            transition={transition}
            className="flex items-center justify-between w-full px-5 py-4 shrink-0 bg-background/90 dark:bg-background/80 backdrop-blur-xs border-b border-border/40 z-30 select-none absolute top-0 left-0 right-0"
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
                className={`flex items-center px-4 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
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
                className={`flex items-center px-4 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  activeTab === 'timer'
                    ? 'bg-accent text-accent-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Hourglass className="w-3.5 h-3.5 mr-1" />
                Timer
              </button>
            </div>

            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 rounded-full hover:bg-card border border-border/20 text-muted-foreground hover:text-foreground transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-accent"
              aria-label="Clock configuration settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Main Content Viewport */}
      <div className="flex-1 flex items-center justify-center w-full px-5 mt-16 landscape:mt-0 transition-all duration-300">
        <AnimatePresence mode="wait">
          {activeTab === 'clock' ? (
            <motion.div
              key="clock"
              initial={animationsEnabled ? { opacity: 0, scale: 0.98 } : { opacity: 1, scale: 1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={animationsEnabled ? { opacity: 0, scale: 0.98 } : { opacity: 0, scale: 0.98 }}
              transition={transition}
              className="w-full flex items-center justify-center"
            >
              {clockType === 'digital' ? <DigitalClock /> : <AnalogClock />}
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

            <h1 className="text-3xl font-black text-white tracking-tight uppercase">Timer Completed</h1>
            <p className="text-sm text-neutral-400 mt-2 text-center max-w-[240px]">
              Dismiss the alert to stop alarm sounds and vibration alerts.
            </p>

            <motion.button
              onClick={handleDismissAlarm}
              whileTap={animationsEnabled ? { scale: 0.98 } : {}}
              className="mt-10 px-8 py-3.5 bg-accent text-accent-foreground font-black rounded-2xl cursor-pointer text-sm shadow-xl focus-visible:outline-2 focus-visible:outline-accent uppercase tracking-wider"
            >
              Dismiss Alarm
            </motion.button>
          </motion.div>
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
