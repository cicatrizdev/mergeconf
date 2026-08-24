import type { Palestra } from '../src/types'

interface Janela {
  sala: string
  inicio: string
  fim: string
}

/**
 * Verifica se uma janela de horário conflita com alguma palestra já
 * alocada na mesma sala. Usado ao remanejar palestras na área do organizador.
 */
export function haConflitoDeSala(palestras: Palestra[], candidata: Janela, ignorarId?: string): Palestra | undefined {
  return palestras.find((p) => {
    if (p.id === ignorarId) return false
    if (p.sala !== candidata.sala) return false
    return p.inicio < candidata.fim && candidata.inicio < p.fim
  })
}

/**
 * Lista as salas livres em uma janela de horário.
 */
export function salasLivres(palestras: Palestra[], inicio: string, fim: string): string[] {
  const todas = [...new Set(palestras.map((p) => p.sala))]
  return todas.filter((sala) => !haConflitoDeSala(palestras, { sala, inicio, fim }))
}
