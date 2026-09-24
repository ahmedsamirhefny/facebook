'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { useChatStore } from '@/lib/store'
import { getSocket } from '@/lib/socket'
import { toast } from 'sonner'

// =========================
// Types
// =========================
export interface ShortUser {
  id: string
  name: string
  avatarUrl: string
}
export interface PostAuthor {
  id: string
  name: string
  avatarUrl: string
}
export interface CommentItem {
  id: string
  content: string
  createdAt: string
  author: PostAuthor
}
export interface PostItem {
  id: string
  content: string
  imageUrl: string | null
  bgColor: string | null
  feeling: string | null
  createdAt: string
  author: PostAuthor
  _count: { likes: number; comments: number }
  likedByMe: boolean
  topComments: CommentItem[]
}
export interface StoryItem {
  id: string
  imageUrl: string
  caption: string | null
  createdAt: string
  user: ShortUser
  isMine: boolean
}
export interface FeedPayload {
  me: ShortUser & { firstName: string }
  stories: StoryItem[]
  posts: PostItem[]
}
export interface NotificationItem {
  id: string
  type: string
  text: string
  read: boolean
  createdAt: string
  fromUser: ShortUser
}
export interface MessageItem {
  id: string
  senderId: string
  receiverId: string
  content: string
  read?: boolean
  createdAt: string
}
export interface UserProfile {
  id: string
  name: string
  firstName: string
  lastName: string
  avatarUrl: string
  coverUrl: string | null
  bio: string | null
  work: string | null
  education: string | null
  location: string | null
  createdAt: string
  _count: { posts: number; friends: number }
  posts: PostItem[]
}

// =========================
// Queries
// =========================
export function useFeed() {
  return useQuery<FeedPayload>({
    queryKey: ['feed'],
    queryFn: async () => {
      const res = await fetch('/api/feed')
      if (!res.ok) throw new Error('feed failed')
      return res.json()
    },
  })
}

export function useContacts() {
  return useQuery<{ users: ShortUser[] }>({
    queryKey: ['contacts'],
    queryFn: async () => {
      const res = await fetch('/api/contacts')
      if (!res.ok) throw new Error('contacts failed')
      return res.json()
    },
  })
}

export function useNotifications() {
  return useQuery<NotificationItem[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications')
      if (!res.ok) throw new Error('notifications failed')
      return res.json()
    },
  })
}

export function useConversation(userId: string | null | undefined) {
  return useQuery<MessageItem[]>({
    queryKey: ['conversation', userId],
    queryFn: async () => {
      const res = await fetch(`/api/messages?userId=${userId}`)
      if (!res.ok) throw new Error('conversation failed')
      return res.json()
    },
    enabled: !!userId,
  })
}

export function useUserProfile(id: string | null | undefined) {
  return useQuery<UserProfile>({
    queryKey: ['user', id],
    queryFn: async () => {
      const res = await fetch(`/api/users/${id}`)
      if (!res.ok) throw new Error('user failed')
      return res.json()
    },
    enabled: !!id,
  })
}

export function useSearchUsers(q: string) {
  return useQuery<ShortUser[]>({
    queryKey: ['search-users', q],
    queryFn: async () => {
      const res = await fetch(`/api/users?q=${encodeURIComponent(q)}`)
      if (!res.ok) throw new Error('search failed')
      return res.json()
    },
    enabled: q.length > 0,
    placeholderData: keepPreviousData,
  })
}

// =========================
// Mutations
// =========================
export function useCreatePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      content: string
      imageUrl?: string
      bgColor?: string
      feeling?: string
    }) => {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) throw new Error('create post failed')
      return res.json()
    },
    onMutate: async () => {
      // We'll prepend the real post in onSuccess.
    },
    onSuccess: async (post: PostItem) => {
      // Prepend to feed cache.
      const cached = qc.getQueryData<FeedPayload>(['feed'])
      if (cached) {
        qc.setQueryData<FeedPayload>(['feed'], {
          ...cached,
          posts: [post, ...cached.posts],
        })
      }
      toast.success('Posted!')
    },
    onError: () => toast.error('Could not post. Try again.'),
  })
}

export function useToggleLike(postId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' })
      if (!res.ok) throw new Error('like failed')
      return res.json() as Promise<{ liked: boolean; count: number }>
    },
    onMutate: async () => {
      // Optimistic
      const cached = qc.getQueryData<FeedPayload>(['feed'])
      if (cached) {
        const posts = cached.posts.map((p) =>
          p.id === postId
            ? {
                ...p,
                likedByMe: !p.likedByMe,
                _count: {
                  ...p._count,
                  likes: p._count.likes + (p.likedByMe ? -1 : 1),
                },
              }
            : p
        )
        qc.setQueryData<FeedPayload>(['feed'], { ...cached, posts })
      }
      return { cached }
    },
    onError: (_err, _vars, ctx) => {
      // Rollback
      if (ctx?.cached) qc.setQueryData(['feed'], ctx.cached)
      toast.error('Could not update like.')
    },
  })
}

export function useCreateComment(postId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) throw new Error('comment failed')
      return res.json() as Promise<CommentItem>
    },
    // Optimistic-ish: append after server confirms.
    onSuccess: async (comment) => {
      const cached = qc.getQueryData<FeedPayload>(['feed'])
      if (cached) {
        const posts = cached.posts.map((p) =>
          p.id === postId
            ? {
                ...p,
                _count: { ...p._count, comments: p._count.comments + 1 },
                topComments: [...p.topComments, comment],
              }
            : p
        )
        qc.setQueryData<FeedPayload>(['feed'], { ...cached, posts })
      }
      // also invalidate full-comment query so expanded lists pick it up
      qc.invalidateQueries({ queryKey: ['comments', postId] })
    },
  })
}

export function usePostComments(postId: string, enabled: boolean) {
  return useQuery<CommentItem[]>({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const res = await fetch(`/api/posts/${postId}/comments`)
      if (!res.ok) throw new Error('comments failed')
      return res.json()
    },
    enabled,
  })
}

export function useMarkNotificationsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/notifications/read', { method: 'POST' })
      if (!res.ok) throw new Error('mark-read failed')
      return res.json()
    },
    onSuccess: async () => {
      const cached = qc.getQueryData<NotificationItem[]>(['notifications'])
      if (cached) {
        qc.setQueryData<NotificationItem[]>(
          ['notifications'],
          cached.map((n) => ({ ...n, read: true }))
        )
      }
    },
  })
}

// Send a message: persists via API then emits via socket for real-time.
export function useSendMessage(receiverId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId, content }),
      })
      if (!res.ok) throw new Error('send failed')
      return res.json() as Promise<MessageItem>
    },
    onSuccess: async (message) => {
      // Optimistic cache update for the conversation (sender's view)
      const cached = qc.getQueryData<MessageItem[]>(['conversation', receiverId])
      if (cached) {
        qc.setQueryData<MessageItem[]>(['conversation', receiverId], [
          ...cached,
          message,
        ])
      } else {
        qc.invalidateQueries({ queryKey: ['conversation', receiverId] })
      }
      // Relay via socket
      try {
        getSocket().emit('private-message', { toUserId: receiverId, message })
      } catch {}
    },
    onError: () => toast.error('Message not sent.'),
  })
}
