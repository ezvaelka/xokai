'use client'

import { useState, useTransition, useRef }   from 'react'
import { toast }                              from 'sonner'
import { Loader2, X, Camera, Upload }         from 'lucide-react'
import { Button }                             from '@/components/ui/button'
import { supabase }                           from '@/lib/supabase/client'
import { createStudent, updateStudent, type StudentDetail, type CreateStudentInput } from '@/app/actions/students'
import type { GroupItem } from '@/app/actions/groups'

interface Props {
  student?: StudentDetail
  groups:   GroupItem[]
  onClose:  () => void
  onSuccess?: () => void
}

const CURP_REGEX = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9]{2}$/i

const inputClass = "w-full rounded-xl border border-xk-border bg-xk-bg px-3 py-2.5 text-sm text-xk-text placeholder:text-xk-text-muted focus:outline-none focus:ring-2 focus:ring-xk-accent focus:border-transparent"

export default function StudentForm({ student, groups, onClose, onSuccess }: Props) {
  const [pending, start]        = useTransition()
  const [uploading, setUpload]  = useState(false)
  const [preview, setPreview]   = useState<string | null>(student?.photo_url ?? null)
  const fileRef                 = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<CreateStudentInput>({
    first_name:    student?.first_name    ?? '',
    last_name:     student?.last_name     ?? '',
    student_code:  student?.student_code  ?? '',
    group_id:      student?.group_id      ?? null,
    date_of_birth: student?.date_of_birth ?? '',
    curp:          student?.curp          ?? '',
    allergies:     student?.allergies     ?? '',
    medical_notes: student?.medical_notes ?? '',
    photo_url:     student?.photo_url     ?? null,
  })

  function set(k: keyof CreateStudentInput, v: string | null) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('La foto no puede ser mayor a 5 MB'); return }
    if (!file.type.startsWith('image/')) { toast.error('Solo se aceptan imágenes'); return }

    setUpload(true)
    try {
      const ext  = file.name.split('.').pop() ?? 'jpg'
      const path = `students/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('student-photos')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('student-photos')
        .getPublicUrl(path)

      setPreview(publicUrl)
      set('photo_url', publicUrl)
    } catch (err) {
      toast.error('No se pudo subir la foto. Verifica el almacenamiento.')
      console.error(err)
    } finally {
      setUpload(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.first_name.trim()) { toast.error('El nombre es requerido'); return }
    if (!form.last_name.trim())  { toast.error('El apellido es requerido'); return }

    const curpVal = form.curp?.trim().toUpperCase() || null
    if (curpVal && !CURP_REGEX.test(curpVal)) {
      toast.error('CURP inválida — debe tener 18 caracteres en formato correcto')
      return
    }

    const payload: CreateStudentInput = {
      first_name:    form.first_name.trim(),
      last_name:     form.last_name.trim(),
      student_code:  form.student_code?.trim()  || null,
      group_id:      form.group_id               || null,
      date_of_birth: form.date_of_birth?.trim()  || null,
      curp:          curpVal,
      allergies:     form.allergies?.trim()      || null,
      medical_notes: form.medical_notes?.trim()  || null,
      photo_url:     form.photo_url              ?? null,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-xk-border shrink-0">
          <h2 className="font-heading text-lg font-bold text-xk-text">
            {student ? 'Editar alumno' : 'Registrar alumno'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-xk-subtle transition-colors">
            <X size={16} className="text-xk-text-muted" />
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          {/* Photo */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {preview ? (
                <img src={preview} alt="Foto del alumno" className="w-16 h-16 rounded-full object-cover border-2 border-xk-border" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-xk-subtle flex items-center justify-center border-2 border-dashed border-xk-border">
                  <Camera size={20} className="text-xk-text-muted" />
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                  <Loader2 size={16} className="animate-spin text-white" />
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1">Foto</p>
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-xs text-xk-accent hover:text-xk-accent-dark font-medium disabled:opacity-50"
              >
                <Upload size={12} />
                {preview ? 'Cambiar foto' : 'Subir foto'}
              </button>
              <p className="text-xs text-xk-text-muted mt-0.5">JPG, PNG · máx 5 MB</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </div>
          </div>

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">Nombre *</label>
              <input value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="Sofía" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">Apellido *</label>
              <input value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Ramírez" className={inputClass} />
            </div>
          </div>

          {/* Matrícula y Fecha de nacimiento */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">Matrícula</label>
              <input
                value={form.student_code ?? ''}
                onChange={e => set('student_code', e.target.value || null)}
                placeholder="Ej: 2024-001"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">Fecha de nacimiento</label>
              <input
                type="date"
                value={form.date_of_birth ?? ''}
                onChange={e => set('date_of_birth', e.target.value || null)}
                className={inputClass}
              />
            </div>
          </div>

          {/* CURP */}
          <div>
            <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">CURP</label>
            <input
              value={form.curp ?? ''}
              onChange={e => set('curp', e.target.value.toUpperCase() || null)}
              placeholder="Ej: RARJ920315HJCMZS01"
              maxLength={18}
              className={`${inputClass} font-mono tracking-wider`}
            />
            {form.curp && form.curp.length > 0 && !CURP_REGEX.test(form.curp) && (
              <p className="text-xs text-red-500 mt-1">CURP inválida — 18 caracteres requeridos</p>
            )}
          </div>

          {/* Grupo */}
          <div>
            <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">Grupo</label>
            <select
              value={form.group_id ?? ''}
              onChange={e => set('group_id', e.target.value || null)}
              className={inputClass}
            >
              <option value="">Sin grupo</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name} — {g.academic_year}</option>
              ))}
            </select>
          </div>

          {/* Alergias */}
          <div>
            <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">Alergias</label>
            <input
              value={form.allergies ?? ''}
              onChange={e => set('allergies', e.target.value || null)}
              placeholder="Ej: Cacahuate, gluten"
              className={inputClass}
            />
          </div>

          {/* Notas médicas */}
          <div>
            <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">Notas médicas</label>
            <textarea
              value={form.medical_notes ?? ''}
              onChange={e => set('medical_notes', e.target.value || null)}
              rows={2}
              placeholder="Ej: Usa inhalador, epipen disponible en enfermería"
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" disabled={pending || uploading} className="flex-1 gap-2">
              {pending && <Loader2 size={14} className="animate-spin" />}
              {student ? 'Guardar cambios' : 'Registrar alumno'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
