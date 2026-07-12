import React, { useState } from 'react'
import { User as UserIcon, Mail, Lock, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface SignupFormProps {
  onSignup: (email: string, password: string, fullName: string) => Promise<void>
  onSwitchToLogin: () => void
  loading: boolean
}

export const SignupForm = ({
  onSignup,
  onSwitchToLogin,
  loading
}: SignupFormProps) => {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const [nameError, setNameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passError, setPassError] = useState('')
  const [confirmError, setConfirmError] = useState('')

  const validate = () => {
    let isValid = true
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!fullName.trim()) {
      setNameError('Full name is required.')
      isValid = false
    } else {
      setNameError('')
    }
    
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address.')
      isValid = false
    } else {
      setEmailError('')
    }

    if (password.length < 6) {
      setPassError('Password must be at least 6 characters.')
      isValid = false
    } else {
      setPassError('')
    }

    if (password !== confirmPassword) {
      setConfirmError('Passwords do not match.')
      isValid = false
    } else {
      setConfirmError('')
    }

    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSignup(email, password, fullName)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left select-none">
      <div className="space-y-1.5">
        <label htmlFor="signup-name" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Full Name
        </label>
        <div className="relative">
          <Input
            id="signup-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            className="pl-10 font-medium"
            disabled={loading}
            required
          />
          <UserIcon className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground/60" />
        </div>
        {nameError && <p className="text-[10px] text-red-500 font-bold pl-1">{nameError}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="signup-email" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Email Address
        </label>
        <div className="relative">
          <Input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="pl-10 font-medium"
            disabled={loading}
            required
          />
          <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground/60" />
        </div>
        {emailError && <p className="text-[10px] text-red-500 font-bold pl-1">{emailError}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="signup-password" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Password
        </label>
        <div className="relative">
          <Input
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 6 characters"
            className="pl-10 pr-10 font-medium"
            disabled={loading}
            required
          />
          <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground/60" />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-3.5 text-muted-foreground/60 hover:text-foreground cursor-pointer"
            disabled={loading}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {passError && <p className="text-[10px] text-red-500 font-bold pl-1">{passError}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="signup-confirm" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Confirm Password
        </label>
        <div className="relative">
          <Input
            id="signup-confirm"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat password"
            className="pl-10 pr-10 font-medium"
            disabled={loading}
            required
          />
          <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground/60" />
        </div>
        {confirmError && <p className="text-[10px] text-red-500 font-bold pl-1">{confirmError}</p>}
      </div>

      <div className="space-y-3 pt-2">
        <Button
          type="submit"
          className="w-full flex items-center justify-center space-x-2 font-bold uppercase text-xs tracking-wider h-11 rounded-xl cursor-pointer"
          disabled={loading}
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            <span>Create Account</span>
          )}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-[11px] font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer py-1"
            disabled={loading}
          >
            Already have an account? <span className="text-accent hover:underline">Log in</span>
          </button>
        </div>
      </div>
    </form>
  )
}

export default SignupForm
