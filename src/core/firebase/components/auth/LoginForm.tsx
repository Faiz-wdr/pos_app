import React, { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>
  onSwitchToSignup: () => void
  onSwitchToForgot: () => void
  loading: boolean
}

export const LoginForm = ({
  onLogin,
  onSwitchToSignup,
  onSwitchToForgot,
  loading
}: LoginFormProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passError, setPassError] = useState('')

  const validate = () => {
    let isValid = true
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
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

    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onLogin(email, password)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left select-none">
      <div className="space-y-1.5">
        <label htmlFor="login-email" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Email Address
        </label>
        <div className="relative">
          <Input
            id="login-email"
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
        <div className="flex justify-between items-center">
          <label htmlFor="login-password" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Password
          </label>
          <button
            type="button"
            onClick={onSwitchToForgot}
            className="text-[10px] font-bold text-accent uppercase tracking-wider hover:opacity-85 cursor-pointer"
            disabled={loading}
          >
            Forgot Password?
          </button>
        </div>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
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

      <div className="flex items-center space-x-2 py-1 pl-1">
        <input
          id="remember-me"
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="w-4 h-4 accent-accent rounded-md border-border cursor-pointer bg-card"
          disabled={loading}
        />
        <label htmlFor="remember-me" className="text-[11px] font-bold text-muted-foreground cursor-pointer">
          Remember Me
        </label>
      </div>

      <div className="space-y-3 pt-2">
        <Button
          type="submit"
          className="w-full flex items-center justify-center space-x-2 font-black uppercase text-xs tracking-wider h-11 rounded-xl cursor-pointer"
          disabled={loading}
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Logging in...</span>
            </>
          ) : (
            <span>Login</span>
          )}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-[11px] font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer py-1"
            disabled={loading}
          >
            Don't have an account? <span className="text-accent hover:underline">Create one</span>
          </button>
        </div>
      </div>
    </form>
  )
}

export default LoginForm
