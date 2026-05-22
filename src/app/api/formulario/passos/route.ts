import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { titulo } = await req.json()
  if (!titulo) return NextResponse.json({ error: 'Título obrigatório' }, { status: 400 })

  const maxOrdem = await prisma.formularioPasso.aggregate({ _max: { ordem: true } })
  const passo = await prisma.formularioPasso.create({
    data: { titulo, ordem: (maxOrdem._max.ordem ?? 0) + 1 },
    include: { perguntas: { orderBy: { ordem: 'asc' } } },
  })
  return NextResponse.json(passo, { status: 201 })
}
