'use client'

import { useState, useTransition } from 'react'
import Link                         from 'next/link'
import { useRouter }                from 'next/navigation'
import { toast }                    from 'sonner'
import { ArrowLeft, Pencil, Archive, Users, GraduationCap } from 'lucide-react'
import { Button }                   from '@/components/ui/button'
import { ConfirmDialog }            from '@/components/ConfirmDialog'
import GroupForm                    from '../GroupForm'
import { updateGroup, type GroupDetail, type TeacherOption } from '@/app/actions/groups'

interface Props {
  detail:   GroupDetail
  teachers: TeacherOption[]
}

function teacherName(id: string | null, teachers: TeacherOption[]): string | null {
  if (!id) return null
  const t = teachers.find(t => t.id === id)
  return t ? [t.first_name, t.last_name].filter(Boolean).join(' ').trim() || null : null
}

export default function GroupDetailClient({ detail, teachers }: Props) {
  const router   = useRouter()
  const [showEdit, setShowEdit] = useState(false)
  const [archiving, startArchive] = useTransition()

  const activeStudents   = detail.students.filter(s => s.active)
  const inactiveStudents = detail.students.filter(s => !s.active)

  const primaryName   = detail.teacher_name
  const spanishName   = teacherName(detail.teacher_spanish_id, teachers)
  const assistantName = teacherName(detail.teacher_assistant_id, teachers)

  function handleArchive() {
    startArchive(async () => {
      const res = await updateGroup(detail.id, { active: false })
      if (res.error) { toast.error(res.error); return }
      toast.success('Grupo archivado')
      router.push('/dashboard/grupos')
    })
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back + Actions */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <Link
          href="/dashboard/grupos"
          className="inline-flex items-center gap-1.5 text-sm text-xk-text-secondary hover:text-xk-accent"
        >
          <ArrowLeft size={14} /> Volver a grupos
        </Link>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setShowEdit(true)}
          >
            <Pencil size={13} /> Editar
          </Button>

          {detail.active && (
            <ConfirmDialog
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xk-warning border-xk-warning/30 hover:bg-amber-50"
                  disabled={archiving}
                >
                  <Archive size={13} /> Archivar
                </Button>
              }
              title={`¿Archivar "${detail.name}"?`}
              description="El grupo quedará inactivo. Los alumnos no serán eliminados. Puedes reactivarlo después editando el grupo."
              confirmLabel="Sí, archivar"
              onConfirm={handleArchive}
            />
          )}
        </div>
      </div>

      {/* Hero card */}
      <div className="bg-xk-card border border-xk-border rounded-2xl p-6 mb-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-heading text-2xl font-bold text-xk-text">{detail.name}</h1>
              {!detail.active && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                  Archivado
                </span>
              )}
            </div>
            {detail.level && <p className="text-sm text-xk-text-secondary">{detail.level}</p>}
            <p className="text-xs text-xk-text-muted mt-1">Ciclo: {detail.academic_year}</p>
          </div>

          <div className="flex gap-6 text-sm shrink-0">
            <div className="text-center">
              <p className="text-xs text-xk-text-muted uppercase tracking-wider">Alumnos</p>
              <p className="font-mono text-2xl font-bold text-xk-text">{activeStudents.length}</p>
            </div>
            {detail.grade && (
              <div className="text-center">
                <p className="text-xs text-xk-text-muted uppercase tracking-wider">Grado</p>
                <p className="font-mono text-2xl font-bold text-xk-text">{detail.grade}°</p>
              </div>
            )}
          </div>
        </div>

        {/* Teachers */}
        {(primaryName || spanishName || assistantName) && (
          <div className="mt-5 pt-4 border-t border-xk-border">
            <div className="flex items-center gap-1.5 mb-3">
              <GraduationCap size={13} className="text-xk-text-muted" />
              <p className="text-xs font-medium text-xk-text-muted uppercase tracking-wider">Maestros</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {primaryName && (
                <div className="bg-xk-subtle rounded-xl p-3">
                  <p className="text-xs text-xk-text-muted mb-0.5">Principal (Inglés)</p>
                  <p className="text-sm font-medium text-xk-text">{primaryName}</p>
                </div>
              )}
              {spanishName && (
                <div className="bg-xk-subtle rounded-xl p-3">
                  <p className="text-xs text-xk-text-muted mb-0.5">Español</p>
                  <p className="text-sm font-medium text-xk-text">{spanishName}</p>
                </div>
              )}
              {assistantName && (
                <div className="bg-xk-subtle rounded-xl p-3">
                  <p className="text-xs text-xk-text-muted mb-0.5">Asistente</p>
                  <p className="text-sm font-medium text-xk-text">{assistantName}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Alumnos activos */}
      <section className="bg-xk-card border border-xk-border rounded-2xl overflow-hidden mb-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-xk-border">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-xk-text-muted" />
            <h2 className="font-heading text-base font-semibold text-xk-text">
              Alumnos activos ({activeStudents.length})
            </h2>
          </div>
          <Link
            href={`/dashboard/alumnos?group=${detail.id}`}
            className="text-xs text-xk-accent hover:underline"
          >
            Ver en módulo →
          </Link>
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
            {activeStudents.map(s => (
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
            {inactiveStudents.map(s => (
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

      {/* Edit modal */}
      {showEdit && (
        <GroupForm
          group={detail}
          teachers={teachers}
          onClose={() => setShowEdit(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  )
}
