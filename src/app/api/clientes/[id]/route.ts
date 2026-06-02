import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const authError = await requireAuth()
  if (authError) return authError

  const cliente = await prisma.cliente.findUnique({ where: { id: Number(params.id) } })
  if (!cliente) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  return NextResponse.json(cliente)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const authError = await requireAuth()
  if (authError) return authError

  const { status } = await req.json()
  const cliente = await prisma.cliente.update({
    where: { id: Number(params.id) },
    data: { status },
  })
  return NextResponse.json(cliente)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const authError = await requireAuth()
  if (authError) return authError

  await prisma.cliente.delete({ where: { id: Number(params.id) } })
  return NextResponse.json({ ok: true })
}
