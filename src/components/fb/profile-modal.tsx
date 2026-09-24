'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useUserProfile } from '@/lib/hooks/queries'
import { useChatStore } from '@/lib/store'
import { UserAvatar } from './user-avatar'
import { PostCard } from './post-card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Briefcase,
  GraduationCap,
  MapPin,
  MessageCircle,
  UserPlus,
} from 'lucide-react'

function ProfileBody({ id }: { id: string }) {
  const profile = useUserProfile(id)
  const openChat = useChatStore((s) => s.openChat)

  if (profile.isLoading || !profile.data) {
    return (
      <div className="p-4">
        <Skeleton className="h-32 w-full" />
        <div className="flex items-start gap-4 mt-4">
          <Skeleton className="h-24 w-24 rounded-full -mt-12 ring-4 ring-white dark:ring-[#242526]" />
          <div className="flex-1">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-20 mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <Skeleton className="h-8" />
          <Skeleton className="h-8" />
          <Skeleton className="h-8" />
        </div>
      </div>
    )
  }

  const u = profile.data

  return (
    <div>
      {/* Cover + avatar */}
      <div className="relative">
        {u.coverUrl ? (
          <img
            src={u.coverUrl}
            alt="cover"
            className="w-full h-44 sm:h-56 object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-44 sm:h-56 bg-gradient-to-r from-[#1877f2] to-[#42a5f5] rounded-t-lg" />
        )}
        <div className="absolute -bottom-12 left-4">
          <div className="ring-4 ring-white dark:ring-[#242526] rounded-full">
            <UserAvatar src={u.avatarUrl} name={u.name} size={120} />
          </div>
        </div>
      </div>

      <div className="px-4 pt-14 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-2xl font-bold text-[#050505] dark:text-[#e4e6eb]">
              {u.name}
            </div>
            <div className="text-sm text-[#65676b] dark:text-[#b0b3b8]">
              {u._count.posts} posts · {u._count.friends} friends
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              className="h-9 bg-white dark:bg-[#3a3b3c] border-[#ced4da] dark:border-[#3a3b3c] text-[#050505] dark:text-[#e4e6eb] hover:bg-[#f0f2f5] dark:hover:bg-[#4e4f50]"
              onClick={() =>
                openChat({ userId: u.id, name: u.name, avatarUrl: u.avatarUrl })
              }
            >
              <MessageCircle className="size-4 mr-1" />
              Message
            </Button>
            <Button
              variant="outline"
              className="h-9 bg-white dark:bg-[#3a3b3c] border-[#ced4da] dark:border-[#3a3b3c] text-[#050505] dark:text-[#e4e6eb] hover:bg-[#f0f2f5] dark:hover:bg-[#4e4f50]"
            >
              <UserPlus className="size-4 mr-1" />
              Add Friend
            </Button>
          </div>
        </div>

        <div className="mt-3 text-sm text-[#050505] dark:text-[#e4e6eb]">
          {u.bio}
        </div>

        <div className="mt-3 flex flex-col gap-1 text-sm text-[#65676b] dark:text-[#b0b3b8]">
          {u.work ? (
            <div className="flex items-center gap-2">
              <Briefcase className="size-4" />
              <span>{u.work}</span>
            </div>
          ) : null}
          {u.education ? (
            <div className="flex items-center gap-2">
              <GraduationCap className="size-4" />
              <span>Studied at {u.education}</span>
            </div>
          ) : null}
          {u.location ? (
            <div className="flex items-center gap-2">
              <MapPin className="size-4" />
              <span>Lives in {u.location}</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-t border-[#ced4da] dark:border-[#3a3b3c] mx-4 my-2" />

      <div className="px-4 pb-4">
        <div className="text-sm font-semibold text-[#65676b] dark:text-[#b0b3b8] mb-2">
          Posts
        </div>
        <div className="flex flex-col">
          {u.posts.length === 0 ? (
            <div className="text-center py-6 text-sm text-[#65676b] dark:text-[#b0b3b8]">
              No posts yet.
            </div>
          ) : (
            u.posts.map((p) => <PostCard key={p.id} post={p} />)
          )}
        </div>
      </div>
    </div>
  )
}

export function ProfileModal() {
  const target = useChatStore((s) => s.profileTarget)
  const openProfile = useChatStore((s) => s.openProfile)
  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && openProfile(null)}>
      <DialogContent
        className="max-w-[36rem] w-[calc(100%-2rem)] p-0 bg-white dark:bg-[#242526] border-[#ced4da] dark:border-[#3a3b3c] overflow-hidden max-h-[90vh]"
      >
        <DialogTitle className="sr-only">Profile</DialogTitle>
        <DialogDescription className="sr-only">
          User profile and posts
        </DialogDescription>
        {target ? (
          <ScrollArea className="max-h-[90vh]">
            <ProfileBody id={target} />
          </ScrollArea>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
