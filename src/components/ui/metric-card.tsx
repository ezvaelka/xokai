import { ArrowDown, ArrowRight, ArrowUp, type LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

type Trend = 'up' | 'down' | 'neutral'

type Props = {
  label:       string
  value:       ReactNode
  sublabel?:   string
  icon?:       LucideIcon
  iconTone?:   'accent' | 'success' | 'warning' | 'danger' | 'neutral'
  delta?:      { value: string; trend: Trend }
  footer?:     ReactNode
}

const ICON_TONE: Record<NonNullable<Props['iconTone']>, { bg: string; fg: string }> = {
  accent:  { bg: 'bg-xk-accent-light',    fg: 'text-xk-accent' },
  success: { bg: 'bg-emerald-50',         fg: 'text-emerald-600' },
  warning: { bg: 'bg-amber-50',           fg: 'text-amber-600' },
  danger:  { bg: 'bg-red-50',             fg: 'text-red-600' },
  neutral: { bg: 'bg-xk-subtle',          fg: 'text-xk-text-secondary' },
}

const TREND_TONE: Record<Trend, { bg: string; fg: string; Icon: typeof ArrowUp }> = {
  up:      { bg: 'bg-emerald-50', fg: 'text-emerald-700', Icon: ArrowUp },
  down:    { bg: 'bg-red-50',     fg: 'text-red-700',     Icon: ArrowDown },
  neutral: { bg: 'bg-xk-subtle',  fg: 'text-xk-text-secondary', Icon: ArrowRight },
}

export function MetricCard({ label, value, sublabel, icon: Icon, iconTone = 'accent', delta, footer }: Props) {
  const tone = ICON_TONE[iconTone]
  const TrendIcon = delta ? TREND_TONE[delta.trend].Icon : null
  return (
    <div className="group xk-surface-elevated p-5 flex flex-col justify-between min-h-[128px] hover:-translate-y-0.5 hover:shadow-lg hover:border-xk-border transition-all duration-200 ease-out cursor-default">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[11px] font-medium text-xk-text-secondary uppercase tracking-wider">
          {label}
        </span>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg ${tone.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200`}>
            <Icon className={`w-4 h-4 ${tone.fg}`} />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="flex items-baseline gap-2.5">
          <span className="xk-metric-number text-[34px] leading-none text-xk-text group-hover:text-xk-accent transition-colors duration-200">
            {value}
          </span>
          {delta && TrendIcon && (
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-medium ${TREND_TONE[delta.trend].bg} ${TREND_TONE[delta.trend].fg}`}>
              <TrendIcon className="w-3 h-3" />
              {delta.value}
            </span>
          )}
        </div>
        {sublabel && (
          <p className="text-xs text-xk-text-muted mt-1.5">{sublabel}</p>
        )}
      </div>

      {footer && <div className="mt-3 pt-3 border-t border-xk-border/50">{footer}</div>}
    </div>
  )
}
