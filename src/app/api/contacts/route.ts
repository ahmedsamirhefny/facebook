import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/contacts — the people "me" is friends with (both directions, ACCEPTED).
// Online flag is NOT computed here; the client merges socket presence.
export async function GET() {
  try {
    const me = await getCurrentUser()
    if (!me) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const friendships = await db.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ userAId: me.id }, { userBId: me.id }],
      },
      select: { userAId: true, userBId: true },
    })

    const otherIds = new Set<string>()
    for (const f of friendships) {
      if (f.userAId === me.id) otherIds.add(f.userBId)
      else otherIds.add(f.userAId)
    }

    const users = await db.user.findMany({
      where: { id: { in: Array.from(otherIds) } },
      select: { id: true, name: true, avatarUrl: true },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ users })
  } catch (e: any) {
    console.error('GET /api/contacts error', e)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
