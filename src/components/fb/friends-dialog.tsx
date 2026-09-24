'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useChatStore } from '@/lib/store'
import { useContacts } from '@/lib/hooks/queries'
import { UserAvatar } from './user-avatar'
import { MessageCircle, Search } from 'lucide-react'
import * as React from 'react'

export function FriendsDialog() {
  const open = useChatStore((s) => s.friendsOpen)
  const setOpen = useChatStore((s) => s.setFriendsOpen)
  const openChat = useChatStore((s) => s.openChat)
  const openProfile = useChatStore((s) => s.openProfile)
  const online = useChatStore((s) => s.online)
  const contacts = useContacts()
  const [q, setQ] = React.useState('')

  const list = (contacts.data?.users ?? []).filter((u) =>
    u.name.toLowerCase().includes(q.trim().toLowerCase())
  )
  const onlineCount = (contacts.data?.users ?? []).filter((u) => online.has(u.id)).length

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md p-0 gap-0 bg-white dark:bg-[#242526] border-[#ced4da] dark:border-[#3a3b3c]">
        <DialogHeader className="px-4 pt-4 pb-3 border-b border-[#ced4da] dark:border-[#3a3b3c]">
          <DialogTitle className="text-lg font-bold text-[#050505] dark:text-[#e4e6eb]">
            Friends
          </DialogTitle>
          <p className="text-xs text-[#65676b] dark:text-[#b0b3b8]">
            {(contacts.data?.users ?? []).length} friends · {onlineCount} online
          </p>
        </DialogHeader>

        <div className="p-3">
          <div className="flex items-center gap-2 bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-full h-10 px-3">
            <Search className="size-4 text-[#65676b] dark:text-[#b0b3b8] shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search friends"
              aria-label="Search friends"
              className="bg-transparent outline-none text-sm text-[#050505] dark:text-[#e4e6eb] placeholder:text-[#65676b] dark:placeholder:text-[#b0b3b8] w-full"
            />
          </div>
        </div>

        <ScrollArea className="max-h-[60vh]">
          <div className="px-2 pb-3">
            {list.length === 0 ? (
              <div className="p-4 text-center text-sm text-[#65676b] dark:text-[#b0b3b8]">
                No friends match &ldquo;{q}&rdquo;.
              </div>
            ) : (
              list.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c]"
                >
                  <button
                    onClick={() => {
                      setOpen(false)
                      openProfile(u.id)
                    }}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  >
                    <UserAvatar src={u.avatarUrl} name={u.name} size={44} onlineUserId={u.id} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[#050505] dark:text-[#e4e6eb] truncate">
                        {u.name}
                      </div>
                      <div className="text-xs text-[#65676b] dark:text-[#b0b3b8]">
                        {online.has(u.id) ? 'Active now' : 'Offline'}
                      </div>
                    </div>
                  </button>
                  <button
                    aria-label={`Message ${u.name}`}
                    title={`Message ${u.name}`}
                    onClick={() => {
                      openChat({ userId: u.id, name: u.name, avatarUrl: u.avatarUrl })
                      setOpen(false)
                    }}
                    className="grid h-9 w-9 place-items-center rounded-full bg-[#e7f0fd] text-[#1877f2] hover:bg-[#d1e2fb] dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] shrink-0"
                  >
                    <MessageCircle className="size-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
