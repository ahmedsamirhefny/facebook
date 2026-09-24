import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/posts — list posts (same shape as feed posts).
export async function GET() {
  try {
    const me = await getCurrentUser()
    if (!me) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const posts = await db.post.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
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
    })

    return NextResponse.json(
      posts.map((p) => ({
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
      }))
    )
  } catch (e: any) {
    console.error('GET /api/posts error', e)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}

// POST /api/posts — create a post authored by me.
export async function POST(req: Request) {
  try {
    const me = await getCurrentUser()
    if (!me) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    const body = await req.json().catch(() => ({}))
    const content: string = (body.content ?? '').toString().trim()
    if (!content) {
      return NextResponse.json({ error: 'content required' }, { status: 400 })
    }
    const imageUrl = body.imageUrl ? String(body.imageUrl) : null
    const bgColor = body.bgColor ? String(body.bgColor) : null
    const feeling = body.feeling ? String(body.feeling) : null

    const post = await db.post.create({
      data: {
        authorId: me.id,
        content,
        imageUrl,
        bgColor,
        feeling,
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { likes: true, comments: true } },
      },
    })

    return NextResponse.json({
      id: post.id,
      content: post.content,
      imageUrl: post.imageUrl,
      bgColor: post.bgColor,
      feeling: post.feeling,
      createdAt: post.createdAt,
      author: post.author,
      _count: { likes: post._count.likes, comments: post._count.comments },
      likedByMe: false,
      topComments: [],
    })
  } catch (e: any) {
    console.error('POST /api/posts error', e)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
