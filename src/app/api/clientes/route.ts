import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const FIELD_MAP: Record<string, string> = {
  nome: 'nome',
  responsavel: 'responsavel',
  negocio: 'negocio',
  servicos: 'servicos',
  cidade: 'cidade',
  estado: 'estado',
  publico: 'publico',
  site: 'site',
  url_site: 'urlSite',
  instagram: 'instagram',
  whatsapp: 'whatsapp',
  pixel: 'pixel',
  objetivo: 'objetivo',
  orcamento: 'orcamento',
  historico: 'historico',
  resultado_esperado: 'resultadoEsperado',
  criativos: 'criativos',
  descricao_criativos: 'descricaoCriativos',
  lista_clientes: 'listaClientes',
  oferta: 'oferta',
  diferencial: 'diferencial',
  comunicacao: 'comunicacao',
  frequencia: 'frequencia',
  observacoes: 'observacoes',
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const clientes = await prisma.cliente.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(clientes)
}

export async function POST(req: NextRequest) {
  const body: Record<string, string> = await req.json()

  const data: Record<string, string | Record<string, string>> = {}
  const extra: Record<string, string> = {}

  for (const [fieldId, value] of Object.entries(body)) {
    const col = FIELD_MAP[fieldId]
    if (col) {
      data[col] = value
    } else {
      extra[fieldId] = value
    }
  }

  if (!data.nome || !data.responsavel) {
    return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
  }

  if (Object.keys(extra).length > 0) {
    data.dadosExtras = extra
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cliente = await prisma.cliente.create({ data: data as any })
  return NextResponse.json(cliente, { status: 201 })
}
