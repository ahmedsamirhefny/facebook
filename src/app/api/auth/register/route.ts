import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const firstName = (body?.firstName ?? '').toString().trim()
    const lastName = (body?.lastName ?? '').toString().trim()
    const email = (body?.email ?? '').toString().trim().toLowerCase()
    const password = (body?.password ?? '').toString()

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'First name, last name, email and password are required.' },
        { status: 400 }
      )
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      )
    }

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Try logging in.' },
        { status: 409 }
      )
    }

    const name = `${firstName} ${lastName}`
    const hashed = await bcrypt.hash(password, 10)
    const seed = Math.floor(Math.random() * 70) + 200
    const user = await db.user.create({
      data: {
        email,
        name,
        firstName,
        lastName,
        password: hashed,
        avatarUrl: `https://i.pravatar.cc/300?img=${seed}`,
        coverUrl: `https://picsum.photos/seed/cover${seed}/1200/400`,
        bio: `New to facebook.`,
        online: true,
      },
    })

    // Auto-friend the new user with a handful of existing users so the feed
    // and contacts aren't empty for a fresh account.
    const others = await db.user.findMany({
      where: { NOT: { id: user.id } },
      take: 5,
      orderBy: { createdAt: 'asc' },
    })
    await Promise.all(
      others.map((o) =>
        db.friendship.create({
          data: { userAId: user.id, userBId: o.id, status: 'ACCEPTED' },
        })
      )
    )

    return NextResponse.json({ ok: true, userId: user.id })
  } catch (e: any) {
    console.error('register error', e)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
