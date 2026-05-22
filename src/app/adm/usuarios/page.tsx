'use client'
import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Spinner } from '@/components/Spinner'
import { BRAND } from '@/lib/constants'

interface User {
  id: number
  nome: string
  username: string
  createdAt: string
}

type FormState = { nome: string; username: string; senha: string }
const EMPTY_FORM: FormState = { nome: '', username: '', senha: '' }

export default function Usuarios() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const load = useCallback(async () => {
    const data = await fetch('/api/usuarios').then(r => r.json())
    setUsers(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function setField(k: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const res = await fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSubmitting(false)
    if (!res.ok) {
      setError(data.error || 'Erro ao criar usuário')
    } else {
      setUsers(prev => [...prev, data])
      setForm(EMPTY_FORM)
    }
  }

  async function handleDelete(id: number) {
    setDeleteError('')
    const res = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) {
      setDeleteError(data.error || 'Erro ao remover usuário')
    } else {
      setUsers(prev => prev.filter(u => u.id !== id))
    }
  }

  const currentId = session?.user?.id

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-gray-800 mb-6">Usuários</h1>

      {loading ? (
        <Spinner />
      ) : (
        <>
          {deleteError && (
            <p className="mb-4 text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">{deleteError}</p>
          )}
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
        </>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Criar novo usuário</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
            <input
              value={form.nome}
              onChange={setField('nome')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuário (login)</label>
            <input
              value={form.username}
              onChange={setField('username')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha <span className="text-gray-400 font-normal">(mín. 8 caracteres)</span></label>
            <input
              type="password"
              value={form.senha}
              onChange={setField('senha')}
              minLength={8}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-lg font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: BRAND }}
          >
            {submitting ? 'Criando...' : 'Criar usuário'}
          </button>
        </form>
      </div>
    </div>
  )
}
