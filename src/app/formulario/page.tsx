'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

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

const BRAND = '#185FA5'

export default function Formulario() {
  const router = useRouter()
  const cardRef = useRef<HTMLDivElement>(null)
  const [passos, setPassos] = useState<Passo[]>([])
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/formulario')
      .then(r => r.json())
      .then(data => { setPassos(data); setLoading(false) })
  }, [])

  function scrollTop() {
    setTimeout(() => cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
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
    try {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (res.ok) router.push('/sucesso')
      else setSubmitting(false)
    } catch {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" style={{ borderTopColor: BRAND }} />
      </main>
    )
  }

  if (!passos.length) return null

  const passo = passos[step]
  const total = passos.length
  const progress = Math.round(((step + 1) / total) * 100)

  return (
    <main className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: BRAND }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
          </div>
          <span className="font-bold text-lg" style={{ color: BRAND }}>Scale Chat</span>
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
