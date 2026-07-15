import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Switch } from '@/components/ui/Switch'
import { useModuleStore } from '@/core/modules/moduleStore'
import { useAuth } from '@/core/firebase/hooks/useAuth'

const ModuleIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = (Icons as any)[name]
  if (!IconComponent) return <Icons.LayoutGrid className={className} />
  return <IconComponent className={className} />
}

export const Modules = () => {
  const { modules, registerModule, toggleModule } = useModuleStore()
  const navigate = useNavigate()
  const { isGuest, openAuthSheet } = useAuth()

  // Dynamically register modules with POS
  useEffect(() => {
    // Free Modules
    registerModule({
      id: 'clock',
      name: 'Clock & Timer',
      icon: 'Clock',
      description: 'Digital & analog bedside clock with countdown presets.',
      isPremium: false,
      enabled: true,
      requiresLogin: false,
      supportsCloudSync: false,
      route: '/modules/clock'
    })
    registerModule({
      id: 'shopping',
      name: 'Shopping List',
      icon: 'ShoppingCart',
      description: 'Offline-first grocery checklist with price calculations.',
      isPremium: false,
      enabled: true,
      requiresLogin: false,
      supportsCloudSync: false,
      route: '/modules/shopping'
    })
    
    // Premium Modules
    registerModule({
      id: 'income',
      name: 'Income Manager',
      icon: 'DollarSign',
      description: 'Track daily expenses, cash flow, and budget thresholds.',
      isPremium: true,
      enabled: true,
      requiresLogin: true,
      supportsCloudSync: true,
      route: '/modules/income'
    })
    registerModule({
      id: 'diet',
      name: 'Diet Planner',
      icon: 'Salad',
      description: 'Plan weekly meals, recipes, and automated grocery lists.',
      isPremium: true,
      enabled: true,
      requiresLogin: true,
      supportsCloudSync: true,
      route: '/modules/diet'
    })
  }, [registerModule])

  const handleOpenModule = (m: any, e: React.MouseEvent) => {
    if (m.isPremium && isGuest) {
      e.preventDefault()
      openAuthSheet({
        title: 'Premium Module',
        description: 'Unlock premium features by signing in with your email address.',
        onSuccess: () => {
          navigate(m.route)
        }
      })
    }
  }

  const moduleStyles: Record<string, { bg: string; btnText: string }> = {
    clock: {
      bg: 'bg-gradient-to-br from-[#EAB308] to-[#D97706]',
      btnText: 'text-[#D97706]'
    },
    shopping: {
      bg: 'bg-gradient-to-br from-[#10B981] to-[#059669]',
      btnText: 'text-[#059669]'
    },
    income: {
      bg: 'bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8]',
      btnText: 'text-[#1D4ED8]'
    },
    diet: {
      bg: 'bg-gradient-to-br from-[#F43F5E] to-[#E11D48]',
      btnText: 'text-[#E11D48]'
    }
  }

  return (
    <div className="flex-1 flex flex-col space-y-6 pb-6 select-none text-left">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-foreground mt-0.5 tracking-tight">Modules</h1>
      </div>

      {modules.length === 0 ? (
        <Card className="border-dashed border-border bg-transparent shadow-none py-10">
          <CardContent className="pt-0 flex flex-col items-center justify-center text-center space-y-3">
            <div className="p-3.5 bg-accent/10 rounded-xl text-accent">
              <Icons.LayoutGrid className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">Registry Ready</h3>
              <p className="text-xs text-muted-foreground max-w-[260px] mx-auto leading-relaxed">
                The POS Module Registry is active and waiting for system modules to boot.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {modules.map((m) => {
            const style = moduleStyles[m.id] || { bg: 'bg-card', btnText: 'text-accent' }
            return (
              <Card 
                key={m.id} 
                onClick={(e) => {
                  if (m.enabled) {
                    handleOpenModule(m, e)
                    if (!e.defaultPrevented) {
                      navigate(m.route)
                    }
                  }
                }}
                className={`relative overflow-hidden transition-all duration-300 border-none shadow-md text-white ${style.bg} ${
                  m.enabled ? 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]' : 'opacity-70'
                }`}
              >
                <CardContent className="p-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3.5">
                      <div className="p-2.5 bg-white/20 text-white rounded-xl shrink-0">
                        <ModuleIcon name={m.icon} className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-extrabold tracking-tight text-white leading-none">{m.name}</h3>
                          {m.isPremium && (
                            <span className="text-[8px] bg-white/20 text-white font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wide">
                              PRO
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-white/85 leading-normal pr-2 font-medium">
                          {m.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Enabled Toggle Switch */}
                    <div onClick={(e) => e.stopPropagation()} className="flex items-center">
                      <Switch
                        checked={m.enabled}
                        onCheckedChange={(checked) => toggleModule(m.id, checked)}
                        className="shrink-0"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Modules
