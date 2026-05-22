import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const currentUserId = (session.user as { id?: string }).id
  if (String(currentUserId) === params.id) {
    return NextResponse.json({ error: 'Não é possível remover o próprio usuário' }, { status: 400 })
  }

  const count = await prisma.user.count()
  if (count <= 1) {
    return NextResponse.json({ error: 'Não é possível remover o único usuário do sistema' }, { status: 400 })
  }

  await prisma.user.delete({ where: { id: Number(params.id) } })
  return NextResponse.json({ ok: true })
}
