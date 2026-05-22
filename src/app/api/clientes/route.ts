import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'
import { FIELD_MAP } from '@/lib/fieldMap'
import { Prisma } from '@prisma/client'

export async function GET() {
  const authError = await requireAuth()
  if (authError) return authError

  const clientes = await prisma.cliente.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      nome: true,
      negocio: true,
      cidade: true,
      estado: true,
      objetivo: true,
      orcamento: true,
      status: true,
      createdAt: true,
    },
  })
  return NextResponse.json(clientes)
}

export async function POST(req: NextRequest) {
  const body: Record<string, string> = await req.json()

  const mapped: Record<string, string> = {}
  const extra: Record<string, string> = {}

  for (const [fieldId, value] of Object.entries(body)) {
    const col = FIELD_MAP[fieldId]
    if (col) {
      mapped[col] = value
    } else {
      extra[fieldId] = value
    }
  }

  if (!mapped.nome || !mapped.responsavel) {
    return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
  }

  const data: Prisma.ClienteCreateInput = {
    nome: mapped.nome,
    responsavel: mapped.responsavel,
    negocio: mapped.negocio ?? '',
    cidade: mapped.cidade ?? '',
    estado: mapped.estado ?? '',
    servicos: mapped.servicos,
    publico: mapped.publico,
    site: mapped.site,
    urlSite: mapped.urlSite,
    instagram: mapped.instagram,
    whatsapp: mapped.whatsapp,
    pixel: mapped.pixel,
    objetivo: mapped.objetivo,
    orcamento: mapped.orcamento,
    historico: mapped.historico,
    resultadoEsperado: mapped.resultadoEsperado,
    criativos: mapped.criativos,
    descricaoCriativos: mapped.descricaoCriativos,
    listaClientes: mapped.listaClientes,
    oferta: mapped.oferta,
    diferencial: mapped.diferencial,
    comunicacao: mapped.comunicacao,
    frequencia: mapped.frequencia,
    observacoes: mapped.observacoes,
    ...(Object.keys(extra).length > 0 ? { dadosExtras: extra } : {}),
  }

  const cliente = await prisma.cliente.create({ data })
  return NextResponse.json(cliente, { status: 201 })
}
