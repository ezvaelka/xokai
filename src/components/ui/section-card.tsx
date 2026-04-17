import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  title?:       ReactNode
  description?: ReactNode
  actions?:     ReactNode
  children:     ReactNode
  className?:   string
  bodyClassName?: string
  padding?:     'default' | 'tight' | 'flush'
}

export function SectionCard({ title, description, actions, children, className, bodyClassName, padding = 'default' }: Props) {
  return (
    <section className={cn('xk-surface-elevated overflow-hidden', className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-xk-border/50">
          <div className="min-w-0">
            {title && <h2 className="text-sm font-semibold text-xk-text">{title}</h2>}
            {description && <p className="text-xs text-xk-text-muted mt-0.5">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}
      <div className={cn(
        padding === 'default' && 'p-5',
        padding === 'tight'   && 'p-3',
        padding === 'flush'   && 'p-0',
        bodyClassName,
      )}>
        {children}
      </div>
    </section>
  )
}
