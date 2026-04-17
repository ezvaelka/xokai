import { cn } from '@/lib/utils'

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'neutral'

const TONE: Record<Tone, { bg: string; fg: string; dot: string }> = {
  success: { bg: 'bg-emerald-50',       fg: 'text-emerald-700', dot: 'bg-emerald-500' },
  warning: { bg: 'bg-amber-50',         fg: 'text-amber-800',   dot: 'bg-amber-500' },
  danger:  { bg: 'bg-red-50',           fg: 'text-red-700',     dot: 'bg-red-500' },
  info:    { bg: 'bg-sky-50',           fg: 'text-sky-700',     dot: 'bg-sky-500' },
  accent:  { bg: 'bg-xk-accent-light',  fg: 'text-xk-accent-dark', dot: 'bg-xk-accent' },
  neutral: { bg: 'bg-xk-subtle',        fg: 'text-xk-text-secondary', dot: 'bg-xk-text-muted' },
}

type Props = {
  tone?:     Tone
  children:  React.ReactNode
  className?: string
  dot?:      boolean
}

export function StatusBadge({ tone = 'neutral', children, className, dot = true }: Props) {
  const t = TONE[tone]
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium',
      t.bg, t.fg, className,
    )}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', t.dot)} />}
      {children}
    </span>
  )
}
