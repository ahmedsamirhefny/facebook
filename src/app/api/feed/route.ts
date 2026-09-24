import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const me = await getCurrentUser()
    if (!me) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const [posts, stories] = await Promise.all([
      db.post.findMany({
        orderBy: { createdAt: 'desc' },
        take: 30,
        include: {
          author: {
            select: { id: true, name: true, avatarUrl: true },
          },
          likes: { where: { userId: me.id }, select: { id: true } },
          _count: { select: { likes: true, comments: true } },
          comments: {
            orderBy: { createdAt: 'desc' },
            take: 2,
            include: {
              author: { select: { id: true, name: true, avatarUrl: true } },
            },
          },
        },
      }),
      db.story.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      }),
    ])

    const payload = {
      me: {
        id: me.id,
        name: me.name,
        firstName: me.firstName,
        avatarUrl: me.avatarUrl,
      },
      stories: stories.map((s) => ({
        id: s.id,
        imageUrl: s.imageUrl,
        caption: s.caption,
        createdAt: s.createdAt,
        user: s.user,
        isMine: s.user.id === me.id,
      })),
      posts: posts.map((p) => ({
        id: p.id,
        content: p.content,
        imageUrl: p.imageUrl,
        bgColor: p.bgColor,
        feeling: p.feeling,
        createdAt: p.createdAt,
        author: p.author,
        _count: { likes: p._count.likes, comments: p._count.comments },
        likedByMe: p.likes.length > 0,
        topComments: p.comments
          .slice()
          .reverse()
          .map((c) => ({
            id: c.id,
            content: c.content,
            createdAt: c.createdAt,
            author: c.author,
          })),
      })),
    }

    return NextResponse.json(payload)
  } catch (e: any) {
    console.error('GET /api/feed error', e)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
