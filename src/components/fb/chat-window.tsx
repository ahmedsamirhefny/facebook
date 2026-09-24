'use client'

import * as React from 'react'
import { useConversation, useSendMessage } from '@/lib/hooks/queries'
import { useChatStore, type ChatMessage } from '@/lib/store'
import { UserAvatar } from './user-avatar'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { formatRelative } from '@/lib/format'
import { getSocket } from '@/lib/socket'
import {
  X,
  Minus,
  Phone,
  Video,
  Plus,
  Smile,
  SendHorizontal,
} from 'lucide-react'

function TypingDots() {
  return (
    <div className="flex items-center gap-1 bg-[#f0f2f5] dark:bg-[#3a3b3c] px-3 py-2 rounded-2xl rounded-bl-sm w-fit">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-[#65676b] dark:bg-[#b0b3b8] animate-bounce"
          style={{ animationDelay: `${i * 120}ms` }}
        />
      ))}
    </div>
  )
}

export function ChatWindow({ win }: { win: { userId: string; name: string; avatarUrl: string; minimized: boolean } }) {
  const conv = useConversation(win.userId)
  const send = useSendMessage(win.userId)
  const closeChat = useChatStore((s) => s.closeChat)
  const toggleMinimize = useChatStore((s) => s.toggleMinimize)
  const typingFrom = useChatStore((s) => s.typingFrom[win.userId])
  const isOnline = useChatStore((s) => s.online.has(win.userId))
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [text, setText] = React.useState('')
  const [extra, setExtra] = React.useState<ChatMessage[]>([])

  // Listen for live messages from socket — append locally.
  // These come from:
  //  - the other participant (envelope.from === win.userId), OR
  //  - our own other tab emitting to the same recipient (envelope.from === me.id
  //    but message.receiverId === win.userId).
  React.useEffect(() => {
    const socket = getSocket()
    const handler = (envelope: { from: string; message: ChatMessage }) => {
      const m = envelope.message
      const belongsToConv =
        m &&
        ((m.senderId === win.userId && m.receiverId !== envelope.from) ||
          m.receiverId === win.userId ||
          envelope.from === win.userId)
      if (!belongsToConv) return
      setExtra((prev) => {
        if (prev.some((mm) => mm.id === m.id)) return prev
        return [...prev, m]
      })
      // Send read-receipt for incoming messages so the sender sees the read flag.
      if (envelope.from === win.userId) {
        socket.emit('read-receipt', {
          toUserId: envelope.from,
          messageIds: [m.id],
        })
      }
    }
    socket.on('private-message', handler)
    return () => {
      socket.off('private-message', handler)
    }
  }, [win.userId])

  // Merge server + extra live messages, dedupe by id
  const messages: ChatMessage[] = React.useMemo(() => {
    const base = (conv.data ?? []) as ChatMessage[]
    const map = new Map<string, ChatMessage>()
    for (const m of base) map.set(m.id, m)
    for (const m of extra) {
      // only include messages that belong to this conversation
      if (m.senderId === win.userId || m.receiverId === win.userId) {
        map.set(m.id, m)
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
  }, [conv.data, extra, win.userId])

  // Scroll to bottom on new messages
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages.length, typingFrom, win.minimized])

  // Determine "my id" from messages: the first message where receiverId === win.userId
  // means senderId is me.
  const myId = (() => {
    const mine = messages.find((m) => m.receiverId === win.userId)
    return mine?.senderId ?? null
  })()

  if (win.minimized) {
    // Collapsed: show only a circular avatar with name as title
    return (
      <div className="flex flex-col items-end">
        <button
          onClick={() => toggleMinimize(win.userId)}
          className="block"
          title={win.name}
        >
          <span className="relative">
            <UserAvatar src={win.avatarUrl} name={win.name} size={48} onlineUserId={win.userId} />
          </span>
        </button>
      </div>
    )
  }

  const submit = async () => {
    const t = text.trim()
    if (!t || send.isPending) return
    setText('')
    await send.mutateAsync(t)
  }

  return (
    <div className="w-[328px] max-w-[calc(100vw-1rem)] bg-white dark:bg-[#242526] rounded-lg shadow-xl border border-[#ced4da] dark:border-[#3a3b3c] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 p-2 border-b border-[#ced4da] dark:border-[#3a3b3c] bg-white dark:bg-[#242526]">
        <button
          onClick={() => toggleMinimize(win.userId)}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
        >
          <UserAvatar src={win.avatarUrl} name={win.name} size={32} onlineUserId={win.userId} />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[#050505] dark:text-[#e4e6eb] truncate">
              {win.name}
            </div>
            <div className="text-xs text-[#31a24c]">
              {isOnline ? 'Active now' : 'Offline'}
            </div>
          </div>
        </button>
        <button
          className="grid h-8 w-8 place-items-center rounded-full hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-[#1877f2]"
          aria-label="Voice call"
        >
          <Phone className="size-4" />
        </button>
        <button
          className="grid h-8 w-8 place-items-center rounded-full hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-[#1877f2]"
          aria-label="Video call"
        >
          <Video className="size-4" />
        </button>
        <button
          onClick={() => toggleMinimize(win.userId)}
          className="grid h-8 w-8 place-items-center rounded-full hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-[#050505] dark:text-[#e4e6eb]"
          aria-label="Minimize"
        >
          <Minus className="size-4" />
        </button>
        <button
          onClick={() => closeChat(win.userId)}
          className="grid h-8 w-8 place-items-center rounded-full hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-[#050505] dark:text-[#e4e6eb]"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex flex-col gap-1.5 overflow-y-auto p-3 max-h-[340px] min-h-[200px]"
      >
        {conv.isLoading && messages.length === 0 ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-sm text-[#65676b] dark:text-[#b0b3b8] mt-4">
            Start a conversation with {win.name}.
          </div>
        ) : (
          messages.map((m, i) => {
            const mine = myId ? m.senderId === myId : m.receiverId === win.userId
            const prevSame = i > 0 && messages[i - 1].senderId === m.senderId
            const time = new Date(m.createdAt)
            const showTime =
              i === 0 ||
              new Date(messages[i - 1].createdAt).getTime() - time.getTime() >
                5 * 60 * 1000
            return (
              <div key={m.id}>
                {showTime ? (
                  <div className="text-center text-xs text-[#65676b] dark:text-[#b0b3b8] my-2">
                    {formatRelative(time)}
                  </div>
                ) : null}
                <div
                  className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm break-words ${
                      mine
                        ? 'bg-[#1877f2] text-white rounded-br-sm'
                        : 'bg-[#f0f2f5] dark:bg-[#3a3b3c] text-[#050505] dark:text-[#e4e6eb] rounded-bl-sm'
                    } ${prevSame ? 'mt-0.5' : 'mt-1'}`}
                  >
                    {m.content}
                  </div>
                </div>
              </div>
            )
          })
        )}
        {typingFrom ? (
          <div className="flex justify-start mt-1">
            <TypingDots />
          </div>
        ) : null}
      </div>

      {/* Input */}
      <div className="flex items-center gap-1 p-2 border-t border-[#ced4da] dark:border-[#3a3b3c]">
        <button
          className="grid h-8 w-8 place-items-center rounded-full hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-[#1877f2]"
          aria-label="Add"
        >
          <Plus className="size-4" />
        </button>
        <div className="flex-1 bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-full px-3">
          <Input
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              // emit typing
              try {
                getSocket().emit('typing', {
                  toUserId: win.userId,
                  isTyping: e.target.value.length > 0,
                })
              } catch {}
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                submit()
              }
            }}
            placeholder="Aa"
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 h-9 px-0 text-sm text-[#050505] dark:text-[#e4e6eb] placeholder:text-[#65676b] dark:placeholder:text-[#b0b3b8]"
          />
        </div>
        <button
          className="grid h-8 w-8 place-items-center rounded-full hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-[#1877f2]"
          aria-label="Emoji"
        >
          <Smile className="size-4" />
        </button>
        {text.trim() ? (
          <button
            onClick={submit}
            disabled={send.isPending}
            className="grid h-8 w-8 place-items-center rounded-full bg-[#1877f2] text-white hover:bg-[#166fe5] disabled:opacity-50"
            aria-label="Send"
          >
            <SendHorizontal className="size-4" />
          </button>
        ) : (
          <button
            onClick={() =>
              send.mutateAsync('👍').then(() => setText(''))
            }
            className="grid h-8 w-8 place-items-center rounded-full hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-[#1877f2]"
            aria-label="Like (send thumbs up)"
          >
            <SendHorizontal className="size-4" />
          </button>
        )}
      </div>
    </div>
  )
}
