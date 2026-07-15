import React from 'react'
import { ClockThemeProps } from './themeInterface'
import { useClockStore } from '../../store/clockStore'

// Dual-tone color mapping for StandBy theme
export const STANDBY_THEME_COLORS = {
  coral: { dark: '#ff5e5b', light: '#ffb3a7' },
  orange: { dark: '#ff9f0a', light: '#ffd28e' },
  yellow: { dark: '#ffd60a', light: '#fff19f' },
  green: { dark: '#30d158', light: '#a3f7b5' },
  blue: { dark: '#0a84ff', light: '#99cbff' },
  purple: { dark: '#bf5af2', light: '#ecbaff' },
  pink: { dark: '#ff375f', light: '#ffabc0' },
  white: { dark: '#76767c', light: '#ffffff' }
} as const

export const MinimalClock: React.FC<ClockThemeProps> = ({
  time,
  showSeconds,
  use24Hour,
  isLandscapeMode
}) => {
  const themeColor = useClockStore((state) => state.themeColor)

  // Format hours and minutes with padding
  const rawHours = time.getHours()
  const hoursNum = use24Hour
    ? rawHours
    : (rawHours % 12 === 0 ? 12 : rawHours % 12)
  const hoursStr = String(hoursNum).padStart(2, '0')
  const minutesStr = String(time.getMinutes()).padStart(2, '0')

  // Get active color configuration
  const colorSet = STANDBY_THEME_COLORS[themeColor as keyof typeof STANDBY_THEME_COLORS] || STANDBY_THEME_COLORS.coral

  // Colon blink logic (toggles every second)
  const isSecondEven = time.getSeconds() % 2 === 0
  const colonOpacity = isSecondEven ? 'opacity-85' : 'opacity-20'

  // Responsive base font size: scales dynamically with viewport width and height
  const fontSize = isLandscapeMode
    ? 'min(38vw, 68vh)'
    : 'min(42vw, 36vh)'

  return (
    <div className="flex items-center justify-center select-none w-full h-full py-8">
      {/* Inject Google Font dynamically for round stand-by style digits */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@800;900&display=swap');
        .standby-font {
          font-family: 'Fredoka', sans-serif;
          font-weight: 900;
          letter-spacing: -0.05em;
        }
      `}} />

      <div 
        className="flex items-center justify-center font-bold"
        style={{ fontSize }}
      >
        {/* Hours Digit 1 & 2 Overlapping */}
        <div className="flex items-center relative text-[1em]">
          <span
            className="standby-font leading-none select-text inline-block"
            style={{
              color: colorSet.dark,
              textShadow: '0 0.01em 0.04em rgba(0, 0, 0, 0.45)',
              transform: 'rotate(-3deg)'
            }}
          >
            {hoursStr[0]}
          </span>
          <span
            className="standby-font leading-none select-text -ml-[0.24em] z-10 opacity-92 mix-blend-screen inline-block"
            style={{
              color: colorSet.light,
              textShadow: '0 0.01em 0.04em rgba(0, 0, 0, 0.45)',
              transform: 'rotate(3deg)'
            }}
          >
            {hoursStr[1]}
          </span>
        </div>

        {/* Pulsing Colon (soft white blurred dots) */}
        <div className={`flex flex-col space-y-[0.05em] mx-[0.04em] items-center justify-center transition-opacity duration-300 ${colonOpacity}`}>
          <div 
            className="w-[0.06em] h-[0.06em] rounded-full bg-white/70"
            style={{ boxShadow: '0 0 0.02em rgba(255,255,255,0.35)' }}
          />
          <div 
            className="w-[0.06em] h-[0.06em] rounded-full bg-white/70"
            style={{ boxShadow: '0 0 0.02em rgba(255,255,255,0.35)' }}
          />
        </div>

        {/* Minutes Digit 1 & 2 Overlapping */}
        <div className="flex items-center relative text-[1em]">
          <span
            className="standby-font leading-none select-text inline-block"
            style={{
              color: colorSet.dark,
              textShadow: '0 0.01em 0.04em rgba(0, 0, 0, 0.45)',
              transform: 'rotate(-3deg)'
            }}
          >
            {minutesStr[0]}
          </span>
          <span
            className="standby-font leading-none select-text -ml-[0.24em] z-10 opacity-92 mix-blend-screen inline-block"
            style={{
              color: colorSet.light,
              textShadow: '0 0.01em 0.04em rgba(0, 0, 0, 0.45)',
              transform: 'rotate(3deg)'
            }}
          >
            {minutesStr[1]}
          </span>
        </div>

        {/* Small Ticking Seconds next to minutes */}
        {showSeconds && (
          <div
            className="flex flex-col justify-end ml-[0.04em] select-none self-end pb-[0.08em]"
            style={{ color: colorSet.light }}
          >
            <span className="standby-font leading-none tabular-nums tracking-wider opacity-85 text-[0.16em]">
              {String(time.getSeconds()).padStart(2, '0')}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default MinimalClock
