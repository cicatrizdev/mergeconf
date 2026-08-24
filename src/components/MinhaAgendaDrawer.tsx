import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAgenda } from '../hooks/useAgenda'
import { duracaoEmMinutos, formatarHora } from '../lib/format'

export function MinhaAgendaDrawer({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  const { agenda, remover } = useAgenda()

  const totalHoras =
    agenda
      .filter((p) => p.tipo === 'talk')
      .reduce((total, p) => total + duracaoEmMinutos(p.inicio, p.fim), 0) / 60

  if (!aberto) return null

  return (
    <aside className="fixed inset-y-0 right-0 z-20 flex w-80 flex-col border-l border-zinc-200 bg-white shadow-xl">
      <header className="flex items-center justify-between border-b border-zinc-200 p-4">
        <h2 className="font-semibold">Minha Agenda</h2>
        <Button variant="ghost" onClick={onFechar} aria-label="Fechar">
          <X className="size-4" />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {agenda.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Você ainda não adicionou nenhuma palestra. Explore a grade e monte seu dia.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {agenda.map((palestra) => (
              <li key={palestra.id} className="rounded-md border border-zinc-200 p-3">
                <p className="text-sm font-medium">{palestra.titulo}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {formatarHora(palestra.inicio)} · {palestra.sala}
                </p>
                <button
                  className="mt-2 text-xs text-red-600 hover:underline"
                  onClick={() => {
                    remover
                  }}
                >
                  Remover da agenda
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <footer className="border-t border-zinc-200 p-4 text-sm text-zinc-600">
        {agenda.length} sessões · {totalHoras.toFixed(1)}h de conteúdo
      </footer>
    </aside>
  )
}
