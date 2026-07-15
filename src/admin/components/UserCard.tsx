import React from 'react'
import { FirestoreUser } from '../types'
import { RoleBadge } from './RoleBadge'
import { PremiumBadge } from './PremiumBadge'
import { StatusBadge } from './StatusBadge'
import { User, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

interface UserCardProps {
  user: FirestoreUser
  onClick: () => void
}

export const UserCard: React.FC<UserCardProps> = ({ user, onClick }) => {
  const formatDate = (date: any) => {
    if (!date) return 'N/A'
    if (typeof date.toDate === 'function') return date.toDate().toLocaleDateString()
    return new Date(date).toLocaleDateString()
  }

  const isPremiumUser = !!(user.premium || user.isPremium)

  return (
    <Card 
      onClick={onClick}
      className="bg-card border border-border/80 rounded-2xl active:scale-[0.99] transition-transform duration-100 cursor-pointer select-none"
    >
      <CardContent className="p-4 space-y-3.5">
        <div className="flex items-center space-x-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border/40">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-foreground truncate">{user.fullName || 'Anonymous User'}</h4>
            <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
          </div>
          <StatusBadge lastActivity={user.lastActivity} />
        </div>

        <div className="flex items-center justify-between text-[10px] border-t border-border/40 pt-2.5">
          <div className="flex space-x-1.5">
            <RoleBadge role={user.role} />
            <PremiumBadge premium={isPremiumUser} />
          </div>
          <div className="flex items-center space-x-1 text-muted-foreground text-[8px] uppercase tracking-wider font-semibold">
            <Calendar className="w-3 h-3" />
            <span>Joined {formatDate(user.createdAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default UserCard
