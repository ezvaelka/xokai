import * as React from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  /** Slot for the primary action button (or any node) */
  action?: React.ReactNode
  className?: string
}

/**
 * PageHeader — encabezado estándar de página.
 * Patrón: título Fraunces + descripción + botón de acción a la derecha.
 * Úsalo como primer elemento de cualquier page.tsx del dashboard.
 */
export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-7', className)}>
      <div className="min-w-0">
        <h1 className="font-heading text-2xl font-bold text-xk-text leading-tight tracking-tight truncate">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-xk-text-secondary">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
