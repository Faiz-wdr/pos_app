import React from 'react'
import { FirestoreUser } from '../types'
import { RoleBadge } from './RoleBadge'
import { PremiumBadge } from './PremiumBadge'
import { StatusBadge } from './StatusBadge'
import { User, Eye } from 'lucide-react'
import { ActionButton } from './ActionButton'

interface UserTableProps {
  users: FirestoreUser[]
  onSelectUser: (user: FirestoreUser) => void
}

export const UserTable: React.FC<UserTableProps> = React.memo(({ users, onSelectUser }) => {
  const formatDate = (date: any) => {
    if (!date) return 'N/A'
    if (typeof date.toDate === 'function') return date.toDate().toLocaleDateString()
    return new Date(date).toLocaleDateString()
  }

  const formatLastActive = (date: any) => {
    if (!date) return 'Never'
    if (typeof date.toDate === 'function') return date.toDate().toLocaleTimeString()
    return new Date(date).toLocaleTimeString()
  }

  return (
    <div className="w-full overflow-x-auto bg-card border border-border/80 rounded-2xl select-none">
      <table className="w-full text-xs text-left border-collapse">
        <thead>
          <tr className="border-b border-border/60 text-muted-foreground font-bold uppercase tracking-wider text-[9px] bg-muted/30">
            <th className="py-3 px-4">User</th>
            <th className="py-3 px-4">Role</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Premium</th>
            <th className="py-3 px-4 hidden md:table-cell">Modules</th>
            <th className="py-3 px-4 hidden lg:table-cell">Joined</th>
            <th className="py-3 px-4 hidden lg:table-cell">Last Active</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {users.map((user) => {
            const isPremiumUser = !!(user.premium || user.isPremium)
            return (
              <tr 
                key={user.uid}
                className="hover:bg-muted/30 transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-3 text-left">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border/40">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-foreground truncate max-w-[120px] sm:max-w-[180px]">
                        {user.fullName || 'Anonymous'}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate max-w-[120px] sm:max-w-[180px]">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-4">
                  <RoleBadge role={user.role} />
                </td>

                <td className="py-3 px-4">
                  <StatusBadge lastActivity={user.lastActivity} />
                </td>

                <td className="py-3 px-4">
                  <PremiumBadge premium={isPremiumUser} />
                </td>

                <td className="py-3 px-4 hidden md:table-cell">
                  <span className="font-mono text-[10px] bg-muted/60 px-1.5 py-0.5 rounded-md border border-border/30">
                    {user.enabledModules?.length || 0} active
                  </span>
                </td>

                <td className="py-3 px-4 hidden lg:table-cell text-muted-foreground">
                  {formatDate(user.createdAt)}
                </td>

                <td className="py-3 px-4 hidden lg:table-cell text-muted-foreground">
                  {formatLastActive(user.lastActivity)}
                </td>

                <td className="py-3 px-4 text-right">
                  <ActionButton
                    onClick={() => onSelectUser(user)}
                    variant="outline"
                    icon={Eye}
                    className="h-8 text-[9px] px-2.5 rounded-lg ml-auto"
                  >
                    View
                  </ActionButton>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
})

UserTable.displayName = 'UserTable'
export default UserTable
