import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Formulário Scale Chat',
  description: 'Plataforma de onboarding Scale Chat',
  icons: {
    icon:     '/logo.png',
    shortcut: '/logo.png',
    apple:    '/logo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  )
}
