import { Button } from '@/components/ui/Button'
import { useTimerStore } from '../store/timerStore'

const PRESETS = [
  { label: '1m', value: 60 },
  { label: '5m', value: 300 },
  { label: '10m', value: 600 },
  { label: '15m', value: 900 },
  { label: '25m', value: 1500 },
  { label: '30m', value: 1800 },
  { label: '45m', value: 2700 },
  { label: '60m', value: 3600 }
]

export const TimerPresets = () => {
  const { duration, setDuration, isRunning } = useTimerStore()

  return (
    <div className="grid grid-cols-4 gap-2 w-full">
      {PRESETS.map((p) => {
        const isSelected = duration === p.value
        return (
          <Button
            key={p.value}
            variant={isSelected ? 'primary' : 'secondary'}
            size="sm"
            disabled={isRunning}
            onClick={() => setDuration(p.value)}
            className="text-xs font-bold h-10 rounded-xl cursor-pointer"
          >
            {p.label}
          </Button>
        )
      })}
    </div>
  )
}
export default TimerPresets
