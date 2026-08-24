import { useEffect, useState } from 'react'
import { GradeHorarios } from '../components/GradeHorarios'
import { listarPalestras } from '../lib/api'
import type { Palestra } from '../types'

export function Grade() {
  const [palestras, setPalestras] = useState<Palestra[]>([])

  useEffect(() => {
    listarPalestras().then(setPalestras)
  }, [])

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Grade — 24 de outubro</h1>
        <p className="mt-1 text-zinc-500">
          Auditório Legacy · Sala Stack Overflow · Sala Rubber Duck
        </p>
      </header>
      <GradeHorarios palestras={palestras} />
    </div>
  )
}
