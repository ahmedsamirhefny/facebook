import { getServerSession } from 'next-auth'
import { authOptions } from './auth.config'
import { db } from './db'

export { authOptions }

// Server-side helper that returns the logged-in user (the "me" for this request),
// resolved from the NextAuth session. Returns null when not authenticated.
// Used inside API routes and server components.
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  const id = (session?.user as any)?.id
  if (!id) return null

  return db.user.findUnique({
    where: { id },
    include: {
      posts: { orderBy: { createdAt: 'desc' }, take: 8 },
      _count: { select: { posts: true } },
    },
  })
}
