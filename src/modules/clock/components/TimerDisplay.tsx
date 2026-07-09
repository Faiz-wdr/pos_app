import { Play, Pause, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useTimerStore } from '../store/timerStore'
import { formatTimerSeconds } from '../utils/format'

export const TimerDisplay = () => {
  const {
    secondsRemaining,
    duration,
    isRunning,
    isPaused,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    setDuration
  } = useTimerStore()

  // Format display numbers based on active countdown vs target preset duration
  const displayTime = isRunning ? secondsRemaining : duration
  const { hours, minutes, seconds } = formatTimerSeconds(displayTime)

  const handleAdjust = (type: 'h' | 'm' | 's', amount: number) => {
    if (isRunning) return

    const currentH = Math.floor(duration / 3600)
    const currentM = Math.floor((duration % 3600) / 60)
    const currentS = duration % 60

    let h = currentH
    let m = currentM
    let s = currentS

    if (type === 'h') {
      h = Math.max(0, Math.min(23, currentH + amount))
    } else if (type === 'm') {
      m = (currentM + amount + 60) % 60
    } else if (type === 's') {
      s = (currentS + amount + 60) % 60
    }

    setDuration(h * 3600 + m * 60 + s)
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-7 w-full select-none py-4">
      
      {/* Segment controls grid */}
      <div className="flex items-center justify-center space-x-3 sm:space-x-4">
        {/* Hours Column */}
        <div className="flex flex-col items-center">
          {!isRunning && (
            <button
              onClick={() => handleAdjust('h', 1)}
              className="p-2 text-muted-foreground hover:text-foreground active:scale-90 font-black text-lg cursor-pointer"
              aria-label="Increase hours"
            >
              ▲
            </button>
          )}
          <div className="w-18 h-18 sm:w-20 sm:h-20 bg-card border border-border/80 rounded-2xl flex items-center justify-center shadow-xs">
            <span className="text-3xl sm:text-4xl font-extrabold tabular-nums select-text">{hours}</span>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Hrs</span>
          {!isRunning && (
            <button
              onClick={() => handleAdjust('h', -1)}
              className="p-2 text-muted-foreground hover:text-foreground active:scale-90 font-black text-lg cursor-pointer"
              aria-label="Decrease hours"
            >
              ▼
            </button>
          )}
        </div>

        <span className="text-2xl font-black text-muted-foreground/60 mb-5 sm:mb-6">:</span>

        {/* Minutes Column */}
        <div className="flex flex-col items-center">
          {!isRunning && (
            <button
              onClick={() => handleAdjust('m', 1)}
              className="p-2 text-muted-foreground hover:text-foreground active:scale-90 font-black text-lg cursor-pointer"
              aria-label="Increase minutes"
            >
              ▲
            </button>
          )}
          <div className="w-18 h-18 sm:w-20 sm:h-20 bg-card border border-border/80 rounded-2xl flex items-center justify-center shadow-xs">
            <span className="text-3xl sm:text-4xl font-extrabold tabular-nums select-text">{minutes}</span>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Min</span>
          {!isRunning && (
            <button
              onClick={() => handleAdjust('m', -1)}
              className="p-2 text-muted-foreground hover:text-foreground active:scale-90 font-black text-lg cursor-pointer"
              aria-label="Decrease minutes"
            >
              ▼
            </button>
          )}
        </div>

        <span className="text-2xl font-black text-muted-foreground/60 mb-5 sm:mb-6">:</span>

        {/* Seconds Column */}
        <div className="flex flex-col items-center">
          {!isRunning && (
            <button
              onClick={() => handleAdjust('s', 1)}
              className="p-2 text-muted-foreground hover:text-foreground active:scale-90 font-black text-lg cursor-pointer"
              aria-label="Increase seconds"
            >
              ▲
            </button>
          )}
          <div className="w-18 h-18 sm:w-20 sm:h-20 bg-card border border-border/80 rounded-2xl flex items-center justify-center shadow-xs">
            <span className="text-3xl sm:text-4xl font-extrabold tabular-nums select-text text-accent">{seconds}</span>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Sec</span>
          {!isRunning && (
            <button
              onClick={() => handleAdjust('s', -1)}
              className="p-2 text-muted-foreground hover:text-foreground active:scale-90 font-black text-lg cursor-pointer"
              aria-label="Decrease seconds"
            >
              ▼
            </button>
          )}
        </div>
      </div>

      {/* Timer Controls Group */}
      <div className="flex justify-center items-center space-x-4">
        {/* Play / Pause Toggle */}
        {!isRunning ? (
          <Button
            variant="primary"
            size="lg"
            onClick={startTimer}
            disabled={duration <= 0}
            className="w-28 cursor-pointer rounded-2xl"
          >
            <Play className="w-4 h-4 mr-2 fill-current" />
            Start
          </Button>
        ) : isPaused ? (
          <Button
            variant="primary"
            size="lg"
            onClick={resumeTimer}
            className="w-28 cursor-pointer rounded-2xl"
          >
            <Play className="w-4 h-4 mr-2 fill-current" />
            Resume
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="lg"
            onClick={pauseTimer}
            className="w-28 cursor-pointer rounded-2xl border border-border"
          >
            <Pause className="w-4 h-4 mr-2" />
            Pause
          </Button>
        )}

        {/* Reset Trigger */}
        {(isRunning || isPaused || duration !== secondsRemaining) && (
          <Button
            variant="outline"
            size="lg"
            onClick={resetTimer}
            className="cursor-pointer border border-border rounded-2xl"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        )}
      </div>

    </div>
  )
}
export default TimerDisplay
