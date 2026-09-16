import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  cancelarInscricao,
  criarInscricao,
  fazerCheckin,
  listarInscricoesPorEmail,
  promoverPrimeiroDaFila,
} from './inscricoes'
import { inscricoes, palestras } from './dados'

// "Escalando o Monólito com Fé": 60 vagas, 41 inscritos no seed — sempre tem vaga
const PALESTRA_ID = '00000000-0000-0000-0000-000000000004'
const EMAIL = 'casey.teste@exemplo.dev'

function palestraDoTeste() {
  return palestras.find((p) => p.id === PALESTRA_ID)!
}

describe('criarInscricao', () => {
  let inscritosAntes: number

  beforeEach(() => {
    inscritosAntes = palestraDoTeste().inscritos
  })

  afterEach(() => {
    // o repositório em memória muta os arrays de dados.ts; desfaz o que o teste criou
    for (let i = inscricoes.length - 1; i >= 0; i--) {
      const email = inscricoes[i].email.trim().toLowerCase()
      if (email === EMAIL || email.endsWith('@teste.dev')) inscricoes.splice(i, 1)
    }
    palestraDoTeste().inscritos = inscritosAntes
  })

  it('recusa segunda inscrição na mesma palestra variando a capitalização do e-mail', async () => {
    await criarInscricao(PALESTRA_ID, 'Casey Teste', 'Casey.Teste@exemplo.dev')

    await expect(
      criarInscricao(PALESTRA_ID, 'Casey Teste', 'casey.teste@exemplo.dev'),
    ).rejects.toMatchObject({ codigo: 'duplicada' })

    expect(palestraDoTeste().inscritos).toBe(inscritosAntes + 1)
  })

  it('recusa duplicata quando o e-mail vem com espaços ao redor', async () => {
    await criarInscricao(PALESTRA_ID, 'Casey Teste', 'casey.teste@exemplo.dev')

    await expect(
      criarInscricao(PALESTRA_ID, 'Casey Teste', '  casey.teste@exemplo.dev  '),
    ).rejects.toMatchObject({ codigo: 'duplicada' })

    expect(palestraDoTeste().inscritos).toBe(inscritosAntes + 1)
  })

  it('persiste o e-mail normalizado (trim + lowercase)', async () => {
    const inscricao = await criarInscricao(PALESTRA_ID, 'Casey Teste', '  Casey.Teste@Exemplo.DEV ')

    expect(inscricao.email).toBe(EMAIL)

    const doEmail = await listarInscricoesPorEmail('CASEY.TESTE@exemplo.dev')
    expect(doEmail).toHaveLength(1)
    expect(doEmail[0].palestra.id).toBe(PALESTRA_ID)
  })

  it('na corrida pela última vaga, só uma confirma e inscritos não passa do limite', async () => {
    palestraDoTeste().inscritos = palestraDoTeste().vagas - 1

    const resultados = await Promise.all([
      criarInscricao(PALESTRA_ID, 'Ana Corrida', 'ana.corrida@teste.dev'),
      criarInscricao(PALESTRA_ID, 'Bia Corrida', 'bia.corrida@teste.dev'),
    ])

    const statuses = resultados.map((r) => r.status).sort()
    expect(statuses).toEqual(['confirmada', 'em-espera'])
    expect(palestraDoTeste().inscritos).toBe(palestraDoTeste().vagas)
    expect(palestraDoTeste().inscritos).toBeLessThanOrEqual(palestraDoTeste().vagas)

    const emEspera = resultados.find((r) => r.status === 'em-espera')!
    expect(emEspera.posicaoFila).toBe(1)
  })
})

