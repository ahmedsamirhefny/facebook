import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/stories — all stories with their user.
export async function GET() {
  try {
    const stories = await db.story.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    })
    return NextResponse.json(
      stories.map((s) => ({
        id: s.id,
        imageUrl: s.imageUrl,
        caption: s.caption,
        createdAt: s.createdAt,
        user: s.user,
      }))
    )
  } catch (e: any) {
    console.error('GET /api/stories error', e)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
