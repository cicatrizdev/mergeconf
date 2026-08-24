import { useCallback, useSyncExternalStore } from 'react'
import type { Palestra } from '../types'

const CHAVE = 'mergeconf:agenda'
const ouvintes = new Set<() => void>()
let cache: Palestra[] | null = null

function lerAgenda(): Palestra[] {
  if (cache === null) {
    try {
      cache = JSON.parse(localStorage.getItem(CHAVE) ?? '[]')
    } catch {
      cache = []
    }
  }
  return cache!
}

function gravarAgenda(agenda: Palestra[]) {
  cache = agenda
  localStorage.setItem(CHAVE, JSON.stringify(agenda))
  ouvintes.forEach((avisar) => avisar())
}

function assinar(avisar: () => void) {
  ouvintes.add(avisar)
  return () => ouvintes.delete(avisar)
}

export function useAgenda() {
  const agenda = useSyncExternalStore(assinar, lerAgenda)

  const adicionar = useCallback((palestra: Palestra) => {
    const atual = lerAgenda()
    if (!atual.some((p) => p.id === palestra.id)) {
      gravarAgenda([...atual, palestra])
    }
  }, [])

  const remover = useCallback((palestraId: string) => {
    gravarAgenda(lerAgenda().filter((p) => p.id !== palestraId))
  }, [])

  return { agenda, adicionar, remover }
}
