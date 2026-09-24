'use client'

import * as React from 'react'
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from '@/components/ui/popover'
import { useSearchUsers } from '@/lib/hooks/queries'
import { useChatStore } from '@/lib/store'
import { UserAvatar } from './user-avatar'
import { Search, X } from 'lucide-react'

export function SearchPalette() {
  const [open, setOpen] = React.useState(false)
  const [q, setQ] = React.useState('')
  const debounced = React.useDeferredValue(q)
  const results = useSearchUsers(debounced.trim())
  const openProfile = useChatStore((s) => s.openProfile)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className="flex items-center bg-[#f0f2f5] dark:bg-[#242526] rounded-full h-10 w-36 sm:w-64 px-3 gap-2 focus-within:ring-2 focus-within:ring-white/40">
          <Search className="size-4 text-[#65676b] dark:text-[#b0b3b8] shrink-0" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search Facebook"
            aria-label="Search Facebook"
            className="bg-transparent outline-none text-sm text-[#050505] dark:text-[#e4e6eb] placeholder:text-[#65676b] dark:placeholder:text-[#b0b3b8] w-full"
          />
          {q ? (
            <button
              aria-label="Clear"
              onClick={() => setQ('')}
              className="shrink-0 text-[#65676b] hover:text-[#050505] dark:text-[#b0b3b8] dark:hover:text-[#e4e6eb]"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        className="w-[20rem] p-2 bg-white dark:bg-[#242526] border-[#ced4da] dark:border-[#3a3b3c]"
      >
        <div className="text-xs font-semibold uppercase tracking-wide text-[#65676b] dark:text-[#b0b3b8] px-2 pb-2 pt-1">
          {q ? 'Search results' : 'Recent searches'}
        </div>
        {results.isLoading && q ? (
          <div className="p-2 text-sm text-[#65676b] dark:text-[#b0b3b8]">
            Searching…
          </div>
        ) : null}
        {!results.isLoading && (results.data?.length ?? 0) === 0 && q ? (
          <div className="p-2 text-sm text-[#65676b] dark:text-[#b0b3b8]">
            No results found.
          </div>
        ) : null}
        <div className="max-h-80 overflow-y-auto">
          {(results.data ?? []).map((u) => (
            <button
              key={u.id}
              onClick={() => {
                openProfile(u.id)
                setOpen(false)
                setQ('')
              }}
              className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-left"
            >
              <UserAvatar src={u.avatarUrl} name={u.name} size={36} />
              <div className="min-w-0">
                <div className="text-sm font-medium text-[#050505] dark:text-[#e4e6eb] truncate">
                  {u.name}
                </div>
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
