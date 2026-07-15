import React from 'react'
import { motion } from 'framer-motion'
import { useSettingsStore } from '@/core/settings/settingsStore'

interface ChartDataPoint {
  label: string
  value: number
}

interface AnalyticsChartProps {
  type: 'line' | 'bar' | 'donut'
  data: ChartDataPoint[]
  height?: number
  accentColor?: string
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  type,
  data,
  height = 240,
  accentColor = '#f8b518'
}) => {
  const animationsEnabled = useSettingsStore((state) => state.animationsEnabled)

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-muted-foreground text-xs select-none" style={{ height }}>
        No chart metrics available
      </div>
    )
  }

  // 1. Line Chart Implementation
  if (type === 'line') {
    const padding = { top: 20, right: 20, bottom: 30, left: 45 }
    const svgWidth = 500
    const svgHeight = height
    const chartWidth = svgWidth - padding.left - padding.right
    const chartHeight = svgHeight - padding.top - padding.bottom

    const maxVal = Math.max(...data.map(d => d.value), 1) * 1.15
    const minVal = 0

    // Compute coordinates
    const points = data.map((d, index) => {
      const x = padding.left + (index / (data.length - 1)) * chartWidth
      const y = padding.top + chartHeight - ((d.value - minVal) / (maxVal - minVal)) * chartHeight
      return { x, y, label: d.label, val: d.value }
    })

    // Construct path string
    const pathD = points.reduce((acc, p, index) => {
      return index === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`
    }, '')

    // Construct closed path for background fill
    const areaD = points.length > 0 
      ? `${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`
      : ''

    const yGridLines = [0, 0.25, 0.5, 0.75, 1]

    return (
      <div className="w-full select-none">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full overflow-visible">
          {/* Y Axis Grid Lines & Labels */}
          {yGridLines.map((ratio, index) => {
            const yVal = minVal + ratio * (maxVal - minVal)
            const yPos = padding.top + chartHeight - ratio * chartHeight
            return (
              <g key={index} className="opacity-40">
                <line
                  x1={padding.left}
                  y1={yPos}
                  x2={svgWidth - padding.right}
                  y2={yPos}
                  stroke="var(--color-border)"
                  strokeWidth={0.5}
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={yPos + 3}
                  textAnchor="end"
                  fill="var(--color-text-muted)"
                  className="text-[9px] font-mono tabular-nums leading-none"
                >
                  {Math.round(yVal)}
                </text>
              </g>
            )
          })}

          {/* Area Fill */}
          {points.length > 0 && (
            <motion.path
              d={areaD}
              fill={`${accentColor}10`}
              initial={animationsEnabled ? { opacity: 0 } : { opacity: 1 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}

          {/* Line Path */}
          {points.length > 0 && (
            <motion.path
              d={pathD}
              fill="none"
              stroke={accentColor}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={animationsEnabled ? { pathLength: 0 } : { pathLength: 1 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          )}

          {/* Interactive Data Dots */}
          {points.map((p, index) => (
            <g key={index} className="group cursor-pointer">
              <circle
                cx={p.x}
                cy={p.y}
                r={3}
                fill="var(--color-card)"
                stroke={accentColor}
                strokeWidth={1.5}
              />
              <circle
                cx={p.x}
                cy={p.y}
                r={8}
                fill="transparent"
                className="hover:fill-accent/10 transition-colors"
              />
              <title>{`${p.label}: ${p.val}`}</title>
            </g>
          ))}

          {/* X Axis Date Labels */}
          {points.map((p, index) => {
            // Label compression (show every 2nd or 3rd to avoid overlaps on large data)
            const showLabel = data.length <= 7 || index % Math.ceil(data.length / 6) === 0
            if (!showLabel) return null

            return (
              <text
                key={index}
                x={p.x}
                y={svgHeight - 8}
                textAnchor="middle"
                fill="var(--color-text-muted)"
                className="text-[8px] font-bold uppercase tracking-wider"
              >
                {p.label}
              </text>
            )
          })}
        </svg>
      </div>
    )
  }

  // 2. Bar Chart Implementation
  if (type === 'bar') {
    const padding = { top: 20, right: 10, bottom: 35, left: 40 }
    const svgWidth = 500
    const svgHeight = height
    const chartWidth = svgWidth - padding.left - padding.right
    const chartHeight = svgHeight - padding.top - padding.bottom

    const maxVal = Math.max(...data.map(d => d.value), 1) * 1.1
    const barWidth = Math.max(8, (chartWidth / data.length) * 0.5)
    const columnWidth = chartWidth / data.length

    return (
      <div className="w-full select-none">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full overflow-visible">
          {/* Y Axis Grid Lines */}
          {[0, 0.5, 1].map((ratio, index) => {
            const yVal = ratio * maxVal
            const yPos = padding.top + chartHeight - ratio * chartHeight
            return (
              <g key={index} className="opacity-40">
                <line
                  x1={padding.left}
                  y1={yPos}
                  x2={svgWidth - padding.right}
                  y2={yPos}
                  stroke="var(--color-border)"
                  strokeWidth={0.5}
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={yPos + 3}
                  textAnchor="end"
                  fill="var(--color-text-muted)"
                  className="text-[9px] font-mono tabular-nums leading-none"
                >
                  {Math.round(yVal)}
                </text>
              </g>
            )
          })}

          {/* Columns & Bars */}
          {data.map((d, index) => {
            const pct = d.value / maxVal
            const barHeight = pct * chartHeight
            const x = padding.left + index * columnWidth + (columnWidth - barWidth) / 2
            const y = padding.top + chartHeight - barHeight

            return (
              <g key={index} className="group cursor-pointer">
                <motion.rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={2.5}
                  fill={accentColor}
                  className="opacity-90 hover:opacity-100 transition-opacity"
                  initial={animationsEnabled ? { scaleY: 0, originY: 1 } : { scaleY: 1 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.02, ease: 'easeOut' }}
                />
                <title>{`${d.label}: ${d.value}`}</title>
              </g>
            )
          })}

          {/* X Axis Labels */}
          {data.map((d, index) => {
            const showLabel = data.length <= 10 || index % Math.ceil(data.length / 8) === 0
            if (!showLabel) return null

            const x = padding.left + index * columnWidth + columnWidth / 2
            return (
              <text
                key={index}
                x={x}
                y={svgHeight - 8}
                textAnchor="middle"
                fill="var(--color-text-muted)"
                className="text-[8px] font-bold uppercase tracking-wider"
              >
                {d.label}
              </text>
            )
          })}
        </svg>
      </div>
    )
  }

  // 3. Donut Chart Implementation
  if (type === 'donut') {
    const total = data.reduce((acc, d) => acc + d.value, 0)
    const radius = 50
    const strokeWidth = 14
    const circumference = 2 * Math.PI * radius
    
    // Accumulate offsets
    let accumulatedPercent = 0
    
    const colors = [accentColor, '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#f43f5e']

    const donutSegments = data.map((d, i) => {
      const pct = total > 0 ? d.value / total : 0
      const strokeOffset = circumference - (pct * circumference)
      const rotation = (accumulatedPercent * 360) - 90
      
      accumulatedPercent += pct

      return {
        ...d,
        pct,
        strokeOffset,
        rotation,
        color: colors[i % colors.length]
      }
    })

    return (
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 select-none p-2.5">
        {/* Animated Circle SVG */}
        <div className="relative w-36 h-36 shrink-0">
          <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
            {donutSegments.map((seg, i) => (
              <motion.circle
                key={i}
                cx={60}
                cy={60}
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={seg.strokeOffset}
                style={{ transformOrigin: '60px 60px', rotate: `${seg.rotation}deg` }}
                initial={animationsEnabled ? { strokeDashoffset: circumference } : { strokeDashoffset: seg.strokeOffset }}
                animate={{ strokeDashoffset: seg.strokeOffset }}
                transition={{ duration: 0.7, ease: 'easeOut', delay: i * 0.05 }}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold tracking-tight text-foreground">{total}</span>
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-0.5">Total</span>
          </div>
        </div>

        {/* Labels legend */}
        <div className="flex-1 space-y-2.5 max-w-[180px] w-full text-left">
          {donutSegments.map((seg, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-md shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="text-muted-foreground truncate font-semibold">{seg.label}</span>
              </div>
              <span className="font-mono font-bold text-foreground tabular-nums shrink-0 ml-2">
                {Math.round(seg.pct * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}

export default AnalyticsChart
