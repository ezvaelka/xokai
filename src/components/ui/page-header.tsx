import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { ReactNode } from 'react'

export type Crumb = { label: string; href?: string }

type Props = {
  crumbs?:     Crumb[]
  title:       string
  description?: ReactNode
  actions?:    ReactNode
  kicker?:     ReactNode
}

export function PageHeader({ crumbs, title, description, actions, kicker }: Props) {
  return (
    <div className="mb-6">
      {crumbs && crumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-xs text-xk-text-muted mb-3">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="w-3 h-3 opacity-50" />}
              {c.href ? (
                <Link href={c.href} className="hover:text-xk-text transition-colors">{c.label}</Link>
              ) : (
                <span className="text-xk-text">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {kicker && <div className="mb-1.5">{kicker}</div>}
          <h1 className="font-heading text-[26px] leading-tight font-semibold tracking-tight text-xk-text">
            {title}
          </h1>
          {description && (
            <div className="mt-1.5 text-sm text-xk-text-secondary max-w-2xl">{description}</div>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  )
}
