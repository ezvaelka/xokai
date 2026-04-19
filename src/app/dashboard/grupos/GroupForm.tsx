'use client'

import { useState, useTransition } from 'react'
import { toast }                    from 'sonner'
import { Loader2, X }               from 'lucide-react'
import { Button }                   from '@/components/ui/button'
import { createGroup, updateGroup, type GroupItem, type CreateGroupInput, type TeacherOption } from '@/app/actions/groups'

interface Props {
  group?:     GroupItem
  teachers:   TeacherOption[]
  onClose:    () => void
  onSuccess?: () => void
}

const CURRENT_YEAR = new Date().getFullYear()
const DEFAULT_YEAR = `${CURRENT_YEAR}-${CURRENT_YEAR + 1}`

const GRADE_OPTIONS: Array<{ label: string; grade: number | null; level: string | null }> = [
  { label: 'Maternal',         grade: null, level: 'Maternal'   },
  { label: 'Kinder',           grade: null, level: 'Kinder'     },
  { label: '1° Primaria',      grade: 1,    level: 'Primaria'   },
  { label: '2° Primaria',      grade: 2,    level: 'Primaria'   },
  { label: '3° Primaria',      grade: 3,    level: 'Primaria'   },
  { label: '4° Primaria',      grade: 4,    level: 'Primaria'   },
  { label: '5° Primaria',      grade: 5,    level: 'Primaria'   },
  { label: '6° Primaria',      grade: 6,    level: 'Primaria'   },
  { label: '1° Secundaria',    grade: 1,    level: 'Secundaria' },
  { label: '2° Secundaria',    grade: 2,    level: 'Secundaria' },
  { label: '3° Secundaria',    grade: 3,    level: 'Secundaria' },
  { label: 'Preparatoria',     grade: null, level: 'Prepa'      },
]

function gradeKey(grade: number | null, level: string | null): string {
  const opt = GRADE_OPTIONS.find(o => o.grade === grade && o.level === level)
  return opt?.label ?? ''
}

function teacherLabel(t: TeacherOption) {
  return [t.first_name, t.last_name].filter(Boolean).join(' ').trim()
}

export default function GroupForm({ group, teachers, onClose, onSuccess }: Props) {
  const [pending, start] = useTransition()
  const [form, setForm] = useState<CreateGroupInput>({
    name:                 group?.name                 ?? '',
    grade:                group?.grade                ?? null,
    level:                group?.level                ?? null,
    academic_year:        group?.academic_year        ?? DEFAULT_YEAR,
    teacher_primary_id:   group?.teacher_primary_id   ?? null,
    teacher_spanish_id:   group?.teacher_spanish_id   ?? null,
    teacher_assistant_id: group?.teacher_assistant_id ?? null,
  })

  const [gradeSelection, setGradeSelection] = useState<string>(
    gradeKey(group?.grade ?? null, group?.level ?? null)
  )

  function set<K extends keyof CreateGroupInput>(k: K, v: CreateGroupInput[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function handleGradeChange(label: string) {
    setGradeSelection(label)
    const opt = GRADE_OPTIONS.find(o => o.label === label)
    if (opt) {
      set('grade', opt.grade)
      set('level', opt.level)
    } else {
      set('grade', null)
      set('level', null)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('El nombre del grupo es requerido'); return }
    if (!form.academic_year.trim()) { toast.error('El ciclo escolar es requerido'); return }

    start(async () => {
      const res = group
        ? await updateGroup(group.id, form)
        : await createGroup(form)

      if (res.error) { toast.error(res.error); return }
      toast.success(group ? 'Grupo actualizado' : 'Grupo creado')
      onSuccess?.()
      onClose()
    })
  }

  const selectClass = "w-full rounded-xl border border-xk-border bg-xk-bg px-3 py-2.5 text-sm text-xk-text focus:outline-none focus:ring-2 focus:ring-xk-accent focus:border-transparent"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header — sticky */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-xk-border shrink-0">
          <h2 className="font-heading text-lg font-bold text-xk-text">
            {group ? 'Editar grupo' : 'Nuevo grupo'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-xk-subtle transition-colors">
            <X size={16} className="text-xk-text-muted" />
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          {/* Nombre */}
          <div>
            <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">
              Nombre del grupo *
            </label>
            <input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Ej: 1°A, Kinder B, Secundaria 3"
              className={selectClass}
            />
          </div>

          {/* Grado / Nivel */}
          <div>
            <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">
              Grado / Nivel
            </label>
            <select
              value={gradeSelection}
              onChange={(e) => handleGradeChange(e.target.value)}
              className={selectClass}
            >
              <option value="">Sin especificar</option>
              {GRADE_OPTIONS.map(o => (
                <option key={o.label} value={o.label}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Ciclo escolar */}
          <div>
            <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">
              Ciclo escolar *
            </label>
            <input
              value={form.academic_year}
              onChange={(e) => set('academic_year', e.target.value)}
              placeholder={DEFAULT_YEAR}
              className={selectClass}
            />
          </div>

          {/* Maestros */}
          <div className="border-t border-xk-border pt-4">
            <p className="text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-3">
              Maestros asignados
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-xk-text-secondary mb-1.5">
                  Maestro/a Principal (Inglés)
                </label>
                <select
                  value={form.teacher_primary_id ?? ''}
                  onChange={(e) => set('teacher_primary_id', e.target.value || null)}
                  className={selectClass}
                >
                  <option value="">Sin asignar</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{teacherLabel(t)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-xk-text-secondary mb-1.5">
                  Maestro/a de Español
                </label>
                <select
                  value={form.teacher_spanish_id ?? ''}
                  onChange={(e) => set('teacher_spanish_id', e.target.value || null)}
                  className={selectClass}
                >
                  <option value="">Sin asignar</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{teacherLabel(t)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-xk-text-secondary mb-1.5">
                  Maestro/a Asistente
                </label>
                <select
                  value={form.teacher_assistant_id ?? ''}
                  onChange={(e) => set('teacher_assistant_id', e.target.value || null)}
                  className={selectClass}
                >
                  <option value="">Sin asignar</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{teacherLabel(t)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={pending} className="flex-1 gap-2">
              {pending && <Loader2 size={14} className="animate-spin" />}
              {group ? 'Guardar cambios' : 'Crear grupo'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
