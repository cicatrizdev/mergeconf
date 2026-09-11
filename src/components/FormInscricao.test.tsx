import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { FormInscricao } from './FormInscricao'
import { buscarInscricoes, cancelarInscricao, inscrever, ErroApi } from '../lib/api'
import type { InscricaoComPalestra, Palestra } from '../types'

vi.mock('../lib/api', async (importOriginal) => {
  const original = await importOriginal<typeof import('../lib/api')>()
  return {
    ...original,
    buscarInscricoes: vi.fn(),
    inscrever: vi.fn(),
    cancelarInscricao: vi.fn(),
  }
})

function criarPalestra(id: string): Palestra {
  return {
    id,
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
}

function inscricaoDe(palestra: Palestra, email: string): InscricaoComPalestra {
  return {
    id: 'i0000000-0000-0000-0000-000000000099',
    palestraId: palestra.id,
    nome: 'Ana Dev',
    email,
    criadaEm: '2026-08-20T10:12:00-03:00',
    checkinEm: null,
    status: 'confirmada',
    palestra,
  }
}

describe('FormInscricao', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('mostra "já inscrito" a partir da API mesmo com localStorage vazio', async () => {
    const palestra = criarPalestra('00000000-0000-0000-0000-000000000801')
    // a API guarda o e-mail normalizado; o usuário digita com maiúsculas
    vi.mocked(buscarInscricoes).mockResolvedValue([inscricaoDe(palestra, 'ana@x.dev')])

    render(<FormInscricao palestra={palestra} />)

    const campoEmail = screen.getByPlaceholderText('Seu e-mail')
    fireEvent.change(campoEmail, { target: { value: 'Ana@x.dev' } })
    fireEvent.blur(campoEmail)

    await waitFor(() => expect(screen.getByText('Você já está inscrito')).toBeInTheDocument())

    fireEvent.click(screen.getByText('Você já está inscrito'))
    expect(inscrever).not.toHaveBeenCalled()
  })

  it('trata resposta "duplicada" da API como já inscrito, não como erro', async () => {
    const palestra = criarPalestra('00000000-0000-0000-0000-000000000802')
    vi.mocked(buscarInscricoes).mockResolvedValue([])
    vi.mocked(inscrever).mockRejectedValue(
      new ErroApi('Você já está inscrito nesta palestra', 'duplicada'),
    )

    render(<FormInscricao palestra={palestra} />)

    fireEvent.change(screen.getByPlaceholderText('Seu nome'), { target: { value: 'Ana Dev' } })
    fireEvent.change(screen.getByPlaceholderText('Seu e-mail'), { target: { value: 'Ana@x.dev' } })
    fireEvent.click(screen.getByText('Inscrever-se'))

    await waitFor(() => expect(screen.getByText('Você já está inscrito')).toBeInTheDocument())
    expect(screen.queryByText('Você já está inscrito nesta palestra')).not.toBeInTheDocument()
  })

  it('oferece "Entrar na lista de espera" quando a palestra está lotada', () => {
    const palestra = criarPalestra('00000000-0000-0000-0000-000000000803')
    palestra.inscritos = palestra.vagas

    render(<FormInscricao palestra={palestra} />)

    expect(screen.getByText('Entrar na lista de espera')).toBeInTheDocument()
  })

  it('mostra a posição após entrar na lista de espera', async () => {
    const palestra = criarPalestra('00000000-0000-0000-0000-000000000804')
    palestra.inscritos = palestra.vagas
    vi.mocked(buscarInscricoes).mockResolvedValue([])
    vi.mocked(inscrever).mockResolvedValue({
      ...inscricaoDe(palestra, 'ana@x.dev'),
      status: 'em-espera',
      posicaoFila: 3,
    })

    render(<FormInscricao palestra={palestra} />)

    fireEvent.change(screen.getByPlaceholderText('Seu nome'), { target: { value: 'Ana Dev' } })
    fireEvent.change(screen.getByPlaceholderText('Seu e-mail'), { target: { value: 'Ana@x.dev' } })
    fireEvent.click(screen.getByText('Entrar na lista de espera'))

    await waitFor(() =>
      expect(screen.getByText('Você entrou na lista de espera · posição 3')).toBeInTheDocument(),
    )
  })

  it('mostra posição e "Sair da fila" quando o e-mail já está em espera', async () => {
    const palestra = criarPalestra('00000000-0000-0000-0000-000000000805')
    vi.mocked(buscarInscricoes).mockResolvedValue([
      { ...inscricaoDe(palestra, 'ana@x.dev'), status: 'em-espera', posicaoFila: 2 },
    ])
    vi.mocked(cancelarInscricao).mockResolvedValue(undefined)

    render(<FormInscricao palestra={palestra} />)

    const campoEmail = screen.getByPlaceholderText('Seu e-mail')
    fireEvent.change(campoEmail, { target: { value: 'Ana@x.dev' } })
    fireEvent.blur(campoEmail)

    await waitFor(() =>
      expect(screen.getByText('Você está na lista de espera · posição 2')).toBeInTheDocument(),
    )
    fireEvent.click(screen.getByText('Sair da fila'))

    await waitFor(() => expect(cancelarInscricao).toHaveBeenCalledWith(inscricaoDe(palestra, 'ana@x.dev').id))
    expect(screen.getByText('Inscrever-se')).toBeInTheDocument()
  })
})
