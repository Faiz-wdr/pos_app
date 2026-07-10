import React, { useState, useEffect, useRef } from 'react'
import { ArrowLeft, RefreshCw, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface OTPVerificationProps {
  phoneNumber: string
  onVerify: (otp: string) => Promise<void>
  onResend: () => Promise<void>
  onBack: () => void
  loading: boolean
}

export const OTPVerification = ({
  phoneNumber,
  onVerify,
  onResend,
  onBack,
  loading
}: OTPVerificationProps) => {
  const [otp, setOtp] = useState('')
  const [resendTimer, setResendTimer] = useState(60) // 60 seconds resend countdown
  const timerRef = useRef<any>(null)

  useEffect(() => {
    setResendTimer(60)
  }, [phoneNumber])

  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [resendTimer])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length === 6) {
      onVerify(otp)
    }
  }

  const handleResendClick = () => {
    if (resendTimer === 0) {
      onResend()
      setResendTimer(60)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="auth-otp-input" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Enter 6-Digit OTP
          </label>
          <button
            type="button"
            onClick={onBack}
            className="flex items-center space-x-1 text-[10px] font-bold text-accent uppercase tracking-wider hover:opacity-85 transition-opacity cursor-pointer"
            disabled={loading}
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Edit Number ({phoneNumber})</span>
          </button>
        </div>
        
        <div className="relative">
          <Input
            id="auth-otp-input"
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            className="font-bold tracking-widest text-center text-lg"
            disabled={loading}
            required
            autoFocus
          />
          <Lock className="w-4 h-4 absolute right-3.5 top-3.5 text-muted-foreground/60" />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs px-1">
        <span className="text-muted-foreground">Didn't receive code?</span>
        {resendTimer > 0 ? (
          <span className="text-muted-foreground font-semibold">Resend in {resendTimer}s</span>
        ) : (
          <button
            id="auth-otp-resend-btn"
            type="button"
            onClick={handleResendClick}
            className="text-accent font-bold hover:underline transition-all cursor-pointer"
            disabled={loading}
          >
            Resend Code
          </button>
        )}
      </div>

      <Button
        id="auth-otp-verify-btn"
        type="submit"
        className="w-full flex items-center justify-center space-x-2 font-black uppercase text-xs tracking-wider h-11 rounded-xl cursor-pointer"
        disabled={loading || otp.length < 6}
      >
        {loading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Verifying...</span>
          </>
        ) : (
          <>
            <span>Verify & Login</span>
          </>
        )}
      </Button>
    </form>
  )
}

export default OTPVerification
