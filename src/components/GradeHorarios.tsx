import { TalkCard } from './TalkCard'
import { formatarHora } from '../lib/format'
import type { Palestra } from '../types'

export function GradeHorarios({ palestras }: { palestras: Palestra[] }) {
  const horarios = [...new Set(palestras.map((p) => p.inicio))].sort()

  return (
    <div className="flex flex-col gap-8">
      {horarios.map((horario) => {
        const sessoes = palestras.filter((p) => p.inicio === horario)
        return (
          <section key={horario}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              {formatarHora(horario)}
            </h2>
            <div className="grid min-w-[720px] grid-cols-3 gap-4">
              {sessoes.map((palestra) => (
                <TalkCard key={palestra.id} palestra={palestra} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
