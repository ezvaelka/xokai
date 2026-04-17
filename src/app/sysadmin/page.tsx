import Link from 'next/link'
import { getSysadminMetrics } from '@/app/actions/sysadmin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import MetricsChart from './MetricsChart'
import {
  Building2, Users, TrendingUp, Clock, CheckCircle2,
  PauseCircle, AlertCircle, ArrowRight, Plus,
} from 'lucide-react'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

const STATUS_CONFIG = {
  active:     { label: 'Activa',      className: 'bg-green-100 text-green-700 border-green-200' },
  onboarding: { label: 'Onboarding',  className: 'bg-amber-100 text-amber-700 border-amber-200' },
  paused:     { label: 'Pausada',     className: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
  pending:    { label: 'Por aprobar', className: 'bg-orange-100 text-orange-700 border-orange-200' },
} as const

export default async function SysadminDashboard() {
  const m = await getSysadminMetrics()

  const statCards = [
    {
      title: 'Escuelas activas',
      value: m.activeSchools,
      total: m.totalSchools,
      icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
      bg: 'bg-green-50',
      border: 'border-green-200',
      href: '/sysadmin/schools?status=active',
    },
    {
      title: 'Total alumnos',
      value: m.totalStudents,
      icon: <Users className="w-5 h-5 text-xk-accent" />,
      bg: 'bg-xk-accent-light',
      border: 'border-xk-accent-medium',
      href: '/sysadmin/schools',
    },
    {
      title: 'MRR estimado',
      value: `$${m.mrrUsd.toLocaleString('en-US')} USD`,
      icon: <TrendingUp className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      href: null,
    },
    {
      title: 'En onboarding',
      value: m.onboardingSchools,
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      href: '/sysadmin/schools?status=onboarding',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-xk-text">Dashboard</h1>
          <p className="text-sm text-xk-text-secondary mt-1">Vista global de la plataforma Xokai.</p>
        </div>
        <Link
          href="/sysadmin/schools/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-xk-accent text-white text-sm font-medium hover:bg-xk-accent-dark transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nueva escuela
        </Link>
      </div>

      {/* Alerta: escuelas pendientes de aprobación */}
      {m.pendingSchools > 0 && (
        <Link
          href="/sysadmin/schools?status=pending"
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-50 border border-orange-300 hover:bg-orange-100 transition-colors"
        >
          <AlertCircle className="w-5 h-5 text-orange-600 shrink-0" />
          <p className="text-sm font-medium text-orange-800">
            {m.pendingSchools === 1
              ? '1 escuela esperando aprobación'
              : `${m.pendingSchools} escuelas esperando aprobación`}
          </p>
          <ArrowRight className="w-4 h-4 text-orange-500 ml-auto shrink-0" />
        </Link>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const inner = (
            <Card className={`border ${card.border} ${card.bg} hover:shadow-md transition-shadow h-full`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-semibold text-xk-text-secondary uppercase tracking-wide">
                    {card.title}
                  </CardTitle>
                  <div className="w-8 h-8 rounded-lg bg-white/70 flex items-center justify-center">
                    {card.icon}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-xk-text tabular-nums">{card.value}</p>
                {card.total !== undefined && (
                  <p className="text-xs text-xk-text-muted mt-1">de {card.total} totales</p>
                )}
              </CardContent>
            </Card>
          )
          return card.href
            ? <Link key={card.title} href={card.href} className="block">{inner}</Link>
            : <div key={card.title}>{inner}</div>
        })}
      </div>

      {/* Fila: Chart + Stats secundarios */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Chart: escuelas por mes */}
        <div className="lg:col-span-2">
          <Card className="border-xk-border h-full">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-xk-text">Nuevas escuelas por mes</CardTitle>
            </CardHeader>
            <CardContent>
              <MetricsChart data={m.schoolsByMonth} />
            </CardContent>
          </Card>
        </div>

        {/* Distribución por status */}
        <Card className="border-xk-border">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-xk-text">Distribución</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Activas',     value: m.activeSchools,     color: 'bg-green-500' },
              { label: 'Onboarding',  value: m.onboardingSchools, color: 'bg-amber-500' },
              { label: 'Por aprobar', value: m.pendingSchools,    color: 'bg-orange-500' },
              { label: 'Pausadas',    value: m.pausedSchools,     color: 'bg-zinc-400' },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-xk-text-secondary">{row.label}</span>
                  <span className="text-xs font-semibold text-xk-text tabular-nums">{row.value}</span>
                </div>
                <div className="w-full h-1.5 bg-xk-subtle rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${row.color} transition-all`}
                    style={{ width: m.totalSchools > 0 ? `${(row.value / m.totalSchools) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}

            <div className="pt-3 border-t border-xk-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-xk-text-muted">Total escuelas</span>
                <span className="text-sm font-bold text-xk-text">{m.totalSchools}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-xk-text-muted">Pausadas</span>
                <span className="text-xs text-xk-text-secondary flex items-center gap-1">
                  <PauseCircle className="w-3 h-3" /> {m.pausedSchools}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Escuelas recientes */}
      <Card className="border-xk-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-xk-text">Escuelas recientes</CardTitle>
            <Link href="/sysadmin/schools" className="text-xs text-xk-accent hover:underline font-medium flex items-center gap-1">
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {m.recentSchools.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-xk-text-muted">
              No hay escuelas registradas aún.
            </div>
          ) : (
            <div className="divide-y divide-xk-border">
              {m.recentSchools.map((s) => (
                <Link
                  key={s.id}
                  href={`/sysadmin/schools/${s.id}`}
                  className="flex items-center justify-between gap-4 px-6 py-3.5 hover:bg-xk-subtle/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-xk-accent-light flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-xk-accent" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-xk-text truncate">{s.name}</p>
                      <p className="text-xs text-xk-text-muted">{s.city ?? '—'} · {fmtDate(s.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="hidden sm:block text-xs text-xk-text-muted tabular-nums">
                      {s.student_count} alumnos
                    </span>
                    <Badge className={`text-xs border ${STATUS_CONFIG[s.status].className}`}>
                      {STATUS_CONFIG[s.status].label}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
