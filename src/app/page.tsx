'use client'

import { useSession } from 'next-auth/react'
import { AppShell } from '@/components/fb/app-shell'
import { AuthScreen } from '@/components/fb/auth-screen'

export default function HomePage() {
  const { status } = useSession()

  if (status === 'loading') {
    return (
      <div className="min-h-screen grid place-items-center bg-[#f0f2f5] dark:bg-[#18191a]">
        <div className="flex flex-col items-center gap-4">
          <div className="text-[#1877f2] font-bold text-4xl tracking-tight">facebook</div>
          <div className="h-7 w-7 rounded-full border-2 border-[#1877f2] border-t-transparent animate-spin" />
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return <AuthScreen />
  }

  return <AppShell />
}
