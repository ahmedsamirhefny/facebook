import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/messages?userId= — conversation between me and userId (asc order).
// Also marks incoming messages (receiverId == me) as read.
export async function GET(req: Request) {
  try {
    const me = await getCurrentUser()
    if (!me) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    // Mark incoming as read first.
    await db.message.updateMany({
      where: { senderId: userId, receiverId: me.id, read: false },
      data: { read: true },
    })

    const messages = await db.message.findMany({
      where: {
        OR: [
          { senderId: me.id, receiverId: userId },
          { senderId: userId, receiverId: me.id },
        ],
      },
      orderBy: { createdAt: 'asc' },
      take: 200,
      select: {
        id: true,
        senderId: true,
        receiverId: true,
        content: true,
        read: true,
        createdAt: true,
      },
    })

    return NextResponse.json(messages)
  } catch (e: any) {
    console.error('GET /api/messages error', e)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}

// POST /api/messages — body { receiverId, content }. Persists a message from me.
// The frontend also emits this via socket for real-time relay.
export async function POST(req: Request) {
  try {
    const me = await getCurrentUser()
    if (!me) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    const body = await req.json().catch(() => ({}))
    const receiverId: string | undefined = body.receiverId
    const content: string = (body.content ?? '').toString().trim()
    if (!receiverId || !content) {
      return NextResponse.json(
        { error: 'receiverId and content required' },
        { status: 400 }
      )
    }

    const message = await db.message.create({
      data: { senderId: me.id, receiverId, content },
      select: {
        id: true,
        senderId: true,
        receiverId: true,
        content: true,
        createdAt: true,
      },
    })

    return NextResponse.json(message)
  } catch (e: any) {
    console.error('POST /api/messages error', e)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
