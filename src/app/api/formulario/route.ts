import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const MOCK_PASSOS = [
  { id: 1, titulo: 'Sobre o negócio', ordem: 1, perguntas: [
    { id: 1, label: 'Nome do cliente / empresa', fieldId: 'nome', type: 'text', obrigatorio: true, ordem: 1, opcoes: [] },
    { id: 2, label: 'Nome do responsável', fieldId: 'responsavel', type: 'text', obrigatorio: true, ordem: 2, opcoes: [] },
    { id: 3, label: 'Tipo de negócio', fieldId: 'negocio', type: 'text', obrigatorio: true, ordem: 3, opcoes: [] },
    { id: 4, label: 'Principais produtos ou serviços', fieldId: 'servicos', type: 'textarea', obrigatorio: true, ordem: 4, opcoes: [] },
    { id: 5, label: 'Cidade', fieldId: 'cidade', type: 'text', obrigatorio: true, ordem: 5, opcoes: [] },
    { id: 6, label: 'Estado', fieldId: 'estado', type: 'text', obrigatorio: true, ordem: 6, opcoes: [] },
    { id: 7, label: 'Público-alvo', fieldId: 'publico', type: 'textarea', obrigatorio: false, ordem: 7, opcoes: [] },
  ]},
  { id: 2, titulo: 'Sobre o digital', ordem: 2, perguntas: [
    { id: 8, label: 'Tem site?', fieldId: 'site', type: 'select', obrigatorio: true, ordem: 1, opcoes: ['Sim', 'Não', 'Em desenvolvimento'] },
    { id: 9, label: 'URL do site', fieldId: 'url_site', type: 'text', obrigatorio: false, ordem: 2, opcoes: [] },
    { id: 10, label: '@ do Instagram', fieldId: 'instagram', type: 'text', obrigatorio: false, ordem: 3, opcoes: [] },
    { id: 11, label: 'WhatsApp comercial', fieldId: 'whatsapp', type: 'text', obrigatorio: false, ordem: 4, opcoes: [] },
    { id: 12, label: 'Tem pixel do Meta instalado?', fieldId: 'pixel', type: 'select', obrigatorio: true, ordem: 5, opcoes: ['Sim', 'Não', 'Não sei'] },
  ]},
  { id: 3, titulo: 'Sobre as campanhas', ordem: 3, perguntas: [
    { id: 13, label: 'Objetivo principal', fieldId: 'objetivo', type: 'select', obrigatorio: true, ordem: 1, opcoes: ['WhatsApp', 'Lead', 'Vendas no site', 'Ligação', 'Visita à loja', 'Outro'] },
    { id: 14, label: 'Orçamento mensal em R$', fieldId: 'orcamento', type: 'text', obrigatorio: true, ordem: 2, opcoes: [] },
    { id: 15, label: 'Já anunciou no Meta antes?', fieldId: 'historico', type: 'select', obrigatorio: true, ordem: 3, opcoes: ['Sim', 'Não'] },
    { id: 16, label: 'Resultado esperado nas primeiras semanas', fieldId: 'resultado_esperado', type: 'textarea', obrigatorio: false, ordem: 4, opcoes: [] },
  ]},
  { id: 4, titulo: 'Criativos e materiais', ordem: 4, perguntas: [
    { id: 17, label: 'Tem criativos disponíveis?', fieldId: 'criativos', type: 'select', obrigatorio: true, ordem: 1, opcoes: ['Sim fotos e vídeos', 'Só fotos', 'Só vídeos', 'Não tenho ainda'] },
    { id: 18, label: 'Descrição dos criativos', fieldId: 'descricao_criativos', type: 'textarea', obrigatorio: false, ordem: 2, opcoes: [] },
    { id: 19, label: 'Tem lista de clientes para remarketing?', fieldId: 'lista_clientes', type: 'select', obrigatorio: true, ordem: 3, opcoes: ['Sim', 'Não'] },
    { id: 20, label: 'Oferta ou promoção ativa', fieldId: 'oferta', type: 'textarea', obrigatorio: false, ordem: 4, opcoes: [] },
    { id: 21, label: 'Principal diferencial do negócio', fieldId: 'diferencial', type: 'textarea', obrigatorio: false, ordem: 5, opcoes: [] },
  ]},
  { id: 5, titulo: 'Expectativas', ordem: 5, perguntas: [
    { id: 22, label: 'Como prefere se comunicar?', fieldId: 'comunicacao', type: 'select', obrigatorio: true, ordem: 1, opcoes: ['WhatsApp', 'E-mail', 'Grupo no WhatsApp'] },
    { id: 23, label: 'Frequência dos relatórios', fieldId: 'frequencia', type: 'select', obrigatorio: true, ordem: 2, opcoes: ['Semanal', 'Quinzenal', 'Mensal'] },
    { id: 24, label: 'Observações adicionais', fieldId: 'observacoes', type: 'textarea', obrigatorio: false, ordem: 3, opcoes: [] },
  ]},
]

export async function GET() {
  try {
    const passos = await prisma.formularioPasso.findMany({
      orderBy: { ordem: 'asc' },
      include: { perguntas: { orderBy: { ordem: 'asc' } } },
    })
    // Se banco conectou mas está vazio, retorna mock
    return NextResponse.json(passos.length > 0 ? passos : MOCK_PASSOS)
  } catch {
    // Banco indisponível — retorna dados de demonstração
    return NextResponse.json(MOCK_PASSOS)
  }
}
