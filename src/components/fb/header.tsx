'use client'

import * as React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { SearchPalette } from './search-palette'
import { NotificationsPopover } from './notifications'
import { AccountMenu, IconButton, CreateMenu } from './account-menu'
import { useFeed, useContacts, useNotifications } from '@/lib/hooks/queries'
import { useChatStore } from '@/lib/store'
import { UserAvatar } from './user-avatar'
import { OnlineDot } from './online-dot'
import {
  Home,
  Users,
  PlaySquare,
  Store,
  Flag,
  Gamepad2,
  MessageCircle,
  Menu,
  Search,
} from 'lucide-react'
import { toast } from 'sonner'

const NAV = [
  { key: 'home', label: 'Home', Icon: Home },
  { key: 'friends', label: 'Friends', Icon: Users },
  { key: 'watch', label: 'Watch', Icon: PlaySquare },
  { key: 'marketplace', label: 'Marketplace', Icon: Store },
  { key: 'groups', label: 'Groups', Icon: Flag },
  { key: 'gaming', label: 'Gaming', Icon: Gamepad2 },
]

function CenterNav({ active, onChange }: { active: string; onChange: (k: string) => void }) {
  return (
    <nav className="hidden lg:flex items-center gap-1.5">
      {NAV.map(({ key, label, Icon }) => {
        const isActive = active === key
        return (
          <button
            key={key}
            aria-label={label}
            title={label}
            onClick={() => {
              onChange(key)
              if (key !== 'home') {
                toast(`${label} isn\u2019t available in this demo build.`, {
                  description: 'Stick to Home for the feed, or open Friends.',
                })
              }
            }}
            className={`relative grid h-12 w-[105px] place-items-center rounded-lg transition-colors ${
              isActive
                ? 'text-[#1877f2] bg-white/10 hover:bg-white/15'
                : 'text-white/85 hover:bg-white/15'
            }`}
          >
            <Icon className="size-6" />
            <span
              className={`absolute bottom-1 h-1 w-7 rounded-full ${
                isActive ? 'bg-[#1877f2]' : 'bg-transparent'
              }`}
            />
          </button>
        )
      })}
    </nav>
  )
}

function MessengerDropdown({ meId }: { meId: string }) {
  const contacts = useContacts()
  const online = useChatStore((s) => s.online)
  const openChat = useChatStore((s) => s.openChat)
  const list = contacts.data?.users ?? []
  const onlineCount = list.filter((u) => online.has(u.id)).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Messenger"
          className="relative grid h-10 w-10 place-items-center rounded-full text-white hover:bg-white/15 transition-colors"
        >
          <MessageCircle className="size-5" />
          {onlineCount > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#fa3e3e] px-1 text-[10px] font-semibold text-white">
              {onlineCount > 9 ? '9+' : onlineCount}
            </span>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 p-3 bg-white dark:bg-[#242526] border-[#ced4da] dark:border-[#3a3b3c]"
      >
        <div className="flex items-center justify-between pb-2">
          <div className="text-base font-semibold text-[#050505] dark:text-[#e4e6eb]">
            Chats
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {list.length === 0 ? (
            <div className="p-2 text-sm text-[#65676b] dark:text-[#b0b3b8]">
              No contacts yet.
            </div>
          ) : null}
          {list.map((u) => (
            <button
              key={u.id}
              onClick={() =>
                openChat({ userId: u.id, name: u.name, avatarUrl: u.avatarUrl })
              }
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-left"
            >
              <span className="relative">
                <UserAvatar src={u.avatarUrl} name={u.name} size={40} onlineUserId={u.id} />
              </span>
              <div className="text-sm font-medium text-[#050505] dark:text-[#e4e6eb] truncate">
                {u.name}
              </div>
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Header() {
  const feed = useFeed()
  const notifications = useNotifications()
  const me = feed.data?.me
  const [active, setActive] = React.useState('home')
  const [mobileSheet, setMobileSheet] = React.useState(false)
  const setFriendsOpen = useChatStore((s) => s.setFriendsOpen)

  const unread = (notifications.data ?? []).filter((n) => !n.read).length

  if (!me) {
    // Skeleton header before feed loads
    return (
      <header className="sticky top-0 z-40 h-14 bg-[#1877f2] text-white flex items-center justify-between px-3 sm:px-4 shadow">
        <div className="flex items-center gap-2">
          <div className="h-7 w-32 rounded bg-white/20 animate-pulse" />
        </div>
        <div className="hidden lg:flex gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 w-[105px] rounded-lg bg-white/10 animate-pulse" />
          ))}
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 w-10 rounded-full bg-white/10 animate-pulse" />
          ))}
        </div>
      </header>
    )
  }

  return (
    <>
      <header className="sticky top-0 z-40 h-14 bg-[#1877f2] text-white flex items-center justify-between px-3 sm:px-4 shadow-md">
        {/* Left: wordmark + search */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            aria-label="Menu"
            className="lg:hidden grid h-10 w-10 place-items-center rounded-full hover:bg-white/15"
            onClick={() => setMobileSheet(true)}
          >
            <Menu className="size-5" />
          </button>
          <div className="text-white font-bold text-[26px] leading-none tracking-tight">
            facebook
          </div>
          <div className="hidden sm:block ml-2">
            <SearchPalette />
          </div>
          <button
            aria-label="Search"
            className="sm:hidden grid h-10 w-10 place-items-center rounded-full hover:bg-white/15"
            onClick={() => setMobileSheet(true)}
          >
            <Search className="size-5" />
          </button>
        </div>

        {/* Center: nav */}
        <CenterNav active={active} onChange={setActive} />

        {/* Right: actions */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <div className="hidden sm:block">
            <CreateMenu meId={me.id} />
          </div>
          <MessengerDropdown meId={me.id} />
          <NotificationsPopover meId={me.id} meName={me.name} />
          <div className="hidden sm:block">
            <AccountMenu me={me} />
          </div>
        </div>
      </header>

      {/* Mobile left-sidebar sheet */}
      <Sheet open={mobileSheet} onOpenChange={setMobileSheet}>
        <SheetContent side="left" className="w-[300px] bg-[#f0f2f5] dark:bg-[#18191a] border-[#ced4da] dark:border-[#3a3b3c]">
          <SheetHeader className="bg-[#1877f2] text-white -mx-4 -mt-4 px-4 pt-3 pb-3">
            <SheetTitle className="text-white">Menu</SheetTitle>
          </SheetHeader>
          <div className="mt-3">
            <SearchPalette />
          </div>
          <div className="mt-3 flex flex-col gap-1">
            {NAV.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => {
                  setActive(key)
                  setMobileSheet(false)
                  if (key === 'friends') {
                    setFriendsOpen(true)
                  } else if (key !== 'home') {
                    toast(`${label} isn\u2019t available in this demo build.`, {
                      description: 'Stick to Home for the feed.',
                    })
                  }
                }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#e4e6eb] dark:hover:bg-[#3a3b3c] text-[#050505] dark:text-[#e4e6eb]"
              >
                <span className="grid place-items-center h-8 w-8 rounded-full bg-[#e4e6eb] dark:bg-[#3a3b3c] text-[#1877f2]">
                  <Icon className="size-4" />
                </span>
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
