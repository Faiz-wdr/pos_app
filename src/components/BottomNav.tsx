import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, LayoutGrid, Settings, User } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { useAuth } from '@/core/firebase/hooks/useAuth'

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/modules', label: 'Modules', icon: LayoutGrid },
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/profile', label: 'Profile', icon: User }
]

export const BottomNav = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname
  const { isGuest, openAuthSheet } = useAuth()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 border-t border-border pb-safe flex items-center justify-around h-16 sm:h-18 select-none">
      <div className="w-full max-w-md mx-auto flex items-center justify-around px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = item.path === '/' 
            ? currentPath === '/' 
            : currentPath.startsWith(item.path)
            
          const Icon = item.icon

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={(e) => {
                if (item.path === '/profile' && isGuest) {
                  e.preventDefault()
                  openAuthSheet({
                    title: 'Welcome',
                    description: 'Sign in to access premium modules, restore purchases and sync your data.',
                    onSuccess: () => {
                      navigate('/profile')
                    }
                  })
                }
              }}
              className="relative flex flex-col items-center justify-center w-16 h-12 transition-colors cursor-pointer group focus-visible:outline-2 focus-visible:outline-accent"
              aria-label={item.label}
            >
              
              <Icon
                className={cn(
                  'w-5 h-5 transition-colors duration-200',
                  isActive ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              <span
                className={cn(
                  'text-[10px] font-bold mt-1 transition-colors duration-200',
                  isActive ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground'
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
export default BottomNav
