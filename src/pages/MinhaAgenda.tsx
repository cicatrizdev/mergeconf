import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BadgeStatusInscricao } from '../components/BadgeStatusInscricao'
import { idsEmConflito, ordenarPorInicio, totalHorasSessoes } from '../lib/agenda'
import { listarPalestras } from '../lib/api'
import { formatarHora } from '../lib/format'
import { useAgenda } from '../hooks/useAgenda'
import type { Palestra } from '../types'

export function MinhaAgenda() {
  const { agenda } = useAgenda()
  const [palestras, setPalestras] = useState<Palestra[] | null>(null)

  useEffect(() => {
    listarPalestras().then(setPalestras)
  }, [])

  if (palestras === null) {
    return <p>Carregando agenda…</p>
  }

  const porId = new Map(palestras.map((palestra) => [palestra.id, palestra]))
  const hidratados = agenda.map((item) => ({
    ...item,
    palestra: porId.get(item.palestra.id) ?? item.palestra,
  }))
  const itens = ordenarPorInicio(hidratados.map((item) => item.palestra)).map((palestra) => {
    const item = hidratados.find((candidato) => candidato.palestra.id === palestra.id)
    return { ...item!, palestra }
  })

  if (itens.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Minha Agenda</h1>
        <p className="mt-1 text-zinc-500">
          Você ainda não adicionou nenhuma palestra.{' '}
          <Link to="/" className="font-medium text-conf hover:underline">
            Explore a grade
          </Link>{' '}
          e monte seu dia.
        </p>
      </div>
    )
  }

  const conflitos = idsEmConflito(itens.map((item) => item.palestra))
  const totalHoras = totalHorasSessoes(itens.map((item) => item.palestra))

  return (
    <div>
      <h1 className="text-2xl font-bold">Minha Agenda</h1>
      <p className="mt-1 text-zinc-500">Sessões inscritas em ordem, com conflitos de horário em evidência.</p>

      <ul className="mt-6 flex flex-col gap-3">
        {itens.map(({ palestra, status }) => (
          <li key={palestra.id} className="rounded-md border border-zinc-200 bg-white p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Link to={`/palestra/${palestra.id}`} className="font-medium hover:underline">
                {palestra.titulo}
              </Link>
              <BadgeStatusInscricao status={status} />
              {conflitos.has(palestra.id) && (
                <span className="text-xs font-medium text-red-600">Conflito de horário</span>
              )}
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              {formatarHora(palestra.inicio)} · {palestra.sala}
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-sm text-zinc-600">
        {itens.length} sessões · {totalHoras.toFixed(1)}h de conteúdo
      </p>
    </div>
  )
}
