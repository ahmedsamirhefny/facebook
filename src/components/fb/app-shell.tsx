'use client'

import { Header } from '@/components/fb/header'
import { LeftSidebar } from '@/components/fb/left-sidebar'
import { RightSidebar } from '@/components/fb/right-sidebar'
import { Feed } from '@/components/fb/feed'
import { ChatDock } from '@/components/fb/chat-dock'
import { ProfileModal } from '@/components/fb/profile-modal'
import { FriendsDialog } from '@/components/fb/friends-dialog'
import { SettingsDialog } from '@/components/fb/settings-dialog'
import { StoryViewer } from '@/components/fb/story-viewer'

export function AppShell() {
  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-[#050505] dark:text-[#e4e6eb]">
      <Header />
      <main className="flex justify-center w-full px-0 sm:px-2 lg:px-4 gap-4 max-w-[1100px] xl:max-w-[1100px] mx-auto">
        <LeftSidebar />
        <div className="flex-1 min-w-0 max-w-[600px] py-3 px-1 sm:px-3">
          <Feed />
        </div>
        <RightSidebar />
      </main>
      <ProfileModal />
      <FriendsDialog />
      <SettingsDialog />
      <StoryViewer />
      <ChatDock />
    </div>
  )
}
