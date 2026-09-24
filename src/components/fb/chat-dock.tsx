'use client'

import * as React from 'react'
import { useChatStore } from '@/lib/store'
import { ChatWindow } from './chat-window'

export function ChatDock() {
  const windows = useChatStore((s) => s.openWindows)
  if (windows.length === 0) return null

  return (
    <div className="fixed bottom-0 right-0 z-40 flex items-end gap-2 pr-3 pb-3 max-h-screen overflow-x-auto">
      {windows.map((w) => (
        <ChatWindow key={w.userId} win={w} />
      ))}
    </div>
  )
}
