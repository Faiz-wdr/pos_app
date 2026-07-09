import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Pin, Sparkles, User } from 'lucide-react'
import * as Icons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useModuleStore } from '@/core/modules/moduleStore'

const ModuleIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = (Icons as any)[name]
  if (!IconComponent) return <Icons.LayoutGrid className={className} />
  return <IconComponent className={className} />
}

export const Home = () => {
  const [greeting, setGreeting] = useState('Hello')
  const [searchQuery, setSearchQuery] = useState('')
  const { modules, registerModule } = useModuleStore()

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

  const activeModules = modules.filter((m) => m.enabled)

  useEffect(() => {
    const hours = new Date().getHours()
    if (hours < 12) {
      setGreeting('Good morning')
    } else if (hours < 18) {
      setGreeting('Good afternoon')
    } else {
      setGreeting('Good evening')
    }
  }, [])

  return (
    <div className="flex-1 flex flex-col space-y-6 pb-6 select-none">
      
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
          <h1 className="text-2xl font-black text-foreground mt-0.5 tracking-tight">
            {greeting}, <span className="text-accent">User</span>
          </h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground shadow-xs">
          <User className="w-5 h-5 text-foreground/80" />
        </div>
      </div>

      {/* Search section */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
          <Search className="w-5 h-5" />
        </div>
        <Input
          type="text"
          placeholder="Search modules or features..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-11 pr-4"
        />
      </div>

      {/* Pinned Modules Section */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-foreground/90 px-1">
          <Pin className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-bold tracking-tight">Pinned Modules</h2>
        </div>
        
        {activeModules.length === 0 ? (
          <Card className="border-dashed border-border bg-transparent shadow-none py-8">
            <CardContent className="pt-0 flex flex-col items-center justify-center text-center space-y-2">
              <div className="p-3 bg-muted rounded-xl text-muted-foreground/70">
                <Pin className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground/90">No pinned modules</p>
                <p className="text-[11px] text-muted-foreground max-w-[200px]">
                  Pin your favorite modules for quick access from the home dashboard.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3.5">
            {activeModules.map((m) => (
              <Link 
                key={m.id} 
                to={m.route}
                className="block hover:scale-[1.02] active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-accent rounded-2xl"
              >
                <Card className="bg-card/65 dark:bg-card/35 hover:bg-card border-border/80 p-4 flex flex-col items-center justify-center text-center h-28 space-y-2 cursor-pointer transition-all duration-300">
                  <div className="p-2.5 bg-accent/10 text-accent rounded-xl">
                    <ModuleIcon name={m.icon} className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-foreground leading-tight">{m.name}</span>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>



      {/* Premium Modules Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2 text-foreground/90">
            <Sparkles className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-bold tracking-tight">Premium Features</h2>
          </div>
          <span className="text-[10px] bg-accent/10 text-accent font-black uppercase px-2 py-0.5 rounded-full tracking-wide">
            PRO
          </span>
        </div>
        
        <Card className="bg-card/50 overflow-hidden relative border-border/80">
          {/* Subtle background glow element */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl pointer-events-none" />
          
          <CardContent className="pt-0 flex flex-col items-center justify-center text-center space-y-2 py-8">
            <div className="p-3 bg-accent/10 rounded-xl text-accent">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-foreground">Unlock Cloud Sync & Modules</p>
              <p className="text-[11px] text-muted-foreground max-w-[240px]">
                Get instant access to advanced modules, automated backup engines, and multi-device cloud sync.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
export default Home
