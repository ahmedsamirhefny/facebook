'use client'

import { useChatStore } from '@/lib/store'

export function OnlineDot({
  userId,
  className = '',
}: {
  userId: string
  className?: string
}) {
  const online = useChatStore((s) => s.online.has(userId))
  if (!online) return null
  return (
    <span
      className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-[#31a24c] ring-2 ring-white dark:ring-[#242526] ${className}`}
      aria-label="online"
    />
  )
}
