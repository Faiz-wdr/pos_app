import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Pin, Sparkles, User } from 'lucide-react'
import * as Icons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useModuleStore } from '@/core/modules/moduleStore'
import { useAuth } from '@/core/firebase/hooks/useAuth'

const ModuleIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = (Icons as any)[name]
  if (!IconComponent) return <Icons.LayoutGrid className={className} />
  return <IconComponent className={className} />
}

export const Home = () => {
  const [greeting, setGreeting] = useState('Hello')
  const [searchQuery, setSearchQuery] = useState('')
  const { modules, registerModule } = useModuleStore()
  const navigate = useNavigate()
  const { isGuest, openAuthSheet, user } = useAuth()

  useEffect(() => {
    // Free Modules
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
    
    // Premium Modules
    registerModule({
      id: 'income',
      name: 'Income Manager',
      icon: 'DollarSign',
      description: 'Track daily transactions, visualize cash flows, and manage budget thresholds.',
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
      description: 'Plan weekly recipes, track nutritional stats, and generate grocery baskets.',
      isPremium: true,
      enabled: true,
      requiresLogin: true,
      supportsCloudSync: true,
      route: '/modules/diet'
    })
  }, [registerModule])

  const freeActiveModules = modules.filter((m) => m.enabled && !m.isPremium)
  const premiumModules = modules.filter((m) => m.isPremium)

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

  const handleProfileClick = () => {
    if (isGuest) {
      openAuthSheet({
        title: 'Welcome',
        description: 'Sign in to access premium modules, restore purchases and sync your data.',
        onSuccess: () => {
          navigate('/profile')
        }
      })
    } else {
      navigate('/profile')
    }
  }

  const handleModuleClick = (m: any, e: React.MouseEvent) => {
    if (m.isPremium && isGuest) {
      e.preventDefault()
      openAuthSheet({
        title: 'Premium Module',
        description: 'Unlock premium features by signing in with your mobile number.',
        onSuccess: () => {
          navigate(m.route)
        }
      })
    } else {
      navigate(m.route)
    }
  }

  // Filter modules based on search query
  const filteredFreeModules = freeActiveModules.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredPremiumModules = premiumModules.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex-1 flex flex-col space-y-6 pb-6 select-none text-left">
      
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
          <h1 className="text-2xl font-black text-foreground mt-0.5 tracking-tight">
            {greeting}, <span className="text-accent">{user?.displayName || (user ? 'User' : 'Guest')}</span>
          </h1>
        </div>
        <button
          onClick={handleProfileClick}
          className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground shadow-xs cursor-pointer hover:border-muted-foreground/30 transition-all focus-visible:outline-2 focus-visible:outline-accent"
          aria-label="User profile"
        >
          <User className="w-5 h-5 text-foreground/80" />
        </button>
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
        
        {filteredFreeModules.length === 0 ? (
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
            {filteredFreeModules.map((m) => (
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
        
        {filteredPremiumModules.length === 0 ? (
          <Card className="border-dashed border-border bg-transparent shadow-none py-8">
            <CardContent className="pt-0 flex flex-col items-center justify-center text-center space-y-2">
              <Sparkles className="w-5 h-5 text-muted-foreground/60" />
              <p className="text-xs text-muted-foreground">No premium features found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3.5">
            {filteredPremiumModules.map((m) => (
              <button
                key={m.id}
                onClick={(e) => handleModuleClick(m, e)}
                className="block text-left hover:scale-[1.02] active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-accent rounded-2xl cursor-pointer w-full"
              >
                <Card className="bg-card/65 dark:bg-card/35 hover:bg-card border-border/80 p-4 flex flex-col items-center justify-center text-center h-28 space-y-2 cursor-pointer transition-all duration-300 relative overflow-hidden">
                  <div className="p-2.5 bg-accent/10 text-accent rounded-xl">
                    <ModuleIcon name={m.icon} className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-foreground leading-tight">{m.name}</span>
                  <span className="text-[8px] bg-accent/15 text-accent font-black uppercase px-2 py-0.5 rounded-full tracking-wider scale-90">
                    PRO
                  </span>
                </Card>
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default Home
