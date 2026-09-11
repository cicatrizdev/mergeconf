import { Badge } from '@/components/ui/badge'
import type { Inscricao } from '../types'

export function BadgeStatusInscricao({ status, posicaoFila }: Pick<Inscricao, 'status' | 'posicaoFila'>) {
  if (status === 'em-espera') {
    return (
      <Badge variant="espera">{posicaoFila === undefined ? 'Em espera' : `Em espera · ${posicaoFila}º`}</Badge>
    )
  }
  return <Badge variant="confirmada">Inscrito</Badge>
}
