import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const cliente = await prisma.cliente.findUnique({ where: { id: Number(params.id) } })
  if (!cliente) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  return NextResponse.json(cliente)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { status } = await req.json()
  const cliente = await prisma.cliente.update({
    where: { id: Number(params.id) },
    data: { status },
  })
  return NextResponse.json(cliente)
}
