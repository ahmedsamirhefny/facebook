import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

// Lightweight current-user endpoint — used by the client to know who "me" is
// (for socket join + UI avatar in header / left sidebar).
export async function GET() {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  return NextResponse.json({
    id: me.id,
    name: me.name,
    firstName: me.firstName,
    lastName: me.lastName,
    avatarUrl: me.avatarUrl,
  })
}
