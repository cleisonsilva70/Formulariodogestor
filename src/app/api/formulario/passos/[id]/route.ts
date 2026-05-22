import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const passo = await prisma.formularioPasso.update({
    where: { id: Number(params.id) },
    data: {
      ...(body.titulo !== undefined && { titulo: body.titulo }),
      ...(body.ordem !== undefined && { ordem: body.ordem }),
    },
  })
  return NextResponse.json(passo)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  await prisma.formularioPasso.delete({ where: { id: Number(params.id) } })
  return NextResponse.json({ ok: true })
}
