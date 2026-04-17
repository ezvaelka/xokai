import { notFound }     from 'next/navigation'
import Link              from 'next/link'
import { ArrowLeft }     from 'lucide-react'
import DashboardShell    from '@/components/DashboardShell'
import { getGroup }      from '@/app/actions/groups'

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let detail
  try { detail = await getGroup(id) }
  catch { notFound() }

  const activeStudents   = detail.students.filter((s) => s.active)
  const inactiveStudents = detail.students.filter((s) => !s.active)

  return (
    <DashboardShell activeHref="/dashboard/grupos">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/dashboard/grupos"
          className="inline-flex items-center gap-1.5 text-sm text-xk-text-secondary hover:text-xk-accent mb-4"
        >
          <ArrowLeft size={14} /> Volver a grupos
        </Link>

        {/* Header */}
        <div className="bg-xk-card border border-xk-border rounded-2xl p-6 mb-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-heading text-2xl font-bold text-xk-text">{detail.name}</h1>
              {detail.level && <p className="text-sm text-xk-text-secondary mt-0.5">{detail.level}</p>}
              <p className="text-xs text-xk-text-muted mt-1">Año: {detail.academic_year}</p>
            </div>
            <div className="flex gap-6 text-sm">
              <div>
                <p className="text-xs text-xk-text-muted uppercase tracking-wider">Alumnos activos</p>
                <p className="font-mono text-2xl font-bold text-xk-text">{activeStudents.length}</p>
              </div>
              {detail.grade && (
                <div>
                  <p className="text-xs text-xk-text-muted uppercase tracking-wider">Grado</p>
                  <p className="font-mono text-2xl font-bold text-xk-text">{detail.grade}°</p>
                </div>
              )}
            </div>
          </div>
          {detail.teacher_name && (
            <p className="mt-4 text-sm text-xk-text-secondary">
              <span className="font-medium">Maestro/a titular:</span> {detail.teacher_name}
            </p>
          )}
        </div>

        {/* Alumnos activos */}
        <section className="bg-xk-card border border-xk-border rounded-2xl overflow-hidden mb-4">
          <div className="px-5 py-4 border-b border-xk-border">
            <h2 className="font-heading text-base font-semibold text-xk-text">
              Alumnos ({activeStudents.length})
            </h2>
          </div>
          {activeStudents.length === 0 ? (
            <div className="p-8 text-center text-sm text-xk-text-muted">
              No hay alumnos activos en este grupo.{' '}
              <Link href="/dashboard/alumnos" className="text-xk-accent hover:underline">
                Registrar alumnos →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-xk-border">
              {activeStudents.map((s) => (
                <Link
                  key={s.id}
                  href={`/dashboard/alumnos/${s.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-xk-subtle transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-xk-accent-light flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-xk-accent">
                        {s.first_name[0]}{s.last_name[0]}
                      </span>
                    </div>
                    <span className="text-sm text-xk-text font-medium">
                      {s.first_name} {s.last_name}
                    </span>
                  </div>
                  {s.student_code && (
                    <span className="text-xs text-xk-text-muted font-mono">{s.student_code}</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Alumnos inactivos */}
        {inactiveStudents.length > 0 && (
          <section className="bg-xk-card border border-xk-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-xk-border">
              <h2 className="font-heading text-base font-semibold text-xk-text-muted">
                Inactivos ({inactiveStudents.length})
              </h2>
            </div>
            <div className="divide-y divide-xk-border">
              {inactiveStudents.map((s) => (
                <div key={s.id} className="flex items-center justify-between px-5 py-3 opacity-50">
                  <span className="text-sm text-xk-text">{s.first_name} {s.last_name}</span>
                  {s.student_code && (
                    <span className="text-xs text-xk-text-muted font-mono">{s.student_code}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </DashboardShell>
  )
}
