'use client'

import * as React from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useNotifications, useMarkNotificationsRead } from '@/lib/hooks/queries'
import { useChatStore } from '@/lib/store'
import { UserAvatar } from './user-avatar'
import { formatRelative } from '@/lib/format'
import { Bell } from 'lucide-react'

function IconForType({ type }: { type: string }) {
  // tiny emoji-style indicators
  if (type === 'like') return <span className="text-base leading-none">👍</span>
  if (type === 'comment') return <span className="text-base leading-none">💬</span>
  if (type === 'friend') return <span className="text-base leading-none">👥</span>
  if (type === 'tag') return <span className="text-base leading-none">🏷️</span>
  return <span className="text-base leading-none">🔔</span>
}

export function NotificationsPopover({
  meId,
  meName,
}: {
  meId: string
  meName: string
}) {
  const [open, setOpen] = React.useState(false)
  const query = useNotifications()
  const markRead = useMarkNotificationsRead()
  const openProfile = useChatStore((s) => s.openProfile)
  const items = query.data ?? []
  const unread = items.filter((n) => !n.read).length

  React.useEffect(() => {
    if (open && unread > 0) {
      markRead.mutate()
    }
  }, [open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Notifications"
          className="relative grid h-10 w-10 place-items-center rounded-full text-white hover:bg-white/15 transition-colors"
        >
          <Bell className="size-5" />
          {unread > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#fa3e3e] px-1 text-[10px] font-semibold text-white">
              {unread > 9 ? '9+' : unread}
            </span>
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[22rem] p-0 bg-white dark:bg-[#242526] border-[#ced4da] dark:border-[#3a3b3c] overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="text-base font-semibold text-[#050505] dark:text-[#e4e6eb]">
            Notifications
          </div>
        </div>
        <div className="max-h-[26rem] overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-4 text-sm text-[#65676b] dark:text-[#b0b3b8]">
              No notifications yet.
            </div>
          ) : null}
          {items.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                if (n.fromUser.id !== meId) openProfile(n.fromUser.id)
                setOpen(false)
              }}
              className="w-full flex items-start gap-3 p-3 text-left hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] relative"
            >
              <span className="relative shrink-0">
                <UserAvatar
                  src={n.fromUser.avatarUrl}
                  name={n.fromUser.name}
                  size={44}
                />
                <span className="absolute -bottom-1 -right-1 grid place-items-center h-5 w-5 rounded-full bg-[#1877f2] text-white text-[10px] ring-2 ring-white dark:ring-[#242526]">
                  <IconForType type={n.type} />
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm text-[#050505] dark:text-[#e4e6eb] leading-snug">
                  {n.text}
                </div>
                <div className="text-xs text-[#65676b] dark:text-[#b0b3b8] mt-0.5">
                  {formatRelative(n.createdAt)}
                </div>
              </div>
              {!n.read ? (
                <span className="mt-1 size-2.5 rounded-full bg-[#1877f2] shrink-0" />
              ) : null}
            </button>
          ))}
        </div>
        <div className="border-t border-[#ced4da] dark:border-[#3a3b3c] p-2 text-center">
          <button className="w-full text-sm text-[#1877f2] hover:bg-[#e7f0fd] dark:hover:bg-[#3a3b3c] rounded-md py-1.5 font-medium">
            See all notifications
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
