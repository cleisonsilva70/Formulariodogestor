'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

interface Cliente {
  id: number
  nome: string
  negocio: string
  cidade: string
  estado: string
  objetivo: string | null
  orcamento: string | null
  status: string
  createdAt: string
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
  const cols = ['ID', 'Nome', 'Negócio', 'Cidade', 'Estado', 'Objetivo', 'Orçamento', 'Status', 'Data']
  const rows = clientes.map(c => [
    c.id,
    c.nome,
    c.negocio,
    c.cidade,
    c.estado,
    c.objetivo ?? '',
    c.orcamento ?? '',
    STATUS_LABELS[c.status] ?? c.status,
    new Date(c.createdAt).toLocaleDateString('pt-BR'),
  ])
  const csv = [cols, ...rows]
    .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `clientes-scalechat-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState('')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    fetch('/api/clientes')
      .then(r => r.json())
      .then(data => { setClientes(data); setLoading(false) })
  }, [])

  async function updateStatus(id: number, status: string) {
    await fetch(`/api/clientes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setClientes(prev => prev.map(c => c.id === id ? { ...c, status } : c))
  }

  const filtered = useMemo(() => clientes.filter(c => {
    const matchStatus = !filtroStatus || c.status === filtroStatus
    const q = busca.toLowerCase()
    const matchBusca = !q || c.nome.toLowerCase().includes(q) || c.negocio.toLowerCase().includes(q) || c.cidade.toLowerCase().includes(q)
    return matchStatus && matchBusca
  }), [clientes, filtroStatus, busca])

  const stats = useMemo(() => ({
    total: clientes.length,
    novo: clientes.filter(c => c.status === 'novo').length,
    em_andamento: clientes.filter(c => c.status === 'em_andamento').length,
    concluido: clientes.filter(c => c.status === 'concluido').length,
  }), [clientes])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Clientes</h1>
        <button
          onClick={() => exportCsv(filtered)}
          disabled={filtered.length === 0}
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
        <StatCard label="Total" value={stats.total} color="bg-gray-300" />
        <StatCard label="Novos" value={stats.novo} color="bg-blue-400" />
        <StatCard label="Em andamento" value={stats.em_andamento} color="bg-yellow-400" />
        <StatCard label="Concluídos" value={stats.concluido} color="bg-green-400" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar por nome, negócio ou cidade..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1"
          />
        </div>
        <select
          value={filtroStatus}
          onChange={e => setFiltroStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
        >
          <option value="">Todos os status</option>
          <option value="novo">Novo</option>
          <option value="em_andamento">Em andamento</option>
          <option value="concluido">Concluído</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-gray-200 rounded-full animate-spin" style={{ borderTopColor: '#185FA5' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          {busca || filtroStatus ? 'Nenhum cliente encontrado com esses filtros.' : 'Nenhum cliente cadastrado ainda.'}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{c.nome}</td>
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
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 cursor-pointer focus:outline-none ${STATUS_COLORS[c.status] || 'bg-gray-100 text-gray-600'}`}
                      >
                        <option value="novo">Novo</option>
                        <option value="em_andamento">Em andamento</option>
                        <option value="concluido">Concluído</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell">
                      {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/adm/clientes/${c.id}`}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors hover:opacity-80 whitespace-nowrap"
                        style={{ backgroundColor: '#e8f1fb', color: '#185FA5' }}
                      >
                        Ver detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
            {filtered.length} de {clientes.length} cliente{clientes.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  )
}
