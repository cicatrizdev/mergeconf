import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { buscarInscricoes, cancelarInscricao, inscrever, ErroApi } from '../lib/api'
import { useAgenda } from '../hooks/useAgenda'
import type { Palestra, StatusInscricao } from '../types'

type InscricaoAtual = { id?: string; status: StatusInscricao; posicaoFila?: number }

export function FormInscricao({ palestra }: { palestra: Palestra }) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [estado, setEstado] = useState<'parado' | 'enviando' | 'sucesso' | 'erro'>('parado')
  const [mensagem, setMensagem] = useState('')
  const [inscricaoAtual, setInscricaoAtual] = useState<InscricaoAtual | null>(null)
  const { agenda, adicionar, atualizar, remover } = useAgenda()

  const itemAgenda = agenda.find((item) => item.palestra.id === palestra.id)
  const inscricaoExibida: InscricaoAtual | null =
    inscricaoAtual ?? (itemAgenda ? { id: itemAgenda.inscricaoId, status: itemAgenda.status } : null)
  const jaInscrito = inscricaoExibida?.status === 'confirmada'
  const lotada = palestra.inscritos >= palestra.vagas

  async function verificarInscricao() {
    if (!email.includes('@')) return
    try {
      const inscricoes = await buscarInscricoes(email)
      const encontrada = inscricoes.find((i) => i.palestra.id === palestra.id)
      if (!encontrada) {
        setInscricaoAtual(null)
        return
      }
      setInscricaoAtual({
        id: encontrada.id,
        status: encontrada.status,
        posicaoFila: encontrada.posicaoFila,
      })
      if (itemAgenda) {
        atualizar(palestra.id, { inscricaoId: encontrada.id, status: encontrada.status })
      }
    } catch {
      // consulta falhou: segue com o estado local; a API ainda barra duplicata no envio
    }
  }

  async function enviar() {
    if (estado === 'enviando' || jaInscrito) return
    setEstado('enviando')
    try {
      const inscricao = await inscrever(palestra.id, nome, email)
      adicionar(palestra, { id: inscricao.id, status: inscricao.status })
      setInscricaoAtual({
        id: inscricao.id,
        status: inscricao.status,
        posicaoFila: inscricao.posicaoFila,
      })
      setEstado('sucesso')
      setMensagem(
        inscricao.status === 'em-espera'
          ? `Você entrou na lista de espera · posição ${inscricao.posicaoFila}`
          : 'Inscrição confirmada! Nos vemos lá.',
      )
    } catch (erro) {
      if (erro instanceof ErroApi && erro.codigo === 'duplicada') {
        // já estava inscrito na API (ex.: outro dispositivo): sincroniza o estado local
        adicionar(palestra)
        setInscricaoAtual({ status: 'confirmada' })
        setEstado('parado')
        setMensagem('')
        return
      }
      setEstado('erro')
      setMensagem(erro instanceof Error ? erro.message : 'Não foi possível concluir a inscrição')
    }
  }

  async function sairDaFila() {
    const id = inscricaoExibida?.id
    if (!id) return
    try {
      await cancelarInscricao(id)
    } catch (erro) {
      if (!(erro instanceof ErroApi && erro.codigo === 'nao-encontrada')) {
        setEstado('erro')
        setMensagem(erro instanceof Error ? erro.message : 'Não foi possível sair da fila')
        return
      }
    }
    remover(palestra.id)
    setInscricaoAtual(null)
    setEstado('parado')
  }

  if (estado === 'sucesso') {
    const espera = inscricaoExibida?.status === 'em-espera'
    return (
      <p className={`text-sm font-medium ${espera ? 'text-amber-600' : 'text-emerald-600'}`}>{mensagem}</p>
    )
  }

  const rotulo = jaInscrito
    ? 'Você já está inscrito'
    : estado === 'enviando'
      ? 'Enviando…'
      : lotada
        ? 'Entrar na lista de espera'
        : 'Inscrever-se'

  return (
    <div className="flex max-w-sm flex-col gap-3">
      <Input placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} />
      <Input
        placeholder="Seu e-mail"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value)
          setInscricaoAtual(null)
        }}
        onBlur={verificarInscricao}
      />
      {estado === 'erro' && <p className="text-sm text-red-600">{mensagem}</p>}
      {inscricaoExibida?.status === 'em-espera' ? (
        <>
          <p className="text-sm text-amber-700">
            Você está na lista de espera · posição {inscricaoExibida.posicaoFila}
          </p>
          <Button variant="outline" onClick={sairDaFila}>
            Sair da fila
          </Button>
        </>
      ) : (
        <div
          className={
            'flex h-9 cursor-pointer items-center justify-center rounded-md bg-conf px-4 text-sm font-medium text-white hover:bg-violet-700 ' +
            (jaInscrito || estado === 'enviando' ? 'pointer-events-none opacity-50' : '')
          }
          onClick={enviar}
        >
          {rotulo}
        </div>
      )}
    </div>
  )
}
