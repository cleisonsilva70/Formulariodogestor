import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { passoId, label, type, obrigatorio, opcoes } = await req.json()
  if (!passoId || !label) return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })

  const maxOrdem = await prisma.formularioPergunta.aggregate({
    where: { passoId: Number(passoId) },
    _max: { ordem: true },
  })

  const fieldId = `custom_${Date.now()}`
  const pergunta = await prisma.formularioPergunta.create({
    data: {
      passoId: Number(passoId),
      label,
      fieldId,
      type: type || 'text',
      obrigatorio: Boolean(obrigatorio),
      ordem: (maxOrdem._max.ordem ?? 0) + 1,
      opcoes: opcoes || [],
    },
  })
  return NextResponse.json(pergunta, { status: 201 })
}
