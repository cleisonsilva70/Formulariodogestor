import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const authError = await requireAuth()
  if (authError) return authError

  const rows = await prisma.cliente.groupBy({
    by: ['status'],
    _count: { _all: true },
  })

  const counts = Object.fromEntries(rows.map(r => [r.status, r._count._all]))
  const total = rows.reduce((s, r) => s + r._count._all, 0)

  return NextResponse.json({
    total,
    novo: counts['novo'] ?? 0,
    em_andamento: counts['em_andamento'] ?? 0,
    concluido: counts['concluido'] ?? 0,
  })
}
