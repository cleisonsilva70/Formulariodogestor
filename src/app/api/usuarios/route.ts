import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'
import { BCRYPT_ROUNDS } from '@/lib/constants'
import bcrypt from 'bcryptjs'

export async function GET() {
  const authError = await requireAuth()
  if (authError) return authError

  const users = await prisma.user.findMany({
    select: { id: true, nome: true, username: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  const { nome, username, senha } = await req.json()
  if (!nome || !username || !senha) {
    return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
  }
  if (senha.length < 8) {
    return NextResponse.json({ error: 'A senha deve ter no mínimo 8 caracteres' }, { status: 422 })
  }

  const existe = await prisma.user.findUnique({ where: { username } })
  if (existe) return NextResponse.json({ error: 'Usuário já existe' }, { status: 409 })

  const hash = await bcrypt.hash(senha, BCRYPT_ROUNDS)
  const user = await prisma.user.create({
    data: { nome, username, senha: hash },
    select: { id: true, nome: true, username: true, createdAt: true },
  })
  return NextResponse.json(user, { status: 201 })
}
