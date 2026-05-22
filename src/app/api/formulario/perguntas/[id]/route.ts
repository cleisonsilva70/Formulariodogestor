import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const pergunta = await prisma.formularioPergunta.update({
    where: { id: Number(params.id) },
    data: {
      ...(body.label !== undefined && { label: body.label }),
      ...(body.type !== undefined && { type: body.type }),
      ...(body.obrigatorio !== undefined && { obrigatorio: body.obrigatorio }),
      ...(body.opcoes !== undefined && { opcoes: body.opcoes }),
    },
  })
  return NextResponse.json(pergunta)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  await prisma.formularioPergunta.delete({ where: { id: Number(params.id) } })
  return NextResponse.json({ ok: true })
}
