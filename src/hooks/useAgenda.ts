import { useCallback, useSyncExternalStore } from 'react'
import type { Inscricao, Palestra, StatusInscricao } from '../types'

export type ItemAgenda = {
  palestra: Palestra
  inscricaoId?: string
  status: StatusInscricao
}

const CHAVE = 'mergeconf:agenda'
const ouvintes = new Set<() => void>()
let cache: ItemAgenda[] | null = null

function normalizarItem(item: ItemAgenda | Palestra): ItemAgenda {
  if ('palestra' in item) return item
  return { palestra: item, status: 'confirmada' }
}

function lerAgenda(): ItemAgenda[] {
  if (cache === null) {
    try {
      const bruto = JSON.parse(localStorage.getItem(CHAVE) ?? '[]') as Array<ItemAgenda | Palestra>
      cache = bruto.map(normalizarItem)
    } catch {
      cache = []
    }
  }
  return cache
}

function gravarAgenda(agenda: ItemAgenda[]) {
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

  const adicionar = useCallback((palestra: Palestra, inscricao?: Pick<Inscricao, 'id' | 'status'>) => {
    const atual = lerAgenda()
    if (!atual.some((item) => item.palestra.id === palestra.id)) {
      gravarAgenda([
        ...atual,
        {
          palestra,
          inscricaoId: inscricao?.id,
          status: inscricao?.status ?? 'confirmada',
        },
      ])
    }
  }, [])

  const atualizar = useCallback(
    (palestraId: string, mudancas: Partial<Pick<ItemAgenda, 'inscricaoId' | 'status'>>) => {
      gravarAgenda(
        lerAgenda().map((item) => (item.palestra.id === palestraId ? { ...item, ...mudancas } : item)),
      )
    },
    [],
  )

  const remover = useCallback((palestraId: string) => {
    gravarAgenda(lerAgenda().filter((item) => item.palestra.id !== palestraId))
  }, [])

  return { agenda, adicionar, atualizar, remover }
}
