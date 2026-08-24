import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { inscrever } from '../lib/api'
import { useAgenda } from '../hooks/useAgenda'
import type { Palestra } from '../types'

export function FormInscricao({ palestra }: { palestra: Palestra }) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [estado, setEstado] = useState<'parado' | 'enviando' | 'sucesso' | 'erro'>('parado')
  const [mensagem, setMensagem] = useState('')
  const { agenda, adicionar } = useAgenda()

  const jaInscrito = agenda.some((p) => p.id === palestra.id)

  async function enviar() {
    if (estado === 'enviando' || jaInscrito) return
    setEstado('enviando')
    try {
      await inscrever(palestra.id, nome, email)
      adicionar(palestra)
      setEstado('sucesso')
      setMensagem('Inscrição confirmada! Nos vemos lá.')
    } catch (erro) {
      setEstado('erro')
      setMensagem(erro instanceof Error ? erro.message : 'Não foi possível concluir a inscrição')
    }
  }

  if (estado === 'sucesso') {
    return <p className="text-sm font-medium text-emerald-600">{mensagem}</p>
  }

  return (
    <div className="flex max-w-sm flex-col gap-3">
      <Input placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} />
      <Input placeholder="Seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
      {estado === 'erro' && <p className="text-sm text-red-600">{mensagem}</p>}
      <div
        className={
          'flex h-9 cursor-pointer items-center justify-center rounded-md bg-conf px-4 text-sm font-medium text-white hover:bg-violet-700 ' +
          (jaInscrito || estado === 'enviando' ? 'pointer-events-none opacity-50' : '')
        }
        onClick={enviar}
      >
        {jaInscrito ? 'Você já está inscrito' : estado === 'enviando' ? 'Enviando…' : 'Inscrever-se'}
      </div>
    </div>
  )
}
