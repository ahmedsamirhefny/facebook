'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { useChatStore } from '@/lib/store'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { useFeed } from '@/lib/hooks/queries'
import { UserAvatar } from './user-avatar'
import { Moon, Sun, LogOut, Info, Shield, Bell, Palette } from 'lucide-react'

function Row({
  icon,
  label,
  desc,
  children,
}: {
  icon: React.ReactNode
  label: string
  desc?: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c]">
      <span className="grid place-items-center h-9 w-9 rounded-full bg-[#e4e6eb] dark:bg-[#3a3b3c] text-[#1877f2] shrink-0">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[#050505] dark:text-[#e4e6eb]">{label}</div>
        {desc ? (
          <div className="text-xs text-[#65676b] dark:text-[#b0b3b8] truncate">{desc}</div>
        ) : null}
      </div>
      {children}
    </div>
  )
}

export function SettingsDialog() {
  const open = useChatStore((s) => s.settingsOpen)
  const setOpen = useChatStore((s) => s.setSettingsOpen)
  const openProfile = useChatStore((s) => s.openProfile)
  const { theme, setTheme } = useTheme()
  const feed = useFeed()
  const me = feed.data?.me

  const dark = theme === 'dark'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md p-0 gap-0 bg-white dark:bg-[#242526] border-[#ced4da] dark:border-[#3a3b3c]">
        <DialogHeader className="px-4 pt-4 pb-3 border-b border-[#ced4da] dark:border-[#3a3b3c]">
          <DialogTitle className="text-lg font-bold text-[#050505] dark:text-[#e4e6eb]">
            Settings
          </DialogTitle>
        </DialogHeader>

        <div className="p-2 max-h-[70vh] overflow-y-auto">
          {/* Account */}
          <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-[#65676b] dark:text-[#b0b3b8]">
            Account
          </div>
          {me ? (
            <button
              onClick={() => {
                setOpen(false)
                openProfile(me.id)
              }}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-left"
            >
              <UserAvatar src={me.avatarUrl} name={me.name} size={40} />
              <div className="min-w-0">
                <div className="text-sm font-medium text-[#050505] dark:text-[#e4e6eb] truncate">
                  {me.name}
                </div>
                <div className="text-xs text-[#65676b] dark:text-[#b0b3b8]">See your profile</div>
              </div>
            </button>
          ) : null}

          {/* Preferences */}
          <div className="px-2 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-[#65676b] dark:text-[#b0b3b8]">
            Preferences
          </div>
          <Row
            icon={<Palette className="size-4" />}
            label="Dark mode"
            desc={dark ? 'On' : 'Off'}
          >
            <Switch
              checked={dark}
              onCheckedChange={(c) => setTheme(c ? 'dark' : 'light')}
              aria-label="Toggle dark mode"
            />
          </Row>
          <Row icon={<Bell className="size-4" />} label="Notifications" desc="On">
            <Switch defaultChecked aria-label="Notifications" />
          </Row>
          <Row icon={<Shield className="size-4" />} label="Privacy" desc="Friends only" />
          <Row icon={<Info className="size-4" />} label="About" desc="Facebook clone · demo build" />

          {/* Session */}
          <div className="px-2 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-[#65676b] dark:text-[#b0b3b8]">
            Session
          </div>
          <button
            onClick={() => {
              setOpen(false)
              toast('This is a demo — log out is disabled.', {
                description: 'You are signed in as the seeded user "Alex Morgan".',
              })
            }}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-left"
          >
            <span className="grid place-items-center h-9 w-9 rounded-full bg-[#e4e6eb] dark:bg-[#3a3b3c] text-[#fa3e3e] shrink-0">
              <LogOut className="size-4" />
            </span>
            <div className="flex-1">
              <div className="text-sm font-medium text-[#050505] dark:text-[#e4e6eb]">Log Out</div>
              <div className="text-xs text-[#65676b] dark:text-[#b0b3b8]">End your session</div>
            </div>
          </button>

          <div className="px-2 pt-4 pb-2 text-center text-[11px] text-[#65676b] dark:text-[#b0b3b8]">
            Facebook clone · built with Next.js 16 + socket.io · Meta © {new Date().getFullYear()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
