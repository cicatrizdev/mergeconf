export type Trilha = 'frontend' | 'backend' | 'ia' | 'carreira'

export type TipoSessao = 'talk' | 'workshop' | 'keynote'

export interface Palestra {
  id: string
  titulo: string
  palestrante: string
  sala: string
  trilha: Trilha
  tipo: TipoSessao
  inicio: string
  fim: string
  vagas: number
  inscritos: number
  remanejadaDe?: string
  descricao: string
}

export interface Inscricao {
  id: string
  palestraId: string
  nome: string
  email: string
  criadaEm: string
  checkinEm: string | null
}

export interface InscricaoComPalestra extends Inscricao {
  palestra: Palestra
}
