import { describe, expect, it } from 'vitest'
import { buscarPalestra, listarPalestras } from './dados'

describe('listarPalestras', () => {
  it('retorna a grade completa da edição 2026', () => {
    expect(listarPalestras()).toHaveLength(12)
  })

  it('ordena por horário de início', () => {
    const inicios = listarPalestras().map((p) => p.inicio)
    expect(inicios).toEqual([...inicios].sort())
  })

  it('abre com a keynote no Auditório Legacy', () => {
    const [primeira] = listarPalestras()
    expect(primeira.tipo).toBe('keynote')
    expect(primeira.sala).toBe('Auditório Legacy')
  })
})

describe('buscarPalestra', () => {
  it('encontra palestra pelo id', () => {
    const palestra = buscarPalestra('00000000-0000-0000-0000-000000000011')
    expect(palestra?.titulo).toContain('Kubernetes')
  })

  it('retorna undefined para id inexistente', () => {
    expect(buscarPalestra('nao-existe')).toBeUndefined()
  })
})
