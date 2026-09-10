import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { criarInscricao, listarInscricoesPorEmail } from './inscricoes'
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
      if (inscricoes[i].email.trim().toLowerCase() === EMAIL) inscricoes.splice(i, 1)
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
})
