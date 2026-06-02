import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'
import { FIELD_MAP } from '@/lib/fieldMap'
import { rateLimit } from '@/lib/rateLimit'
import { Prisma } from '@prisma/client'

const PAGE_SIZE = 20

const SELECT_FIELDS = {
  id: true, nome: true, responsavel: true, negocio: true,
  cidade: true, estado: true, objetivo: true, orcamento: true,
  status: true, createdAt: true,
} satisfies Prisma.ClienteSelect

export async function GET(req: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  const { searchParams } = new URL(req.url)
  const q      = searchParams.get('q')?.trim() ?? ''
  const status = searchParams.get('status') ?? ''
  const all    = searchParams.get('all') === 'true'
  const page   = Math.max(1, Number(searchParams.get('page') ?? 1))

  const where: Prisma.ClienteWhereInput = {
    ...(status && { status }),
    ...(q && {
      OR: [
        { nome:        { contains: q, mode: 'insensitive' } },
        { responsavel: { contains: q, mode: 'insensitive' } },
        { negocio:     { contains: q, mode: 'insensitive' } },
        { cidade:      { contains: q, mode: 'insensitive' } },
      ],
    }),
  }

  // Export mode — return a plain array without pagination
  if (all) {
    const clientes = await prisma.cliente.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: SELECT_FIELDS,
    })
    return NextResponse.json(clientes)
  }

  // Paginated mode
  const [clientes, total, statRows] = await Promise.all([
    prisma.cliente.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: SELECT_FIELDS,
    }),
    prisma.cliente.count({ where }),
    // Stats are always global (not affected by current search/filter)
    prisma.cliente.groupBy({ by: ['status'], _count: { _all: true } }),
  ])

  const statMap   = Object.fromEntries(statRows.map(r => [r.status, r._count._all]))
  const statsTotal = statRows.reduce((s, r) => s + r._count._all, 0)

  return NextResponse.json({
    data:  clientes,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    stats: {
      total:        statsTotal,
      novo:         statMap['novo']         ?? 0,
      em_andamento: statMap['em_andamento'] ?? 0,
      concluido:    statMap['concluido']    ?? 0,
    },
  })
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown'
  if (!rateLimit(ip, 5, 60_000)) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Aguarde 1 minuto e tente novamente.' },
      { status: 429 },
    )
  }

  const body: Record<string, string> = await req.json()

  const mapped: Record<string, string> = {}
  const extra:  Record<string, string> = {}

  for (const [fieldId, value] of Object.entries(body)) {
    const col = FIELD_MAP[fieldId]
    if (col) mapped[col] = value
    else     extra[fieldId] = value
  }

  if (!mapped.nome || !mapped.responsavel) {
    return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
  }

  // Normalize Instagram — remove leading @ before saving
  if (mapped.instagram) mapped.instagram = mapped.instagram.replace(/^@+/, '')

  const data: Prisma.ClienteCreateInput = {
    nome:               mapped.nome,
    responsavel:        mapped.responsavel,
    negocio:            mapped.negocio            ?? '',
    cidade:             mapped.cidade             ?? '',
    estado:             mapped.estado             ?? '',
    servicos:           mapped.servicos,
    publico:            mapped.publico,
    site:               mapped.site,
    urlSite:            mapped.urlSite,
    instagram:          mapped.instagram,
    whatsapp:           mapped.whatsapp,
    pixel:              mapped.pixel,
    objetivo:           mapped.objetivo,
    orcamento:          mapped.orcamento,
    historico:          mapped.historico,
    resultadoEsperado:  mapped.resultadoEsperado,
    criativos:          mapped.criativos,
    descricaoCriativos: mapped.descricaoCriativos,
    listaClientes:      mapped.listaClientes,
    oferta:             mapped.oferta,
    diferencial:        mapped.diferencial,
    comunicacao:        mapped.comunicacao,
    frequencia:         mapped.frequencia,
    observacoes:        mapped.observacoes,
    ...(Object.keys(extra).length > 0 ? { dadosExtras: extra } : {}),
  }

  const cliente = await prisma.cliente.create({ data })
  return NextResponse.json(cliente, { status: 201 })
}
