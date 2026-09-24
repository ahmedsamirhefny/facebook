import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/notifications — for me, newest first, with fromUser short shape.
export async function GET() {
  try {
    const me = await getCurrentUser()
    if (!me) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const notifs = await db.notification.findMany({
      where: { userId: me.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: {
        fromUser: { select: { id: true, name: true, avatarUrl: true } },
      },
    })
    return NextResponse.json(
      notifs.map((n) => ({
        id: n.id,
        type: n.type,
        text: n.text,
        read: n.read,
        createdAt: n.createdAt,
        fromUser: n.fromUser,
      }))
    )
  } catch (e: any) {
    console.error('GET /api/notifications error', e)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
