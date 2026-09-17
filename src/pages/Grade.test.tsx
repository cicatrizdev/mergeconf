import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { Grade } from './Grade'
import { listarPalestras } from '../lib/api'
import type { Palestra, Trilha } from '../types'

vi.mock('../lib/api', async (importOriginal) => {
  const original = await importOriginal<typeof import('../lib/api')>()
  return { ...original, listarPalestras: vi.fn() }
})

function criarPalestra(
  id: string,
  titulo: string,
  trilha: Trilha,
  inicio: string,
): Palestra {
  return {
    id,
    titulo,
    palestrante: 'Alguém',
    sala: 'Sala Stack Overflow',
    trilha,
    tipo: 'talk',
    inicio,
    fim: '2026-10-24T11:15:00-03:00',
    vagas: 80,
    inscritos: 10,
    descricao: 'Descrição.',
  }
}

const keynoteCarreira = criarPalestra(
  '00000000-0000-0000-0000-000000000001',
  'O Deploy de Sexta: Ao Vivo',
  'carreira',
  '2026-10-24T09:00:00-03:00',
)
const talkFrontend = criarPalestra(
  '00000000-0000-0000-0000-000000000002',
  'useEffect: Uma História de Terror',
  'frontend',
  '2026-10-24T10:30:00-03:00',
)
const talkBackend = criarPalestra(
  '00000000-0000-0000-0000-000000000003',
  'Escalando o Monólito com Fé',
  'backend',
  '2026-10-24T11:30:00-03:00',
)

function UrlAtual() {
  const { pathname, search } = useLocation()
  return <p aria-label="url atual">{`${pathname}${search}`}</p>
}

function renderizarGrade(rotaInicial = '/') {
  return render(
    <MemoryRouter initialEntries={[rotaInicial]}>
      <Grade />
      <UrlAtual />
    </MemoryRouter>,
  )
}

describe('Grade', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(listarPalestras).mockResolvedValue([
      keynoteCarreira,
      talkFrontend,
      talkBackend,
    ])
  })

  it('marca Todas e mostra todas as palestras quando não há filtro na URL', async () => {
    renderizarGrade()

    expect(await screen.findByText('O Deploy de Sexta: Ao Vivo')).toBeInTheDocument()
    expect(screen.getByText('useEffect: Uma História de Terror')).toBeInTheDocument()
    expect(screen.getByText('Escalando o Monólito com Fé')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Todas' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('filtra pela trilha frontend e reflete na URL', async () => {
    renderizarGrade()
    await screen.findByText('O Deploy de Sexta: Ao Vivo')

    fireEvent.click(screen.getByRole('radio', { name: 'frontend' }))

    expect(screen.queryByText('O Deploy de Sexta: Ao Vivo')).not.toBeInTheDocument()
    expect(screen.queryByText('Escalando o Monólito com Fé')).not.toBeInTheDocument()
    expect(screen.getByText('useEffect: Uma História de Terror')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByLabelText('url atual')).toHaveTextContent('/?trilha=frontend'),
    )
  })

  it('hidrata o filtro a partir de ?trilha=frontend', async () => {
    renderizarGrade('/?trilha=frontend')

    expect(await screen.findByText('useEffect: Uma História de Terror')).toBeInTheDocument()
    expect(screen.queryByText('O Deploy de Sexta: Ao Vivo')).not.toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'frontend' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('remove o parâmetro da URL ao escolher Todas', async () => {
    renderizarGrade('/?trilha=frontend')
    await screen.findByText('useEffect: Uma História de Terror')

    fireEvent.click(screen.getByRole('radio', { name: 'Todas' }))

    expect(await screen.findByText('O Deploy de Sexta: Ao Vivo')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByLabelText('url atual')).toHaveTextContent('/'))
    expect(screen.getByLabelText('url atual')).not.toHaveTextContent('trilha')
  })

  it('omite horário sem palestra da trilha filtrada', async () => {
    renderizarGrade()
    expect(await screen.findByRole('heading', { name: '09h00' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('radio', { name: 'frontend' }))

    expect(screen.queryByRole('heading', { name: '09h00' })).not.toBeInTheDocument()
    expect(screen.queryByText('O Deploy de Sexta: Ao Vivo')).not.toBeInTheDocument()
  })

  it('trata trilha desconhecida como Todas', async () => {
    renderizarGrade('/?trilha=design')

    expect(await screen.findByText('O Deploy de Sexta: Ao Vivo')).toBeInTheDocument()
    expect(screen.getByText('useEffect: Uma História de Terror')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Todas' })).toHaveAttribute('aria-pressed', 'true')
  })
})
