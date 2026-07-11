import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { useAuth } from '@/core/firebase/hooks/useAuth'
import { LoginForm } from './LoginForm'
import { SignupForm } from './SignupForm'
import { ForgotPasswordForm } from './ForgotPasswordForm'
import { playNotificationSound, playSuccessSound } from '@/shared/utils/sound'

type AuthTab = 'login' | 'signup' | 'forgot'

export const AuthBottomSheet = () => {
  const {
    isAuthSheetOpen,
    closeAuthSheet,
    authSheetTitle,
    authSheetDescription,
    authSuccessCallback,
    loginWithEmail,
    signupWithEmail,
    sendPasswordReset,
    loading,
    error,
    setError,
    resetAuth
  } = useAuth()

  const [activeTab, setActiveTab] = useState<AuthTab>('login')

  // Reset tab back to login when sheet closes
  useEffect(() => {
    if (!isAuthSheetOpen) {
      const timer = setTimeout(() => {
        setActiveTab('login')
        resetAuth()
      }, 300) // matches dialog fade-out timing
      return () => clearTimeout(timer)
    }
  }, [isAuthSheetOpen, resetAuth])

  // Play notification chime when in-app errors pop up
  useEffect(() => {
    if (error) {
      playNotificationSound()
    }
  }, [error])

  const handleLogin = async (email: string, pass: string) => {
    try {
      await loginWithEmail(email, pass)
      playSuccessSound()
      closeAuthSheet()
      if (authSuccessCallback) {
        authSuccessCallback()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSignup = async (email: string, pass: string, name: string) => {
    try {
      await signupWithEmail(email, pass, name)
      playSuccessSound()
      closeAuthSheet()
      if (authSuccessCallback) {
        authSuccessCallback()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleResetPassword = async (email: string) => {
    try {
      await sendPasswordReset(email)
      setError(null) // clear errors on reset dispatch success
    } catch (err) {
      console.error(err)
      throw err // propagate to form success handler check
    }
  }

  const getHeaderInfo = () => {
    switch (activeTab) {
      case 'signup':
        return {
          title: 'Create Account',
          desc: 'Join the Personal OS family to access premium features and sync data.'
        }
      case 'forgot':
        return {
          title: 'Reset Password',
          desc: 'Enter your email address to receive a secure password reset link.'
        }
      case 'login':
      default:
        return {
          title: authSheetTitle || 'Welcome Back',
          desc: authSheetDescription || 'Sign in to unlock premium modules and sync your data.'
        }
    }
  }

  const header = getHeaderInfo()

  return (
    <Dialog
      isOpen={isAuthSheetOpen}
      onClose={closeAuthSheet}
      title={header.title}
      description={header.desc}
      className="pb-6"
    >
      <div className="mt-4 relative min-h-[260px]">
        {/* Error Alert Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 p-3 bg-red-500/10 dark:bg-red-500/15 border border-red-500/20 rounded-xl flex items-start space-x-2 text-red-600 dark:text-red-400 text-xs font-semibold"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sliding form transitions */}
        <AnimatePresence mode="wait">
          {activeTab === 'login' && (
            <motion.div
              key="login-tab"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.15 }}
            >
              <LoginForm
                onLogin={handleLogin}
                onSwitchToSignup={() => {
                  setError(null)
                  setActiveTab('signup')
                }}
                onSwitchToForgot={() => {
                  setError(null)
                  setActiveTab('forgot')
                }}
                loading={loading}
              />
            </motion.div>
          )}

          {activeTab === 'signup' && (
            <motion.div
              key="signup-tab"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.15 }}
            >
              <SignupForm
                onSignup={handleSignup}
                onSwitchToLogin={() => {
                  setError(null)
                  setActiveTab('login')
                }}
                loading={loading}
              />
            </motion.div>
          )}

          {activeTab === 'forgot' && (
            <motion.div
              key="forgot-tab"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.15 }}
            >
              <ForgotPasswordForm
                onReset={handleResetPassword}
                onSwitchToLogin={() => {
                  setError(null)
                  setActiveTab('login')
                }}
                loading={loading}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Dialog>
  )
}

export default AuthBottomSheet
