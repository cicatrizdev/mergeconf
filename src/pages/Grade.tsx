import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { GradeHorarios } from '../components/GradeHorarios'
import { Button } from '@/components/ui/button'
import { listarPalestras } from '../lib/api'
import type { Palestra, Trilha } from '../types'

const TRILHAS: Trilha[] = ['frontend', 'backend', 'ia', 'carreira']

function ehTrilha(valor: string | null): valor is Trilha {
  return TRILHAS.some((trilha) => trilha === valor)
}

export function Grade() {
  const [palestras, setPalestras] = useState<Palestra[]>([])
  const [searchParams, setSearchParams] = useSearchParams()
  const paramTrilha = searchParams.get('trilha')
  const trilha = ehTrilha(paramTrilha) ? paramTrilha : null

  useEffect(() => {
    listarPalestras().then(setPalestras)
  }, [])

  function selecionarTrilha(proxima: Trilha | null) {
    setSearchParams(
      (atual) => {
        const proximo = new URLSearchParams(atual)
        if (proxima === null) {
          proximo.delete('trilha')
        } else {
          proximo.set('trilha', proxima)
        }
        return proximo
      },
      { replace: true },
    )
  }

  const palestrasFiltradas = trilha
    ? palestras.filter((palestra) => palestra.trilha === trilha)
    : palestras

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Grade — 24 de outubro</h1>
        <p className="mt-1 text-zinc-500">
          Auditório Legacy · Sala Stack Overflow · Sala Rubber Duck
        </p>
        <div
          role="radiogroup"
          aria-label="Filtrar por trilha"
          className="mt-4 flex flex-wrap gap-2"
        >
          <Button
            type="button"
            role="radio"
            aria-checked={trilha === null}
            aria-pressed={trilha === null}
            variant={trilha === null ? 'default' : 'outline'}
            onClick={() => selecionarTrilha(null)}
          >
            Todas
          </Button>
          {TRILHAS.map((item) => (
            <Button
              key={item}
              type="button"
              role="radio"
              aria-checked={item === trilha}
              aria-pressed={item === trilha}
              variant={item === trilha ? 'default' : 'outline'}
              onClick={() => selecionarTrilha(item)}
            >
              {item}
            </Button>
          ))}
        </div>
      </header>
      <GradeHorarios palestras={palestrasFiltradas} />
    </div>
  )
}
