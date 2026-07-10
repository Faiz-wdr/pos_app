import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/core/firebase/hooks/useAuth'
import { OTPVerification } from './OTPVerification'

export const LoginBottomSheet = () => {
  const {
    isAuthSheetOpen,
    closeAuthSheet,
    authSheetTitle,
    authSheetDescription,
    authSuccessCallback,
    authStep,
    setAuthStep,
    sendOtp,
    verifyOtp,
    loading,
    error,
    resetAuth,
    phoneNumber: storePhoneNumber
  } = useAuth()

  const [countryCode, setCountryCode] = useState('+91')
  const [phoneInput, setPhoneInput] = useState('')

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneInput) return

    // Clean formatting and validate number length
    const cleanedNumber = phoneInput.replace(/\D/g, '')
    if (cleanedNumber.length < 8) {
      alert('Please enter a valid mobile number.')
      return
    }

    const formattedPhone = `${countryCode}${cleanedNumber}`
    try {
      await sendOtp(formattedPhone, 'recaptcha-container')
    } catch (err) {
      console.error(err)
    }
  }

  const handleVerifyOtp = async (otpCode: string) => {
    try {
      await verifyOtp(otpCode)
      // Successful auth completion
      closeAuthSheet()
      setPhoneInput('')
      if (authSuccessCallback) {
        authSuccessCallback()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleResendOtp = async () => {
    const cleanedNumber = phoneInput.replace(/\D/g, '')
    const formattedPhone = `${countryCode}${cleanedNumber}`
    try {
      await sendOtp(formattedPhone, 'recaptcha-container')
    } catch (err) {
      console.error(err)
    }
  }

  const handleClose = () => {
    resetAuth()
    setPhoneInput('')
    closeAuthSheet()
  }

  return (
    <Dialog
      isOpen={isAuthSheetOpen}
      onClose={handleClose}
      title={authSheetTitle}
      description={authSheetDescription}
      className="pb-6"
    >
      {/* Invisible Recaptcha Element */}
      <div id="recaptcha-container" className="absolute opacity-0 pointer-events-none w-0 h-0"></div>

      <div className="mt-4 relative min-h-[220px]">
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

        <AnimatePresence mode="wait">
          {authStep === 'phone' ? (
            /* PHONE INPUT FORM */
            <motion.form
              key="phone-step"
              onSubmit={handleSendOtp}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="space-y-4 text-left"
            >
              <div className="space-y-2">
                <label htmlFor="auth-phone-input" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Mobile Number
                </label>
                <div className="flex space-x-2">
                  <div className="w-20 shrink-0 relative">
                    <Input
                      id="auth-country-code-input"
                      type="text"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      placeholder="+91"
                      className="text-center font-bold"
                      disabled={loading}
                    />
                  </div>
                  <div className="flex-1 relative">
                    <Input
                      id="auth-phone-input"
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="98765 43210"
                      className="font-bold tracking-wide"
                      disabled={loading}
                      required
                    />
                    <Phone className="w-4 h-4 absolute right-3.5 top-3.5 text-muted-foreground/60" />
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClose}
                  className="flex-1 font-black uppercase text-xs tracking-wider h-11 rounded-xl cursor-pointer"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  id="auth-phone-continue-btn"
                  type="submit"
                  className="flex-1 flex items-center justify-center space-x-2 font-black uppercase text-xs tracking-wider h-11 rounded-xl cursor-pointer"
                  disabled={loading || !phoneInput}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </motion.form>
          ) : (
            /* OTP VERIFICATION COMPONENT */
            <motion.div
              key="otp-step"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              <OTPVerification
                phoneNumber={storePhoneNumber}
                onVerify={handleVerifyOtp}
                onResend={handleResendOtp}
                onBack={() => setAuthStep('phone')}
                loading={loading}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Dialog>
  )
}

export default LoginBottomSheet
