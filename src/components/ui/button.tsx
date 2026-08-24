import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

type Variante = 'default' | 'outline' | 'ghost' | 'destructive'

const variantes: Record<Variante, string> = {
  default: 'bg-conf text-white hover:bg-violet-700',
  outline: 'border border-zinc-300 bg-white hover:bg-zinc-100',
  ghost: 'hover:bg-zinc-100',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variante
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex h-9 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
        variantes[variant],
        className,
      )}
      {...props}
    />
  ),
)
Button.displayName = 'Button'
