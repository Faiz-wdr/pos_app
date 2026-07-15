import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { ActionButton } from '../components/ActionButton'
import { auth } from '@/core/firebase/auth'

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate()

  const handleLogoutAndReturn = async () => {
    try {
      await auth.signOut()
      navigate('/admin/login')
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 select-none">
      <Card className="w-full max-w-md bg-neutral-900 border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
        <CardContent className="pt-10 px-6 sm:px-8 pb-10 flex flex-col items-center text-center space-y-6">
          <div className="p-3.5 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/25 shadow-lg">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Access Denied</h1>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
              Your account does not possess the required `super_admin` permissions to access the administrator panel.
            </p>
          </div>

          <ActionButton
            onClick={handleLogoutAndReturn}
            icon={ArrowLeft}
            className="w-full h-11 bg-muted border border-border/50 text-foreground hover:bg-muted/80 hover:text-foreground mt-4 rounded-xl font-bold uppercase tracking-wider text-xs shadow-xs"
          >
            Log Out & Return
          </ActionButton>
        </CardContent>
      </Card>
    </div>
  )
}

export default UnauthorizedPage
