import * as React from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  /** Slot for the primary action button (or any node) */
  action?: React.ReactNode
  className?: string
  /** Si se provee, muestra un enlace "Volver" encima del título */
  backHref?: string
}

/**
 * PageHeader — encabezado estándar de página.
 * Patrón: título Fraunces + descripción + botón de acción a la derecha.
 * Úsalo como primer elemento de cualquier page.tsx del dashboard.
 */
export function PageHeader({ title, description, action, className, backHref }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 pb-5 mb-6 border-b border-xk-border', className)}>
      <div className="min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 text-xs text-xk-text-muted hover:text-xk-text mb-2 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Volver
          </Link>
        )}
        <h1 className="font-heading text-[28px] font-bold text-xk-text leading-tight tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-xk-text-secondary leading-relaxed">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
    </div>
  )
}
