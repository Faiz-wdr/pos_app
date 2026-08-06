import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, LayoutGrid, RefreshCw } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { useAuth } from '@/core/firebase/hooks/useAuth'
import { playNotificationSound, playSuccessSound } from '@/shared/utils/sound'

export const AuthBottomSheet = () => {
  const {
    isAuthSheetOpen,
    closeAuthSheet,
    authSheetTitle,
    authSheetDescription,
    authSuccessCallback,
    loginWithGoogle,
    loading,
    error,
    resetAuth
  } = useAuth()

  // Reset auth errors when sheet closes
  useEffect(() => {
    if (!isAuthSheetOpen) {
      const timer = setTimeout(() => {
        resetAuth()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isAuthSheetOpen, resetAuth])

  // Play notification chime when in-app errors pop up
  useEffect(() => {
    if (error) {
      playNotificationSound()
    }
  }, [error])

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle()
      playSuccessSound()
      closeAuthSheet()
      if (authSuccessCallback) {
        authSuccessCallback()
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Dialog
      isOpen={isAuthSheetOpen}
      onClose={closeAuthSheet}
      title={authSheetTitle || 'Welcome to Personal OS'}
      description={authSheetDescription || 'Sign in to unlock premium modules and sync your settings.'}
      className="pb-6"
    >
      <div className="mt-4 flex flex-col items-center text-center space-y-6 select-none">
        
        {/* App Logo */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center text-accent shadow-md animate-in zoom-in duration-300">
          <LayoutGrid className="w-8 h-8" />
        </div>

        {/* Error Alert Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="w-full p-3 bg-red-500/10 dark:bg-red-500/15 border border-red-500/20 rounded-xl flex items-start space-x-2 text-red-600 dark:text-red-400 text-xs font-semibold text-left"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sign In Button */}
        <div className="w-full pt-2">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2.5 font-bold uppercase text-xs tracking-wider h-12 rounded-xl cursor-pointer bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-sm dark:bg-neutral-900 dark:text-white dark:border-neutral-800 dark:hover:bg-neutral-800"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-accent" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 14.99 0 12 0 7.35 0 3.37 2.67 1.45 6.57l3.92 3.04C6.35 6.94 8.94 5.04 12 5.04z" />
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.51h6.48c-.29 1.48-1.14 2.73-2.43 3.59l3.78 2.93c2.2-2.03 3.48-5.02 3.48-8.68z" />
                  <path fill="#FBBC05" d="M5.37 14.47c-.24-.73-.38-1.5-.38-2.3s.14-1.57.38-2.3L1.45 6.57C.52 8.2.01 10.04.01 12c0 1.96.51 3.8 1.44 5.43l3.92-3.04z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.97-1.07 7.96-2.91l-3.78-2.93c-1.12.75-2.54 1.2-4.18 1.2-3.06 0-5.65-1.9-6.62-4.57L1.45 17.83C3.37 21.33 7.35 24 12 24z" />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>

        {/* Privacy disclaimer */}
        <p className="text-[10px] font-medium text-muted-foreground leading-relaxed px-4 pt-2">
          By signing in, you agree to our <a href="#" className="text-accent hover:underline">Terms of Service</a> and <a href="#" className="text-accent hover:underline">Privacy Policy</a>. Personal OS securely syncs your profile.
        </p>

      </div>
    </Dialog>
  )
}

export default AuthBottomSheet
