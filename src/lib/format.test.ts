import { describe, expect, it } from 'vitest'
import { duracaoEmMinutos, formatarDuracao, formatarHora } from './format'

describe('formatarHora', () => {
  it('formata o horário no fuso da conferência', () => {
    expect(formatarHora('2026-10-24T09:00:00-03:00')).toBe('09h00')
    expect(formatarHora('2026-10-24T16:45:00-03:00')).toBe('16h45')
  })
})

describe('duracaoEmMinutos', () => {
  it('calcula a duração entre início e fim', () => {
    expect(duracaoEmMinutos('2026-10-24T09:00:00-03:00', '2026-10-24T10:00:00-03:00')).toBe(60)
    expect(duracaoEmMinutos('2026-10-24T10:30:00-03:00', '2026-10-24T11:15:00-03:00')).toBe(45)
  })
})

describe('formatarDuracao', () => {
  it('usa minutos para sessões curtas', () => {
    expect(formatarDuracao('2026-10-24T10:30:00-03:00', '2026-10-24T11:15:00-03:00')).toBe('45 min')
  })

  it('usa horas para workshops', () => {
    expect(formatarDuracao('2026-10-24T14:30:00-03:00', '2026-10-24T16:30:00-03:00')).toBe('2h')
    expect(formatarDuracao('2026-10-24T14:30:00-03:00', '2026-10-24T16:00:00-03:00')).toBe('1h30')
  })
})
