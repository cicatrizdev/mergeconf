import type { Inscricao, Palestra } from '../src/types'
import { criarRepositorioMemoria } from './repositorio-memoria'
import { criarRepositorioSupabase } from './repositorio-supabase'

export interface Repositorio {
  listarPalestras(): Promise<Palestra[]>
  buscarPalestra(id: string): Promise<Palestra | undefined>
  atualizarPalestra(id: string, mudancas: Partial<Palestra>): Promise<void>
  /** Incrementa inscritos só se ainda houver vaga. Atômico contra corrida. */
  reservarVaga(palestraId: string): Promise<boolean>
  /** Decrementa inscritos sem ir abaixo de zero. */
  liberarVaga(palestraId: string): Promise<void>
  buscarInscricaoExata(palestraId: string, email: string): Promise<Inscricao | undefined>
  listarInscricoesPorEmail(email: string): Promise<Inscricao[]>
  criarInscricao(inscricao: Omit<Inscricao, 'id' | 'posicaoFila'>): Promise<Inscricao>
  marcarCheckin(inscricaoId: string): Promise<Inscricao | undefined>
  buscarInscricao(id: string): Promise<Inscricao | undefined>
  listarFilaDaPalestra(palestraId: string): Promise<Inscricao[]>
  atualizarInscricao(id: string, mudancas: Pick<Inscricao, 'status'>): Promise<Inscricao | undefined>
  removerInscricao(id: string): Promise<void>
}

function criarRepositorio(): Repositorio {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    console.log(`🗄️  Banco: Supabase (${new URL(SUPABASE_URL).hostname})`)
    return criarRepositorioSupabase(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  console.log('🗄️  Banco: memória (sem .env — espelho de supabase/seed.sql)')
  return criarRepositorioMemoria()
}

export const repo = criarRepositorio()
