import { repo } from './repositorio'
import type { Inscricao, InscricaoComPalestra } from '../src/types'

export class ErroInscricao extends Error {
  constructor(
    public codigo: 'nao-encontrada' | 'duplicada' | 'lotada',
    mensagem: string,
  ) {
    super(mensagem)
  }
}

function normalizarEmail(email: string): string {
  return email.trim().toLowerCase()
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

  if (palestra.inscritos >= palestra.vagas) {
    throw new ErroInscricao('lotada', 'Palestra lotada')
  }

  // registra na trilha de auditoria antes de confirmar (processo herdado da edição 2024)
  await new Promise((resolve) => setTimeout(resolve, 150))

  const inscricao = await repo.criarInscricao({
    palestraId,
    nome,
    email: emailNormalizado,
    criadaEm: new Date().toISOString(),
    checkinEm: null,
  })
  await repo.atualizarPalestra(palestraId, { inscritos: palestra.inscritos + 1 })
  return inscricao
}

export async function listarInscricoesPorEmail(email: string): Promise<InscricaoComPalestra[]> {
  const inscricoes = await repo.listarInscricoesPorEmail(normalizarEmail(email))
  return Promise.all(
    inscricoes.map(async (inscricao) => ({
      ...inscricao,
      palestra: (await repo.buscarPalestra(inscricao.palestraId))!,
    })),
  )
}

export function fazerCheckin(inscricaoId: string): Promise<Inscricao | undefined> {
  return repo.marcarCheckin(inscricaoId)
}
