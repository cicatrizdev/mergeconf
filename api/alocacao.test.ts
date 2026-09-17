import { describe, expect, it } from 'vitest'
import { haConflitoDeSala, salasLivres } from './alocacao'
import type { Palestra } from '../src/types'

const dia = (hora: string) => `2026-10-24T${hora}:00-03:00`

function palestra(campos: Pick<Palestra, 'id' | 'sala' | 'inicio' | 'fim'> & Partial<Palestra>): Palestra {
  return {
    titulo: 'Talk de teste',
    palestrante: 'Palestrante Teste',
    trilha: 'backend',
    tipo: 'talk',
    vagas: 80,
    inscritos: 10,
    descricao: 'Descrição de teste.',
    ...campos,
  }
}

describe('haConflitoDeSala', () => {
  it('detecta conflito quando a candidata está totalmente contida na ocupante', () => {
    const ocupante = palestra({
      id: 'ocupante',
      sala: 'Sala Rubber Duck',
      inicio: dia('10:00'),
      fim: dia('12:00'),
    })

    expect(
      haConflitoDeSala([ocupante], {
        sala: 'Sala Rubber Duck',
        inicio: dia('10:30'),
        fim: dia('11:00'),
      }),
    ).toBe(ocupante)
  })

  it('detecta conflito quando a ocupante está totalmente contida na candidata', () => {
    const ocupante = palestra({
      id: 'ocupante',
      sala: 'Sala Rubber Duck',
      inicio: dia('10:30'),
      fim: dia('11:00'),
    })

    expect(
      haConflitoDeSala([ocupante], {
        sala: 'Sala Rubber Duck',
        inicio: dia('10:00'),
        fim: dia('12:00'),
      }),
    ).toBe(ocupante)
  })

  it('detecta conflito quando o início da candidata cai dentro da ocupante', () => {
    const ocupante = palestra({
      id: 'ocupante',
      sala: 'Sala Rubber Duck',
      inicio: dia('10:00'),
      fim: dia('11:00'),
    })

    expect(
      haConflitoDeSala([ocupante], {
        sala: 'Sala Rubber Duck',
        inicio: dia('10:30'),
        fim: dia('11:30'),
      }),
    ).toBe(ocupante)
  })

  it('detecta conflito quando o fim da candidata cai dentro da ocupante', () => {
    const ocupante = palestra({
      id: 'ocupante',
      sala: 'Sala Rubber Duck',
      inicio: dia('10:00'),
      fim: dia('11:00'),
    })

    expect(
      haConflitoDeSala([ocupante], {
        sala: 'Sala Rubber Duck',
        inicio: dia('09:30'),
        fim: dia('10:30'),
      }),
    ).toBe(ocupante)
  })

  it('retorna a palestra ocupante quando a janela é exatamente a mesma na mesma sala', () => {
    const ocupante = palestra({
      id: 'ocupante',
      sala: 'Sala Rubber Duck',
      inicio: dia('10:00'),
      fim: dia('11:00'),
    })

    expect(
      haConflitoDeSala([ocupante], {
        sala: 'Sala Rubber Duck',
        inicio: dia('10:00'),
        fim: dia('11:00'),
      }),
    ).toBe(ocupante)
  })

  it('não conflita quando a mesma janela está em sala diferente', () => {
    const ocupante = palestra({
      id: 'ocupante',
      sala: 'Sala Rubber Duck',
      inicio: dia('10:00'),
      fim: dia('11:00'),
    })

    expect(
      haConflitoDeSala([ocupante], {
        sala: 'Sala Stack Overflow',
        inicio: dia('10:00'),
        fim: dia('11:00'),
      }),
    ).toBeUndefined()
  })

  it('ignora a ocupante cujo id foi passado em ignorarId', () => {
    const ocupante = palestra({
      id: 'ocupante',
      sala: 'Sala Rubber Duck',
      inicio: dia('10:00'),
      fim: dia('11:00'),
    })

    expect(
      haConflitoDeSala(
        [ocupante],
        {
          sala: 'Sala Rubber Duck',
          inicio: dia('10:00'),
          fim: dia('11:00'),
        },
        ocupante.id,
      ),
    ).toBeUndefined()
  })

  it('não conflita quando o fim da ocupante coincide com o início da candidata', () => {
    const ocupante = palestra({
      id: 'ocupante',
      sala: 'Sala Rubber Duck',
      inicio: dia('10:00'),
      fim: dia('11:00'),
    })

    expect(
      haConflitoDeSala([ocupante], {
        sala: 'Sala Rubber Duck',
        inicio: dia('11:00'),
        fim: dia('12:00'),
      }),
    ).toBeUndefined()
  })

  it('não conflita quando o fim da candidata coincide com o início da ocupante', () => {
    const ocupante = palestra({
      id: 'ocupante',
      sala: 'Sala Rubber Duck',
      inicio: dia('10:00'),
      fim: dia('11:00'),
    })

    expect(
      haConflitoDeSala([ocupante], {
        sala: 'Sala Rubber Duck',
        inicio: dia('09:00'),
        fim: dia('10:00'),
      }),
    ).toBeUndefined()
  })

  it('retorna undefined quando não há palestras', () => {
    expect(
      haConflitoDeSala([], {
        sala: 'Sala Rubber Duck',
        inicio: dia('10:00'),
        fim: dia('11:00'),
      }),
    ).toBeUndefined()
  })
})

