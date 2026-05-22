'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Pergunta {
  id: number
  label: string
  fieldId: string
}

interface Passo {
  id: number
  titulo: string
  perguntas: Pergunta[]
}

interface Cliente {
  id: number
  nome: string
  responsavel: string
  negocio: string
  servicos: string | null
  cidade: string
  estado: string
  publico: string | null
  site: string | null
  urlSite: string | null
  instagram: string | null
  whatsapp: string | null
  pixel: string | null
  objetivo: string | null
  orcamento: string | null
  historico: string | null
  resultadoEsperado: string | null
  criativos: string | null
  descricaoCriativos: string | null
  listaClientes: string | null
  oferta: string | null
  diferencial: string | null
  comunicacao: string | null
  frequencia: string | null
  observacoes: string | null
  dadosExtras: Record<string, string> | null
  status: string
  createdAt: string
}

const FIELD_MAP: Record<string, keyof Cliente> = {
  nome: 'nome', responsavel: 'responsavel', negocio: 'negocio',
  servicos: 'servicos', cidade: 'cidade', estado: 'estado', publico: 'publico',
  site: 'site', url_site: 'urlSite', instagram: 'instagram', whatsapp: 'whatsapp',
  pixel: 'pixel', objetivo: 'objetivo', orcamento: 'orcamento', historico: 'historico',
  resultado_esperado: 'resultadoEsperado', criativos: 'criativos',
  descricao_criativos: 'descricaoCriativos', lista_clientes: 'listaClientes',
  oferta: 'oferta', diferencial: 'diferencial', comunicacao: 'comunicacao',
  frequencia: 'frequencia', observacoes: 'observacoes',
}

const STATUS_COLORS: Record<string, string> = {
  novo: 'bg-blue-100 text-blue-700',
  em_andamento: 'bg-yellow-100 text-yellow-700',
  concluido: 'bg-green-100 text-green-700',
}

const STATUS_LABELS: Record<string, string> = {
  novo: 'Novo',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
}

function FieldValue({ label, value, highlight }: { label: string; value?: string | null; highlight?: boolean }) {
  if (!value) return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-300 italic">—</p>
    </div>
  )
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className={`text-sm font-medium ${highlight ? 'text-blue-700' : 'text-gray-800'} whitespace-pre-wrap`}>{value}</p>
    </div>
  )
}

export default function ClienteDetalhes() {
  const { id } = useParams()
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [passos, setPassos] = useState<Passo[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/clientes/${id}`).then(r => r.json()),
      fetch('/api/formulario').then(r => r.json()),
    ]).then(([c, p]) => {
      setCliente(c)
      setPassos(p)
      setLoading(false)
    })
  }, [id])

  async function updateStatus(status: string) {
    await fetch(`/api/clientes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setCliente(prev => prev ? { ...prev, status } : prev)
  }

  function copyWhatsApp() {
    if (!cliente?.whatsapp) return
    navigator.clipboard.writeText(cliente.whatsapp)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-gray-200 rounded-full animate-spin" style={{ borderTopColor: '#185FA5' }} />
      </div>
    )
  }

  if (!cliente || (cliente as unknown as { error: string }).error) {
    return <div className="text-gray-400 text-center py-16">Cliente não encontrado.</div>
  }

  return (
    <div className="max-w-3xl">
      {/* Breadcrumb */}
      <Link href="/adm/clientes" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        Clientes
      </Link>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{cliente.nome}</h1>
            <p className="text-gray-500 text-sm mt-1">{cliente.negocio} · {cliente.cidade}/{cliente.estado}</p>
            {cliente.responsavel && (
              <p className="text-gray-400 text-xs mt-0.5">Responsável: {cliente.responsavel}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0">
            {cliente.whatsapp && (
              <button
                onClick={copyWhatsApp}
                className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border border-green-200 text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {copied ? 'Copiado!' : cliente.whatsapp}
              </button>
            )}
            <div className="flex items-center gap-2">
              <select
                value={cliente.status}
                onChange={e => updateStatus(e.target.value)}
                className={`text-xs font-semibold px-3 py-2 rounded-lg border-0 cursor-pointer focus:outline-none ${STATUS_COLORS[cliente.status] || 'bg-gray-100'}`}
              >
                {Object.entries(STATUS_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <span className="text-xs text-gray-400">
              {new Date(cliente.createdAt).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>

        {/* Quick highlights */}
        {(cliente.objetivo || cliente.orcamento) && (
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
            {cliente.objetivo && (
              <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: '#e8f1fb', color: '#185FA5' }}>
                🎯 {cliente.objetivo}
              </span>
            )}
            {cliente.orcamento && (
              <span className="text-xs px-3 py-1 rounded-full font-medium bg-gray-100 text-gray-600">
                💰 R$ {cliente.orcamento}/mês
              </span>
            )}
            {cliente.comunicacao && (
              <span className="text-xs px-3 py-1 rounded-full font-medium bg-gray-100 text-gray-600">
                💬 {cliente.comunicacao}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Detail sections from form */}
      <div className="flex flex-col gap-4">
        {passos.map(passo => {
          const hasData = passo.perguntas.some(pg => {
            const k = FIELD_MAP[pg.fieldId]
            const v = k ? cliente[k] : cliente.dadosExtras?.[pg.fieldId]
            return v
          })
          return (
            <div key={passo.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-gray-700 text-sm mb-4 pb-3 border-b border-gray-100 flex items-center gap-2">
                {passo.titulo}
                {!hasData && <span className="text-xs font-normal text-gray-300">(sem dados)</span>}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {passo.perguntas.map(pergunta => {
                  const k = FIELD_MAP[pergunta.fieldId]
                  const value = (k ? cliente[k] : cliente.dadosExtras?.[pergunta.fieldId]) as string | null | undefined
                  return (
                    <FieldValue
                      key={pergunta.fieldId}
                      label={pergunta.label}
                      value={value}
                      highlight={pergunta.fieldId === 'objetivo'}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
