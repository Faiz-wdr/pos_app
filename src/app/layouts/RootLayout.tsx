import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from '@/components/BottomNav'
import { useNavigationStore } from '@/core/navigation/navigationStore'
import { cn } from '@/shared/utils/cn'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/core/firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/core/firebase/firestore'
import { useAuthStore } from '@/core/firebase/stores/authStore'
import { authService, mapFirebaseError } from '@/core/firebase/services/authService'
import { serializeFirebaseUser } from '@/core/firebase/hooks/useAuth'
import { AuthBottomSheet } from '@/core/firebase/components/auth/AuthBottomSheet'
import { UpdateDialog } from '@/core/pwa/UpdateDialog'
import { useUserHeartbeat } from '@/shared/hooks/useUserHeartbeat'
import { ShieldAlert } from 'lucide-react'
import { OnboardingScreen } from '@/core/onboarding/components/OnboardingScreen'

export const RootLayout = () => {
  const location = useLocation()
  const setActiveTab = useNavigationStore((state) => state.setActiveTab)
  const hideSystemNav = useNavigationStore((state) => state.hideSystemNav)
  const setHideSystemNav = useNavigationStore((state) => state.setHideSystemNav)
  const isFullscreen = useNavigationStore((state) => state.isFullscreen)
  const restoreSession = useAuthStore((state) => state.restoreSession)
  const user = useAuthStore((state) => state.user)
  const [authInitialized, setAuthInitialized] = useState(false)
  const [onboardingCompleted, setOnboardingCompleted] = useState(() => localStorage.getItem('personalos_onboarding_completed') === 'true')
  const showOnboarding = !onboardingCompleted && !user

  // Start the background heartbeat activity reporter
  useUserHeartbeat()

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null

    // Check redirect result on load (mobile browser / standalone PWA)
    authService.handleRedirectResult()
      .then(async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const profile = await authService.syncUserProfile(
              firebaseUser.uid,
              firebaseUser.email,
              firebaseUser.displayName,
              firebaseUser.photoURL
            )
            useAuthStore.getState().login(profile)
          } catch (e) {
            console.error('Error syncing profile from redirect result:', e)
          }
        }
      })
      .catch((error) => {
        console.error('Redirect sign-in error:', error)
        const userFriendlyMessage = mapFirebaseError(error)
        useAuthStore.getState().setError(userFriendlyMessage)
        useAuthStore.getState().openAuthSheet({
          title: 'Sign In Failed',
          description: userFriendlyMessage
        })
      })

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot()
        unsubscribeSnapshot = null
      }

      if (firebaseUser) {
        // Initial sync of profile
        try {
          await authService.syncUserProfile(
            firebaseUser.uid,
            firebaseUser.email,
            firebaseUser.displayName,
            firebaseUser.photoURL
          )
        } catch (e) {
          console.error('Error syncing profile:', e)
        }

        // Set up real-time listener on user doc
        const userDocRef = doc(db, 'users', firebaseUser.uid)
        unsubscribeSnapshot = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data()
            const profile = {
              uid: data.uid,
              fullName: data.fullName || firebaseUser.displayName || '',
              email: data.email || firebaseUser.email,
              photoURL: data.photoURL || firebaseUser.photoURL || null,
              createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
              lastLogin: data.lastLogin?.toDate?.()?.toISOString() || data.lastLogin || new Date().toISOString(),
              isPremium: data.plan === 'pro' || !!data.isPremium || !!data.premium,
              enabledModules: data.enabledModules || [],
              role: data.role || 'user',
              status: data.status || 'active'
            }
            restoreSession(profile)
          } else {
            restoreSession(serializeFirebaseUser(firebaseUser))
          }
          setAuthInitialized(true)
        }, (err) => {
          console.error('Firestore subscription error:', err)
          restoreSession(serializeFirebaseUser(firebaseUser))
          setAuthInitialized(true)
        })
      } else {
        restoreSession(null)
        setAuthInitialized(true)
      }
    })

    return () => {
      unsubscribeAuth()
      if (unsubscribeSnapshot) unsubscribeSnapshot()
    }
  }, [restoreSession])

  useEffect(() => {
    const path = location.pathname
    if (path === '/') {
      setActiveTab('home')
    } else if (path.startsWith('/modules')) {
      setActiveTab('modules')
    } else if (path.startsWith('/settings')) {
      setActiveTab('settings')
    } else if (path.startsWith('/profile')) {
      setActiveTab('profile')
    }

    // Automatically hide system bottom nav on module detail pages
    const isSubModule = path.startsWith('/modules/') && path !== '/modules'
    setHideSystemNav(isSubModule)
  }, [location.pathname, setActiveTab, setHideSystemNav])

  const handleLogout = async () => {
    try {
      await authService.logout()
      useAuthStore.getState().logout()
    } catch (e) {
      console.error('Error logging out suspended account:', e)
    }
  }

  const isSuspended = user && user.status === 'suspended'

  const isClockModule = location.pathname.startsWith('/modules/clock')

  return (
    <div className="min-h-screen bg-background/50 dark:bg-black/90 flex flex-col justify-between transition-colors duration-300">
      {/* Containerizing layout as mobile device mock on wide viewports, edge-to-edge on mobile */}
      <main
        className={cn(
          'w-full mx-auto min-h-screen bg-background flex flex-col relative border-x border-border/60 dark:border-border/30 shadow-2xl transition-all duration-300 overflow-hidden',
          isFullscreen ? 'max-w-none border-x-0' : 'max-w-md',
          (showOnboarding || hideSystemNav) ? 'pb-0' : 'pb-16 sm:pb-18',
          !isClockModule && 'lock-portrait'
        )}
      >
        {!authInitialized ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 select-none">
            <div className="w-10 h-10 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider animate-pulse">Initializing PersonalOS...</p>
          </div>
        ) : showOnboarding ? (
          <>
            <OnboardingScreen onCompleted={() => setOnboardingCompleted(true)} />
            <AuthBottomSheet />
          </>
        ) : isSuspended ? (
          <div className="flex-1 flex flex-col justify-center items-center p-6 text-center space-y-5 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-base font-extrabold text-foreground tracking-tight">Account Restricted</h2>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-[280px] mx-auto">
                Your personal account has been suspended by an administrator. Please contact support if you believe this is an error.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-muted border border-border text-foreground hover:bg-card active:scale-[0.98] transition-all cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <>
            {/* Page transitions */}
            <div
              className={cn(
                'flex-1 flex flex-col w-full',
                hideSystemNav ? 'px-0 pt-0 pb-0' : 'px-4 pt-4 pb-4'
              )}
            >
              <Outlet />
            </div>

            {!hideSystemNav && <BottomNav />}
            <AuthBottomSheet />
            <UpdateDialog />
          </>
        )}
      </main>
    </div>
  )
}
export default RootLayout
