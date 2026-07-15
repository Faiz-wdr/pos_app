import React from 'react'

interface SectionTitleProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ title, subtitle, actions }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none pb-2 border-b border-border/60">
      <div className="flex flex-col">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center space-x-3 shrink-0">{actions}</div>}
    </div>
  )
}

export default SectionTitle
