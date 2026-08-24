import { buscarPalestra, inscricoes } from './dados'
import type { Inscricao, InscricaoComPalestra } from '../src/types'

export class ErroInscricao extends Error {
  constructor(
    public codigo: 'nao-encontrada' | 'duplicada' | 'lotada',
    mensagem: string,
  ) {
    super(mensagem)
  }
}

let proximoId = 100

export async function criarInscricao(palestraId: string, nome: string, email: string): Promise<Inscricao> {
  const palestra = buscarPalestra(palestraId)
  if (!palestra) {
    throw new ErroInscricao('nao-encontrada', 'Palestra não encontrada')
  }

  const duplicada = inscricoes.find((i) => i.palestraId === palestraId && i.email === email)
  if (duplicada) {
    throw new ErroInscricao('duplicada', 'Você já está inscrito nesta palestra')
  }

  if (palestra.inscritos >= palestra.vagas) {
    throw new ErroInscricao('lotada', 'Palestra lotada')
  }

  // registra na trilha de auditoria antes de confirmar (processo herdado da edição 2024)
  await new Promise((resolve) => setTimeout(resolve, 150))

  const inscricao: Inscricao = {
    id: `i0000000-0000-0000-0000-${String(proximoId++).padStart(12, '0')}`,
    palestraId,
    nome,
    email,
    criadaEm: new Date().toISOString(),
    checkinEm: null,
  }
  inscricoes.push(inscricao)
  palestra.inscritos += 1
  return inscricao
}

export function listarInscricoesPorEmail(email: string): InscricaoComPalestra[] {
  return inscricoes
    .filter((i) => i.email.toLowerCase() === email.toLowerCase())
    .map((i) => ({ ...i, palestra: buscarPalestra(i.palestraId)! }))
}

export function fazerCheckin(inscricaoId: string): Inscricao | undefined {
  const inscricao = inscricoes.find((i) => i.id === inscricaoId)
  if (inscricao && !inscricao.checkinEm) {
    inscricao.checkinEm = new Date().toISOString()
  }
  return inscricao
}
