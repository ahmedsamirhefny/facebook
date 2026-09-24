'use client'

import * as React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  useToggleLike,
  useCreateComment,
  usePostComments,
  type PostItem,
  type CommentItem,
} from '@/lib/hooks/queries'
import { useChatStore } from '@/lib/store'
import { useFeed } from '@/lib/hooks/queries'
import { formatRelative, initials, compact } from '@/lib/format'
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  Globe,
  MoreHorizontal,
  Eye,
  Bell,
  Trash2,
  Bookmark,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

function CommentsList({ items }: { items: CommentItem[] }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((c) => (
        <div key={c.id} className="flex items-start gap-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={c.author.avatarUrl} alt={c.author.name} />
            <AvatarFallback className="bg-[#e4e6eb] text-[#050505] dark:bg-[#3a3b3c] dark:text-[#e4e6eb] text-xs">
              {initials(c.author.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="inline-block bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-2xl px-3 py-2 max-w-full">
              <div className="text-xs font-semibold text-[#050505] dark:text-[#e4e6eb]">
                {c.author.name}
              </div>
              <div className="text-sm text-[#050505] dark:text-[#e4e6eb] break-words">
                {c.content}
              </div>
            </div>
            <div className="flex items-center gap-3 px-3 mt-0.5 text-xs text-[#65676b] dark:text-[#b0b3b8] font-medium">
              <span>{formatRelative(c.createdAt)}</span>
              <button className="hover:underline">Like</button>
              <button className="hover:underline">Reply</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function CommentComposer({ postId }: { postId: string }) {
  const feed = useFeed()
  const me = feed.data?.me
  const create = useCreateComment(postId)
  const [text, setText] = React.useState('')

  if (!me) return null

  const submit = async () => {
    const t = text.trim()
    if (!t || create.isPending) return
    await create.mutateAsync(t)
    setText('')
  }

  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={me.avatarUrl} alt={me.name} />
        <AvatarFallback className="bg-[#e4e6eb] text-[#050505] dark:bg-[#3a3b3c] dark:text-[#e4e6eb] text-xs">
          {initials(me.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 flex items-center bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-2xl px-3 py-1">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              submit()
            }
          }}
          placeholder="Write a comment…"
          className="border-0 bg-transparent shadow-none focus-visible:ring-0 h-8 px-0 text-sm placeholder:text-[#65676b] dark:placeholder:text-[#b0b3b8] text-[#050505] dark:text-[#e4e6eb]"
        />
        <button
          onClick={submit}
          disabled={!text.trim() || create.isPending}
          className="text-xs font-medium text-[#1877f2] hover:underline disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  )
}

export function PostCard({ post }: { post: PostItem }) {
  const like = useToggleLike(post.id)
  const [showComments, setShowComments] = React.useState(false)
  const [comments, setComments] = React.useState<CommentItem[]>(post.topComments)
  const full = usePostComments(post.id, showComments)
  const openProfile = useChatStore((s) => s.openProfile)

  // When the user opens comments, load the full list and merge into local state.
  React.useEffect(() => {
    if (full.data) {
      setComments(full.data)
    } else if (showComments) {
      // already loading — keep showing top comments until ready
      setComments(post.topComments)
    }
  }, [full.data, showComments])

  const displayComments = comments
  const commentCount = post._count.comments

  return (
    <article className="bg-white dark:bg-[#242526] rounded-lg shadow-sm mb-3">
      {/* Header */}
      <div className="flex items-start gap-2 p-3 pb-2">
        <button onClick={() => openProfile(post.author.id)}>
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
            <AvatarFallback className="bg-[#e4e6eb] text-[#050505] dark:bg-[#3a3b3c] dark:text-[#e4e6eb]">
              {initials(post.author.name)}
            </AvatarFallback>
          </Avatar>
        </button>
        <div className="min-w-0 flex-1">
          <div className="text-sm">
            <button
              onClick={() => openProfile(post.author.id)}
              className="font-semibold text-[#050505] dark:text-[#e4e6eb] hover:underline"
            >
              {post.author.name}
            </button>
            {post.feeling ? (
              <span className="text-[#65676b] dark:text-[#b0b3b8]"> is {post.feeling}</span>
            ) : null}
          </div>
          <div className="flex items-center gap-1 text-xs text-[#65676b] dark:text-[#b0b3b8]">
            <span>{formatRelative(post.createdAt)}</span>
            <span>·</span>
            <Globe className="size-3" />
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="More options"
              className="grid h-9 w-9 place-items-center rounded-full hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-[#050505] dark:text-[#e4e6eb]"
            >
              <MoreHorizontal className="size-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-white dark:bg-[#242526] border-[#ced4da] dark:border-[#3a3b3c]"
          >
            <DropdownMenuItem className="gap-2 text-sm cursor-pointer hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c]">
              <Bookmark className="size-4" /> Save post
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-sm cursor-pointer hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c]">
              <Bell className="size-4" /> Turn on notifications
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-sm cursor-pointer text-[#fa3e3e] hover:bg-[#fff0f0] dark:hover:bg-[#3a2222]">
              <Trash2 className="size-4" /> Hide post
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Body */}
      <div className="px-3 pb-2">
        {post.content ? (
          <p className="text-[15px] text-[#050505] dark:text-[#e4e6eb] whitespace-pre-wrap break-words">
            {post.feeling && !post.content
              ? null
              : post.content}
          </p>
        ) : null}
        {post.feeling && !post.content ? (
          <p className="text-[15px] text-[#050505] dark:text-[#e4e6eb]">
            is {post.feeling}
          </p>
        ) : null}
      </div>

      {/* Image */}
      {post.imageUrl ? (
        <div
          className="w-full overflow-hidden bg-[#f0f2f5] dark:bg-[#18191a]"
        >
          <img
            src={post.imageUrl}
            alt="post"
            className="w-full max-h-[520px] object-cover"
            loading="lazy"
          />
        </div>
      ) : null}

      {/* Stats */}
      {(post._count.likes > 0 || commentCount > 0) ? (
        <div className="flex items-center justify-between px-3 py-2 text-sm text-[#65676b] dark:text-[#b0b3b8]">
          <div className="flex items-center gap-1">
            {post._count.likes > 0 ? (
              <div className="flex items-center">
                <span className="grid place-items-center h-5 w-5 rounded-full bg-[#1877f2] text-white text-xs mr-[-3px] ring-2 ring-white dark:ring-[#242526]">
                  <ThumbsUp className="size-3 fill-white" />
                </span>
                <span className="grid place-items-center h-5 w-5 rounded-full bg-[#fa3e3e] text-white text-xs mr-1">
                  <span className="text-[10px]">❤</span>
                </span>
                <span>{compact(post._count.likes)}</span>
              </div>
            ) : null}
          </div>
          {commentCount > 0 ? (
            <button
              onClick={() => setShowComments((v) => !v)}
              className="hover:underline"
            >
              {compact(commentCount)} comments
            </button>
          ) : null}
        </div>
      ) : null}

      {/* Action bar */}
      <div className="border-t border-[#ced4da] dark:border-[#3a3b3c] mx-3 my-1" />
      <div className="px-2 py-1 grid grid-cols-3 gap-0.5">
        <button
          onClick={() => like.mutate()}
          disabled={like.isPending}
          className={`flex items-center justify-center gap-2 h-9 rounded-md hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-sm font-medium ${
            post.likedByMe
              ? 'text-[#1877f2]'
              : 'text-[#65676b] dark:text-[#b0b3b8]'
          }`}
        >
          <ThumbsUp className={`size-4 ${post.likedByMe ? 'fill-[#1877f2]' : ''}`} />
          <span>Like</span>
        </button>
        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center justify-center gap-2 h-9 rounded-md hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-sm font-medium text-[#65676b] dark:text-[#b0b3b8]"
        >
          <MessageCircle className="size-4" />
          <span>Comment</span>
        </button>
        <button className="flex items-center justify-center gap-2 h-9 rounded-md hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-sm font-medium text-[#65676b] dark:text-[#b0b3b8]">
          <Share2 className="size-4" />
          <span>Share</span>
        </button>
      </div>

      {/* Comments */}
      {showComments ? (
        <div className="px-3 pb-3 pt-1">
          <div className="max-h-80 overflow-y-auto flex flex-col gap-2 pb-2">
            {displayComments.length > 0 ? (
              <CommentsList items={displayComments} />
            ) : null}
            {full.isLoading && commentCount > 0 ? (
              <div className="text-xs text-[#65676b] dark:text-[#b0b3b8]">
                Loading comments…
              </div>
            ) : null}
            {displayComments.length === 0 && !full.isLoading ? (
              <div className="text-xs text-[#65676b] dark:text-[#b0b3b8]">
                No comments yet.
              </div>
            ) : null}
          </div>
          <div className="mt-2">
            <CommentComposer postId={post.id} />
          </div>
        </div>
      ) : null}
      {commentCount > 0 && !showComments ? (
        <div className="px-3 pb-2">
          <button
            onClick={() => setShowComments(true)}
            className="text-xs text-[#1877f2] font-medium hover:underline flex items-center gap-1"
          >
            View {compact(commentCount)} {commentCount === 1 ? 'comment' : 'comments'}
            <ChevronDown className="size-3" />
          </button>
        </div>
      ) : null}
      {showComments && commentCount > 3 ? (
        <div className="px-3 pb-2">
          <button
            onClick={() => setShowComments(false)}
            className="text-xs text-[#1877f2] font-medium hover:underline flex items-center gap-1"
          >
            Hide comments
            <ChevronUp className="size-3" />
          </button>
        </div>
      ) : null}
    </article>
  )
}
