'use client'

import { useState, useTransition } from 'react'
import { useRouter }                from 'next/navigation'
import Link                         from 'next/link'
import { toast }                    from 'sonner'
import { ArrowLeft, Pencil, UserX, Users, Car, FileText, GraduationCap, Plus, Trash2, Loader2, Camera, Upload } from 'lucide-react'
import { Button }                   from '@/components/ui/button'
import { ConfirmDialog }            from '@/components/ConfirmDialog'
import StudentForm                  from '../StudentForm'
import { updateStudent, type StudentDetail } from '@/app/actions/students'
import { addAuthorizedPickup, removeAuthorizedPickup, type AuthorizedPickup, type AddAuthorizedPickupInput } from '@/app/actions/authorized-pickups'
import { supabase }                 from '@/lib/supabase/client'
import type { GroupItem }           from '@/app/actions/groups'

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

const RELATIONSHIPS = ['Madre', 'Padre', 'Tutor/a', 'Abuelo/a', 'Tío/a', 'Hermano/a mayor', 'Otro']

function AddPickupModal({
  studentId,
  onClose,
  onSuccess,
}: {
  studentId: string
  onClose:   () => void
  onSuccess: () => void
}) {
  const [pending, start]       = useTransition()
  const [uploading, setUpload] = useState(false)
  const [preview, setPreview]  = useState<string | null>(null)
  const [form, setForm]        = useState<AddAuthorizedPickupInput & { photo_url?: string | null }>({
    first_name: '', last_name: '', phone: '', relationship: '', notes: '', photo_url: null,
  })

  function set(k: string, v: string | null) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('La foto no puede ser mayor a 5 MB'); return }

    setUpload(true)
    try {
      const ext  = file.name.split('.').pop() ?? 'jpg'
      const path = `authorized/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('student-photos')
        .upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('student-photos').getPublicUrl(path)
      setPreview(publicUrl)
      set('photo_url', publicUrl)
    } catch {
      toast.error('No se pudo subir la foto')
    } finally {
      setUpload(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.first_name.trim()) { toast.error('El nombre es requerido'); return }
    if (!form.last_name.trim())  { toast.error('El apellido es requerido'); return }

    start(async () => {
      const res = await addAuthorizedPickup(studentId, {
        first_name:   form.first_name.trim(),
        last_name:    form.last_name.trim(),
        phone:        form.phone?.trim()        || null,
        relationship: form.relationship?.trim() || null,
        notes:        form.notes?.trim()        || null,
        photo_url:    form.photo_url            ?? null,
      })
      if (res.error) { toast.error(res.error); return }
      toast.success('Persona autorizada agregada')
      onSuccess()
      onClose()
    })
  }

  const inputClass = "w-full rounded-xl border border-xk-border bg-xk-bg px-3 py-2.5 text-sm text-xk-text placeholder:text-xk-text-muted focus:outline-none focus:ring-2 focus:ring-xk-accent focus:border-transparent"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-xk-border shrink-0">
          <h2 className="font-heading text-lg font-bold text-xk-text">Agregar persona autorizada</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-xk-subtle transition-colors">
            <span className="text-xk-text-muted text-lg leading-none">×</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          {/* Photo */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {preview ? (
                <img src={preview} alt="Foto" className="w-14 h-14 rounded-full object-cover border-2 border-xk-border" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-xk-subtle flex items-center justify-center border-2 border-dashed border-xk-border">
                  <Camera size={18} className="text-xk-text-muted" />
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                  <Loader2 size={14} className="animate-spin text-white" />
                </div>
              )}
            </div>
            <div>
              <label className="inline-flex items-center gap-1.5 text-xs text-xk-accent font-medium cursor-pointer hover:text-xk-accent-dark">
                <Upload size={12} /> {preview ? 'Cambiar' : 'Subir foto'}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">Nombre *</label>
              <input value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="Juan" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">Apellido *</label>
              <input value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="López" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">Teléfono</label>
              <input value={form.phone ?? ''} onChange={e => set('phone', e.target.value || null)} placeholder="+52 33 1234 5678" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">Relación</label>
              <select value={form.relationship ?? ''} onChange={e => set('relationship', e.target.value || null)} className={inputClass}>
                <option value="">Sin especificar</option>
                {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-xk-text-muted uppercase tracking-wider mb-1.5">Notas</label>
            <input value={form.notes ?? ''} onChange={e => set('notes', e.target.value || null)} placeholder="Ej: Solo los viernes" className={inputClass} />
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" disabled={pending || uploading} className="flex-1 gap-2">
              {pending && <Loader2 size={14} className="animate-spin" />}
              Agregar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function StudentDetailContent({
  student,
  groups,
  authorizedPickups,
}: {
  student:           StudentDetail
  groups:            GroupItem[]
  authorizedPickups: AuthorizedPickup[]
}) {
  const router = useRouter()
  const [tab, setTab]             = useState<Tab>('datos')
  const [editing, setEditing]     = useState(false)
  const [showAddPickup, setAddPickup] = useState(false)
  const [removingId, setRemovingId]   = useState<string | null>(null)
  const [deactivating, start]     = useTransition()
  const [removePending, startRemove] = useTransition()

  function handleDeactivate() {
    start(async () => {
      const res = await updateStudent(student.id, { active: false })
      if (res.error) { toast.error(res.error); return }
      toast.success('Alumno dado de baja')
      router.push('/dashboard/alumnos')
    })
  }

  function handleRemovePickup(pickupId: string) {
    setRemovingId(pickupId)
    startRemove(async () => {
      const res = await removeAuthorizedPickup(pickupId, student.id)
      setRemovingId(null)
      if (res.error) toast.error(res.error)
      else { toast.success('Persona removida'); router.refresh() }
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
        <Link href="/dashboard/alumnos" className="inline-flex items-center gap-1.5 text-sm text-xk-text-secondary hover:text-xk-accent">
          <ArrowLeft size={14} /> Volver a alumnos
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditing(true)}>
            <Pencil size={13} /> Editar
          </Button>
          {student.active && (
            <ConfirmDialog
              trigger={
                <Button variant="outline" size="sm" className="gap-1.5 text-red-500 border-red-200 hover:bg-red-50" disabled={deactivating}>
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
            <img src={student.photo_url} alt={`${student.first_name} ${student.last_name}`} className="w-16 h-16 rounded-2xl object-cover shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-xk-accent-light flex items-center justify-center shrink-0">
              <span className="text-xl font-bold text-xk-accent">{student.first_name[0]}{student.last_name[0]}</span>
            </div>
          )}
          <div className="min-w-0">
            <h1 className="font-heading text-2xl font-bold text-xk-text">{student.first_name} {student.last_name}</h1>
            {student.group_name && <p className="text-sm text-xk-text-secondary mt-0.5">{student.group_name}</p>}
            <span className={['inline-flex mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium', student.active ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'].join(' ')}>
              {student.active ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-xk-subtle rounded-xl p-1 mb-5 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={['flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex-1 justify-center',
              tab === t.id ? 'bg-white shadow-sm text-xk-text' : 'text-xk-text-muted hover:text-xk-text'].join(' ')}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Datos tab */}
      {tab === 'datos' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <section className="bg-xk-card border border-xk-border rounded-2xl p-5">
            <h2 className="font-heading text-base font-semibold text-xk-text mb-3">General</h2>
            <Row label="Matrícula"        value={student.student_code} />
            <Row label="Fecha nacimiento" value={fmtDate(student.date_of_birth)} />
            <Row label="CURP"             value={student.curp} />
            <Row label="Grupo"            value={student.group_name} />
            <Row label="Nivel"            value={student.group_level} />
          </section>
          <section className="bg-xk-card border border-xk-border rounded-2xl p-5">
            <h2 className="font-heading text-base font-semibold text-xk-text mb-3">Salud</h2>
            <Row label="Alergias"      value={student.allergies} />
            <Row label="Notas médicas" value={student.medical_notes} />
          </section>
        </div>
      )}

      {/* Padres tab */}
      {tab === 'padres' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-base font-semibold text-xk-text">Personas autorizadas para recoger</h2>
              <p className="text-xs text-xk-text-muted mt-0.5">Visibles al portero durante pickup</p>
            </div>
            <Button size="sm" className="gap-1.5" onClick={() => setAddPickup(true)}>
              <Plus size={13} /> Agregar
            </Button>
          </div>

          {authorizedPickups.length === 0 ? (
            <div className="bg-xk-card border border-xk-border rounded-2xl p-10 text-center">
              <p className="text-sm font-medium text-xk-text mb-1">Sin personas autorizadas</p>
              <p className="text-xs text-xk-text-muted mb-4">Agrega a los familiares o tutores que pueden recoger a este alumno.</p>
              <Button size="sm" className="gap-1.5" onClick={() => setAddPickup(true)}>
                <Plus size={13} /> Agregar persona
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {authorizedPickups.map(p => (
                <div key={p.id} className="bg-xk-card border border-xk-border rounded-2xl p-4 flex items-center gap-3">
                  {p.photo_url ? (
                    <img src={p.photo_url} alt={`${p.first_name} ${p.last_name}`} className="w-11 h-11 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-xk-accent-light flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-xk-accent">{p.first_name[0]}{p.last_name[0]}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xk-text text-sm">{p.first_name} {p.last_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {p.relationship && <span className="text-xs text-xk-text-secondary">{p.relationship}</span>}
                      {p.phone && <span className="text-xs text-xk-text-muted font-mono">{p.phone}</span>}
                    </div>
                    {p.notes && <p className="text-xs text-xk-text-muted mt-0.5 truncate">{p.notes}</p>}
                  </div>
                  <ConfirmDialog
                    trigger={
                      <button disabled={removingId === p.id || removePending} className="p-1.5 rounded-lg hover:bg-red-50 shrink-0">
                        {removingId === p.id
                          ? <Loader2 size={13} className="animate-spin text-red-400" />
                          : <Trash2 size={13} className="text-red-400" />
                        }
                      </button>
                    }
                    title={`¿Remover a ${p.first_name} ${p.last_name}?`}
                    description="Ya no podrá recoger al alumno."
                    confirmLabel="Sí, remover"
                    destructive
                    onConfirm={() => handleRemovePickup(p.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'pickup'     && (
        <div className="bg-xk-card border border-xk-border rounded-2xl p-12 text-center">
          <p className="text-sm font-medium text-xk-text mb-1">Historial de pickup</p>
          <p className="text-xs text-xk-text-muted">Módulo en desarrollo — disponible próximamente</p>
        </div>
      )}
      {tab === 'documentos' && (
        <div className="bg-xk-card border border-xk-border rounded-2xl p-12 text-center">
          <p className="text-sm font-medium text-xk-text mb-1">Documentos del alumno</p>
          <p className="text-xs text-xk-text-muted">Módulo en desarrollo — disponible próximamente</p>
        </div>
      )}

      {editing && (
        <StudentForm
          student={student}
          groups={groups}
          onClose={() => setEditing(false)}
          onSuccess={() => { setEditing(false); router.refresh() }}
        />
      )}

      {showAddPickup && (
        <AddPickupModal
          studentId={student.id}
          onClose={() => setAddPickup(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  )
}
