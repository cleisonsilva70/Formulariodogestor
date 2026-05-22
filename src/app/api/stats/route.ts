import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const [total, novo, em_andamento, concluido] = await Promise.all([
    prisma.cliente.count(),
    prisma.cliente.count({ where: { status: 'novo' } }),
    prisma.cliente.count({ where: { status: 'em_andamento' } }),
    prisma.cliente.count({ where: { status: 'concluido' } }),
  ])

  return NextResponse.json({ total, novo, em_andamento, concluido })
}
