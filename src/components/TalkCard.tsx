import { Link } from 'react-router-dom'
import { MapPin, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatarHora } from '../lib/format'
import type { Palestra } from '../types'

const rotulosTipo = { keynote: 'Keynote', workshop: 'Workshop', talk: null } as const

export function TalkCard({ palestra }: { palestra: Palestra }) {
  const vagasRestantes = palestra.vagas - palestra.inscritos
  const rotulo = rotulosTipo[palestra.tipo]

  return (
    <Link to={`/palestra/${palestra.id}`} className="block">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant={palestra.trilha}>{palestra.trilha}</Badge>
            {rotulo && <Badge variant="neutro">{rotulo}</Badge>}
          </div>
          <CardTitle>{palestra.titulo}</CardTitle>
          <p className="text-sm text-zinc-500">{palestra.palestrante}</p>
        </CardHeader>
        <CardContent className="flex items-center gap-4 text-sm text-zinc-600">
          <span className="font-medium">
            {palestra.remanejadaDe && (
              <span className="mr-1 text-zinc-400">{formatarHora(palestra.remanejadaDe)}</span>
            )}
            {formatarHora(palestra.inicio)}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" aria-hidden />
            {palestra.sala}
          </span>
          <span className="ml-auto inline-flex items-center gap-1">
            <Users className="size-3.5" aria-hidden />
            {vagasRestantes} vagas
          </span>
        </CardContent>
      </Card>
    </Link>
  )
}
