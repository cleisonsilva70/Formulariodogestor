import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const authError = await requireAuth()
  if (authError) return authError

  const session = await getServerSession(authOptions)
  if (String(session!.user.id) === params.id) {
    return NextResponse.json({ error: 'Não é possível remover o próprio usuário' }, { status: 400 })
  }

  const othersExist = await prisma.user.count({ where: { id: { not: Number(params.id) } } })
  if (othersExist === 0) {
    return NextResponse.json({ error: 'Não é possível remover o único usuário do sistema' }, { status: 400 })
  }

  await prisma.user.delete({ where: { id: Number(params.id) } })
  return NextResponse.json({ ok: true })
}
