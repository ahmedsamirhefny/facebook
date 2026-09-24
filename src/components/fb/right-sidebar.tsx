'use client'

import * as React from 'react'
import { useContacts } from '@/lib/hooks/queries'
import { useChatStore } from '@/lib/store'
import { UserAvatar } from './user-avatar'
import { OnlineDot } from './online-dot'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, MoreHorizontal, Video } from 'lucide-react'

const SPONSORED = [
  {
    title: 'BlueSky Travel',
    url: 'bluesky-travel.com',
    img: 'https://picsum.photos/seed/ad1/300/200',
  },
  {
    title: 'Nimbus Headphones',
    url: 'nimbus-audio.com',
    img: 'https://picsum.photos/seed/ad2/300/200',
  },
]

function Birthdays() {
  return (
    <div className="bg-white dark:bg-[#242526] rounded-lg shadow-sm p-3 mb-3">
      <div className="text-base font-semibold text-[#050505] dark:text-[#e4e6eb] mb-1">
        Birthdays
      </div>
      <div className="flex items-start gap-2 text-sm text-[#65676b] dark:text-[#b0b3b8]">
        <span className="text-xl">🎂</span>
        <span>
          <span className="text-[#050505] dark:text-[#e4e6eb] font-medium">Tom Davis</span> and{' '}
          <span className="text-[#050505] dark:text-[#e4e6eb] font-medium">2 others</span> have birthdays today.
        </span>
      </div>
    </div>
  )
}

function Sponsored() {
  return (
    <div className="mb-3">
      <div className="text-[#65676b] dark:text-[#b0b3b8] text-sm font-semibold mb-2 px-1">
        Sponsored
      </div>
      <div className="flex flex-col gap-3">
        {SPONSORED.map((ad) => (
          <div
            key={ad.title}
            className="bg-white dark:bg-[#242526] rounded-lg shadow-sm overflow-hidden cursor-pointer hover:opacity-95"
          >
            <div className="flex gap-3 p-3">
              <img
                src={ad.img}
                alt={ad.title}
                className="h-[72px] w-[72px] rounded-lg object-cover"
              />
              <div className="min-w-0 flex flex-col justify-center">
                <div className="text-sm font-medium text-[#050505] dark:text-[#e4e6eb] line-clamp-2">
                  {ad.title}
                </div>
                <div className="text-xs text-[#65676b] dark:text-[#b0b3b8] truncate mt-0.5">
                  {ad.url}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Contacts() {
  const contacts = useContacts()
  const online = useChatStore((s) => s.online)
  const openChat = useChatStore((s) => s.openChat)
  const list = contacts.data?.users ?? []
  const sorted = [...list].sort((a, b) => {
    const ao = online.has(a.id) ? 1 : 0
    const bo = online.has(b.id) ? 1 : 0
    return bo - ao
  })

  return (
    <div className="bg-white dark:bg-[#242526] rounded-lg shadow-sm">
      <div className="flex items-center justify-between p-3">
        <div className="text-base font-semibold text-[#050505] dark:text-[#e4e6eb]">
          Contacts
        </div>
        <div className="flex items-center gap-1 text-[#1877f2]">
          <button
            className="grid h-8 w-8 place-items-center rounded-full hover:bg-[#e4e6eb] dark:hover:bg-[#3a3b3c]"
            aria-label="New room"
          >
            <Video className="size-4" />
          </button>
          <button
            className="grid h-8 w-8 place-items-center rounded-full hover:bg-[#e4e6eb] dark:hover:bg-[#3a3b3c]"
            aria-label="Search"
          >
            <Search className="size-4" />
          </button>
          <button
            className="grid h-8 w-8 place-items-center rounded-full hover:bg-[#e4e6eb] dark:hover:bg-[#3a3b3c]"
            aria-label="More"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </div>
      </div>
      <ScrollArea className="max-h-[420px]">
        <div className="px-1 pb-2">
          {sorted.map((u) => {
            const isOnline = online.has(u.id)
            return (
              <button
                key={u.id}
                onClick={() =>
                  openChat({ userId: u.id, name: u.name, avatarUrl: u.avatarUrl })
                }
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-left"
              >
                <span className="relative">
                  <UserAvatar
                    src={u.avatarUrl}
                    name={u.name}
                    size={36}
                    onlineUserId={u.id}
                  />
                </span>
                <span className="text-sm text-[#050505] dark:text-[#e4e6eb] truncate">
                  {u.name}
                </span>
              </button>
            )
          })}
          {sorted.length === 0 ? (
            <div className="px-3 py-2 text-xs text-[#65676b] dark:text-[#b0b3b8]">
              No contacts yet.
            </div>
          ) : null}
        </div>
      </ScrollArea>
    </div>
  )
}

export function RightSidebar() {
  return (
    <aside className="hidden xl:block w-[300px] shrink-0">
      <ScrollArea className="h-[calc(100vh-3.5rem)]">
        <div className="py-3 pl-2 pr-3">
          <Sponsored />
          <Birthdays />
          <Contacts />
        </div>
      </ScrollArea>
    </aside>
  )
}
