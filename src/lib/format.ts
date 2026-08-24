const FUSO = 'America/Sao_Paulo'

export function formatarHora(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: FUSO,
  })
    .format(new Date(iso))
    .replace(':', 'h')
}

export function formatarData(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    timeZone: FUSO,
  }).format(new Date(iso))
}

export function duracaoEmMinutos(inicio: string, fim: string): number {
  return Math.round((new Date(fim).getTime() - new Date(inicio).getTime()) / 60000)
}

export function formatarDuracao(inicio: string, fim: string): string {
  const minutos = duracaoEmMinutos(inicio, fim)
  if (minutos < 60) return `${minutos} min`
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  return resto === 0 ? `${horas}h` : `${horas}h${String(resto).padStart(2, '0')}`
}
