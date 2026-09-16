import { repo } from './repositorio'
import type { Inscricao, InscricaoComPalestra } from '../src/types'

export class ErroInscricao extends Error {
  constructor(
    public codigo: 'nao-encontrada' | 'duplicada' | 'em-espera',
    mensagem: string,
  ) {
    super(mensagem)
  }
}

function normalizarEmail(email: string): string {
  return email.trim().toLowerCase()
}

async function posicaoNaFila(inscricao: Inscricao): Promise<number | undefined> {
  if (inscricao.status !== 'em-espera') return undefined
  const fila = await repo.listarFilaDaPalestra(inscricao.palestraId)
  return fila.findIndex((item) => item.id === inscricao.id) + 1
}

async function comPosicao(inscricao: Inscricao): Promise<Inscricao> {
  const posicaoFila = await posicaoNaFila(inscricao)
  return posicaoFila === undefined ? inscricao : { ...inscricao, posicaoFila }
}

export async function criarInscricao(palestraId: string, nome: string, email: string): Promise<Inscricao> {
  const emailNormalizado = normalizarEmail(email)

  const palestra = await repo.buscarPalestra(palestraId)
  if (!palestra) {
    throw new ErroInscricao('nao-encontrada', 'Palestra não encontrada')
  }

  const duplicada = await repo.buscarInscricaoExata(palestraId, emailNormalizado)
  if (duplicada) {
    throw new ErroInscricao('duplicada', 'Você já está inscrito nesta palestra')
  }

  // registra na trilha de auditoria antes de confirmar (processo herdado da edição 2024)
  await new Promise((resolve) => setTimeout(resolve, 150))

  // reserva atômica: só uma corrida pela última vaga ganha a confirmação
  const reservou = await repo.reservarVaga(palestraId)
  const inscricao = await repo.criarInscricao({
    palestraId,
    nome,
    email: emailNormalizado,
    criadaEm: new Date().toISOString(),
    checkinEm: null,
    status: reservou ? 'confirmada' : 'em-espera',
  })
  if (!reservou) return comPosicao(inscricao)
  return inscricao
}

export async function promoverPrimeiroDaFila(palestraId: string): Promise<Inscricao | undefined> {
  const fila = await repo.listarFilaDaPalestra(palestraId)
  const primeira = fila[0]
  if (!primeira) return undefined
  const reservou = await repo.reservarVaga(palestraId)
  if (!reservou) return undefined
  return repo.atualizarInscricao(primeira.id, { status: 'confirmada' })
}

export async function cancelarInscricao(
  id: string,
): Promise<{ removida: Inscricao; promovida?: Inscricao }> {
  const inscricao = await repo.buscarInscricao(id)
  if (!inscricao) {
    throw new ErroInscricao('nao-encontrada', 'Inscrição não encontrada')
  }

  await repo.removerInscricao(id)
  if (inscricao.status === 'em-espera') {
    return { removida: inscricao }
  }

  await repo.liberarVaga(inscricao.palestraId)
  const promovida = await promoverPrimeiroDaFila(inscricao.palestraId)
  return promovida ? { removida: inscricao, promovida } : { removida: inscricao }
}

export async function listarInscricoesPorEmail(email: string): Promise<InscricaoComPalestra[]> {
  const inscricoes = await repo.listarInscricoesPorEmail(normalizarEmail(email))
  return Promise.all(
    inscricoes.map(async (inscricao) => ({
      ...(await comPosicao(inscricao)),
      palestra: (await repo.buscarPalestra(inscricao.palestraId))!,
    })),
  )
}

export async function fazerCheckin(inscricaoId: string): Promise<Inscricao | undefined> {
  const inscricao = await repo.buscarInscricao(inscricaoId)
  if (!inscricao) return undefined
  if (inscricao.status === 'em-espera') {
    throw new ErroInscricao('em-espera', 'Inscrição em lista de espera não pode fazer check-in')
  }
  return repo.marcarCheckin(inscricaoId)
}
