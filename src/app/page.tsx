import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="mb-10 flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#185FA5' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
          </div>
          <span className="text-2xl font-bold" style={{ color: '#185FA5' }}>Scale Chat</span>
        </div>
        <p className="text-gray-500 text-sm mt-1">Gestão de tráfego pago</p>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-4">
        <Link
          href="/formulario"
          className="w-full text-center py-4 px-6 rounded-xl font-semibold text-white text-base shadow-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#185FA5' }}
        >
          Preencher Formulário
        </Link>
        <Link
          href="/login"
          className="w-full text-center py-4 px-6 rounded-xl font-semibold text-base border-2 transition-colors hover:bg-blue-50"
          style={{ borderColor: '#185FA5', color: '#185FA5' }}
        >
          Painel Administrativo
        </Link>
      </div>
    </main>
  )
}
