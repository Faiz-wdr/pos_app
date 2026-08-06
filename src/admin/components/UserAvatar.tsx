import React, { useState } from 'react'
import { getGravatarUrl } from '@/shared/utils/gravatar'

interface UserAvatarProps {
  photoURL?: string | null
  email?: string | null
  fullName?: string | null
  sizeClass?: string
  textClass?: string
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  photoURL, 
  email, 
  fullName,
  sizeClass = "w-8 h-8 rounded-lg",
  textClass = "text-[10px]"
}) => {
  const [imgError, setImgError] = useState(false)
  const avatarSrc = photoURL || getGravatarUrl(email)

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  if (avatarSrc && !imgError) {
    return (
      <img 
        src={avatarSrc} 
        alt={fullName || 'User'} 
        className={`${sizeClass} border border-border/40 object-cover shrink-0`}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
      />
    )
  }

  return (
    <div className={`${sizeClass} bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold ${textClass} shrink-0 uppercase`}>
      {getInitials(fullName)}
    </div>
  )
}

export default UserAvatar
