import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

function shapePost(p: any, meId: string) {
  return {
    id: p.id,
    content: p.content,
    imageUrl: p.imageUrl,
    bgColor: p.bgColor,
    feeling: p.feeling,
    createdAt: p.createdAt,
    author: p.author,
    _count: { likes: p._count.likes, comments: p._count.comments },
    likedByMe: (p.likes ?? []).some((l: any) => l.userId === meId),
    topComments: (p.comments ?? [])
      .slice()
      .reverse()
      .map((c: any) => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt,
        author: c.author,
      })),
  }
}

// GET /api/users/[id] — full profile + recent posts.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const me = await getCurrentUser()
    if (!me) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    const { id } = await params

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        coverUrl: true,
        bio: true,
        work: true,
        education: true,
        location: true,
        createdAt: true,
        _count: { select: { posts: true, friendshipsA: true, friendshipsB: true } },
      },
    })
    if (!user) {
      return NextResponse.json({ error: 'user not found' }, { status: 404 })
    }

    const posts = await db.post.findMany({
      where: { authorId: id },
      orderBy: { createdAt: 'desc' },
      take: 9,
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

    const friendsCount = user._count.friendshipsA + user._count.friendshipsB

    return NextResponse.json({
      id: user.id,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      coverUrl: user.coverUrl,
      bio: user.bio,
      work: user.work,
      education: user.education,
      location: user.location,
      createdAt: user.createdAt,
      _count: { posts: user._count.posts, friends: friendsCount },
      posts: posts.map((p) => shapePost(p, me.id)),
    })
  } catch (e: any) {
    console.error('GET /api/users/[id] error', e)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
