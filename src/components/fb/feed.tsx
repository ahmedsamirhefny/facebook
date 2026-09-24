'use client'

import { useFeed } from '@/lib/hooks/queries'
import { Stories } from './stories'
import { CreatePost } from './create-post'
import { PostCard } from './post-card'
import { Skeleton } from '@/components/ui/skeleton'
import { useChatStore } from '@/lib/store'

function PostSkeleton() {
  return (
    <div className="bg-white dark:bg-[#242526] rounded-lg shadow-sm mb-3 p-3">
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-20 mt-2" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6 mt-2" />
      <Skeleton className="h-3 w-2/3 mt-2" />
      <Skeleton className="h-60 w-full mt-3 rounded-lg" />
      <div className="border-t border-[#ced4da] dark:border-[#3a3b3c] my-3" />
      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
      </div>
    </div>
  )
}

export function Feed() {
  const feed = useFeed()
  const me = feed.data?.me
  const openStory = useChatStore((s) => s.openStory)

  return (
    <div className="w-full max-w-[600px] mx-auto">
      <Stories onView={openStory} />
      <CreatePost />

      {feed.isLoading || !me ? (
        <>
          <PostSkeleton />
          <PostSkeleton />
        </>
      ) : feed.isError ? (
        <div className="bg-white dark:bg-[#242526] rounded-lg shadow-sm p-6 text-center text-[#65676b] dark:text-[#b0b3b8]">
          Could not load the feed. Please refresh.
        </div>
      ) : feed.data.posts.length === 0 ? (
        <div className="bg-white dark:bg-[#242526] rounded-lg shadow-sm p-6 text-center text-[#65676b] dark:text-[#b0b3b8]">
          No posts yet. Be the first to share something!
        </div>
      ) : (
        feed.data.posts.map((p) => <PostCard key={p.id} post={p} />)
      )}
    </div>
  )
}
