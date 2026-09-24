import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// POST /api/notifications/read — mark all unread notifications for me as read.
export async function POST() {
  try {
    const me = await getCurrentUser()
    if (!me) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    await db.notification.updateMany({
      where: { userId: me.id, read: false },
      data: { read: true },
    })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('POST /api/notifications/read error', e)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
