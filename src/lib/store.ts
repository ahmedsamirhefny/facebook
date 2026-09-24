'use client'

import { create } from 'zustand'

export interface ChatWindow {
  userId: string
  name: string
  avatarUrl: string
  minimized: boolean
}

export interface ChatMessage {
  id: string
  senderId: string
  receiverId: string
  content: string
  createdAt: string
  read?: boolean
}

interface ChatState {
  openWindows: ChatWindow[]
  online: Set<string>
  typingFrom: Record<string, boolean> // userId -> isTyping
  /** When set, the profile modal opens for this userId. */
  profileTarget: string | null
  /** When set, the story viewer opens at this index. */
  storyInitialIndex: number | null
  /** Whether the settings dialog is open. */
  settingsOpen: boolean
  /** Whether the friends dialog is open. */
  friendsOpen: boolean

  openChat: (u: { userId: string; name: string; avatarUrl: string }) => void
  closeChat: (userId: string) => void
  toggleMinimize: (userId: string) => void

  setOnline: (ids: string[]) => void
  receiveMessage: (from: string, message: ChatMessage) => void
  setTyping: (from: string, isTyping: boolean) => void

  openProfile: (userId: string | null) => void
  openStory: (index: number | null) => void
  setSettingsOpen: (open: boolean) => void
  setFriendsOpen: (open: boolean) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  openWindows: [],
  online: new Set<string>(),
  typingFrom: {},
  profileTarget: null,
  storyInitialIndex: null,
  settingsOpen: false,
  friendsOpen: false,

  openChat: (u) => {
    const existing = get().openWindows.find((w) => w.userId === u.userId)
    if (existing) {
      set((st) => ({
        openWindows: st.openWindows.map((w) =>
          w.userId === u.userId ? { ...w, minimized: false } : w
        ),
      }))
      return
    }
    // Facebook docks at most ~3 visible windows on small screens; allow more (scroll)
    set((st) => ({
      openWindows: [...st.openWindows, { ...u, minimized: false }],
    }))
  },
  closeChat: (userId) =>
    set((st) => ({
      openWindows: st.openWindows.filter((w) => w.userId !== userId),
    })),
  toggleMinimize: (userId) =>
    set((st) => ({
      openWindows: st.openWindows.map((w) =>
        w.userId === userId ? { ...w, minimized: !w.minimized } : w
      ),
    })),

  setOnline: (ids) =>
    set(() => ({
      online: new Set(ids),
    })),

  receiveMessage: (from, _message) => {
    // We don't persist again here (the sender already persisted via the API).
    // The conversation query cache is invalidated by the message list hook in
    // the chat window when a private-message arrives for that conversation.
    // Trigger a re-fetch by toggling a sentinel — but to keep things simple,
    // the chat-window subscribes directly and appends locally.
    // Touch typing state to force a re-render of any open window for `from`:
    set((st) => ({ typingFrom: { ...st.typingFrom, [from]: false } }))
  },
  setTyping: (from, isTyping) =>
    set((st) => ({
      typingFrom: { ...st.typingFrom, [from]: isTyping },
    })),

  openProfile: (userId) => set(() => ({ profileTarget: userId })),
  openStory: (index) => set(() => ({ storyInitialIndex: index })),
  setSettingsOpen: (open) => set(() => ({ settingsOpen: open })),
  setFriendsOpen: (open) => set(() => ({ friendsOpen: open })),
}))
