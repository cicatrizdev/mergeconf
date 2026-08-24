import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { buscarInscricoes, fazerCheckin } from '../lib/api'
import { formatarHora } from '../lib/format'
import type { InscricaoComPalestra } from '../types'

export function CheckIn() {
  const [email, setEmail] = useState('')
  const [inscricoes, setInscricoes] = useState<InscricaoComPalestra[] | null>(null)

  async function buscar() {
    setInscricoes(await buscarInscricoes(email))
  }

  async function checkin(inscricaoId: string) {
    await fazerCheckin(inscricaoId)
    await buscar()
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold">Check-in</h1>
      <p className="mt-1 text-zinc-500">Busque pelo e-mail usado na inscrição.</p>

      <form
        className="mt-6 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          buscar()
        }}
      >
        <label htmlFor="email-checkin" className="sr-only">
          E-mail do participante
        </label>
        <Input
          id="email-checkin"
          type="email"
          placeholder="participante@exemplo.dev"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit">Buscar</Button>
      </form>

      {inscricoes && (
        <ul className="mt-6 flex flex-col gap-3">
          {inscricoes.length === 0 && (
            <p className="text-sm text-zinc-500">Nenhuma inscrição encontrada para este e-mail.</p>
          )}
          {inscricoes.map((inscricao) => (
            <li
              key={inscricao.id}
              className="flex items-center justify-between rounded-md border border-zinc-200 bg-white p-4"
            >
              <div>
                <p className="font-medium">{inscricao.palestra.titulo}</p>
                <p className="mt-0.5 text-sm text-zinc-500">
                  {formatarHora(inscricao.palestra.inicio)} · {inscricao.palestra.sala}
                </p>
              </div>
              {inscricao.checkinEm ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                  <CheckCircle2 className="size-4" aria-hidden />
                  Presente
                </span>
              ) : (
                <Button variant="outline" onClick={() => checkin(inscricao.id)}>
                  Check-in
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
