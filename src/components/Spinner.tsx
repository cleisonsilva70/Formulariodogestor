import { BRAND } from '@/lib/constants'

export function Spinner({ fullPage = false }: { fullPage?: boolean }) {
  const spinner = (
    <div
      className="w-8 h-8 border-4 border-gray-200 rounded-full animate-spin"
      style={{ borderTopColor: BRAND }}
    />
  )

  if (fullPage) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        {spinner}
      </main>
    )
  }

  return (
    <div className="flex justify-center py-16">
      {spinner}
    </div>
  )
}
