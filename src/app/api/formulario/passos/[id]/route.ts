import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const authError = await requireAuth()
  if (authError) return authError

  const body = await req.json()
  const passo = await prisma.formularioPasso.update({
    where: { id: Number(params.id) },
    data: {
      ...(body.titulo !== undefined && { titulo: body.titulo }),
      ...(body.ordem  !== undefined && { ordem:  body.ordem  }),
    },
  })

  revalidatePath('/api/formulario')
  return NextResponse.json(passo)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const authError = await requireAuth()
  if (authError) return authError

  await prisma.formularioPasso.delete({ where: { id: Number(params.id) } })

  revalidatePath('/api/formulario')
  return NextResponse.json({ ok: true })
}
