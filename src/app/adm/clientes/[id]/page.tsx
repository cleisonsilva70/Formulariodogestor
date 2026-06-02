'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Spinner } from '@/components/Spinner'
import { STATUS_COLORS, STATUS_OPTIONS } from '@/lib/status'
import { FIELD_MAP } from '@/lib/fieldMap'
import { BRAND } from '@/lib/constants'

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
  const params = useParams()
  const router = useRouter()
  const id = Array.isArray(params.id) ? params.id[0] : params.id

  const [cliente,     setCliente]     = useState<Cliente | null>(null)
  const [fetchError,  setFetchError]  = useState(false)
  const [passos,      setPassos]      = useState<Passo[]>([])
  const [loading,     setLoading]     = useState(true)
  const [copied,      setCopied]      = useState(false)
  const [deleting,    setDeleting]    = useState(false)
  const [confirmDel,  setConfirmDel]  = useState(false)
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cancela o timer ao desmontar para evitar stale state update
  useEffect(() => () => { if (copiedTimer.current) clearTimeout(copiedTimer.current) }, [])

  useEffect(() => {
    Promise.all([
      fetch(`/api/clientes/${id}`).then(r => r.json()),
      fetch('/api/formulario').then(r => r.json()),
    ])
      .then(([c, p]) => {
        if ('error' in c) {
          setFetchError(true)
        } else {
          setCliente(c)
          setPassos(p)
        }
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false))
  }, [id])

  async function updateStatus(status: string) {
    const previous = cliente
    setCliente(prev => prev ? { ...prev, status } : prev)
    const res = await fetch(`/api/clientes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) setCliente(previous)
  }

  async function copyWhatsApp() {
    if (!cliente?.whatsapp) return
    try {
      await navigator.clipboard.writeText(cliente.whatsapp)
      if (copiedTimer.current) clearTimeout(copiedTimer.current)
      setCopied(true)
      copiedTimer.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available (HTTP / permission denied) — silently ignore
    }
  }

  async function deleteCliente() {
    setDeleting(true)
    await fetch(`/api/clientes/${id}`, { method: 'DELETE' })
    router.push('/adm/clientes')
  }

  function whatsAppUrl(number: string) {
    const digits = number.replace(/\D/g, '')
    // Adiciona DDI 55 se não tiver
    const full = digits.startsWith('55') ? digits : `55${digits}`
    return `https://wa.me/${full}`
  }

  if (loading) return <Spinner />

  if (fetchError || !cliente) {
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
              <div className="flex items-center gap-1.5">
                <button
                  onClick={copyWhatsApp}
                  title="Copiar número"
                  className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border border-green-200 text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  {copied ? 'Copiado!' : cliente.whatsapp}
                </button>
                <a
                  href={whatsAppUrl(cliente.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Abrir no WhatsApp"
                  className="flex items-center justify-center w-8 h-8 rounded-lg border border-green-200 text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </a>
              </div>
            )}
            <div className="flex items-center gap-2">
              <select
                value={cliente.status}
                onChange={e => updateStatus(e.target.value)}
                className={`text-xs font-semibold px-3 py-2 rounded-lg border-0 cursor-pointer focus:outline-none ${STATUS_COLORS[cliente.status as keyof typeof STATUS_COLORS] || 'bg-gray-100'}`}
              >
                {STATUS_OPTIONS.map(([v, l]) => (
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
              <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: '#e8f1fb', color: BRAND }}>
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
            const k = FIELD_MAP[pg.fieldId] as keyof Cliente | undefined
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
                  const k = FIELD_MAP[pergunta.fieldId] as keyof Cliente | undefined
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

      {/* Zona de perigo */}
      <div className="mt-4 bg-white rounded-2xl border border-red-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-red-500 mb-3">Zona de perigo</h2>
        {confirmDel ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-gray-600">Tem certeza? Esta ação <strong>não pode ser desfeita</strong>.</p>
            <button
              onClick={deleteCliente}
              disabled={deleting}
              className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-60 transition-colors"
            >
              {deleting ? 'Excluindo...' : 'Sim, excluir permanentemente'}
            </button>
            <button
              onClick={() => setConfirmDel(false)}
              disabled={deleting}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 font-medium">Excluir este cliente</p>
              <p className="text-xs text-gray-400 mt-0.5">Remove permanentemente todos os dados deste cliente do sistema.</p>
            </div>
            <button
              onClick={() => setConfirmDel(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors flex-shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
              Excluir cliente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
