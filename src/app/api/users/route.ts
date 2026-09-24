import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET /api/users?q=  — search users by name (exclude me). Returns short list.
export async function GET(req: Request) {
  try {
    const me = await getCurrentUser()
    if (!me) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') ?? '').trim()

    const where = q
      ? {
          AND: [
            { id: { not: me.id } },
            {
              OR: [
                { name: { contains: q } },
                { firstName: { contains: q } },
                { lastName: { contains: q } },
              ],
            },
          ],
        }
      : { id: { not: me.id } }

    const users = await db.user.findMany({
      where,
      select: { id: true, name: true, avatarUrl: true },
      take: q ? 20 : 8,
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(users)
  } catch (e: any) {
    console.error('GET /api/users error', e)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
