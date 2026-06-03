'use client'
import { useCallback, useEffect, useState } from 'react'
import { Spinner } from '@/components/Spinner'
import { BRAND } from '@/lib/constants'

interface Pergunta {
  id: number
  label: string
  fieldId: string
  type: string
  obrigatorio: boolean
  opcoes: string[]
  editing?: boolean
}

interface Passo {
  id: number
  titulo: string
  ordem: number
  perguntas: Pergunta[]
}

type PassoUI = Passo & { editingTitle: boolean }

export default function FormularioEditor() {
  const [passos, setPassos] = useState<PassoUI[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [newPassoTitle, setNewPassoTitle] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<
    { type: 'passo'; id: number } | { type: 'pergunta'; passoId: number; id: number } | null
  >(null)

  const load = useCallback(async () => {
    const data = await fetch('/api/formulario').then(r => r.json())
    setPassos(data.map((p: Passo) => ({ ...p, editingTitle: false })))
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // --- Reorder passos ---
  async function movePasso(idx: number, dir: -1 | 1) {
    const other = idx + dir
    if (other < 0 || other >= passos.length) return
    const original = passos
    const updated = [...passos]
    const a = updated[idx]
    const b = updated[other]
    ;[updated[idx], updated[other]] = [{ ...b, editingTitle: b.editingTitle }, { ...a, editingTitle: a.editingTitle }]
    updated[idx].ordem = idx + 1
    updated[other].ordem = other + 1
    setPassos(updated)
    try {
      await Promise.all([
        fetch(`/api/formulario/passos/${a.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ordem: other + 1 }) }),
        fetch(`/api/formulario/passos/${b.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ordem: idx + 1 }) }),
      ])
    } catch {
      setPassos(original) // revert on network/server error
    }
  }

  // --- Passo title ---
  async function saveTitulo(passo: PassoUI, titulo: string) {
    setSaving(`passo-${passo.id}`)
    await fetch(`/api/formulario/passos/${passo.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo }),
    })
    setPassos(prev => prev.map(p => p.id === passo.id ? { ...p, titulo, editingTitle: false } : p))
    setSaving(null)
  }

  async function submitAddPasso() {
    if (!newPassoTitle?.trim()) return
    const titulo = newPassoTitle.trim()
    setNewPassoTitle(null)
    const res = await fetch('/api/formulario/passos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo }),
    })
    const novo = await res.json()
    setPassos(prev => [...prev, { ...novo, editingTitle: false }])
  }

  async function deletePasso(id: number) {
    await fetch(`/api/formulario/passos/${id}`, { method: 'DELETE' })
    setPassos(prev => prev.filter(p => p.id !== id))
    setPendingDelete(null)
  }

  // --- Perguntas ---
  async function savePergunta(passoId: number, pId: number, data: Partial<Pergunta>) {
    setSaving(`perg-${pId}`)
    await fetch(`/api/formulario/perguntas/${pId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setPassos(prev => prev.map(p =>
      p.id === passoId
        ? { ...p, perguntas: p.perguntas.map(pg => pg.id === pId ? { ...pg, ...data, editing: false } : pg) }
        : p
    ))
    setSaving(null)
  }

  async function deletePergunta(passoId: number, pId: number) {
    await fetch(`/api/formulario/perguntas/${pId}`, { method: 'DELETE' })
    setPassos(prev => prev.map(p =>
      p.id === passoId ? { ...p, perguntas: p.perguntas.filter(pg => pg.id !== pId) } : p
    ))
    setPendingDelete(null)
  }

  async function addPergunta(passoId: number) {
    const res = await fetch('/api/formulario/perguntas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passoId, label: 'Nova pergunta', type: 'text', obrigatorio: false, opcoes: [] }),
    })
    const nova = await res.json()
    setPassos(prev => prev.map(p =>
      p.id === passoId ? { ...p, perguntas: [...p.perguntas, { ...nova, editing: true }] } : p
    ))
  }

  function toggleEdit(passoId: number, pId: number) {
    setPassos(prev => prev.map(p =>
      p.id === passoId
        ? { ...p, perguntas: p.perguntas.map(pg => pg.id === pId ? { ...pg, editing: !pg.editing } : pg) }
        : p
    ))
  }

  if (loading) return <Spinner />

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Editor do formulário</h1>
          <p className="text-sm text-gray-400 mt-0.5">Alterações refletem imediatamente no formulário público</p>
        </div>
        {newPassoTitle !== null ? (
          <div className="flex gap-2 flex-shrink-0">
            <input
              value={newPassoTitle}
              onChange={e => setNewPassoTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submitAddPasso(); if (e.key === 'Escape') setNewPassoTitle(null) }}
              placeholder="Título da etapa"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1"
              autoFocus
            />
            <button
              onClick={submitAddPasso}
              className="text-sm font-medium px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: BRAND }}
            >
              Criar
            </button>
            <button
              onClick={() => setNewPassoTitle(null)}
              className="text-sm px-3 py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setNewPassoTitle('')}
            className="text-sm font-medium px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90 flex-shrink-0"
            style={{ backgroundColor: BRAND }}
          >
            + Nova etapa
          </button>
        )}
      </div>

      <div className="flex flex-col gap-5">
        {passos.map((passo, pIdx) => (
          <div key={passo.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Passo header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/70">
              {/* Order arrows */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => movePasso(pIdx, -1)}
                  disabled={pIdx === 0}
                  className="text-gray-300 hover:text-gray-500 disabled:opacity-20 leading-none"
                  title="Mover para cima"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>
                </button>
                <button
                  onClick={() => movePasso(pIdx, 1)}
                  disabled={pIdx === passos.length - 1}
                  className="text-gray-300 hover:text-gray-500 disabled:opacity-20 leading-none"
                  title="Mover para baixo"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              </div>

              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ backgroundColor: BRAND }}
              >
                {pIdx + 1}
              </span>

              {passo.editingTitle ? (
                <TitleEditor
                  value={passo.titulo}
                  loading={saving === `passo-${passo.id}`}
                  onSave={v => saveTitulo(passo, v)}
                  onCancel={() => setPassos(prev => prev.map(p => p.id === passo.id ? { ...p, editingTitle: false } : p))}
                />
              ) : (
                <>
                  <span className="font-semibold text-gray-800 flex-1">{passo.titulo}</span>
                  <button
                    onClick={() => setPassos(prev => prev.map(p => p.id === passo.id ? { ...p, editingTitle: true } : p))}
                    className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
                  >
                    Editar
                  </button>
                  {pendingDelete?.type === 'passo' && pendingDelete.id === passo.id ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-red-500">Remover etapa?</span>
                      <button
                        onClick={() => deletePasso(passo.id)}
                        className="text-xs font-medium text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                      >
                        Sim
                      </button>
                      <button
                        onClick={() => setPendingDelete(null)}
                        className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setPendingDelete({ type: 'passo', id: passo.id })}
                      className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50"
                    >
                      Remover
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Perguntas */}
            <div className="divide-y divide-gray-50">
              {passo.perguntas.length === 0 && (
                <p className="px-4 py-4 text-sm text-gray-300 italic">Nenhuma pergunta nesta etapa.</p>
              )}
              {passo.perguntas.map(pg => (
                <div key={pg.id} className="px-4 py-3">
                  {pg.editing ? (
                    <PerguntaEditor
                      pergunta={pg}
                      loading={saving === `perg-${pg.id}`}
                      onSave={data => savePergunta(passo.id, pg.id, data)}
                      onCancel={() => toggleEdit(passo.id, pg.id)}
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 truncate">{pg.label}</p>
                        <div className="flex gap-1.5 mt-1 flex-wrap">
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            {pg.type === 'text' ? 'Texto' : pg.type === 'textarea' ? 'Texto longo' : `Seleção (${pg.opcoes.length})`}
                          </span>
                          {pg.obrigatorio && (
                            <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Obrigatório</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleEdit(passo.id, pg.id)}
                        className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100 flex-shrink-0"
                      >
                        Editar
                      </button>
                      {pendingDelete?.type === 'pergunta' && pendingDelete.id === pg.id ? (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => deletePergunta(passo.id, pg.id)}
                            className="text-xs font-medium text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                          >
                            Sim
                          </button>
                          <button
                            onClick={() => setPendingDelete(null)}
                            className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
                          >
                            Não
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setPendingDelete({ type: 'pergunta', passoId: passo.id, id: pg.id })}
                          className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 flex-shrink-0"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="px-4 py-2.5 border-t border-gray-50">
              <button
                onClick={() => addPergunta(passo.id)}
                className="text-sm text-gray-400 hover:text-gray-600 py-1 w-full text-left transition-colors hover:underline"
              >
                + Adicionar pergunta
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TitleEditor({ value, loading, onSave, onCancel }: {
  value: string; loading: boolean; onSave: (v: string) => void; onCancel: () => void
}) {
  const [v, setV] = useState(value)
  return (
    <div className="flex gap-2 flex-1">
      <input
        value={v}
        onChange={e => setV(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') onSave(v); if (e.key === 'Escape') onCancel() }}
        className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1"
        autoFocus
      />
      <button
        onClick={() => onSave(v)}
        disabled={loading}
        className="text-xs font-medium px-3 py-1 rounded-lg text-white"
        style={{ backgroundColor: BRAND }}
      >
        {loading ? '...' : 'OK'}
      </button>
      <button onClick={onCancel} className="text-xs px-2 py-1 rounded-lg border border-gray-200 text-gray-500">
        ✕
      </button>
    </div>
  )
}

function PerguntaEditor({ pergunta, loading, onSave, onCancel }: {
  pergunta: Pergunta; loading: boolean; onSave: (d: Partial<Pergunta>) => void; onCancel: () => void
}) {
  const [label, setLabel] = useState(pergunta.label)
  const [type, setType] = useState(pergunta.type)
  const [obrigatorio, setObrigatorio] = useState(pergunta.obrigatorio)
  const [opcoesText, setOpcoesText] = useState(pergunta.opcoes.join('\n'))

  function handleSave() {
    const opcoes = type === 'select' ? opcoesText.split('\n').map(o => o.trim()).filter(Boolean) : []
    onSave({ label, type, obrigatorio, opcoes })
  }

  return (
    <div className="flex flex-col gap-3 bg-gray-50 rounded-xl p-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Label da pergunta</label>
        <input
          value={label}
          onChange={e => setLabel(e.target.value)}
          onKeyDown={e => e.key === 'Escape' && onCancel()}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-white"
          autoFocus
        />
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-32">
          <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-white"
          >
            <option value="text">Texto</option>
            <option value="textarea">Texto longo</option>
            <option value="select">Seleção</option>
            <option value="info">Informativo (exibe e-mail/instrução)</option>
          </select>
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={obrigatorio}
              onChange={e => setObrigatorio(e.target.checked)}
              className="w-4 h-4 rounded accent-blue-600"
            />
            <span className="text-xs font-medium text-gray-600">Obrigatório</span>
          </label>
        </div>
      </div>

      {type === 'select' && (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Opções (uma por linha)</label>
          <textarea
            value={opcoesText}
            onChange={e => setOpcoesText(e.target.value)}
            rows={4}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none bg-white"
            placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
          />
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={loading}
          className="text-sm font-medium px-4 py-2 rounded-lg text-white disabled:opacity-60"
          style={{ backgroundColor: BRAND }}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
        <button
          onClick={onCancel}
          className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
