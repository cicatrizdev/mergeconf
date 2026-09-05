import type { Inscricao, Palestra } from '../src/types'
import { criarRepositorioMemoria } from './repositorio-memoria'
import { criarRepositorioSupabase } from './repositorio-supabase'

export interface Repositorio {
  listarPalestras(): Promise<Palestra[]>
  buscarPalestra(id: string): Promise<Palestra | undefined>
  atualizarPalestra(id: string, mudancas: Partial<Palestra>): Promise<void>
  buscarInscricaoExata(palestraId: string, email: string): Promise<Inscricao | undefined>
  listarInscricoesPorEmail(email: string): Promise<Inscricao[]>
  criarInscricao(inscricao: Omit<Inscricao, 'id'>): Promise<Inscricao>
  marcarCheckin(inscricaoId: string): Promise<Inscricao | undefined>
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
