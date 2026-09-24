'use client'

import * as React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { OnlineDot } from './online-dot'
import { initials } from '@/lib/format'

interface UserAvatarProps {
  src?: string | null
  name?: string | null
  size?: number
  className?: string
  onlineUserId?: string // if set, show online dot
  ringClass?: string
}

export function UserAvatar({
  src,
  name,
  size = 40,
  className = '',
  onlineUserId,
  ringClass = '',
}: UserAvatarProps) {
  return (
    <span
      className={`relative inline-block shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <Avatar
        className={`h-full w-full rounded-full ${ringClass}`}
        style={{ width: size, height: size }}
      >
        {src ? (
          <AvatarImage src={src} alt={name ?? 'avatar'} />
        ) : null}
        <AvatarFallback
          className="rounded-full bg-[#e4e6eb] text-[#050505] dark:bg-[#3a3b3c] dark:text-[#e4e6eb]"
          style={{ fontSize: Math.max(10, size * 0.35) }}
        >
          {initials(name)}
        </AvatarFallback>
      </Avatar>
      {onlineUserId ? <OnlineDot userId={onlineUserId} /> : null}
    </span>
  )
}
