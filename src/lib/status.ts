export type ClienteStatus = 'novo' | 'em_andamento' | 'concluido'

export const STATUS_LABELS: Record<ClienteStatus, string> = {
  novo: 'Novo',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
}

export const STATUS_COLORS: Record<ClienteStatus, string> = {
  novo: 'bg-blue-100 text-blue-700',
  em_andamento: 'bg-yellow-100 text-yellow-700',
  concluido: 'bg-green-100 text-green-700',
}

export const STATUS_OPTIONS = Object.entries(STATUS_LABELS) as [ClienteStatus, string][]
