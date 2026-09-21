import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { Palestra, StatusInscricao } from '../types'

vi.mock('../lib/api', async (importOriginal) => {
  const original = await importOriginal<typeof import('../lib/api')>()
  return { ...original, listarPalestras: vi.fn() }
})

function criarPalestra(parcial: Partial<Palestra> & Pick<Palestra, 'id' | 'titulo' | 'inicio' | 'fim' | 'tipo'>): Palestra {
  return {
    palestrante: 'Alguém',
    sala: 'Sala Stack Overflow',
    trilha: 'frontend',
    vagas: 80,
    inscritos: 10,
    descricao: 'Descrição.',
    ...parcial,
  }
}

const useEffectTerror = criarPalestra({
  id: '00000000-0000-0000-0000-000000000002',
  titulo: 'useEffect: Uma História de Terror',
  tipo: 'talk',
  inicio: '2026-10-24T10:30:00-03:00',
  fim: '2026-10-24T11:15:00-03:00',
})

const microservicos = criarPalestra({
  id: '00000000-0000-0000-0000-000000000003',
  titulo: 'Microserviços: Como Transformar 1 Problema em 47',
  tipo: 'talk',
  trilha: 'backend',
  sala: 'Auditório Legacy',
  inicio: '2026-10-24T10:30:00-03:00',
  fim: '2026-10-24T11:15:00-03:00',
})

const workshopTestes = criarPalestra({
  id: '00000000-0000-0000-0000-000000000009',
  titulo: 'Testes: Escrevendo o que Você Jurou que Ia Escrever',
  tipo: 'workshop',
  trilha: 'backend',
  sala: 'Sala Rubber Duck',
  inicio: '2026-10-24T14:30:00-03:00',
  fim: '2026-10-24T16:30:00-03:00',
})

function gravarAgenda(
  itens: Array<{ palestra: Palestra; status?: StatusInscricao; inscricaoId?: string }>,
) {
  localStorage.setItem(
    'mergeconf:agenda',
    JSON.stringify(
      itens.map((item) => ({
        palestra: item.palestra,
        status: item.status ?? 'confirmada',
        inscricaoId: item.inscricaoId,
      })),
    ),
  )
}

async function mockListarPalestras(resultado: Palestra[] | Promise<Palestra[]>) {
  const { listarPalestras } = await import('../lib/api')
  if (resultado instanceof Promise) {
    vi.mocked(listarPalestras).mockReturnValue(resultado)
  } else {
    vi.mocked(listarPalestras).mockResolvedValue(resultado)
  }
}

async function renderizarPagina() {
  const { MinhaAgenda } = await import('./MinhaAgenda')
  return render(
    <MemoryRouter>
      <MinhaAgenda />
    </MemoryRouter>,
  )
}

describe('MinhaAgenda', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetModules()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('mostra estado vazio com link para a grade', async () => {
    await mockListarPalestras([useEffectTerror, microservicos, workshopTestes])
    await renderizarPagina()

    expect(await screen.findByText(/Você ainda não adicionou nenhuma palestra/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Explore a grade' })).toHaveAttribute('href', '/')
  })

  it('mostra carregando até a API resolver', async () => {
    let resolver!: (palestras: Palestra[]) => void
    await mockListarPalestras(
      new Promise((resolve) => {
        resolver = resolve
      }),
    )

    await renderizarPagina()

    expect(screen.getByText('Carregando agenda…')).toBeInTheDocument()

    resolver([])
    await waitFor(() => expect(screen.queryByText('Carregando agenda…')).not.toBeInTheDocument())
    expect(screen.getByText(/Você ainda não adicionou nenhuma palestra/)).toBeInTheDocument()
  })

  it('lista as sessões em ordem cronológica', async () => {
    gravarAgenda([{ palestra: workshopTestes }, { palestra: useEffectTerror }])
    await mockListarPalestras([useEffectTerror, microservicos, workshopTestes])
    await renderizarPagina()

    const titulos = await screen.findAllByRole('link', {
      name: /useEffect: Uma História de Terror|Testes: Escrevendo o que Você Jurou que Ia Escrever/,
    })
    expect(titulos.map((link) => link.textContent)).toEqual([
      'useEffect: Uma História de Terror',
      'Testes: Escrevendo o que Você Jurou que Ia Escrever',
    ])
  })

  it('sinaliza conflito entre sessões paralelas das 10h30', async () => {
    gravarAgenda([{ palestra: useEffectTerror }, { palestra: microservicos }])
    await mockListarPalestras([useEffectTerror, microservicos, workshopTestes])
    await renderizarPagina()

    expect(await screen.findByText('useEffect: Uma História de Terror')).toBeInTheDocument()
    expect(screen.getAllByText('Conflito de horário')).toHaveLength(2)
  })

  it('inclui workshop no total de horas', async () => {
    gravarAgenda([{ palestra: useEffectTerror }, { palestra: workshopTestes }])
    await mockListarPalestras([useEffectTerror, microservicos, workshopTestes])
    await renderizarPagina()

    expect(await screen.findByText('2 sessões · 2.8h de conteúdo')).toBeInTheDocument()
  })

  it('oferece link para a página de detalhe da palestra', async () => {
    gravarAgenda([{ palestra: useEffectTerror }])
    await mockListarPalestras([useEffectTerror, microservicos, workshopTestes])
    await renderizarPagina()

    expect(await screen.findByRole('link', { name: 'useEffect: Uma História de Terror' })).toHaveAttribute(
      'href',
      '/palestra/00000000-0000-0000-0000-000000000002',
    )
  })
})
