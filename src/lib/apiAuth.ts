import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

/** Returns a 401 response if not authenticated, null otherwise. */
export async function requireAuth(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  return null
}
