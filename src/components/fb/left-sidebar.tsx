'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { useFeed } from '@/lib/hooks/queries'
import { useChatStore } from '@/lib/store'
import { UserAvatar } from './user-avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Users,
  Bookmark,
  Flag,
  Calendar,
  Video,
  Store,
  Gamepad2,
  Clock,
  ChevronDown,
  Moon,
  Sun,
} from 'lucide-react'
import { toast } from 'sonner'

const MENU = [
  { label: 'Friends', Icon: Users, color: '#1877f2' },
  { label: 'Memories', Icon: Clock, color: '#0668e0' },
  { label: 'Saved', Icon: Bookmark, color: '#9c4af2' },
  { label: 'Groups', Icon: Flag, color: '#217a8b' },
  { label: 'Marketplace', Icon: Store, color: '#0668e0' },
  { label: 'Watch', Icon: Video, color: '#1877f2' },
  { label: 'Events', Icon: Calendar, color: '#da2c43' },
  { label: 'Gaming', Icon: Gamepad2, color: '#a234ad' },
]

function SideMenuButton({
  label,
  Icon,
  color,
  onClick,
}: (typeof MENU)[number] & { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#e4e6eb] dark:hover:bg-[#3a3b3c] text-left"
    >
      <span
        className="grid place-items-center h-9 w-9 rounded-full"
        style={{ backgroundColor: `${color}22`, color }}
      >
        <Icon className="size-5" />
      </span>
      <span className="text-sm font-medium text-[#050505] dark:text-[#e4e6eb]">
        {label}
      </span>
    </button>
  )
}

export function LeftSidebar() {
  const feed = useFeed()
  const { theme, setTheme } = useTheme()
  const openProfile = useChatStore((s) => s.openProfile)
  const setFriendsOpen = useChatStore((s) => s.setFriendsOpen)
  const me = feed.data?.me
  const [showMore, setShowMore] = React.useState(false)

  if (!me) return null
  const menu = showMore ? MENU : MENU.slice(0, 5)

  return (
    <aside className="hidden lg:block w-[320px] xl:w-[360px] shrink-0">
      <ScrollArea className="h-[calc(100vh-3.5rem)]">
        <div className="px-2 py-3 pr-3">
          {/* User card */}
          <button
            onClick={() => openProfile(me.id)}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#e4e6eb] dark:hover:bg-[#3a3b3c] text-left"
          >
            <UserAvatar src={me.avatarUrl} name={me.name} size={40} />
            <span className="font-semibold text-[#050505] dark:text-[#e4e6eb]">
              {me.name}
            </span>
          </button>

          <div className="h-px my-2 bg-[#ced4da] dark:bg-[#3a3b3c]" />

          {/* Menu */}
          <div className="flex flex-col gap-0.5">
            {menu.map((item) => (
              <SideMenuButton
                key={item.label}
                {...item}
                onClick={() =>
                  item.label === 'Friends'
                    ? setFriendsOpen(true)
                    : toast(`${item.label} isn\u2019t available in this demo build.`, {
                        description: 'Try the feed, chat, stories, search, and profile features.',
                      })
                }
              />
            ))}
            <button
              onClick={() => setShowMore((v) => !v)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#e4e6eb] dark:hover:bg-[#3a3b3c] text-left"
            >
              <span className="grid place-items-center h-9 w-9 rounded-full bg-[#e4e6eb] dark:bg-[#3a3b3c] text-[#65676b] dark:text-[#b0b3b8]">
                <ChevronDown
                  className={`size-5 transition-transform ${showMore ? 'rotate-180' : ''}`}
                />
              </span>
              <span className="text-sm font-medium text-[#050505] dark:text-[#e4e6eb]">
                {showMore ? 'See less' : 'See more'}
              </span>
            </button>
          </div>

          <div className="h-px my-3 bg-[#ced4da] dark:bg-[#3a3b3c]" />

          {/* Footer mini-links + dark toggle */}
          <div className="px-2 flex flex-col gap-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center gap-2 text-sm text-[#050505] dark:text-[#e4e6eb] hover:underline"
            >
              {theme === 'dark' ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
              Toggle dark mode
            </button>
            <div className="text-xs text-[#65676b] dark:text-[#b0b3b8] leading-5">
              Privacy · Terms · Advertising · Ad Choices · Cookies · More ·
              Meta © 2024
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  )
}
