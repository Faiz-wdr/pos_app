import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import * as Icons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Switch } from '@/components/ui/Switch'
import { Button } from '@/components/ui/Button'
import { useModuleStore } from '@/core/modules/moduleStore'

const ModuleIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = (Icons as any)[name]
  if (!IconComponent) return <Icons.LayoutGrid className={className} />
  return <IconComponent className={className} />
}

export const Modules = () => {
  const { modules, registerModule, toggleModule } = useModuleStore()

  // Dynamically register modules with POS
  useEffect(() => {
    registerModule({
      id: 'clock',
      name: 'Clock & Timer',
      icon: 'Clock',
      description: 'High-visibility digital & analog bedside clock with count-down presets and background alert engines.',
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
      description: 'Offline-first grocery checklist organizer with quick-add chips, drag sorting, and price calculations.',
      isPremium: false,
      enabled: true,
      requiresLogin: false,
      supportsCloudSync: false,
      route: '/modules/shopping'
    })
  }, [registerModule])

  return (
    <div className="flex-1 flex flex-col space-y-6 pb-6 select-none">
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">System Components</span>
        <h1 className="text-2xl font-black text-foreground mt-0.5 tracking-tight">Modules</h1>
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
          {modules.map((m) => (
            <Card key={m.id} className="relative overflow-hidden bg-card/60 dark:bg-card/35 transition-all duration-300">
              <CardContent className="pt-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3.5">
                    <div className="p-3.5 bg-accent/10 text-accent rounded-2xl shrink-0">
                      <ModuleIcon name={m.icon} className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-black text-foreground">{m.name}</h3>
                        {m.isPremium && (
                          <span className="text-[9px] bg-accent/10 text-accent font-black uppercase px-2 py-0.5 rounded-full tracking-wide">
                            PRO
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed pr-2">
                        {m.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Enabled Toggle Switch */}
                  <Switch
                    checked={m.enabled}
                    onCheckedChange={(checked) => toggleModule(m.id, checked)}
                    className="shrink-0 mt-1"
                  />
                </div>

                {/* Open Module Button */}
                {m.enabled && (
                  <div className="pt-2 border-t border-border/40 dark:border-border/10">
                    <Link to={m.route} className="block w-full focus-visible:outline-2 focus-visible:outline-accent rounded-xl">
                      <Button 
                        variant="secondary" 
                        className="w-full flex justify-between items-center h-10 px-4 text-xs font-black bg-muted/60 dark:bg-card/50 rounded-xl hover:bg-muted active:scale-[0.98] border border-border"
                      >
                        <span>Open Module</span>
                        <ArrowRight className="w-4 h-4 text-accent" />
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
export default Modules
