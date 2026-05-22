import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  const { passoId, label, type, obrigatorio, opcoes } = await req.json()
  if (!passoId || !label) return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })

  const count = await prisma.formularioPergunta.count({ where: { passoId: Number(passoId) } })

  const fieldId = `custom_${Date.now()}`
  const pergunta = await prisma.formularioPergunta.create({
    data: {
      passoId: Number(passoId),
      label,
      fieldId,
      type: type || 'text',
      obrigatorio: Boolean(obrigatorio),
      ordem: count + 1,
      opcoes: opcoes || [],
    },
  })
  return NextResponse.json(pergunta, { status: 201 })
}
