import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/posts/[id]/comments — list all comments for a post.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const comments = await db.comment.findMany({
      where: { postId: id },
      orderBy: { createdAt: 'asc' },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    })
    return NextResponse.json(comments)
  } catch (e: any) {
    console.error('GET /api/posts/[id]/comments error', e)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}

// POST /api/posts/[id]/comments — create a comment by me on post id.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const me = await getCurrentUser()
    if (!me) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const content: string = (body.content ?? '').toString().trim()
    if (!content) {
      return NextResponse.json({ error: 'content required' }, { status: 400 })
    }

    const post = await db.post.findUnique({
      where: { id },
      select: { authorId: true },
    })
    if (!post) {
      return NextResponse.json({ error: 'post not found' }, { status: 404 })
    }

    const comment = await db.comment.create({
      data: { postId: id, authorId: me.id, content },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    })

    // Notify the post author if it isn't me.
    if (post.authorId !== me.id) {
      await db.notification.create({
        data: {
          userId: post.authorId,
          fromUserId: me.id,
          type: 'comment',
          text: `${me.name} commented on your post: "${content.slice(0, 40)}${
            content.length > 40 ? '…' : ''
          }"`,
        },
      })
    }

    return NextResponse.json({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      author: comment.author,
    })
  } catch (e: any) {
    console.error('POST /api/posts/[id]/comments error', e)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
