import * as React from 'react'
import { Badge, type BadgeProps } from '@/components/ui/badge'

type StatusConfig = {
  label: string
  variant: BadgeProps['variant']
}

// ─── Pickup event statuses ────────────────────────────────────────────────────
const PICKUP_EVENT: Record<string, StatusConfig> = {
  waiting:   { label: 'En espera',  variant: 'warning' },
  called:    { label: 'Llamado',    variant: 'default' },
  delivered: { label: 'Entregado',  variant: 'success' },
  cancelled: { label: 'Cancelado',  variant: 'destructive' },
}

// ─── Pickup session statuses ──────────────────────────────────────────────────
const PICKUP_SESSION: Record<string, StatusConfig> = {
  scheduled: { label: 'Programada', variant: 'secondary' },
  active:    { label: 'En curso',   variant: 'success' },
  closed:    { label: 'Cerrada',    variant: 'outline' },
}

// ─── Generic active / inactive ───────────────────────────────────────────────
const ACTIVE: Record<string, StatusConfig> = {
  true:  { label: 'Activo',   variant: 'success' },
  false: { label: 'Inactivo', variant: 'outline' },
}

type StatusType = 'pickup_event' | 'pickup_session' | 'active'

interface StatusBadgeProps {
  type: StatusType
  value: string | boolean
  className?: string
}

const STATUS_MAP: Record<StatusType, Record<string, StatusConfig>> = {
  pickup_event:    PICKUP_EVENT,
  pickup_session:  PICKUP_SESSION,
  active:          ACTIVE,
}

/**
 * StatusBadge — badge de estado semánticamente correcto.
 *
 * @example
 * <StatusBadge type="pickup_event" value="waiting" />
 * <StatusBadge type="active" value={student.active} />
 */
export function StatusBadge({ type, value, className }: StatusBadgeProps) {
  const key = String(value)
  const map = STATUS_MAP[type]
  const config = map[key] ?? { label: key, variant: 'secondary' as const }

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}
