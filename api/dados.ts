import type { Inscricao, Palestra } from '../src/types'

const id = (n: number) => `00000000-0000-0000-0000-0000000000${String(n).padStart(2, '0')}`
const dia = (hora: string) => `2026-10-24T${hora}:00-03:00`

export const palestras: Palestra[] = [
  {
    id: id(1),
    titulo: 'O Deploy de Sexta: Ao Vivo',
    palestrante: 'Marina Prod',
    sala: 'Auditório Legacy',
    trilha: 'carreira',
    tipo: 'keynote',
    inicio: dia('09:00'),
    fim: dia('10:00'),
    vagas: 300,
    inscritos: 187,
    descricao:
      'A keynote de abertura da MergeConf 2026. Marina faz um deploy em produção no palco, numa sexta-feira, sem rede de segurança. O que pode dar errado é o roteiro.',
  },
  {
    id: id(2),
    titulo: 'useEffect: Uma História de Terror',
    palestrante: 'Carlos Render',
    sala: 'Sala Stack Overflow',
    trilha: 'frontend',
    tipo: 'talk',
    inicio: dia('10:30'),
    fim: dia('11:15'),
    vagas: 80,
    inscritos: 64,
    remanejadaDe: dia('14:00'),
    descricao:
      'Cinco dependências, três race conditions e um cleanup que nunca roda. Baseado em fatos reais do repositório da sua empresa.',
  },
  {
    id: id(3),
    titulo: 'Microserviços: Como Transformar 1 Problema em 47',
    palestrante: 'Rafa Broker',
    sala: 'Auditório Legacy',
    trilha: 'backend',
    tipo: 'talk',
    inicio: dia('10:30'),
    fim: dia('11:15'),
    vagas: 300,
    inscritos: 143,
    descricao:
      'Um monolito virou 47 serviços e agora ninguém sabe onde mora o bug. Um guia sincero de quando (não) distribuir.',
  },
  {
    id: id(4),
    titulo: 'Escalando o Monólito com Fé',
    palestrante: 'Dona Estela Singleton',
    sala: 'Sala Rubber Duck',
    trilha: 'backend',
    tipo: 'talk',
    inicio: dia('11:30'),
    fim: dia('12:15'),
    vagas: 60,
    inscritos: 41,
    descricao:
      'O monolito aguenta. Sempre aguentou. Técnicas de cache, filas e oração para adiar a grande reescrita por mais um ano fiscal.',
  },
  {
    id: id(5),
    titulo: 'CSS: A Arte de Centralizar uma Div em 2026',
    palestrante: 'Bea Flexbox',
    sala: 'Sala Stack Overflow',
    trilha: 'frontend',
    tipo: 'talk',
    inicio: dia('11:30'),
    fim: dia('12:15'),
    vagas: 80,
    inscritos: 77,
    descricao:
      'Grid, flex, anchor positioning e as 14 formas de centralizar — incluindo a que funciona no navegador do seu cliente.',
  },
  {
    id: id(6),
    titulo: 'Prompt Engineering: Falando Bonito com a Máquina',
    palestrante: 'Ju Tokens',
    sala: 'Auditório Legacy',
    trilha: 'ia',
    tipo: 'talk',
    inicio: dia('13:30'),
    fim: dia('14:15'),
    vagas: 300,
    inscritos: 205,
    descricao:
      'Contexto, objetivo, restrições e critérios de aceite: por que o prompt do seu colega funciona e o seu não.',
  },
  {
    id: id(7),
    titulo: 'RAG: Seu Chatbot Decorou a Wiki Errada',
    palestrante: 'Otto Embedding',
    sala: 'Sala Rubber Duck',
    trilha: 'ia',
    tipo: 'talk',
    inicio: dia('13:30'),
    fim: dia('14:15'),
    vagas: 60,
    inscritos: 58,
    descricao:
      'Retrieval que recupera a página errada, chunks cortados no meio da frase e a arte de culpar o modelo pelo seu pipeline.',
  },
  {
    id: id(8),
    titulo: 'Do Estágio ao Burnout em 18 Meses',
    palestrante: 'Léo Sprint',
    sala: 'Sala Stack Overflow',
    trilha: 'carreira',
    tipo: 'talk',
    inicio: dia('14:30'),
    fim: dia('15:15'),
    vagas: 80,
    inscritos: 52,
    descricao:
      'Uma retrospectiva honesta sobre dizer sim para tudo. Inclui o gráfico de commits às 2h da manhã e como sair dessa curva.',
  },
  {
    id: id(9),
    titulo: 'Testes: Escrevendo o que Você Jurou que Ia Escrever',
    palestrante: 'Vera Coverage',
    sala: 'Sala Rubber Duck',
    trilha: 'backend',
    tipo: 'workshop',
    inicio: dia('14:30'),
    fim: dia('16:30'),
    vagas: 40,
    inscritos: 33,
    descricao:
      'Workshop mão na massa: pegamos um serviço real sem nenhum teste e saímos com uma suíte que o time tem orgulho de rodar.',
  },
  {
    id: id(10),
    titulo: 'Git Rebase Sem Chorar (Quase)',
    palestrante: 'Chico Conflitos',
    sala: 'Sala Stack Overflow',
    trilha: 'carreira',
    tipo: 'workshop',
    inicio: dia('15:30'),
    fim: dia('17:30'),
    vagas: 40,
    inscritos: 39,
    descricao:
      'Workshop prático de reescrita de histórico: interactive rebase, fixup, autosquash e o momento exato de desistir e fazer merge.',
  },
  {
    id: id(11),
    titulo: 'Kubernetes: O Cluster que Ninguém Sabe Quem Criou',
    palestrante: 'Helena Helm',
    sala: 'Auditório Legacy',
    trilha: 'backend',
    tipo: 'talk',
    inicio: dia('16:00'),
    fim: dia('16:45'),
    vagas: 30,
    inscritos: 29,
    descricao:
      'Arqueologia de infraestrutura: entendendo um cluster herdado onde todo manifesto tem um "não mexer" no comentário. Sala pequena, corre que está acabando.',
  },
  {
    id: id(12),
    titulo: 'Acessibilidade: O Requisito que Virou Lenda',
    palestrante: 'Alice Aria',
    sala: 'Sala Rubber Duck',
    trilha: 'frontend',
    tipo: 'talk',
    inicio: dia('17:00'),
    fim: dia('17:45'),
    vagas: 60,
    inscritos: 21,
    remanejadaDe: dia('09:00'),
    descricao:
      'Todo mundo diz que é prioridade, ninguém coloca na sprint. Como sair do discurso e fazer um formulário que uma pessoa cega consegue enviar.',
  },
]

export const inscricoes: Inscricao[] = [
  {
    id: 'i0000000-0000-0000-0000-000000000001',
    palestraId: id(2),
    nome: 'Ana Dev',
    email: 'ana@exemplo.dev',
    criadaEm: '2026-08-20T10:12:00-03:00',
    checkinEm: null,
  },
  {
    id: 'i0000000-0000-0000-0000-000000000002',
    palestraId: id(6),
    nome: 'Ana Dev',
    email: 'ana@exemplo.dev',
    criadaEm: '2026-08-20T10:13:00-03:00',
    checkinEm: null,
  },
  {
    id: 'i0000000-0000-0000-0000-000000000003',
    palestraId: id(11),
    nome: 'Bruno Backend',
    email: 'bruno@exemplo.dev',
    criadaEm: '2026-08-21T15:40:00-03:00',
    checkinEm: null,
  },
]

export function listarPalestras(): Palestra[] {
  return [...palestras].sort((a, b) => a.inicio.localeCompare(b.inicio))
}

export function buscarPalestra(palestraId: string): Palestra | undefined {
  return palestras.find((p) => p.id === palestraId)
}
