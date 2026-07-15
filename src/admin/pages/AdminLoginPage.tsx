import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth } from '@/core/firebase/auth'
import { db } from '@/core/firebase/firestore'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { ActionButton } from '../components/ActionButton'
import { Shield, Mail, Lock, ShieldAlert } from 'lucide-react'

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const navigate = useNavigate()
  const location = useLocation()
  
  const from = (location.state as any)?.from?.pathname || '/admin'

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          if (userDoc.exists() && userDoc.data()?.role === 'super_admin') {
            navigate(from, { replace: true })
          }
        } catch (e) {
          console.error(e)
        }
      }
    })
    return () => unsubscribe()
  }, [navigate, from])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      const userDocRef = doc(db, 'users', user.uid)
      const userDocSnap = await getDoc(userDocRef)

      if (userDocSnap.exists() && userDocSnap.data()?.role === 'super_admin') {
        navigate(from, { replace: true })
      } else {
        await auth.signOut()
        setError('Access Denied: You do not have administrative privileges.')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Invalid admin credentials.')
      } else {
        setError(err.message || 'An error occurred during authentication.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 select-none">
      <Card className="w-full max-w-md bg-neutral-900 border-neutral-800 rounded-3xl overflow-hidden shadow-2xl relative">
        <CardContent className="pt-8 px-6 sm:px-8 pb-10 space-y-6">
          
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-black shadow-lg shadow-accent/10">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-2">Admin Portal</h1>
            <p className="text-xs text-muted-foreground">Sign in to manage the Personal Operating System</p>
          </div>

          {error && (
            <div className="flex items-start space-x-2.5 p-3.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs leading-normal animate-in fade-in duration-200">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block px-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@personalos.com"
                  className="pl-9.5 h-11 bg-neutral-950 border-neutral-800 focus-visible:ring-1 focus-visible:ring-accent rounded-xl text-xs text-white"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block px-1">
                Security Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="pl-9.5 h-11 bg-neutral-950 border-neutral-800 focus-visible:ring-1 focus-visible:ring-accent rounded-xl text-xs text-white"
                  disabled={loading}
                />
              </div>
            </div>

            <ActionButton
              type="submit"
              loading={loading}
              className="w-full h-11 bg-accent text-black hover:bg-accent/90 border-none font-bold uppercase tracking-wider text-xs shadow-md mt-6 rounded-xl"
            >
              Verify & Enter
            </ActionButton>
          </form>

        </CardContent>
      </Card>
    </div>
  )
}

export default AdminLoginPage
