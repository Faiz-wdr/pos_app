import React, { useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/core/firebase/stores/authStore'

interface AuthGuardProps {
  children: React.ReactNode
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const isGuest = useAuthStore((state) => state.isGuest)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const openAuthSheet = useAuthStore((state) => state.openAuthSheet)
  const navigate = useNavigate()

  useEffect(() => {
    if (isGuest) {
      openAuthSheet({
        title: 'Premium Module',
        description: 'Unlock premium features by signing in with your email address.'
      })
    }
  }, [isGuest, openAuthSheet])

  if (isAuthenticated && !isGuest) {
    return <>{children}</>
  }

  // Renders a premium locked intercept placeholder screen if they cancel
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-6 max-w-sm mx-auto select-none min-h-[60vh]">
      <div className="p-4.5 bg-accent/15 text-accent rounded-full animate-bounce duration-1000">
        <Sparkles className="w-10 h-10" />
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-foreground tracking-tight">Premium Module</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Sign in to access premium features, automated backup engines, and multi-device cloud sync.
        </p>
      </div>

      <div className="w-full space-y-3 pt-4">
        <Button
          onClick={() => openAuthSheet({
            title: 'Premium Module',
            description: 'Unlock premium features by signing in with your email address.'
          })}
          className="w-full font-bold uppercase text-xs tracking-wider h-11 rounded-xl cursor-pointer"
        >
          Sign In to Unlock
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate('/')}
          className="w-full font-bold uppercase text-xs tracking-wider h-11 rounded-xl cursor-pointer bg-muted/60 hover:bg-muted border border-border"
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  )
}

export default AuthGuard
