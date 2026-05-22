import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  const { titulo } = await req.json()
  if (!titulo) return NextResponse.json({ error: 'Título obrigatório' }, { status: 400 })

  const count = await prisma.formularioPasso.count()
  const passo = await prisma.formularioPasso.create({
    data: { titulo, ordem: count + 1 },
    include: { perguntas: { orderBy: { ordem: 'asc' } } },
  })
  return NextResponse.json(passo, { status: 201 })
}
