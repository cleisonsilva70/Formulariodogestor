'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Spinner } from '@/components/Spinner'
import { Logo } from '@/components/Logo'
import { BRAND } from '@/lib/constants'

interface Pergunta {
  id: number
  label: string
  fieldId: string
  type: string
  obrigatorio: boolean
  opcoes: string[]
}

interface Passo {
  id: number
  titulo: string
  ordem: number
  perguntas: Pergunta[]
}

export default function Formulario() {
  const router = useRouter()
  const cardRef = useRef<HTMLDivElement>(null)
  const [passos, setPassos] = useState<Passo[]>([])
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/formulario')
      .then(r => r.json())
      .then(data => { setPassos(data); setLoading(false) })
  }, [])

  function scrollTop() {
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      )
    )
  }

  function setValue(fieldId: string, val: string) {
    setValues(prev => ({ ...prev, [fieldId]: val }))
    if (errors[fieldId]) setErrors(prev => ({ ...prev, [fieldId]: '' }))
  }

  function validateStep() {
    const passo = passos[step]
    const newErrors: Record<string, string> = {}
    passo.perguntas.forEach(p => {
      if (p.obrigatorio && !values[p.fieldId]?.trim()) {
        newErrors[p.fieldId] = 'Campo obrigatório'
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleNext() {
    if (validateStep()) { setStep(s => s + 1); scrollTop() }
  }

  function handleBack() {
    setStep(s => s - 1)
    setErrors({})
    scrollTop()
  }

  async function handleSubmit() {
    if (!validateStep()) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (res.ok) {
        router.push('/sucesso')
      } else {
        const body = await res.json().catch(() => ({}))
        setSubmitError(body.error || 'Erro ao enviar. Tente novamente.')
        setSubmitting(false)
      }
    } catch {
      setSubmitError('Falha de conexão. Verifique sua internet e tente novamente.')
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner fullPage />

  if (!passos.length) return null

  const passo = passos[step]
  const total = passos.length
  const progress = Math.round(((step + 1) / total) * 100)

  return (
    <main className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-xl mx-auto">
        {/* Logo */}
        <div className="mb-6">
          <Logo size="md" />
        </div>

        {/* Progress */}
        <div className="mb-5">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Etapa {step + 1} de {total}</span>
            <span>{progress}% concluído</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: BRAND }}
            />
          </div>
          {/* Step dots */}
          <div className="flex gap-1 mt-2 justify-center">
            {passos.map((_, i) => (
              <div
                key={i}
                className="transition-all duration-300"
                style={{
                  width: i === step ? 20 : 6,
                  height: 6,
                  borderRadius: 999,
                  backgroundColor: i <= step ? BRAND : '#e5e7eb',
                }}
              />
            ))}
          </div>
        </div>

        {/* Card */}
        <div ref={cardRef} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-5">{passo.titulo}</h2>

          <div className="flex flex-col gap-5">
            {passo.perguntas.map(pergunta => (
              <div key={pergunta.id}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {pergunta.label}
                  {pergunta.obrigatorio
                    ? <span className="text-red-400 ml-1">*</span>
                    : <span className="text-gray-300 text-xs ml-2 font-normal">opcional</span>
                  }
                </label>

                {pergunta.type === 'text' && (
                  <input
                    type="text"
                    value={values[pergunta.fieldId] || ''}
                    onChange={e => setValue(pergunta.fieldId, e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors ${
                      errors[pergunta.fieldId] ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                )}

                {pergunta.type === 'textarea' && (
                  <div>
                    <textarea
                      value={values[pergunta.fieldId] || ''}
                      onChange={e => setValue(pergunta.fieldId, e.target.value)}
                      rows={3}
                      className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors resize-none ${
                        errors[pergunta.fieldId] ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                    <p className="text-xs text-gray-300 text-right mt-0.5">
                      {(values[pergunta.fieldId] || '').length} caracteres
                    </p>
                  </div>
                )}

                {pergunta.type === 'select' && (
                  <div className="flex flex-col gap-2">
                    {pergunta.opcoes.map(opcao => {
                      const selected = values[pergunta.fieldId] === opcao
                      return (
                        <label
                          key={opcao}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            selected ? 'border-blue-400 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                          style={selected ? { borderColor: BRAND, backgroundColor: '#f0f6ff' } : {}}
                        >
                          <input
                            type="radio"
                            name={pergunta.fieldId}
                            value={opcao}
                            checked={selected}
                            onChange={() => setValue(pergunta.fieldId, opcao)}
                            className="sr-only"
                          />
                          <div
                            className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                            style={{ borderColor: selected ? BRAND : '#d1d5db' }}
                          >
                            {selected && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: BRAND }} />}
                          </div>
                          <span className={`text-sm ${selected ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>{opcao}</span>
                        </label>
                      )
                    })}
                  </div>
                )}

                {errors[pergunta.fieldId] && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                    {errors[pergunta.fieldId]}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Submit error */}
          {submitError && (
            <p className="mt-4 text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">{submitError}</p>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8 pt-5 border-t border-gray-100">
            {step > 0 && (
              <button
                onClick={handleBack}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                Voltar
              </button>
            )}
            {step < total - 1 ? (
              <button
                onClick={handleNext}
                className="flex-1 py-3 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                style={{ backgroundColor: BRAND }}
              >
                Próximo
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ backgroundColor: BRAND }}
              >
                {submitting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Enviando...</>
                ) : (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg> Enviar formulário</>
                )}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-300 mt-4">
          Scale Chat · Gestão de tráfego pago
        </p>
      </div>
    </main>
  )
}
