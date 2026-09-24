import { db } from './db'

// No real auth in this demo. The "current user" is the seeded user
// you@facebook.local — represents the logged-in viewer ("me").
const ME_EMAIL = 'you@facebook.local'

let cachedMe: Awaited<ReturnType<typeof getCurrentUserInner>> | null = null

async function getCurrentUserInner() {
  return db.user.findUnique({
    where: { email: ME_EMAIL },
    include: {
      posts: { orderBy: { createdAt: 'desc' }, take: 8 },
      _count: { select: { posts: true } },
    },
  })
}

export async function getCurrentUser() {
  if (!cachedMe) cachedMe = await getCurrentUserInner()
  return cachedMe
}
