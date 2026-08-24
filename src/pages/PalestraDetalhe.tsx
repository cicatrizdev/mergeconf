import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Clock, MapPin, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { FormInscricao } from '../components/FormInscricao'
import { buscarPalestra } from '../lib/api'
import { formatarDuracao, formatarHora } from '../lib/format'
import type { Palestra } from '../types'

export function PalestraDetalhe() {
  const { id } = useParams<{ id: string }>()
  const [palestra, setPalestra] = useState<Palestra | null>(null)

  useEffect(() => {
    if (id) buscarPalestra(id).then(setPalestra)
  }, [id])

  if (!palestra) return null

  const vagasRestantes = palestra.vagas - palestra.inscritos

  return (
    <article className="max-w-2xl">
      <div className="flex items-center gap-2">
        <Badge variant={palestra.trilha}>{palestra.trilha}</Badge>
        {palestra.tipo !== 'talk' && <Badge variant="neutro">{palestra.tipo}</Badge>}
      </div>

      <h1 className="mt-3 text-3xl font-bold leading-tight">{palestra.titulo}</h1>
      <p className="mt-2 text-lg text-zinc-500">com {palestra.palestrante}</p>

      <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-zinc-600">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-4" aria-hidden />
          {palestra.remanejadaDe && (
            <span className="text-zinc-400">{formatarHora(palestra.remanejadaDe)}</span>
          )}
          {formatarHora(palestra.inicio)} · {formatarDuracao(palestra.inicio, palestra.fim)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="size-4" aria-hidden />
          {palestra.sala}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users className="size-4" aria-hidden />
          {vagasRestantes} de {palestra.vagas} vagas
        </span>
      </div>

      <p className="mt-6 leading-relaxed text-zinc-700">{palestra.descricao}</p>

      <section className="mt-8 border-t border-zinc-200 pt-6">
        <h2 className="mb-4 font-semibold">Garanta sua vaga</h2>
        <FormInscricao palestra={palestra} />
      </section>
    </article>
  )
}
