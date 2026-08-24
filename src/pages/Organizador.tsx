import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { listarPalestras } from '../lib/api'
import type { Palestra } from '../types'

export function Organizador() {
  const [palestras, setPalestras] = useState<Palestra[]>([])

  useEffect(() => {
    listarPalestras().then(setPalestras)
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold">Área do organizador</h1>
      <p className="mt-1 text-zinc-500">Ocupação das salas e horários da edição 2026.</p>

      <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500">
              <th className="px-4 py-3">Sessão</th>
              <th className="px-4 py-3">Sala</th>
              <th className="px-4 py-3">Início</th>
              <th className="px-4 py-3">Fim</th>
              <th className="px-4 py-3 text-right">Ocupação</th>
            </tr>
          </thead>
          <tbody>
            {palestras.map((palestra) => {
              const ocupacao = Math.round((palestra.inscritos / palestra.vagas) * 100)
              return (
                <tr key={palestra.id} className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{palestra.titulo}</p>
                    <p className="text-xs text-zinc-500">{palestra.palestrante}</p>
                  </td>
                  <td className="px-4 py-3">{palestra.sala}</td>
                  <td className="px-4 py-3 font-mono text-xs">{palestra.inicio}</td>
                  <td className="px-4 py-3 font-mono text-xs">{palestra.fim}</td>
                  <td className="px-4 py-3 text-right">
                    <Badge variant={ocupacao >= 90 ? 'carreira' : 'neutro'}>
                      {palestra.inscritos}/{palestra.vagas} · {ocupacao}%
                    </Badge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
