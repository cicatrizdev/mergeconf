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
      return inscricoes.find(
        (i) => i.palestraId === palestraId && i.email.toLowerCase() === email.toLowerCase(),
      )
    },

    async listarInscricoesPorEmail(email: string) {
      return inscricoes.filter((i) => i.email.toLowerCase() === email.toLowerCase())
    },

    async criarInscricao(dados: Omit<Inscricao, 'id' | 'posicaoFila'>) {
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

    async buscarInscricao(id: string) {
      return inscricoes.find((i) => i.id === id)
    },

    async listarFilaDaPalestra(palestraId: string) {
      return inscricoes
        .filter((i) => i.palestraId === palestraId && i.status === 'em-espera')
        .sort((a, b) => a.criadaEm.localeCompare(b.criadaEm))
    },

    async atualizarInscricao(id: string, mudancas: Pick<Inscricao, 'status'>) {
      const inscricao = inscricoes.find((i) => i.id === id)
      if (inscricao) Object.assign(inscricao, mudancas)
      return inscricao
    },

    async removerInscricao(id: string) {
      const indice = inscricoes.findIndex((i) => i.id === id)
      if (indice !== -1) inscricoes.splice(indice, 1)
    },
  }
}
