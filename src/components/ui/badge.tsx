import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variante = 'default' | 'frontend' | 'backend' | 'ia' | 'carreira' | 'neutro'

const variantes: Record<Variante, string> = {
  default: 'bg-conf-soft text-conf',
  frontend: 'bg-sky-100 text-sky-700',
  backend: 'bg-emerald-100 text-emerald-700',
  ia: 'bg-violet-100 text-violet-700',
  carreira: 'bg-amber-100 text-amber-700',
  neutro: 'bg-zinc-100 text-zinc-600',
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variante
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        variantes[variant],
        className,
      )}
      {...props}
    />
  )
}
