'use client'

import { useState }  from 'react'
import { useRouter } from 'next/navigation'
import Link          from 'next/link'
import { ArrowLeft, Pencil } from 'lucide-react'
import StudentForm   from '../StudentForm'
import type { StudentDetail } from '@/app/actions/students'
import type { GroupItem }     from '@/app/actions/groups'

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-xk-border last:border-0">
      <span className="text-xs font-medium text-xk-text-muted uppercase tracking-wider w-36 shrink-0">{label}</span>
      <span className="text-sm text-xk-text text-right break-words">{value || '—'}</span>
    </div>
  )
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function StudentDetailContent({
  student,
  groups,
}: {
  student: StudentDetail
  groups:  GroupItem[]
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/dashboard/alumnos"
        className="inline-flex items-center gap-1.5 text-sm text-xk-text-secondary hover:text-xk-accent mb-4"
      >
        <ArrowLeft size={14} /> Volver a alumnos
      </Link>

      {/* Header */}
      <div className="bg-xk-card border border-xk-border rounded-2xl p-6 mb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-xk-accent-light flex items-center justify-center shrink-0">
              <span className="text-xl font-bold text-xk-accent">
                {student.first_name[0]}{student.last_name[0]}
              </span>
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-xk-text">
                {student.first_name} {student.last_name}
              </h1>
              {student.group_name && (
                <p className="text-sm text-xk-text-secondary mt-0.5">{student.group_name}</p>
              )}
              <span className={[
                'inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-medium',
                student.active ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500',
              ].join(' ')}>
                {student.active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-xk-border text-xs font-medium text-xk-text-secondary hover:bg-xk-subtle transition-colors"
          >
            <Pencil size={13} /> Editar
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <section className="bg-xk-card border border-xk-border rounded-2xl p-5">
          <h2 className="font-heading text-base font-semibold text-xk-text mb-3">Datos generales</h2>
          <Row label="Matrícula"        value={student.student_code} />
          <Row label="Fecha nacimiento" value={fmtDate(student.date_of_birth)} />
          <Row label="Grupo"            value={student.group_name} />
        </section>

        <section className="bg-xk-card border border-xk-border rounded-2xl p-5">
          <h2 className="font-heading text-base font-semibold text-xk-text mb-3">Salud</h2>
          <Row label="Alergias"      value={student.allergies} />
          <Row label="Notas médicas" value={student.medical_notes} />
        </section>
      </div>

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
