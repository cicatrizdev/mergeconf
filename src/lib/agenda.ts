import type { Palestra } from '../types'
import { duracaoEmMinutos } from './format'

type ComHorario = Pick<Palestra, 'id' | 'inicio' | 'fim'>

export function horariosConflitam(
  a: Pick<Palestra, 'inicio' | 'fim'>,
  b: Pick<Palestra, 'inicio' | 'fim'>,
): boolean {
  return a.inicio < b.fim && b.inicio < a.fim
}

export function idsEmConflito(itens: ComHorario[]): Set<string> {
  const ids = new Set<string>()
  for (let i = 0; i < itens.length; i++) {
    for (let j = i + 1; j < itens.length; j++) {
      if (horariosConflitam(itens[i], itens[j])) {
        ids.add(itens[i].id)
        ids.add(itens[j].id)
      }
    }
  }
  return ids
}

export function ordenarPorInicio<T extends Pick<Palestra, 'inicio'>>(itens: T[]): T[] {
  return [...itens].sort((a, b) => a.inicio.localeCompare(b.inicio))
}

export function totalHorasSessoes(palestras: Pick<Palestra, 'inicio' | 'fim'>[]): number {
  return palestras.reduce((total, palestra) => total + duracaoEmMinutos(palestra.inicio, palestra.fim), 0) / 60
}
