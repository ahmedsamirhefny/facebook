'use client'

import * as React from 'react'
import { useFeed } from '@/lib/hooks/queries'
import { useChatStore } from '@/lib/store'
import { UserAvatar } from './user-avatar'
import { Plus, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface StoriesProps {
  onView: (index: number) => void
}

export function Stories({ onView }: StoriesProps) {
  const feed = useFeed()
  const openProfile = useChatStore((s) => s.openProfile)
  const stories = feed.data?.stories ?? []
  const me = feed.data?.me

  if (!me) return null

  return (
    <div className="bg-white dark:bg-[#242526] rounded-lg shadow-sm overflow-hidden mb-3">
      <div className="flex gap-2 p-3 overflow-x-auto" style={{ scrollbarWidth: 'thin' }}>
        {/* Create story tile */}
        <button
          onClick={() => onView(-1)}
          className="relative shrink-0 w-[110px] h-[200px] rounded-lg overflow-hidden bg-[#f0f2f5] dark:bg-[#18191a] text-left"
        >
          <div className="h-[140px] w-full bg-gradient-to-br from-[#1877f2] to-[#42a5f5] grid place-items-center text-white text-xs font-medium">
            <span className="text-center px-2">Create story</span>
          </div>
          <div className="absolute top-[120px] left-1/2 -translate-x-1/2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#1877f2] text-white ring-4 ring-[#f0f2f5] dark:ring-[#242526]">
              <Plus className="size-5" />
            </span>
          </div>
          <div className="mt-3 text-center text-xs font-medium text-[#050505] dark:text-[#e4e6eb]">
            Create story
          </div>
        </button>

        {/* Story tiles */}
        {stories.map((s, i) => (
          <button
            key={s.id}
            onClick={() => onView(i)}
            className="relative shrink-0 w-[110px] h-[200px] rounded-lg overflow-hidden bg-[#f0f2f5] dark:bg-[#18191a] group"
          >
            <img
              src={s.imageUrl}
              alt={s.user.name + ' story'}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
            <div className="absolute top-2 left-2">
              <span className="ring-4 ring-[#1877f2] rounded-full block">
                <UserAvatar
                  src={s.user.avatarUrl}
                  name={s.user.name}
                  size={36}
                  ringClass="ring-0"
                />
              </span>
            </div>
            <div className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium truncate">
              {s.user.name}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
