import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getSchoolDetail, type SchoolStatus } from '@/app/actions/sysadmin'
import SchoolActions from './SchoolActions'

const STATUS_BADGE: Record<Exclude<SchoolStatus, 'all'>, { label: string; className: string }> = {
  active:     { label: 'Activa',        className: 'bg-green-100 text-green-700 border-green-200' },
  onboarding: { label: 'En onboarding', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  paused:     { label: 'Pausada',       className: 'bg-zinc-100 text-zinc-700 border-zinc-200' },
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function Row({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-xk-border last:border-0">
      <span className="text-xs font-medium text-xk-text-muted uppercase tracking-wider w-40 shrink-0">{label}</span>
      <span className="text-sm text-xk-text text-right break-words">{value || '—'}</span>
    </div>
  )
}

export default async function SchoolDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let detail
  try {
    detail = await getSchoolDetail(id)
  } catch {
    notFound()
  }

  const { school, status, users, studentCount, groupCount } = detail
  const badge = STATUS_BADGE[status]

  return (
    <div className="max-w-5xl mx-auto">
      <Link
        href="/sysadmin/schools"
        className="inline-flex items-center gap-1.5 text-sm text-xk-text-secondary hover:text-xk-accent mb-4"
      >
        <ArrowLeft size={14} /> Volver a escuelas
      </Link>

      {/* Header */}
      <div className="bg-xk-card border border-xk-border rounded-2xl p-6 mb-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-heading text-2xl font-bold text-xk-text">{school.name}</h1>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${badge.className}`}>
                {badge.label}
              </span>
            </div>
            {school.short_name && (
              <p className="text-sm text-xk-text-secondary">{school.short_name}</p>
            )}
            <p className="text-xs text-xk-text-muted mt-1">ID · {school.id}</p>
          </div>

          <div className="flex gap-6 text-sm">
            <div>
              <p className="text-xs text-xk-text-muted uppercase tracking-wider">Alumnos</p>
              <p className="font-mono text-xl font-bold text-xk-text">{studentCount}</p>
            </div>
            <div>
              <p className="text-xs text-xk-text-muted uppercase tracking-wider">Grupos</p>
              <p className="font-mono text-xl font-bold text-xk-text">{groupCount}</p>
            </div>
            <div>
              <p className="text-xs text-xk-text-muted uppercase tracking-wider">Usuarios</p>
              <p className="font-mono text-xl font-bold text-xk-text">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-xk-border">
          <SchoolActions schoolId={school.id} isActive={school.active} schoolName={school.name} />
        </div>
      </div>

      {/* Datos generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <section className="bg-xk-card border border-xk-border rounded-2xl p-5">
          <h2 className="font-heading text-base font-semibold text-xk-text mb-3">Contacto</h2>
          <Row label="Email"    value={school.email} />
          <Row label="Teléfono" value={school.phone} />
          <Row label="Dirección" value={school.address} />
          <Row label="Ciudad"   value={school.city} />
          <Row label="Estado"   value={school.state} />
          <Row label="Timezone" value={school.timezone} />
        </section>

        <section className="bg-xk-card border border-xk-border rounded-2xl p-5">
          <h2 className="font-heading text-base font-semibold text-xk-text mb-3">Datos fiscales</h2>
          <Row label="RFC"            value={school.rfc} />
          <Row label="Razón social"   value={school.razon_social} />
          <Row label="CP fiscal"      value={school.cp_fiscal} />
          <Row label="Régimen fiscal" value={school.regimen_fiscal} />
          <Row label="Uso CFDI"       value={school.uso_cfdi} />
        </section>

        <section className="bg-xk-card border border-xk-border rounded-2xl p-5">
          <h2 className="font-heading text-base font-semibold text-xk-text mb-3">Pickup</h2>
          <Row label="Inicio"    value={school.pickup_start} />
          <Row label="Fin"       value={school.pickup_end} />
          <Row label="Tolerancia (min)" value={school.pickup_tolerance_mins} />
        </section>

        <section className="bg-xk-card border border-xk-border rounded-2xl p-5">
          <h2 className="font-heading text-base font-semibold text-xk-text mb-3">Estado</h2>
          <Row label="Activa"                value={school.active ? 'Sí' : 'No'} />
          <Row label="Onboarding completo"   value={school.onboarding_completed ? 'Sí' : 'No'} />
          <Row label="Creada"                value={fmtDate(school.created_at)} />
        </section>
      </div>

      {/* Usuarios */}
      <section className="bg-xk-card border border-xk-border rounded-2xl mt-5 overflow-hidden">
        <div className="px-5 py-4 border-b border-xk-border">
          <h2 className="font-heading text-base font-semibold text-xk-text">Usuarios de la escuela</h2>
        </div>
        {users.length === 0 ? (
          <div className="p-6 text-sm text-xk-text-muted text-center">Sin usuarios registrados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-xk-subtle border-b border-xk-border">
                <tr className="text-xs font-semibold text-xk-text-muted uppercase tracking-wider">
                  <th className="text-left px-5 py-2.5">Nombre</th>
                  <th className="text-left px-5 py-2.5">Email</th>
                  <th className="text-left px-5 py-2.5">Rol</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const fullName = [u.first_name, u.last_name].filter(Boolean).join(' ') || '—'
                  return (
                    <tr key={u.id} className="border-b border-xk-border last:border-0">
                      <td className="px-5 py-2.5 text-xk-text">{fullName}</td>
                      <td className="px-5 py-2.5 text-xk-text-secondary">{u.email ?? '—'}</td>
                      <td className="px-5 py-2.5">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-xk-subtle text-xk-text-secondary">
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
