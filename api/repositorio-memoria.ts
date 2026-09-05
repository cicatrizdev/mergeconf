import type { Inscricao, Palestra } from '../src/types'
import type { Repositorio } from './repositorio'
import { inscricoes, listarPalestras, palestras } from './dados'

let proximoId = 100

export function criarRepositorioMemoria(): Repositorio {
  return {
    async listarPalestras() {
      return listarPalestras()
    },

    async buscarPalestra(id: string) {
      return palestras.find((p) => p.id === id)
    },

    async atualizarPalestra(id: string, mudancas: Partial<Palestra>) {
      const palestra = palestras.find((p) => p.id === id)
      if (palestra) Object.assign(palestra, mudancas)
    },

    async buscarInscricaoExata(palestraId: string, email: string) {
      return inscricoes.find((i) => i.palestraId === palestraId && i.email === email)
    },

    async listarInscricoesPorEmail(email: string) {
      return inscricoes.filter((i) => i.email.toLowerCase() === email.toLowerCase())
    },

    async criarInscricao(dados: Omit<Inscricao, 'id'>) {
      const inscricao: Inscricao = {
        id: `i0000000-0000-0000-0000-${String(proximoId++).padStart(12, '0')}`,
        ...dados,
      }
      inscricoes.push(inscricao)
      return inscricao
    },

    async marcarCheckin(inscricaoId: string) {
      const inscricao = inscricoes.find((i) => i.id === inscricaoId)
      if (inscricao && !inscricao.checkinEm) {
        inscricao.checkinEm = new Date().toISOString()
      }
      return inscricao
    },
  }
}
