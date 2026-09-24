'use client'

import * as React from 'react'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getSocket } from '@/lib/socket'
import { useChatStore } from '@/lib/store'

/** Connects the shared socket and joins as "me" once the user is known. */
function SocketBoot() {
  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/me')
        if (!res.ok) return
        const me = await res.json()
        if (cancelled || !me?.id) return
        const socket = getSocket()
        // wire socket events into the Zustand store
        socket.on('online-users', (payload: { userIds: string[] }) => {
          useChatStore.getState().setOnline(payload.userIds ?? [])
        })
        socket.on('private-message', (envelope: { from: string; message: any }) => {
          useChatStore.getState().receiveMessage(envelope.from, envelope.message)
        })
        socket.on('typing', (envelope: { from: string; isTyping: boolean }) => {
          useChatStore.getState().setTyping(envelope.from, envelope.isTyping)
        })
        // join as me
        socket.emit('join', {
          userId: me.id,
          name: me.name,
          avatarUrl: me.avatarUrl,
        })
      } catch {
        // network or socket not ready — silently ignore
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])
  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  )
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <QueryClientProvider client={client}>
          <SocketBoot />
          {children}
        </QueryClientProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
