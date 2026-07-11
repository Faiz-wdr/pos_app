import React, { useState } from 'react'
import { Mail, CheckCircle, RefreshCw, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface ForgotPasswordFormProps {
  onReset: (email: string) => Promise<void>
  onSwitchToLogin: () => void
  loading: boolean
}

export const ForgotPasswordForm = ({
  onReset,
  onSwitchToLogin,
  loading
}: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [success, setSuccess] = useState(false)

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address.')
      return false
    }
    setEmailError('')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      try {
        await onReset(email)
        setSuccess(true)
      } catch (err) {
        // Error will be caught and mapped by the parent useAuth state handler
        console.error(err)
      }
    }
  }

  if (success) {
    return (
      <div className="space-y-5 text-center py-4 select-none">
        <div className="flex justify-center text-green-500">
          <CheckCircle className="w-12 h-12 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-foreground">Reset Email Sent</h3>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-[280px] mx-auto">
            We have sent a password reset link to <span className="font-bold text-foreground">{email}</span>. Please check your inbox.
          </p>
        </div>
        <Button
          onClick={onSwitchToLogin}
          className="w-full font-black uppercase text-xs tracking-wider h-11 rounded-xl cursor-pointer"
        >
          Return to Login
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left select-none">
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label htmlFor="forgot-email" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Email Address
          </label>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="flex items-center space-x-1 text-[10px] font-bold text-accent uppercase tracking-wider hover:opacity-85 cursor-pointer"
            disabled={loading}
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Back to Login</span>
          </button>
        </div>
        <div className="relative">
          <Input
            id="forgot-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="pl-10 font-medium"
            disabled={loading}
            required
            autoFocus
          />
          <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground/60" />
        </div>
        {emailError && <p className="text-[10px] text-red-500 font-bold pl-1">{emailError}</p>}
      </div>

      <Button
        type="submit"
        className="w-full flex items-center justify-center space-x-2 font-black uppercase text-xs tracking-wider h-11 rounded-xl cursor-pointer"
        disabled={loading || !email}
      >
        {loading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Sending Link...</span>
          </>
        ) : (
          <span>Send Reset Link</span>
        )}
      </Button>
    </form>
  )
}

export default ForgotPasswordForm
