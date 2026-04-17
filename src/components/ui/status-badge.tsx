import { cn } from '@/lib/utils'

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'neutral'

type StatusConfig = {
  label: string
  tone: Tone
}

const TONE: Record<Tone, { bg: string; fg: string; border: string; dot: string }> = {
  success: { bg: 'bg-green-500/10',  fg: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500' },
  warning: { bg: 'bg-yellow-500/10', fg: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500' },
  danger:  { bg: 'bg-red-500/10',    fg: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500' },
  info:    { bg: 'bg-blue-500/10',   fg: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500' },
  accent:  { bg: 'bg-violet-500/10', fg: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500' },
  neutral: { bg: 'bg-zinc-500/10',   fg: 'text-zinc-600',   border: 'border-zinc-200',   dot: 'bg-zinc-400' },
}

// School statuses (para escuelas en sysadmin)
export const SCHOOL_STATUS: Record<string, StatusConfig> = {
  active:     { label: 'Activo',     tone: 'success' },
  pending:    { label: 'Pendiente',  tone: 'warning' },
  onboarding: { label: 'Onboarding', tone: 'info' },
  paused:     { label: 'Pausado',    tone: 'neutral' },
  trial:      { label: 'Trial',      tone: 'accent' },
  suspended:  { label: 'Suspendido', tone: 'danger' },
}

type Props = {
  tone?:      Tone
  children:   React.ReactNode
  className?: string
  dot?:       boolean
}

export function StatusBadge({ tone = 'neutral', children, className, dot = true }: Props) {
  const t = TONE[tone]
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border',
      t.bg, t.fg, t.border, className,
    )}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', t.dot)} />}
      {children}
    </span>
  )
}

/** Convierte un status de escuela en un <StatusBadge> listo para usar */
export function SchoolStatusBadge({ status, className }: { status: string; className?: string }) {
  const config = SCHOOL_STATUS[status] ?? { label: status, tone: 'neutral' as Tone }
  return (
    <StatusBadge tone={config.tone} className={className}>
      {config.label}
    </StatusBadge>
  )
}
