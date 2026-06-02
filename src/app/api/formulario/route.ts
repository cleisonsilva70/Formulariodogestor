import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MOCK_PASSOS } from '@/lib/mockPassos'

// Cache por 1 hora; revalidado on-demand após edições no admin
export const revalidate = 3600

export async function GET() {
  try {
    const passos = await prisma.formularioPasso.findMany({
      orderBy: { ordem: 'asc' },
      include: { perguntas: { orderBy: { ordem: 'asc' } } },
    })
    return NextResponse.json(passos.length > 0 ? passos : MOCK_PASSOS)
  } catch {
    // Banco indisponível — retorna dados de demonstração
    return NextResponse.json(MOCK_PASSOS)
  }
}
