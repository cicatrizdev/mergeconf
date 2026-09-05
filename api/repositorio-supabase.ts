import { createClient } from '@supabase/supabase-js'
import type { Inscricao, Palestra } from '../src/types'
import type { Repositorio } from './repositorio'

interface LinhaPalestra {
  id: string
  titulo: string
  palestrante: string
  sala: string
  trilha: Palestra['trilha']
  tipo: Palestra['tipo']
  inicio: string
  fim: string
  vagas: number
  inscritos: number
  remanejada_de: string | null
  descricao: string
}

interface LinhaInscricao {
  id: string
  palestra_id: string
  nome: string
  email: string
  criada_em: string
  checkin_em: string | null
}

function paraPalestra(linha: LinhaPalestra): Palestra {
  return {
    id: linha.id,
    titulo: linha.titulo,
    palestrante: linha.palestrante,
    sala: linha.sala,
    trilha: linha.trilha,
    tipo: linha.tipo,
    inicio: linha.inicio,
    fim: linha.fim,
    vagas: linha.vagas,
    inscritos: linha.inscritos,
    remanejadaDe: linha.remanejada_de ?? undefined,
    descricao: linha.descricao,
  }
}

function paraInscricao(linha: LinhaInscricao): Inscricao {
  return {
    id: linha.id,
    palestraId: linha.palestra_id,
    nome: linha.nome,
    email: linha.email,
    criadaEm: linha.criada_em,
    checkinEm: linha.checkin_em,
  }
}

export function criarRepositorioSupabase(url: string, chave: string): Repositorio {
  const supabase = createClient(url, chave)

  return {
    async listarPalestras() {
      const { data, error } = await supabase.from('palestras').select('*').order('inicio')
      if (error) throw new Error(`Supabase: ${error.message}`)
      return (data as LinhaPalestra[]).map(paraPalestra)
    },

    async buscarPalestra(id: string) {
      const { data, error } = await supabase.from('palestras').select('*').eq('id', id).maybeSingle()
      if (error) throw new Error(`Supabase: ${error.message}`)
      return data ? paraPalestra(data as LinhaPalestra) : undefined
    },

    async atualizarPalestra(id: string, mudancas: Partial<Palestra>) {
      const linha: Partial<LinhaPalestra> = {}
      if (mudancas.sala !== undefined) linha.sala = mudancas.sala
      if (mudancas.inicio !== undefined) linha.inicio = mudancas.inicio
      if (mudancas.fim !== undefined) linha.fim = mudancas.fim
      if (mudancas.inscritos !== undefined) linha.inscritos = mudancas.inscritos
      if (mudancas.remanejadaDe !== undefined) linha.remanejada_de = mudancas.remanejadaDe
      const { error } = await supabase.from('palestras').update(linha).eq('id', id)
      if (error) throw new Error(`Supabase: ${error.message}`)
    },

    async buscarInscricaoExata(palestraId: string, email: string) {
      const { data, error } = await supabase
        .from('inscricoes')
        .select('*')
        .eq('palestra_id', palestraId)
        .eq('email', email)
        .maybeSingle()
      if (error) throw new Error(`Supabase: ${error.message}`)
      return data ? paraInscricao(data as LinhaInscricao) : undefined
    },

    async listarInscricoesPorEmail(email: string) {
      const { data, error } = await supabase.from('inscricoes').select('*').ilike('email', email)
      if (error) throw new Error(`Supabase: ${error.message}`)
      return (data as LinhaInscricao[]).map(paraInscricao)
    },

    async criarInscricao(dados: Omit<Inscricao, 'id'>) {
      const { data, error } = await supabase
        .from('inscricoes')
        .insert({
          palestra_id: dados.palestraId,
          nome: dados.nome,
          email: dados.email,
          criada_em: dados.criadaEm,
          checkin_em: dados.checkinEm,
        })
        .select()
        .single()
      if (error) throw new Error(`Supabase: ${error.message}`)
      return paraInscricao(data as LinhaInscricao)
    },

    async marcarCheckin(inscricaoId: string) {
      const { data, error } = await supabase
        .from('inscricoes')
        .update({ checkin_em: new Date().toISOString() })
        .eq('id', inscricaoId)
        .is('checkin_em', null)
        .select()
        .maybeSingle()
      if (error) throw new Error(`Supabase: ${error.message}`)
      if (data) return paraInscricao(data as LinhaInscricao)
      const { data: existente } = await supabase
        .from('inscricoes')
        .select('*')
        .eq('id', inscricaoId)
        .maybeSingle()
      return existente ? paraInscricao(existente as LinhaInscricao) : undefined
    },
  }
}
