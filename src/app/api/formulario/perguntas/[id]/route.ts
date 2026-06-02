import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const authError = await requireAuth()
  if (authError) return authError

  const body = await req.json()
  const pergunta = await prisma.formularioPergunta.update({
    where: { id: Number(params.id) },
    data: {
      ...(body.label      !== undefined && { label:       body.label      }),
      ...(body.type       !== undefined && { type:        body.type       }),
      ...(body.obrigatorio!== undefined && { obrigatorio: body.obrigatorio }),
      ...(body.opcoes     !== undefined && { opcoes:      body.opcoes     }),
    },
  })

  revalidatePath('/api/formulario')
  return NextResponse.json(pergunta)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const authError = await requireAuth()
  if (authError) return authError

  await prisma.formularioPergunta.delete({ where: { id: Number(params.id) } })

  revalidatePath('/api/formulario')
  return NextResponse.json({ ok: true })
}
