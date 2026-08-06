import React, { useState, useEffect } from 'react'
import { User, RefreshCw } from 'lucide-react'
import { useAuth } from '@/core/firebase/hooks/useAuth'

interface OnboardingScreenProps {
  onCompleted: () => void
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onCompleted }) => {
  const { loginWithGoogle, openAuthSheet, loading } = useAuth()
  const [activePageIndex, setActivePageIndex] = useState(0)

  // Touch and Drag tracking for swipe gestures
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [mouseDownX, setMouseDownX] = useState<number | null>(null)

  const minSwipeDistance = 50

  const onTouchStartHandler = (e: React.TouchEvent) => {
    handleInteraction()
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMoveHandler = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && activePageIndex < 2) {
      setActivePageIndex(p => p + 1)
    } else if (isRightSwipe && activePageIndex > 0) {
      setActivePageIndex(p => p - 1)
    }
  }

  const onMouseDownHandler = (e: React.MouseEvent) => {
    handleInteraction()
    setMouseDownX(e.clientX)
  }

  const onMouseUpHandler = (e: React.MouseEvent) => {
    if (mouseDownX === null) return
    const distance = mouseDownX - e.clientX
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && activePageIndex < 2) {
      setActivePageIndex(p => p + 1)
    } else if (isRightSwipe && activePageIndex > 0) {
      setActivePageIndex(p => p - 1)
    }
    setMouseDownX(null)
  }

  // Auto-sliding interval logic (slides every 6 seconds, pauses upon interaction)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => {
      setActivePageIndex((current) => (current + 1) % 3)
    }, 6000)
    return () => clearInterval(interval)
  }, [isPaused])

  const handleInteraction = () => {
    setIsPaused(true)
  }

  // Action Triggers
  const handleGuestContinue = () => {
    localStorage.setItem('personalos_onboarding_completed', 'true')
    onCompleted()
  }

  const handleGoogleSignIn = async () => {
    try {
      const profile = await loginWithGoogle()
      if (profile) {
        localStorage.setItem('personalos_onboarding_completed', 'true')
        onCompleted()
      }
    } catch (err) {
      console.error('Google sign-in onboarding error:', err)
    }
  }

  const handleLogin = () => {
    openAuthSheet({
      title: 'Welcome Back',
      description: 'Sign in to access your modules, data, and settings.',
      onSuccess: () => {
        localStorage.setItem('personalos_onboarding_completed', 'true')
        onCompleted()
      }
    })
  }

  const slides = [
    {
      title: (
        <>
          Everyday<br />
          Tools,<br />
          One Place.
        </>
      ),
      subtitle: 'Organize life with ease.',
      image: '/Blocks.png'
    },
    {
      title: (
        <>
          Take <br />Control of<br />
          Your Money
        </>
      ),
      subtitle: 'Track. Budget. Save.',
      image: '/wallet.png'
    },
    {
      title: (
        <>
          Stay<br />
          organized<br />
          Every Day
        </>
      ),
      subtitle: 'Plan. Focus. Achieve.',
      image: '/clock.png'
    }
  ]

  return (
    <div
      className="flex-1 flex flex-col justify-between w-full h-full bg-neutral-950 text-white relative select-none overflow-hidden py-12 px-6"
      onTouchStart={onTouchStartHandler}
      onTouchMove={onTouchMoveHandler}
      onTouchEnd={onTouchEndHandler}
      onMouseDown={onMouseDownHandler}
      onMouseUp={onMouseUpHandler}
    >
      {/* Slider Viewport */}
      <div className="flex-1 flex flex-col justify-center min-h-0 relative">
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{
            width: '300%',
            transform: `translate3d(-${activePageIndex * 33.333}%, 0, 0)`
          }}
        >
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className="w-1/3 h-full flex flex-col justify-center items-start text-left px-6 space-y-8 select-none"
            >
              {/* Slide Content Header */}
              <div className="space-y-2 w-full">
                <h1 className="text-amber-400 font-semibold text-[40px] leading-[1.08] tracking-tight">
                  {slide.title}
                </h1>
                <p className="text-base text-zinc-300">
                  {slide.subtitle}
                </p>
              </div>

              {/* Graphic Illustration */}
              <div className="w-52 h-52 flex items-center justify-center self-center drop-shadow-[0_12px_24px_rgba(0,0,0,0.4)] pointer-events-none select-none">
                <img
                  src={slide.image}
                  alt="Illustration"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Footer Control Actions */}
      <div className="w-full space-y-6 pt-4 shrink-0 flex flex-col items-center">
        {/* Pagination Dot Indicators */}
        <div className="flex items-center space-x-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                handleInteraction()
                setActivePageIndex(idx)
              }}
              className={`transition-all duration-300 cursor-pointer ${activePageIndex === idx
                ? 'bg-amber-400 w-4 h-1.5 rounded-full'
                : 'bg-zinc-700 w-1.5 h-1.5 rounded-full'
                }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Buttons and Login Prompt */}
        <div className="w-full space-y-3">
          {/* Guest Button */}
          <button
            onClick={handleGuestContinue}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2.5 font-bold uppercase text-xs tracking-wider h-12 rounded-xl cursor-pointer bg-zinc-900 border border-zinc-800 text-zinc-100 hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <User className="w-4 h-4 text-zinc-400" />
            <span>Continue as Guest</span>
          </button>

          {/* Google Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2.5 font-bold uppercase text-xs tracking-wider h-12 rounded-xl cursor-pointer bg-zinc-900 border border-zinc-800 text-zinc-100 hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 14.99 0 12 0 7.35 0 3.37 2.67 1.45 6.57l3.92 3.04C6.35 6.94 8.94 5.04 12 5.04z" />
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.51h6.48c-.29 1.48-1.14 2.73-2.43 3.59l3.78 2.93c2.2-2.03 3.48-5.02 3.48-8.68z" />
                <path fill="#FBBC05" d="M5.37 14.47c-.24-.73-.38-1.5-.38-2.3s.14-1.57.38-2.3L1.45 6.57C.52 8.2.01 10.04.01 12c0 1.96.51 3.8 1.44 5.43l3.92-3.04z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.97-1.07 7.96-2.91l-3.78-2.93c-1.12.75-2.54 1.2-4.18 1.2-3.06 0-5.65-1.9-6.62-4.57L1.45 17.83C3.37 21.33 7.35 24 12 24z" />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          {/* Login prompt */}
          <div className="text-center pt-2 select-none">
            <span className="text-[11px] font-medium text-zinc-400">
              Already have an account?{' '}
              <button
                onClick={handleLogin}
                className="text-amber-400 font-bold hover:underline bg-transparent border-0 p-0 cursor-pointer focus:outline-hidden"
              >
                Log In
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingScreen
