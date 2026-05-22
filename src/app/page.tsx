import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { BRAND } from '@/lib/constants'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="mb-10 flex flex-col items-center gap-3">
        <Logo size="lg" />
        <p className="text-gray-500 text-sm">Gestão de tráfego pago</p>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-4">
        <Link
          href="/formulario"
          className="w-full text-center py-4 px-6 rounded-xl font-semibold text-white text-base shadow-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: BRAND }}
        >
          Preencher Formulário
        </Link>
        <Link
          href="/login"
          className="w-full text-center py-4 px-6 rounded-xl font-semibold text-base border-2 transition-colors hover:bg-blue-50"
          style={{ borderColor: BRAND, color: BRAND }}
        >
          Painel Administrativo
        </Link>
      </div>
    </main>
  )
}
