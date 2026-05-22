import Link from 'next/link'

export default function Sucesso() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: '#e8f1fb' }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Formulário enviado!</h1>
        <p className="text-gray-500 mb-8">
          Recebemos suas informações. Nossa equipe entrará em contato em breve.
        </p>
        <Link
          href="/"
          className="inline-block py-3 px-8 rounded-xl font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#185FA5' }}
        >
          Voltar ao início
        </Link>
      </div>
    </main>
  )
}
