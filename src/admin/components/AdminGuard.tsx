import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth } from '@/core/firebase/auth'
import { db } from '@/core/firebase/firestore'
import { Loader2 } from 'lucide-react'

interface AdminGuardProps {
  children: React.ReactNode
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const [checking, setChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsAuthenticated(true)
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid)
          const userDocSnap = await getDoc(userDocRef)
          
          if (userDocSnap.exists() && userDocSnap.data()?.role === 'super_admin') {
            setIsSuperAdmin(true)
          } else {
            setIsSuperAdmin(false)
          }
        } catch (e) {
          console.error('Error verifying admin permissions:', e)
          setIsSuperAdmin(false)
        }
      } else {
        setIsAuthenticated(false)
        setIsSuperAdmin(false)
      }
      setChecking(false)
    })

    return () => unsubscribe()
  }, [])

  if (checking) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center space-y-4 select-none">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Verifying security authorization...
        </span>
      </div>
    )
  }

  // Redirect to admin login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  // Redirect to unauthorized page if authenticated but not super_admin
  if (!isSuperAdmin) {
    return <Navigate to="/admin/unauthorized" replace />
  }

  return <>{children}</>
}

export default AdminGuard
