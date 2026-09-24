'use client'

import * as React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from 'next-themes'
import { UserAvatar } from './user-avatar'
import { useChatStore } from '@/lib/store'
import { ChevronDown, LogOut, Moon, Settings, Sun, Plus } from 'lucide-react'
import { signOut } from 'next-auth/react'

function AccountMenu({ me }: { me: { id: string; name: string; avatarUrl: string; firstName: string } }) {
  const { theme, setTheme } = useTheme()
  const openProfile = useChatStore((s) => s.openProfile)
  const setSettingsOpen = useChatStore((s) => s.setSettingsOpen)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="hidden sm:flex items-center gap-1 h-10 rounded-full bg-white/10 hover:bg-white/20 px-1 pr-2 transition-colors">
          <UserAvatar src={me.avatarUrl} name={me.name} size={28} />
          <ChevronDown className="size-3.5 text-white opacity-80" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-72 p-2 bg-white dark:bg-[#242526] border-[#ced4da] dark:border-[#3a3b3c]"
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <button
            onClick={() => openProfile(me.id)}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-left"
          >
            <UserAvatar src={me.avatarUrl} name={me.name} size={40} />
            <div className="min-w-0">
              <div className="font-medium text-sm text-[#050505] dark:text-[#e4e6eb] truncate">
                {me.name}
              </div>
              <div className="text-xs text-[#65676b] dark:text-[#b0b3b8]">
                See your profile
              </div>
            </div>
          </button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#ced4da] dark:bg-[#3a3b3c]" />
        <DropdownMenuItem
          onSelect={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="cursor-pointer text-sm text-[#050505] dark:text-[#e4e6eb] hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c]"
        >
          <span className="grid place-items-center h-7 w-7 rounded-full bg-[#e4e6eb] dark:bg-[#3a3b3c]">
            {theme === 'dark' ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </span>
          <div>
            <div className="font-medium">Display & Accessibility</div>
            <div className="text-xs text-[#65676b] dark:text-[#b0b3b8]">
              {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => setSettingsOpen(true)}
          className="cursor-pointer text-sm text-[#050505] dark:text-[#e4e6eb] hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c]"
        >
          <span className="grid place-items-center h-7 w-7 rounded-full bg-[#e4e6eb] dark:bg-[#3a3b3c]">
            <Settings className="size-4" />
          </span>
          <span>Settings & Privacy</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => signOut({ callbackUrl: '/' })}
          className="cursor-pointer text-sm text-[#050505] dark:text-[#e4e6eb] hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c]"
        >
          <span className="grid place-items-center h-7 w-7 rounded-full bg-[#e4e6eb] dark:bg-[#3a3b3c]">
            <LogOut className="size-4" />
          </span>
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function IconButton({
  label,
  badge,
  children,
  onClick,
}: {
  label: string
  badge?: number
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className="relative grid h-10 w-10 place-items-center rounded-full text-white hover:bg-white/15 transition-colors"
    >
      {children}
      {badge && badge > 0 ? (
        <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#fa3e3e] px-1 text-[10px] font-semibold text-white">
          {badge > 9 ? '9+' : badge}
        </span>
      ) : null}
    </button>
  )
}

function CreateMenu({ meId }: { meId: string }) {
  // For demo: just opens the create-post (handled via a custom event).
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Create"
          className="grid h-10 w-10 place-items-center rounded-full text-white hover:bg-white/15 transition-colors"
        >
          <Plus className="size-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 p-2 bg-white dark:bg-[#242526] border-[#ced4da] dark:border-[#3a3b3c]"
      >
        <DropdownMenuItem
          onSelect={() =>
            window.dispatchEvent(new CustomEvent('fb:open-create-post'))
          }
          className="cursor-pointer text-sm text-[#050505] dark:text-[#e4e6eb] hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c]"
        >
          <span className="grid place-items-center h-7 w-7 rounded-full bg-[#e7f0fd] text-[#1877f2]">
            <Plus className="size-4" />
          </span>
          <div>
            <div className="font-medium">Post</div>
            <div className="text-xs text-[#65676b] dark:text-[#b0b3b8]">
              Share a feeling, photo or thought
            </div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { AccountMenu, IconButton, CreateMenu }
