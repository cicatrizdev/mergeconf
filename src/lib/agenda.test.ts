import { describe, expect, it } from 'vitest'
import { horariosConflitam, idsEmConflito, ordenarPorInicio, totalHorasSessoes } from './agenda'

function janela(id: string, inicio: string, fim: string) {
  return { id, inicio, fim }
}

describe('horariosConflitam', () => {
  it('detecta sobreposição no mesmo horário', () => {
    expect(
      horariosConflitam(
        { inicio: '2026-10-24T10:30:00-03:00', fim: '2026-10-24T11:15:00-03:00' },
        { inicio: '2026-10-24T10:30:00-03:00', fim: '2026-10-24T11:15:00-03:00' },
      ),
    ).toBe(true)
  })

  it('não trata fim de uma igual ao início da outra como conflito', () => {
    expect(
      horariosConflitam(
        { inicio: '2026-10-24T10:30:00-03:00', fim: '2026-10-24T11:15:00-03:00' },
        { inicio: '2026-10-24T11:15:00-03:00', fim: '2026-10-24T12:00:00-03:00' },
      ),
    ).toBe(false)
  })
})

describe('idsEmConflito', () => {
  it('marca as duas sessões paralelas', () => {
    const ids = idsEmConflito([
      janela('talk-a', '2026-10-24T10:30:00-03:00', '2026-10-24T11:15:00-03:00'),
      janela('talk-b', '2026-10-24T10:30:00-03:00', '2026-10-24T11:15:00-03:00'),
      janela('talk-c', '2026-10-24T11:30:00-03:00', '2026-10-24T12:15:00-03:00'),
    ])

    expect(ids).toEqual(new Set(['talk-a', 'talk-b']))
  })
})

describe('ordenarPorInicio', () => {
  it('ordena da mais cedo para a mais tarde', () => {
    const tarde = janela('tarde', '2026-10-24T16:00:00-03:00', '2026-10-24T16:45:00-03:00')
    const cedo = janela('cedo', '2026-10-24T09:00:00-03:00', '2026-10-24T10:00:00-03:00')

    expect(ordenarPorInicio([tarde, cedo]).map((item) => item.id)).toEqual(['cedo', 'tarde'])
  })
})

describe('totalHorasSessoes', () => {
  it('soma talks, workshops e keynotes', () => {
    expect(
      totalHorasSessoes([
        { inicio: '2026-10-24T09:00:00-03:00', fim: '2026-10-24T10:00:00-03:00' },
        { inicio: '2026-10-24T10:30:00-03:00', fim: '2026-10-24T11:15:00-03:00' },
        { inicio: '2026-10-24T14:30:00-03:00', fim: '2026-10-24T16:30:00-03:00' },
      ]),
    ).toBe(3.75)
  })
})
