'use client'

import * as React from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useFeed } from '@/lib/hooks/queries'
import { useChatStore } from '@/lib/store'
import { UserAvatar } from './user-avatar'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

const DURATION = 5000

export function StoryViewer() {
  const feed = useFeed()
  const stories = feed.data?.stories ?? []
  const initialIndex = useChatStore((s) => s.storyInitialIndex)
  const closeStory = useChatStore((s) => s.openStory)
  const open = initialIndex !== null && initialIndex >= 0

  const [index, setIndex] = React.useState(0)
  const [progress, setProgress] = React.useState(0)

  React.useEffect(() => {
    if (initialIndex !== null && initialIndex >= 0) {
      setIndex(initialIndex)
      setProgress(0)
    }
  }, [initialIndex])

  // auto-advance timer
  React.useEffect(() => {
    if (!open) return
    setProgress(0)
    const start = Date.now()
    const id = setInterval(() => {
      const elapsed = Date.now() - start
      const p = Math.min(1, elapsed / DURATION)
      setProgress(p)
      if (p >= 1) {
        clearInterval(id)
        if (index < stories.length - 1) {
          setIndex((i) => i + 1)
        } else {
          closeStory(null)
        }
      }
    }, 50)
    return () => clearInterval(id)
  }, [open, index, stories.length, closeStory])

  if (!open || stories.length === 0) return null
  const story = stories[index]
  if (!story) return null

  const prev = () => setIndex((i) => Math.max(0, i - 1))
  const next = () => {
    if (index < stories.length - 1) setIndex((i) => i + 1)
    else closeStory(null)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && closeStory(null)}>
      <DialogContent
        showCloseButton={false}
        className="p-0 bg-transparent border-0 shadow-none max-w-none w-auto h-[90vh] overflow-hidden"
        onClick={(e: any) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = e.clientX - rect.left
          if (x < rect.width / 2) prev()
          else next()
        }}
      >
        <div className="relative h-full w-[420px] max-w-[92vw] rounded-xl overflow-hidden bg-black">
          <img
            src={story.imageUrl}
            alt="story"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/40" />

          {/* Progress bars */}
          <div className="absolute top-3 left-3 right-3 flex gap-1.5">
            {stories.map((_, i) => (
              <div
                key={i}
                className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden"
              >
                <div
                  className="h-full bg-white"
                  style={{
                    width: i < index ? '100%' : i > index ? '0%' : `${progress * 100}%`,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-6 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserAvatar
                src={story.user.avatarUrl}
                name={story.user.name}
                size={36}
              />
              <span className="text-white text-sm font-medium drop-shadow">
                {story.user.name}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                closeStory(null)
              }}
              className="grid h-9 w-9 place-items-center rounded-full text-white hover:bg-white/15"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Caption */}
          {story.caption ? (
            <div className="absolute bottom-12 left-3 right-3 text-center">
              <div className="inline-block px-3 py-2 rounded-lg bg-black/40 text-white text-sm backdrop-blur">
                {story.caption}
              </div>
            </div>
          ) : null}

          {/* Side buttons */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              prev()
            }}
            disabled={index === 0}
            className="absolute left-2 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/20 hover:bg-white/30 text-white disabled:opacity-0 transition-opacity"
            aria-label="Previous"
          >
            <ChevronLeft className="size-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              next()
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-opacity"
            aria-label="Next"
          >
            <ChevronRight className="size-6" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
