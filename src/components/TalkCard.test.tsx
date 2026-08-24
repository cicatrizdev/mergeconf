import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { TalkCard } from './TalkCard'
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

describe('TalkCard', () => {
  it('mostra título, palestrante e sala', () => {
    render(<TalkCard palestra={palestra} />, { wrapper: MemoryRouter })
    expect(screen.getByText('useEffect: Uma História de Terror')).toBeInTheDocument()
    expect(screen.getByText('Carlos Render')).toBeInTheDocument()
    expect(screen.getByText('Sala Stack Overflow')).toBeInTheDocument()
  })

  it('mostra as vagas restantes', () => {
    render(<TalkCard palestra={palestra} />, { wrapper: MemoryRouter })
    expect(screen.getByText('16 vagas')).toBeInTheDocument()
  })

  it('linka para a página da palestra', () => {
    render(<TalkCard palestra={palestra} />, { wrapper: MemoryRouter })
    expect(screen.getByRole('link')).toHaveAttribute('href', `/palestra/${palestra.id}`)
  })
})
