'use client'

import { io } from 'socket.io-client'

// Shared singleton socket — uses the Caddy gateway with XTransformPort=3003.
// Path MUST stay "/" — never use a direct host:port URL.
let s: ReturnType<typeof io> | null = null

export function getSocket() {
  if (!s) {
    s = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
      reconnection: true,
    })
  }
  return s
}
