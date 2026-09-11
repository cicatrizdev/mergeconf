import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import type { Palestra } from '../types'

const palestra: Palestra = {
  id: '00000000-0000-0000-0000-000000000002',
  titulo: 'useEffect: Uma História de Terror',
  palestrante: 'Carlos Render',
  sala: 'Sala Stack Overflow',
  trilha: 'frontend',
  tipo: 'talk',
  inicio: '2026-10-24T10:30:00-03:00',
  fim: '2026-10-24T11:15:00-03:00',
  vagas: 80,
  inscritos: 64,
  descricao: 'Cinco dependências, três race conditions.',
}

describe('useAgenda', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetModules()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('lê agenda no formato antigo como confirmada sem inscricaoId', async () => {
    localStorage.setItem('mergeconf:agenda', JSON.stringify([palestra]))
    const { useAgenda } = await import('./useAgenda')

    const { result } = renderHook(() => useAgenda())

    expect(result.current.agenda).toEqual([{ palestra, status: 'confirmada' }])
    expect(result.current.agenda[0].inscricaoId).toBeUndefined()
  })

  it('grava item novo com inscricaoId e status', async () => {
    const { useAgenda } = await import('./useAgenda')
    const { result } = renderHook(() => useAgenda())

    act(() => {
      result.current.adicionar(palestra, { id: 'insc-1', status: 'em-espera' })
    })

    expect(result.current.agenda).toEqual([
      { palestra, inscricaoId: 'insc-1', status: 'em-espera' },
    ])
  })

  it('não duplica a mesma palestra', async () => {
    const { useAgenda } = await import('./useAgenda')
    const { result } = renderHook(() => useAgenda())

    act(() => {
      result.current.adicionar(palestra, { id: 'insc-1', status: 'confirmada' })
      result.current.adicionar(palestra, { id: 'insc-2', status: 'em-espera' })
    })

    expect(result.current.agenda).toHaveLength(1)
    expect(result.current.agenda[0].inscricaoId).toBe('insc-1')
    expect(result.current.agenda[0].status).toBe('confirmada')
  })

  it('atualiza status de item existente', async () => {
    const { useAgenda } = await import('./useAgenda')
    const { result } = renderHook(() => useAgenda())

    act(() => {
      result.current.adicionar(palestra, { id: 'insc-1', status: 'em-espera' })
    })
    act(() => {
      result.current.atualizar(palestra.id, { status: 'confirmada' })
    })

    expect(result.current.agenda[0].status).toBe('confirmada')
    expect(result.current.agenda[0].inscricaoId).toBe('insc-1')
  })
})
