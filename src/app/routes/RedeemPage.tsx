import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/core/firebase/hooks/useAuth'
import { auth } from '@/core/firebase/auth'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Gift, ShieldCheck, AlertCircle, Loader2, Sparkles, LogIn, ArrowRight } from 'lucide-react'

export const RedeemPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const { user, isAuthenticated, loginWithGoogle } = useAuth()

  // API State
  const [checkingToken, setCheckingToken] = useState(true)
  const [tokenStatus, setTokenStatus] = useState<'Pending' | 'Redeemed' | 'invalid' | null>(null)
  const [campaignName, setCampaignName] = useState('')
  
  const [redeeming, setRedeeming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 1. Validate token on mount
  useEffect(() => {
    if (!token) {
      setTokenStatus('invalid')
      setCheckingToken(false)
      return
    }

    const validateToken = async () => {
      try {
        const res = await fetch(`/api/gifts/validate-token?token=${token}`)
        const data = await res.json()
        
        if (res.ok) {
          setTokenStatus(data.status)
          setCampaignName(data.campaign)
        } else {
          setTokenStatus('invalid')
        }
      } catch (err) {
        console.error('Error validating token:', err)
        setTokenStatus('invalid')
      } finally {
        setCheckingToken(false)
      }
    }

    validateToken()
  }, [token])

  // 2. Perform account upgrade
  const handleRedeem = async () => {
    if (!token) return
    setError(null)
    setRedeeming(true)

    try {
      const currentUser = auth.currentUser
      if (!currentUser) {
        throw new Error('You must be signed in to redeem a gift.')
      }

      const idToken = await currentUser.getIdToken(true)
      const res = await fetch('/api/gifts/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ token })
      })

      const data = await res.json()

      if (res.ok && data.success) {
        localStorage.setItem('personalos_redeem_success', 'true')
        navigate('/')
      } else {
        setError(data.error || 'Redemption failed. Please try again.')
      }
    } catch (err: any) {
      console.error('Error redeeming token:', err)
      setError(err.message || 'An error occurred during activation.')
    } finally {
      setRedeeming(false)
    }
  }

  const handleSignIn = async () => {
    setError(null)
    try {
      await loginWithGoogle()
    } catch (err: any) {
      setError(err.message || 'Sign in failed. Please try again.')
    }
  }

  // RENDER: Loading State
  if (checkingToken) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-20 space-y-4 animate-in fade-in duration-300">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div className="absolute -inset-1 rounded-2xl bg-accent/10 blur-md animate-pulse -z-10" />
        </div>
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Validating Gift Token...
        </span>
      </div>
    )
  }

  // RENDER: Invalid Token State
  if (tokenStatus === 'invalid' || !token) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-10 select-none text-center animate-in fade-in duration-300">
        <Card className="w-full bg-card/30 border border-border/40 rounded-3xl overflow-hidden shadow-xl max-w-sm">
          <CardContent className="p-8 flex flex-col items-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center shadow-md shadow-red-500/5">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-foreground">Invalid Gift Token</h2>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-[240px] mx-auto">
                This token is invalid, expired, or does not exist. Please check your redemption link.
              </p>
            </div>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="px-6 font-bold uppercase text-[10px] tracking-wider h-10 rounded-xl cursor-pointer w-full"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // RENDER: Already Redeemed State
  if (tokenStatus === 'Redeemed') {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-10 select-none text-center animate-in fade-in duration-300">
        <Card className="w-full bg-card/30 border border-border/40 rounded-3xl overflow-hidden shadow-xl max-w-sm">
          <CardContent className="p-8 flex flex-col items-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shadow-md shadow-amber-500/5">
              <Gift className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-foreground">Gift Already Claimed</h2>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-[240px] mx-auto">
                This gift has already been redeemed. Each gift token can only be activated once.
              </p>
            </div>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="px-6 font-bold uppercase text-[10px] tracking-wider h-10 rounded-xl cursor-pointer w-full"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // RENDER: Valid Token State
  return (
    <div className="flex-1 flex flex-col justify-center items-center py-10 select-none text-center animate-in fade-in duration-300">
      <Card className="w-full bg-card/30 border border-border/40 rounded-3xl overflow-hidden shadow-2xl max-w-sm relative">
        {/* Glowing aura effect */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-accent/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <CardContent className="p-8 flex flex-col items-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent border border-accent/25 flex items-center justify-center shadow-lg shadow-accent/10 relative">
            <Gift className="w-7 h-7" />
            <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-accent animate-pulse" />
          </div>

          <div className="space-y-1.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-accent bg-accent/15 px-2.5 py-0.5 rounded-full">
              Campaign: {campaignName || 'Giveaway'}
            </span>
            <h2 className="text-lg font-bold text-foreground leading-snug">
              🎉 You have unlocked PersonalOS Pro
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[240px] mx-auto">
              You've been gifted lifetime access to PersonalOS Pro. Redeem it now to enable cloud sync and unlock premium modules.
            </p>
          </div>

          {error && (
            <div className="w-full p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-semibold leading-normal">
              {error}
            </div>
          )}

          {!isAuthenticated ? (
            <div className="w-full space-y-3 pt-2">
              <Button
                onClick={handleSignIn}
                className="w-full flex items-center justify-center space-x-2 font-bold uppercase text-[10px] tracking-wider h-11 rounded-xl cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Continue with Google</span>
              </Button>
              <p className="text-[9px] text-muted-foreground">
                Sign in with Google to associate the Pro membership with your account.
              </p>
            </div>
          ) : (
            <div className="w-full space-y-3 pt-2">
              <div className="p-3 bg-muted/40 border border-border/40 rounded-2xl text-left space-y-1 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Activating for:</span>
                  <p className="text-xs font-bold text-foreground truncate">{user?.email}</p>
                </div>
                <div className="p-1.5 rounded-lg bg-accent/10 text-accent">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              <Button
                onClick={handleRedeem}
                disabled={redeeming}
                className="w-full flex items-center justify-center space-x-2 font-bold uppercase text-[10px] tracking-wider h-11 rounded-xl cursor-pointer"
              >
                {redeeming ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Activating...</span>
                  </>
                ) : (
                  <>
                    <span>Activate PersonalOS Pro</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default RedeemPage
