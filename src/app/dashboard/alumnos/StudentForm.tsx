'use client'

import { useState, useTransition }   from 'react'
import { toast }                      from 'sonner'
import { Loader2, X }                 from 'lucide-react'
import { Button }                     from '@/components/ui/button'
import { createStudent, updateStudent, type StudentDetail, type CreateStudentInput } from '@/app/actions/students'
import type { GroupItem } from '@/app/actions/groups'

interface Props {
  student?: StudentDetail
  groups:   GroupItem[]
  onClose:  () => void
  onSuccess?: () => void
}

export default function StudentForm({ student, groups, onClose, onSuccess }: Props) {
  const [pending, start] = useTransition()
  const [form, setForm] = useState<CreateStudentInput>({
    first_name:    student?.first_name    ?? '',
    last_name:     student?.last_name     ?? '',
    student_code:  student?.student_code  ?? '',
    group_id:      student?.group_id      ?? null,
    date_of_birth: student?.date_of_birth ?? '',
    allergies:     student?.allergies     ?? '',
    medical_notes: student?.medical_notes ?? '',
  })

  function set(k: keyof CreateStudentInput, v: string | null) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.first_name.trim()) { toast.error('El nombre es requerido'); return }
    if (!form.last_name.trim())  { toast.error('El apellido es requerido'); return }

    const payload: CreateStudentInput = {
      first_name:    form.first_name.trim(),
      last_name:     form.last_name.trim(),
      student_code:  form.student_code?.trim()  || null,
      group_id:      form.group_id               || null,
      date_of_birth: form.date_of_birth?.trim()  || null,
      allergies:     form.allergies?.trim()      || null,
      medical_notes: form.medical_notes?.trim()  || null,
    }

    start(async () => {
      const res = student
        ? await updateStudent(student.id, payload)
        : await createStudent(payload)

      if (res.error) { toast.error(res.error); return }
      toast.success(student ? 'Alumno actualizado' : 'Alumno registrado')
      onSuccess?.()
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-xk-border">
          <h2 className="font-heading text-lg font-bold text-xk-text">
            {student ? 'Editar alumno' : 'Registrar alumno'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-xk-subtle transition-colors">
            <X size={16} className="text-xk-text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">
                Nombre *
              </label>
              <input
                value={form.first_name}
                onChange={(e) => set('first_name', e.target.value)}
                placeholder="Sofía"
                className="w-full rounded-xl border border-xk-border bg-xk-bg px-3 py-2.5 text-sm text-xk-text placeholder:text-xk-text-muted focus:outline-none focus:ring-2 focus:ring-xk-accent focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">
                Apellido *
              </label>
              <input
                value={form.last_name}
                onChange={(e) => set('last_name', e.target.value)}
                placeholder="Ramírez"
                className="w-full rounded-xl border border-xk-border bg-xk-bg px-3 py-2.5 text-sm text-xk-text placeholder:text-xk-text-muted focus:outline-none focus:ring-2 focus:ring-xk-accent focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">
                Matrícula
              </label>
              <input
                value={form.student_code ?? ''}
                onChange={(e) => set('student_code', e.target.value || null)}
                placeholder="Ej: 2024-001"
                className="w-full rounded-xl border border-xk-border bg-xk-bg px-3 py-2.5 text-sm text-xk-text placeholder:text-xk-text-muted focus:outline-none focus:ring-2 focus:ring-xk-accent focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">
                Fecha de nacimiento
              </label>
              <input
                type="date"
                value={form.date_of_birth ?? ''}
                onChange={(e) => set('date_of_birth', e.target.value || null)}
                className="w-full rounded-xl border border-xk-border bg-xk-bg px-3 py-2.5 text-sm text-xk-text focus:outline-none focus:ring-2 focus:ring-xk-accent focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">
              Grupo
            </label>
            <select
              value={form.group_id ?? ''}
              onChange={(e) => set('group_id', e.target.value || null)}
              className="w-full rounded-xl border border-xk-border bg-xk-bg px-3 py-2.5 text-sm text-xk-text focus:outline-none focus:ring-2 focus:ring-xk-accent focus:border-transparent"
            >
              <option value="">Sin grupo</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name} — {g.academic_year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">
              Alergias
            </label>
            <input
              value={form.allergies ?? ''}
              onChange={(e) => set('allergies', e.target.value || null)}
              placeholder="Ej: Cacahuate, gluten"
              className="w-full rounded-xl border border-xk-border bg-xk-bg px-3 py-2.5 text-sm text-xk-text placeholder:text-xk-text-muted focus:outline-none focus:ring-2 focus:ring-xk-accent focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">
              Notas médicas
            </label>
            <textarea
              value={form.medical_notes ?? ''}
              onChange={(e) => set('medical_notes', e.target.value || null)}
              rows={2}
              placeholder="Ej: Usa inhalador, epipen disponible en enfermería"
              className="w-full rounded-xl border border-xk-border bg-xk-bg px-3 py-2.5 text-sm text-xk-text placeholder:text-xk-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-xk-accent focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={pending} className="flex-1 gap-2">
              {pending && <Loader2 size={14} className="animate-spin" />}
              {student ? 'Guardar cambios' : 'Registrar alumno'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
