import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Sparkles, User } from 'lucide-react'
import * as Icons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useModuleStore } from '@/core/modules/moduleStore'
import { useAuth } from '@/core/firebase/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import moneyImg from '@/assets/money.png'
import plannerImg from '@/assets/planner.png'

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
  'day-planner': {
    bg: 'bg-gradient-to-br from-[#F43F5E] to-[#E11D48]',
    shadow: 'shadow-rose-500/10',
    hoverShadow: 'hover:shadow-rose-500/25'
  }
}

// Horizontal push/move animation variants
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 1
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 1
  })
}

export const Home = () => {
  const [greeting, setGreeting] = useState('Hello')
  const [searchQuery, setSearchQuery] = useState('')
  const { modules, registerModule } = useModuleStore()
  const navigate = useNavigate()
  const { isGuest, openAuthSheet, user } = useAuth()

  // Sliding ad banner and info dialog states
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(1) // 1 for next (right), -1 for prev (left)
  const [isPaused, setIsPaused] = useState(false)
  const [infoModalOpen, setInfoModalOpen] = useState(false)
  const [updateModalOpen, setUpdateModalOpen] = useState(false)

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
      id: 'day-planner',
      name: 'Day Planner',
      icon: 'CalendarCheck',
      description: 'Organize tasks, track routines, and plan your daily timeline.',
      isPremium: false,
      enabled: true,
      requiresLogin: false,
      supportsCloudSync: false,
      route: '/modules/day-planner'
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

    // Check version update release modal trigger
    const CURRENT_VERSION = '1.2.0'
    const lastSeenVersion = localStorage.getItem('last_seen_version')
    if (lastSeenVersion !== CURRENT_VERSION) {
      setUpdateModalOpen(true)
    }
  }, [])

  const handleCloseUpdateModal = () => {
    localStorage.setItem('last_seen_version', '1.2.0')
    setUpdateModalOpen(false)
  }

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

  const handlePromoAction = (slideId: string) => {
    if (isGuest) {
      openAuthSheet({
        title: slideId === 'upgrade' ? 'Go Pro with PersonalOS' : 'Unlock Pro Module',
        description: slideId === 'upgrade' 
          ? 'Sign in to access all premium modules, unlock cloud sync, and premium lifestyle trackers.'
          : `Sign in to unlock the ${slideId === 'income' ? 'Income Manager' : 'Day Planner'} module.`,
        onSuccess: () => {
          if (slideId === 'income') navigate('/modules/income')
          else if (slideId === 'day-planner') navigate('/modules/day-planner')
          else navigate('/profile')
        }
      })
    } else {
      if (slideId === 'income') {
        navigate('/modules/income')
      } else if (slideId === 'day-planner') {
        navigate('/modules/day-planner')
      } else {
        setInfoModalOpen(true)
      }
    }
  }

  const promoSlides = [
    {
      id: 'upgrade',
      title: 'PersonalOS Pro',
      description: 'Unlock secure cloud synchronization and all premium lifestyle modules.',
      badge: 'Upgrade',
      accentColor: 'text-white bg-white/20',
      gradient: 'from-[#7c3aed] via-[#6366f1] to-[#4f46e5]',
      btnTextColor: 'text-[#6366f1]',
      icon: 'Crown',
      actionText: 'Get Pro',
      disclaimer: 'PersonalOS Premium Modules • Cloud Sync Enabled',
      action: () => handlePromoAction('upgrade'),
      illustration: (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.25)]">
          <defs>
            <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffd700" />
              <stop offset="50%" stopColor="#ffae00" />
              <stop offset="100%" stopColor="#d4af37" />
            </linearGradient>
            <linearGradient id="glowingGem" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ff453a" />
              <stop offset="100%" stopColor="#b30006" />
            </linearGradient>
          </defs>
          <path d="M 20,25 Q 20,30 25,30 Q 20,30 20,35 Q 20,30 15,30 Q 20,30 20,25 Z" fill="#ffffff" className="animate-pulse" />
          <path d="M 80,65 Q 80,70 85,70 Q 80,70 80,75 Q 80,70 75,70 Q 80,70 80,65 Z" fill="#ffd700" className="animate-pulse" />
          <path d="M 25,70 L 75,70 L 70,78 L 30,78 Z" fill="url(#crownGrad)" />
          <path d="M 25,70 L 20,40 L 37,58 L 50,30 L 63,58 L 80,40 L 75,70 Z" fill="url(#crownGrad)" />
          <circle cx="20" cy="40" r="3" fill="url(#glowingGem)" />
          <circle cx="50" cy="30" r="4.5" fill="url(#glowingGem)" />
          <circle cx="80" cy="40" r="3" fill="url(#glowingGem)" />
          <circle cx="35" cy="74" r="2" fill="#ffffff" />
          <circle cx="50" cy="74" r="2.5" fill="#3b82f6" />
          <circle cx="65" cy="74" r="2" fill="#ffffff" />
        </svg>
      )
    },
    {
      id: 'income',
      title: 'Take Control of Your Money',
      description: 'Know where your salary goes, stay within budget and build better saving habits.',
      badge: 'Pro Module',
      accentColor: 'text-white bg-white/20',
      gradient: 'from-[#3b82f6] via-[#2563eb] to-[#1d4ed8]',
      btnTextColor: 'text-[#2563eb]',
      icon: 'DollarSign',
      actionText: 'Unlock',
      disclaimer: 'PersonalOS Premium Modules • Cloud Sync Enabled',
      action: () => handlePromoAction('income'),
      illustration: (
        <img 
          src={plannerImg} 
          alt="Income Manager" 
          className="w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.25)]" 
        />
      )
    },
    {
      id: 'day-planner',
      title: 'Master Your Day, Step by Step',
      description: 'Organize tasks, track routines, and achieve your daily goals with clarity.',
      badge: 'Free Module',
      accentColor: 'text-white bg-white/20',
      gradient: 'from-[#f43f5e] via-[#e11d48] to-[#be123c]',
      btnTextColor: 'text-[#e11d48]',
      icon: 'CalendarCheck',
      actionText: 'Open',
      disclaimer: 'PersonalOS Module • Offline First',
      action: () => handlePromoAction('day-planner'),
      illustration: (
        <img 
          src={moneyImg} 
          alt="Day Planner" 
          className="w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.25)]" 
        />
      )
    }
  ]

  const handleNextSlide = () => {
    setDirection(1)
    setCurrentSlide((prev) => (prev + 1) % promoSlides.length)
  }

  const handlePrevSlide = () => {
    setDirection(-1)
    setCurrentSlide((prev) => (prev - 1 + promoSlides.length) % promoSlides.length)
  }

  // Auto sliding interval effect with increased delay (6.5 seconds)
  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      handleNextSlide()
    }, 6500)
    return () => clearInterval(timer)
  }, [isPaused, promoSlides.length])

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

      {/* Pro Ad Banner Component */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="relative overflow-hidden rounded-xl bg-neutral-950 group/banner shadow-sm w-full h-[150px] sm:h-[120px]"
      >
        {/* Top-Right Badge */}
        <div className="absolute top-3 right-3 z-20">
          <span className="text-[8px] font-bold text-white/80 uppercase px-2 py-0.5 rounded-full bg-white/15 tracking-wider backdrop-blur-xs select-none">
            Pro
          </span>
        </div>

        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.4}
            onDragEnd={(_e, info) => {
              const swipeThreshold = 50
              if (info.offset.x < -swipeThreshold) {
                handleNextSlide()
              } else if (info.offset.x > swipeThreshold) {
                handlePrevSlide()
              }
            }}
            transition={{ type: 'spring', stiffness: 80, damping: 22 }}
            className={`p-5 sm:p-6 flex flex-row items-center justify-between gap-4 absolute inset-0 w-full h-full bg-gradient-to-br ${promoSlides[currentSlide].gradient} cursor-grab active:cursor-grabbing touch-none select-none overflow-hidden`}
          >
            {/* Left Column: Text Content and Button */}
            <div className="flex flex-col justify-center h-full z-10 space-y-3 max-w-[65%] select-none">
              <div className="space-y-0.5">
                <h3 className="text-sm sm:text-base font-bold tracking-tight text-white">
                  {promoSlides[currentSlide].title}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-white/80 font-medium leading-tight max-w-sm">
                  {promoSlides[currentSlide].description}
                </p>
              </div>

              <div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    promoSlides[currentSlide].action();
                  }}
                  className={`px-4 py-1.5 bg-white ${promoSlides[currentSlide].btnTextColor} hover:bg-neutral-50 font-extrabold text-[10px] rounded-lg shadow-md transition-all active:scale-95 cursor-pointer`}
                >
                  {promoSlides[currentSlide].actionText}
                </button>
              </div>
            </div>

            {/* Right Column: Beautiful SVG illustration */}
            <div className="flex items-center justify-center w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] z-10 shrink-0 pointer-events-none select-none">
              {promoSlides[currentSlide].illustration}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Left/Right manual sliding navigation arrows */}
        <button
          onClick={(e) => { e.stopPropagation(); handlePrevSlide(); }}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white opacity-0 group-hover/banner:opacity-100 transition-opacity duration-200 cursor-pointer shadow-md active:scale-90 border border-white/10"
          aria-label="Previous slide"
        >
          <Icons.ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleNextSlide(); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white opacity-0 group-hover/banner:opacity-100 transition-opacity duration-200 cursor-pointer shadow-md active:scale-90 border border-white/10"
          aria-label="Next slide"
        >
          <Icons.ChevronRight className="w-4 h-4" />
        </button>

        {/* Centered Carousel Indicators */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex space-x-1.5 z-20">
          {promoSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                currentSlide === idx ? 'w-4 bg-white' : 'w-1 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Unified Modules Grid */}
      {filteredModules.length === 0 ? (
        <Card className="border-dashed border-border bg-transparent shadow-none py-8 rounded-xl">
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
                  className="block text-left hover:scale-[1.02] active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-accent rounded-xl cursor-pointer w-full"
                >
                  <Card className={`${cardStyle.bg} border-none text-white rounded-xl p-4 h-[110px] flex flex-col justify-start items-start cursor-pointer transition-all duration-300 relative overflow-hidden shadow-xs ${cardStyle.shadow} ${cardStyle.hoverShadow} w-full`}>
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
                  className="block hover:scale-[1.02] active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-accent rounded-xl"
                >
                  <Card className={`${cardStyle.bg} border-none text-white rounded-xl p-4 h-[110px] flex flex-col justify-start items-start cursor-pointer transition-all duration-300 relative overflow-hidden shadow-xs ${cardStyle.shadow} ${cardStyle.hoverShadow}`}>
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

      {/* Info Dialog for Active Pro Users */}
      <AnimatePresence>
        {infoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-card border border-border w-full max-w-sm rounded-xl p-6 shadow-2xl space-y-4 text-left relative overflow-hidden"
            >
              {/* Background gradient flare */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-accent/15 text-accent">
                  <Icons.Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Pro Member Active</h3>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">PersonalOS Premium</p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Thank you for being a Pro Member! You have full access to all premium modules including <span className="font-semibold text-foreground">Income Manager</span>, <span className="font-semibold text-foreground">Day Planner</span>, and secure cloud synchronization.
              </p>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setInfoModalOpen(false)}
                  className="px-4 py-2 bg-foreground text-background font-bold text-xs rounded-xl cursor-pointer hover:opacity-90 active:scale-95 transition-all"
                >
                  Awesome!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* System Update / What's New Dialog */}
      <AnimatePresence>
        {updateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-card border border-border w-full max-w-sm rounded-xl p-6 shadow-2xl space-y-4 text-left relative overflow-hidden"
            >
              {/* Background gradient flare */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-accent/15 text-accent">
                  <Icons.Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">What's New in v1.2.0</h3>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">System Update</p>
                </div>
              </div>

              <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1">
                {/* Feature 1 */}
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl shrink-0 mt-0.5">
                    <Icons.Clock className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-[11px] font-bold text-foreground">Clock Majestic Scaling</h4>
                    <p className="text-[10px] text-muted-foreground leading-normal">
                      Bedside clocks now scale to fill the entire viewport in fullscreen mode.
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl shrink-0 mt-0.5">
                    <Icons.Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-[11px] font-bold text-foreground">Polished Ad Carousel</h4>
                    <p className="text-[10px] text-muted-foreground leading-normal">
                      Snappy push-move spring animations, dynamic colors, and custom 3D graphics.
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl shrink-0 mt-0.5">
                    <Icons.LayoutGrid className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-[11px] font-bold text-foreground">Clickable Minimal Cards</h4>
                    <p className="text-[10px] text-muted-foreground leading-normal">
                      Compact module registry list cards with direct tap-to-open interaction.
                    </p>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl shrink-0 mt-0.5">
                    <Icons.CheckSquare className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-[11px] font-bold text-foreground">Clean Layout Refinements</h4>
                    <p className="text-[10px] text-muted-foreground leading-normal">
                      Removed subtitle headers and bottom bar rectangles, unified rounded borders.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleCloseUpdateModal}
                  className="px-4 py-2 bg-foreground text-background font-bold text-xs rounded-xl cursor-pointer hover:opacity-90 active:scale-95 transition-all"
                >
                  Awesome, thanks!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Home
