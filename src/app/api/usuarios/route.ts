import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const users = await prisma.user.findMany({
    select: { id: true, nome: true, username: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { nome, username, senha } = await req.json()
  if (!nome || !username || !senha) {
    return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
  }

  const existe = await prisma.user.findUnique({ where: { username } })
  if (existe) return NextResponse.json({ error: 'Usuário já existe' }, { status: 409 })

  const hash = await bcrypt.hash(senha, 10)
  const user = await prisma.user.create({
    data: { nome, username, senha: hash },
    select: { id: true, nome: true, username: true, createdAt: true },
  })
  return NextResponse.json(user, { status: 201 })
}
