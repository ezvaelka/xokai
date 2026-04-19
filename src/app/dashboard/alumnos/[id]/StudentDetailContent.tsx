'use client'

import { useState, useTransition } from 'react'
import { useRouter }                from 'next/navigation'
import Link                         from 'next/link'
import { toast }                    from 'sonner'
import { ArrowLeft, Pencil, UserX, Users, Car, FileText, GraduationCap } from 'lucide-react'
import { Button }                   from '@/components/ui/button'
import { ConfirmDialog }            from '@/components/ConfirmDialog'
import StudentForm                  from '../StudentForm'
import { updateStudent, type StudentDetail } from '@/app/actions/students'
import type { GroupItem }                    from '@/app/actions/groups'

type Tab = 'datos' | 'padres' | 'pickup' | 'documentos'

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-xk-border last:border-0">
      <span className="text-xs font-medium text-xk-text-muted uppercase tracking-wider w-40 shrink-0">{label}</span>
      <span className="text-sm text-xk-text text-right break-all">{value || '—'}</span>
    </div>
  )
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
}

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="bg-xk-card border border-xk-border rounded-2xl p-12 text-center">
      <p className="text-sm font-medium text-xk-text mb-1">{label}</p>
      <p className="text-xs text-xk-text-muted">Módulo en desarrollo — disponible próximamente</p>
    </div>
  )
}

export default function StudentDetailContent({
  student,
  groups,
}: {
  student: StudentDetail
  groups:  GroupItem[]
}) {
  const router = useRouter()
  const [tab, setTab]       = useState<Tab>('datos')
  const [editing, setEditing] = useState(false)
  const [deactivating, start] = useTransition()

  function handleDeactivate() {
    start(async () => {
      const res = await updateStudent(student.id, { active: false })
      if (res.error) { toast.error(res.error); return }
      toast.success('Alumno dado de baja')
      router.push('/dashboard/alumnos')
    })
  }

  const TABS: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
    { id: 'datos',      label: 'Datos',      icon: <GraduationCap size={14} /> },
    { id: 'padres',     label: 'Padres',      icon: <Users size={14} /> },
    { id: 'pickup',     label: 'Pickup',      icon: <Car size={14} /> },
    { id: 'documentos', label: 'Documentos',  icon: <FileText size={14} /> },
  ]

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back + Actions */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <Link
          href="/dashboard/alumnos"
          className="inline-flex items-center gap-1.5 text-sm text-xk-text-secondary hover:text-xk-accent"
        >
          <ArrowLeft size={14} /> Volver a alumnos
        </Link>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditing(true)}>
            <Pencil size={13} /> Editar
          </Button>
          {student.active && (
            <ConfirmDialog
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-red-500 border-red-200 hover:bg-red-50"
                  disabled={deactivating}
                >
                  <UserX size={13} /> Dar de baja
                </Button>
              }
              title="¿Dar de baja al alumno?"
              description={`${student.first_name} ${student.last_name} quedará inactivo. Puedes reactivarlo editando el alumno.`}
              confirmLabel="Sí, dar de baja"
              destructive
              onConfirm={handleDeactivate}
            />
          )}
        </div>
      </div>

      {/* Hero card */}
      <div className="bg-xk-card border border-xk-border rounded-2xl p-6 mb-5">
        <div className="flex items-start gap-4">
          {student.photo_url ? (
            <img
              src={student.photo_url}
              alt={`${student.first_name} ${student.last_name}`}
              className="w-16 h-16 rounded-2xl object-cover shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-xk-accent-light flex items-center justify-center shrink-0">
              <span className="text-xl font-bold text-xk-accent">
                {student.first_name[0]}{student.last_name[0]}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <h1 className="font-heading text-2xl font-bold text-xk-text">
              {student.first_name} {student.last_name}
            </h1>
            {student.group_name && (
              <p className="text-sm text-xk-text-secondary mt-0.5">{student.group_name}</p>
            )}
            <span className={[
              'inline-flex mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
              student.active ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500',
            ].join(' ')}>
              {student.active ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-xk-subtle rounded-xl p-1 mb-5 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={[
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex-1 justify-center',
              tab === t.id
                ? 'bg-white shadow-sm text-xk-text'
                : 'text-xk-text-muted hover:text-xk-text',
            ].join(' ')}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'datos' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <section className="bg-xk-card border border-xk-border rounded-2xl p-5">
            <h2 className="font-heading text-base font-semibold text-xk-text mb-3">General</h2>
            <Row label="Matrícula"         value={student.student_code} />
            <Row label="Fecha nacimiento"  value={fmtDate(student.date_of_birth)} />
            <Row label="CURP"              value={student.curp} />
            <Row label="Grupo"             value={student.group_name} />
            <Row label="Nivel"             value={student.group_level} />
          </section>

          <section className="bg-xk-card border border-xk-border rounded-2xl p-5">
            <h2 className="font-heading text-base font-semibold text-xk-text mb-3">Salud</h2>
            <Row label="Alergias"      value={student.allergies} />
            <Row label="Notas médicas" value={student.medical_notes} />
          </section>
        </div>
      )}

      {tab === 'padres'     && <ComingSoon label="Padres y tutores" />}
      {tab === 'pickup'     && <ComingSoon label="Historial de pickup" />}
      {tab === 'documentos' && <ComingSoon label="Documentos del alumno" />}

      {editing && (
        <StudentForm
          student={student}
          groups={groups}
          onClose={() => setEditing(false)}
          onSuccess={() => { setEditing(false); router.refresh() }}
        />
      )}
    </div>
  )
}
