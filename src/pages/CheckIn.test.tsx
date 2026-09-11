import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { CheckIn } from './CheckIn'
import { buscarInscricoes, cancelarInscricao } from '../lib/api'
import type { InscricaoComPalestra, Palestra } from '../types'

vi.mock('../lib/api', async (importOriginal) => {
  const original = await importOriginal<typeof import('../lib/api')>()
  return {
    ...original,
    buscarInscricoes: vi.fn(),
    cancelarInscricao: vi.fn(),
    fazerCheckin: vi.fn(),
  }
})

function criarPalestra(id: string, titulo: string): Palestra {
  return {
    id,
    titulo,
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
}

function inscricaoDe(
  palestra: Palestra,
  extras: Partial<InscricaoComPalestra> = {},
): InscricaoComPalestra {
  return {
    id: extras.id ?? 'i0000000-0000-0000-0000-000000000099',
    palestraId: palestra.id,
    nome: 'Ana Dev',
    email: 'ana@x.dev',
    criadaEm: '2026-08-20T10:12:00-03:00',
    checkinEm: null,
    status: 'confirmada',
    palestra,
    ...extras,
  }
}

async function buscarPorEmail() {
  fireEvent.change(screen.getByPlaceholderText('participante@exemplo.dev'), {
    target: { value: 'ana@x.dev' },
  })
  fireEvent.click(screen.getByText('Buscar'))
  await waitFor(() => expect(buscarInscricoes).toHaveBeenCalled())
}

describe('CheckIn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('diferencia inscrição confirmada de em espera com posição', async () => {
    const confirmada = criarPalestra('00000000-0000-0000-0000-000000000901', 'Talk confirmada')
    const espera = criarPalestra('00000000-0000-0000-0000-000000000902', 'Talk em espera')
    vi.mocked(buscarInscricoes).mockResolvedValue([
      inscricaoDe(confirmada, { id: 'insc-confirmada', status: 'confirmada' }),
      inscricaoDe(espera, { id: 'insc-espera', status: 'em-espera', posicaoFila: 2 }),
    ])

    render(<CheckIn />)
    await buscarPorEmail()

    expect(screen.getByText('Inscrito')).toBeInTheDocument()
    expect(screen.getByText('Em espera · 2º')).toBeInTheDocument()
  })

  it('mostra "Sair da fila" em vez de Check-in para inscrição em espera', async () => {
    const palestra = criarPalestra('00000000-0000-0000-0000-000000000903', 'Talk em espera')
    vi.mocked(buscarInscricoes).mockResolvedValue([
      inscricaoDe(palestra, { id: 'insc-espera', status: 'em-espera', posicaoFila: 1 }),
    ])
    vi.mocked(cancelarInscricao).mockResolvedValue(undefined)

    render(<CheckIn />)
    await buscarPorEmail()

    expect(screen.getByText('Sair da fila')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Check-in' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Sair da fila'))

    await waitFor(() => expect(cancelarInscricao).toHaveBeenCalledWith('insc-espera'))
    expect(buscarInscricoes).toHaveBeenCalledTimes(2)
  })

  it('oferece "Cancelar inscrição" para confirmada sem check-in', async () => {
    const palestra = criarPalestra('00000000-0000-0000-0000-000000000904', 'Talk confirmada')
    vi.mocked(buscarInscricoes).mockResolvedValue([inscricaoDe(palestra)])

    render(<CheckIn />)
    await buscarPorEmail()

    expect(screen.getByRole('button', { name: 'Check-in' })).toBeInTheDocument()
    expect(screen.getByText('Cancelar inscrição')).toBeInTheDocument()
  })
})
