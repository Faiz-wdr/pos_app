import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Sparkles, User } from 'lucide-react'
import * as Icons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useModuleStore } from '@/core/modules/moduleStore'
import { useAuth } from '@/core/firebase/hooks/useAuth'

const ModuleIcon = ({ name, className, strokeWidth = 2 }: { name: string; className?: string; strokeWidth?: number }) => {
  const IconComponent = (Icons as any)[name]
  if (!IconComponent) return <Icons.LayoutGrid className={className} strokeWidth={strokeWidth} />
  return <IconComponent className={className} strokeWidth={strokeWidth} />
}

const moduleCardStyles: Record<
  string,
  { bg: string; shadow: string; hoverShadow: string }
> = {
  clock: {
    bg: 'bg-gradient-to-br from-[#EAB308] to-[#D97706]',
    shadow: 'shadow-amber-500/10',
    hoverShadow: 'hover:shadow-amber-500/25'
  },
  shopping: {
    bg: 'bg-gradient-to-br from-[#10B981] to-[#059669]',
    shadow: 'shadow-emerald-500/10',
    hoverShadow: 'hover:shadow-emerald-500/25'
  },
  income: {
    bg: 'bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8]',
    shadow: 'shadow-blue-500/10',
    hoverShadow: 'hover:shadow-blue-500/25'
  },
  diet: {
    bg: 'bg-gradient-to-br from-[#F43F5E] to-[#E11D48]',
    shadow: 'shadow-rose-500/10',
    hoverShadow: 'hover:shadow-rose-500/25'
  }
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
        description: 'Unlock premium features by signing in with your email address.',
        onSuccess: () => {
          navigate(m.route)
        }
      })
    } else {
      navigate(m.route)
    }
  }

  // Filter modules based on search query
  const filteredModules = activeModules.filter(m => 
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
          <h1 className="text-2xl font-bold text-foreground mt-0.5 tracking-tight">
            {greeting}, <span className="text-accent">{user?.fullName || (user ? 'User' : 'Guest')}</span>
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

      {/* Unified Modules Grid */}
      {filteredModules.length === 0 ? (
        <Card className="border-dashed border-border bg-transparent shadow-none py-8">
          <CardContent className="pt-0 flex flex-col items-center justify-center text-center space-y-2">
            <Sparkles className="w-5 h-5 text-muted-foreground/60" />
            <p className="text-xs text-muted-foreground">No features found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3.5">
          {filteredModules.map((m) => {
            const cardStyle = moduleCardStyles[m.id] || {
              bg: 'bg-card',
              shadow: 'shadow-xs',
              hoverShadow: 'hover:shadow-md'
            }
            if (m.isPremium) {
              return (
                <button
                  key={m.id}
                  onClick={(e) => handleModuleClick(m, e)}
                  className="block text-left hover:scale-[1.02] active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-accent rounded-[20px] cursor-pointer w-full"
                >
                  <Card className={`${cardStyle.bg} border-none text-white rounded-[20px] p-4 h-[110px] flex flex-col justify-start items-start cursor-pointer transition-all duration-300 relative overflow-hidden shadow-xs ${cardStyle.shadow} ${cardStyle.hoverShadow} w-full`}>
                    <span className="absolute top-2.5 right-2.5 text-[8px] bg-white/20 text-white font-bold uppercase px-2 py-0.5 rounded-full tracking-wider select-none">
                      PRO
                    </span>
                    <span className="text-[13px] font-semibold tracking-tight text-white leading-tight select-none text-left max-w-[70%]">
                      {m.name}
                    </span>
                    <div className="absolute bottom-1.5 right-1.5 pointer-events-none">
                      <ModuleIcon 
                        name={m.icon} 
                        strokeWidth={1.5} 
                        className="w-14 h-14 text-white/20" 
                      />
                    </div>
                  </Card>
                </button>
              )
            } else {
              return (
                <Link 
                  key={m.id} 
                  to={m.route}
                  className="block hover:scale-[1.02] active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-accent rounded-[20px]"
                >
                  <Card className={`${cardStyle.bg} border-none text-white rounded-[20px] p-4 h-[110px] flex flex-col justify-start items-start cursor-pointer transition-all duration-300 relative overflow-hidden shadow-xs ${cardStyle.shadow} ${cardStyle.hoverShadow}`}>
                    <span className="text-[13px] font-semibold tracking-tight text-white leading-tight select-none text-left max-w-[70%]">
                      {m.name}
                    </span>
                    <div className="absolute bottom-1.5 right-1.5 pointer-events-none">
                      <ModuleIcon 
                        name={m.icon} 
                        strokeWidth={1.5} 
                        className="w-14 h-14 text-white/20" 
                      />
                    </div>
                  </Card>
                </Link>
              )
            }
          })}
        </div>
      )}

    </div>
  )
}

export default Home
