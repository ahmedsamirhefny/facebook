import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// POST /api/posts/[id]/like — toggle like by me.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const me = await getCurrentUser()
    if (!me) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    const { id } = await params

    const existing = await db.like.findUnique({
      where: { postId_userId: { postId: id, userId: me.id } },
    })

    if (existing) {
      await db.like.delete({ where: { id: existing.id } })
      const count = await db.like.count({ where: { postId: id } })
      return NextResponse.json({ liked: false, count })
    }

    await db.like.create({ data: { postId: id, userId: me.id } })
    const count = await db.like.count({ where: { postId: id } })
    return NextResponse.json({ liked: true, count })
  } catch (e: any) {
    console.error('POST /api/posts/[id]/like error', e)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