describe('lista de espera', () => {
  let inscritosAntes: number

  beforeEach(() => {
    inscritosAntes = palestraDoTeste().inscritos
    palestraDoTeste().inscritos = palestraDoTeste().vagas
  })

  afterEach(() => {
    palestraDoTeste().inscritos = inscritosAntes
    for (let i = inscricoes.length - 1; i >= 0; i--) {
      if (inscricoes[i].email.endsWith('@teste.dev')) inscricoes.splice(i, 1)
    }
  })

  it('entra na lista de espera com posição 1 quando a palestra está lotada', async () => {
    const inscricao = await criarInscricao(PALESTRA_ID, 'Ana Fila', 'ana@teste.dev')

    expect(inscricao.status).toBe('em-espera')
    expect(inscricao.posicaoFila).toBe(1)
    expect(palestraDoTeste().inscritos).toBe(palestraDoTeste().vagas)
  })

  it('atribui posição 2 à segunda pessoa da fila', async () => {
    await criarInscricao(PALESTRA_ID, 'Ana Fila', 'ana@teste.dev')
    const segunda = await criarInscricao(PALESTRA_ID, 'Bia Fila', 'bia@teste.dev')

    expect(segunda.status).toBe('em-espera')
    expect(segunda.posicaoFila).toBe(2)
    expect(palestraDoTeste().inscritos).toBe(palestraDoTeste().vagas)
  })

  it('recusa duplicata mesmo quando a primeira inscrição está em espera', async () => {
    await criarInscricao(PALESTRA_ID, 'Ana Fila', 'ana@teste.dev')

    await expect(criarInscricao(PALESTRA_ID, 'Ana Fila', 'ana@teste.dev')).rejects.toMatchObject({
      codigo: 'duplicada',
    })
  })

  it('cancela inscrição confirmada, promove o primeiro da fila e mantém inscritos', async () => {
    palestraDoTeste().inscritos = palestraDoTeste().vagas - 1
    const confirmada = await criarInscricao(PALESTRA_ID, 'Ana Vaga', 'ana@teste.dev')
    const espera = await criarInscricao(PALESTRA_ID, 'Bia Fila', 'bia@teste.dev')

    expect(confirmada.status).toBe('confirmada')
    expect(espera.status).toBe('em-espera')
    expect(palestraDoTeste().inscritos).toBe(palestraDoTeste().vagas)

    const resultado = await cancelarInscricao(confirmada.id)

    expect(resultado.promovida?.id).toBe(espera.id)
    expect(resultado.promovida?.status).toBe('confirmada')
    expect(palestraDoTeste().inscritos).toBe(palestraDoTeste().vagas)

    const promovida = await listarInscricoesPorEmail('bia@teste.dev')
    expect(promovida[0].status).toBe('confirmada')
    expect(promovida[0].posicaoFila).toBeUndefined()
  })

  it('libera a vaga ao cancelar inscrição confirmada sem fila', async () => {
    palestraDoTeste().inscritos = palestraDoTeste().vagas - 1
    const confirmada = await criarInscricao(PALESTRA_ID, 'Ana Vaga', 'ana@teste.dev')

    expect(palestraDoTeste().inscritos).toBe(palestraDoTeste().vagas)

    const resultado = await cancelarInscricao(confirmada.id)

    expect(resultado.promovida).toBeUndefined()
    expect(palestraDoTeste().inscritos).toBe(palestraDoTeste().vagas - 1)
  })

  it('sai da fila sem alterar inscritos e reordena quem vem depois', async () => {
    const primeira = await criarInscricao(PALESTRA_ID, 'Ana Fila', 'ana@teste.dev')
    await criarInscricao(PALESTRA_ID, 'Bia Fila', 'bia@teste.dev')

    await cancelarInscricao(primeira.id)

    expect(palestraDoTeste().inscritos).toBe(palestraDoTeste().vagas)
    const bia = await listarInscricoesPorEmail('bia@teste.dev')
    expect(bia[0].status).toBe('em-espera')
    expect(bia[0].posicaoFila).toBe(1)
  })

  it('recusa check-in de inscrição em espera', async () => {
    const espera = await criarInscricao(PALESTRA_ID, 'Ana Fila', 'ana@teste.dev')

    await expect(fazerCheckin(espera.id)).rejects.toMatchObject({ codigo: 'em-espera' })
  })

  it('lança nao-encontrada ao cancelar inscrição inexistente', async () => {
    await expect(cancelarInscricao('inscricao-inexistente')).rejects.toMatchObject({
      codigo: 'nao-encontrada',
    })
  })

  it('expõe status e posição na fila ao listar inscrições por e-mail', async () => {
    await criarInscricao(PALESTRA_ID, 'Ana Fila', 'ana@teste.dev')

    const lista = await listarInscricoesPorEmail('ana@teste.dev')
    expect(lista[0].status).toBe('em-espera')
    expect(lista[0].posicaoFila).toBe(1)
  })

  it('promoverPrimeiroDaFila é no-op quando não há fila', async () => {
    palestraDoTeste().inscritos = palestraDoTeste().vagas - 1

    const promovida = await promoverPrimeiroDaFila(PALESTRA_ID)

    expect(promovida).toBeUndefined()
    expect(palestraDoTeste().inscritos).toBe(palestraDoTeste().vagas - 1)
  })
})