describe('salasLivres', () => {
  it('lista cada sala uma única vez', () => {
    const palestras = [
      palestra({ id: 'a1', sala: 'Sala Rubber Duck', inicio: dia('10:00'), fim: dia('11:00') }),
      palestra({ id: 'b1', sala: 'Sala Stack Overflow', inicio: dia('10:00'), fim: dia('11:00') }),
      palestra({ id: 'c1', sala: 'Auditório Legacy', inicio: dia('14:00'), fim: dia('15:00') }),
    ]

    expect(salasLivres(palestras, dia('16:00'), dia('17:00'))).toEqual([
      'Sala Rubber Duck',
      'Sala Stack Overflow',
      'Auditório Legacy',
    ])
  })

  it('omite a sala ocupada na janela', () => {
    const palestras = [
      palestra({ id: 'a1', sala: 'Sala Rubber Duck', inicio: dia('10:00'), fim: dia('11:00') }),
      palestra({ id: 'b1', sala: 'Sala Stack Overflow', inicio: dia('14:00'), fim: dia('15:00') }),
    ]

    expect(salasLivres(palestras, dia('10:00'), dia('11:00'))).toEqual(['Sala Stack Overflow'])
  })

  it('inclui a sala livre na janela', () => {
    const palestras = [
      palestra({ id: 'a1', sala: 'Sala Rubber Duck', inicio: dia('10:00'), fim: dia('11:00') }),
      palestra({ id: 'b1', sala: 'Sala Stack Overflow', inicio: dia('14:00'), fim: dia('15:00') }),
    ]

    expect(salasLivres(palestras, dia('10:00'), dia('11:00'))).toContain('Sala Stack Overflow')
  })

  it('ainda lista a sala quando as janelas são adjacentes', () => {
    const palestras = [
      palestra({ id: 'a1', sala: 'Sala Rubber Duck', inicio: dia('10:00'), fim: dia('11:00') }),
    ]

    expect(salasLivres(palestras, dia('11:00'), dia('12:00'))).toEqual(['Sala Rubber Duck'])
  })

  it('omite a sala quando as janelas se sobrepõem', () => {
    const palestras = [
      palestra({ id: 'a1', sala: 'Sala Rubber Duck', inicio: dia('10:00'), fim: dia('11:00') }),
    ]

    expect(salasLivres(palestras, dia('10:30'), dia('11:30'))).toEqual([])
  })

  it('retorna lista vazia quando não há palestras', () => {
    expect(salasLivres([], dia('10:00'), dia('11:00'))).toEqual([])
  })

  it('não duplica sala quando duas palestras usam a mesma sala', () => {
    const palestras = [
      palestra({ id: 'a1', sala: 'Sala Rubber Duck', inicio: dia('10:00'), fim: dia('11:00') }),
      palestra({ id: 'a2', sala: 'Sala Rubber Duck', inicio: dia('14:00'), fim: dia('15:00') }),
    ]

    expect(salasLivres(palestras, dia('16:00'), dia('17:00'))).toEqual(['Sala Rubber Duck'])
  })
})
