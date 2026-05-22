'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface User {
  id: number
  nome: string
  username: string
  createdAt: string
}

export default function Usuarios() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [nome, setNome] = useState('')
  const [username, setUsername] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    const data = await fetch('/api/usuarios').then(r => r.json())
    setUsers(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const res = await fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, username, senha }),
    })
    const data = await res.json()
    setSubmitting(false)
    if (!res.ok) {
      setError(data.error || 'Erro ao criar usuário')
    } else {
      setUsers(prev => [...prev, data])
      setNome('')
      setUsername('')
      setSenha('')
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Remover este usuário?')) return
    const res = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) {
      alert(data.error || 'Erro ao remover usuário')
    } else {
      setUsers(prev => prev.filter(u => u.id !== id))
    }
  }

  const currentId = (session?.user as { id?: string })?.id

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-gray-800 mb-6">Usuários</h1>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-gray-200 rounded-full animate-spin" style={{ borderTopColor: '#185FA5' }} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Nome</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Usuário</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Criado em</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{u.nome}</td>
                  <td className="px-4 py-3 text-gray-600">{u.username}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell">
                    {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    {String(u.id) !== String(currentId) && (
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded"
                      >
                        Remover
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Criar novo usuário</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
            <input
              value={nome}
              onChange={e => setNome(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuário (login)</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-lg font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: '#185FA5' }}
          >
            {submitting ? 'Criando...' : 'Criar usuário'}
          </button>
        </form>
      </div>
    </div>
  )
}
