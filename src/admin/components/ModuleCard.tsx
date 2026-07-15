import React from 'react'
import { AdminModule } from '../hooks/useAdminModules'
import { ModuleStatusBadge } from './ModuleStatusBadge'
import { ActionButton } from './ActionButton'
import { 
  Clock, 
  Hourglass, 
  ShoppingCart, 
  TrendingUp, 
  Heart, 
  Layers,
  Settings,
  Users,
  Timer,
  Play
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'Clock': return Clock
    case 'Hourglass': return Hourglass
    case 'ShoppingCart': return ShoppingCart
    case 'TrendingUp': return TrendingUp
    case 'Heart': return Heart
    default: return Layers
  }
}

interface ModuleCardProps {
  module: AdminModule
  onEdit: () => void
  onToggleEnabled: () => void
  loadingAction?: boolean
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  module,
  onEdit,
  onToggleEnabled,
  loadingAction = false
}) => {
  const IconComponent = getIconComponent(module.icon)

  return (
    <Card className="bg-card border border-border/80 rounded-2xl overflow-hidden select-none hover:border-border transition-all flex flex-col justify-between">
      <CardContent className="p-5 flex flex-col flex-1 justify-between space-y-4">
        {/* Module Header */}
        <div className="flex items-start justify-between space-x-3.5">
          <div 
            className="p-2.5 rounded-xl border shrink-0 text-white"
            style={{ 
              backgroundColor: `${module.accentColor}15`, 
              borderColor: `${module.accentColor}30`,
              color: module.accentColor 
            }}
          >
            <IconComponent className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <h3 className="text-sm font-bold text-foreground truncate">{module.name}</h3>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-0.5 block">
              {module.category} • v{module.version}
            </span>
          </div>
          <ModuleStatusBadge status={module.status} />
        </div>

        {/* Description */}
        <p className="text-[11px] text-muted-foreground leading-normal text-left min-h-[36px]">
          {module.description}
        </p>

        {/* Stat Indicators Grid */}
        <div className="grid grid-cols-3 gap-2.5 border-t border-b border-border/40 py-3 text-left">
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider flex items-center space-x-1">
              <Users className="w-3 h-3 text-muted-foreground" />
              <span>Users</span>
            </span>
            <span className="text-xs font-bold text-foreground mt-0.5">{module.totalUsers}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider flex items-center space-x-1">
              <Play className="w-3 h-3 text-muted-foreground" />
              <span>Actives</span>
            </span>
            <span className="text-xs font-bold text-foreground mt-0.5">{module.activeUsersToday} today</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider flex items-center space-x-1">
              <Timer className="w-3 h-3 text-muted-foreground" />
              <span>Avg Time</span>
            </span>
            <span className="text-xs font-bold text-foreground mt-0.5">{module.avgSessionTime} mins</span>
          </div>
        </div>

        {/* Footer Pricing & Actions */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-col text-left">
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Pricing</span>
            <span className="text-xs font-bold text-foreground mt-0.5">
              {module.free ? 'Free Mode' : `₹${module.price}`}
            </span>
          </div>
          
          <div className="flex space-x-2">
            <ActionButton
              onClick={onToggleEnabled}
              loading={loadingAction}
              variant={module.enabled ? 'outline' : 'primary'}
              className="h-8 text-[9px] px-2.5 rounded-lg font-bold transition-all"
            >
              {module.enabled ? 'Disable' : 'Enable'}
            </ActionButton>
            <ActionButton
              onClick={onEdit}
              icon={Settings}
              variant="outline"
              className="h-8 text-[9px] px-2.5 rounded-lg border border-border/60 hover:bg-muted"
            >
              Configure
            </ActionButton>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ModuleCard
