'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Spinner } from '@/components/Spinner'
import { STATUS_COLORS, STATUS_LABELS, STATUS_OPTIONS } from '@/lib/status'
import { BRAND } from '@/lib/constants'

const PAGE_SIZE = 20

interface Cliente {
  id: number
  nome: string
  responsavel: string
  negocio: string
  cidade: string
  estado: string
  objetivo: string | null
  orcamento: string | null
  status: string
  createdAt: string
}

interface StatsData {
  total: number
  novo: number
  em_andamento: number
  concluido: number
  [key: string]: number
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
      <div className={`w-2.5 h-10 rounded-full ${color}`} />
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  )
}

function exportCsv(clientes: Cliente[]) {
  const cols = ['ID', 'Nome', 'Responsável', 'Negócio', 'Cidade', 'Estado', 'Objetivo', 'Orçamento', 'Status', 'Data']
  const rows = clientes.map(c => [
    c.id, c.nome, c.responsavel, c.negocio, c.cidade, c.estado,
    c.objetivo ?? '',
    c.orcamento ?? '',
    STATUS_LABELS[c.status as keyof typeof STATUS_LABELS] ?? c.status,
    new Date(c.createdAt).toLocaleDateString('pt-BR'),
  ])
  const csv = [cols, ...rows]
    .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  document.body.appendChild(a)
  a.href     = url
  a.download = `clientes-scalechat-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function Clientes() {
  const [clientes,     setClientes]     = useState<Cliente[]>([])
  const [stats,        setStats]        = useState<StatsData>({ total: 0, novo: 0, em_andamento: 0, concluido: 0 })
  const [total,        setTotal]        = useState(0)
  const [pages,        setPages]        = useState(1)
  const [page,         setPage]         = useState(1)
  const [q,            setQ]            = useState('')
  const [debouncedQ,   setDebouncedQ]   = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [loading,      setLoading]      = useState(true)
  const [fetching,     setFetching]     = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300)
    return () => clearTimeout(t)
  }, [q])

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1) }, [debouncedQ, filtroStatus])

  // Derive API URL from current state
  const apiUrl = useMemo(() => {
    const p = new URLSearchParams({ page: String(page) })
    if (debouncedQ)   p.set('q',      debouncedQ)
    if (filtroStatus) p.set('status', filtroStatus)
    return `/api/clientes?${p}`
  }, [page, debouncedQ, filtroStatus])

  // Fetch whenever URL changes; cancels in-flight requests on next change
  useEffect(() => {
    let cancelled = false
    setFetching(true)
    fetch(apiUrl)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return
        setClientes(data.data)
        setTotal(data.total)
        setPages(data.pages)
        setStats(data.stats)
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) { setFetching(false); setLoading(false) } })
    return () => { cancelled = true }
  }, [apiUrl])

  async function updateStatus(id: number, newStatus: string) {
    const prevClientes = clientes
    const prevStats    = stats
    const oldStatus    = clientes.find(c => c.id === id)?.status

    // Optimistic update — clientes row + stat cards
    setClientes(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
    if (oldStatus && oldStatus !== newStatus) {
      setStats(prev => ({
        ...prev,
        [oldStatus]:  Math.max(0, (prev as Record<string, number>)[oldStatus]  - 1),
        [newStatus]:            ((prev as Record<string, number>)[newStatus] ?? 0) + 1,
      }))
    }

    const res = await fetch(`/api/clientes/${id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status: newStatus }),
    })
    if (!res.ok) { setClientes(prevClientes); setStats(prevStats) }
  }

  async function deleteCliente(id: number) {
    await fetch(`/api/clientes/${id}`, { method: 'DELETE' })
    setClientes(prev => prev.filter(c => c.id !== id))
    setTotal(prev => prev - 1)
    setStats(prev => {
      const status = clientes.find(c => c.id === id)?.status ?? ''
      return { ...prev, total: prev.total - 1, [status]: Math.max(0, prev[status] - 1) }
    })
    setPendingDeleteId(null)
  }

  async function handleExportCsv() {
    const p = new URLSearchParams({ all: 'true' })
    if (debouncedQ)   p.set('q',      debouncedQ)
    if (filtroStatus) p.set('status', filtroStatus)
    const data: Cliente[] = await fetch(`/api/clientes?${p}`).then(r => r.json())
    exportCsv(data)
  }

  const start = (page - 1) * PAGE_SIZE + 1
  const end   = Math.min(page * PAGE_SIZE, total)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Clientes</h1>
        <button
          onClick={handleExportCsv}
          disabled={total === 0}
          className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Exportar CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total"        value={stats.total}        color="bg-gray-300"  />
        <StatCard label="Novos"        value={stats.novo}         color="bg-blue-400"  />
        <StatCard label="Em andamento" value={stats.em_andamento} color="bg-yellow-400"/>
        <StatCard label="Concluídos"   value={stats.concluido}    color="bg-green-400" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar por nome, responsável, negócio ou cidade..."
            value={q}
            onChange={e => setQ(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1"
          />
        </div>
        <select
          value={filtroStatus}
          onChange={e => setFiltroStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
        >
          <option value="">Todos os status</option>
          {STATUS_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : total === 0 ? (
        <div className="text-center py-16 text-gray-400">
          {q || filtroStatus ? 'Nenhum cliente encontrado com esses filtros.' : 'Nenhum cliente cadastrado ainda.'}
        </div>
      ) : (
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-opacity duration-150 ${fetching ? 'opacity-60 pointer-events-none' : ''}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Nome</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden md:table-cell">Negócio</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden lg:table-cell">Cidade</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden lg:table-cell">Objetivo</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden md:table-cell">Orçamento</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden sm:table-cell">Data</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {clientes.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{c.nome}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{c.responsavel}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{c.negocio}</td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{c.cidade}/{c.estado}</td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{c.objetivo || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                      {c.orcamento ? `R$ ${c.orcamento}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={c.status}
                        onChange={e => updateStatus(c.id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 cursor-pointer focus:outline-none ${STATUS_COLORS[c.status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-600'}`}
                      >
                        {STATUS_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell">
                      {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/adm/clientes/${c.id}`}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors hover:opacity-80 whitespace-nowrap"
                          style={{ backgroundColor: '#e8f1fb', color: BRAND }}
                        >
                          Ver detalhes
                        </Link>
                        {pendingDeleteId === c.id ? (
                          <>
                            <button
                              onClick={() => deleteCliente(c.id)}
                              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors whitespace-nowrap"
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => setPendingDeleteId(null)}
                              className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setPendingDeleteId(c.id)}
                            title="Excluir cliente"
                            className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                              <path d="M10 11v6M14 11v6"/>
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer: count + pagination */}
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-4">
            <span className="text-xs text-gray-400">
              {total === 0 ? '0 resultados' : `${start}–${end} de ${total} cliente${total !== 1 ? 's' : ''}`}
            </span>

            {pages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-default transition-colors"
                >
                  ←
                </button>
                <span className="px-3 py-1.5 text-xs text-gray-500 min-w-[64px] text-center">
                  {page} / {pages}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page === pages}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-default transition-colors"
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
