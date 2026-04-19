'use client'

import { useState, useTransition } from 'react'
import { useRouter }                from 'next/navigation'
import { toast }                    from 'sonner'
import { UserPlus, Mail, Trash2, Loader2, GraduationCap } from 'lucide-react'
import { Button }                   from '@/components/ui/button'
import { ConfirmDialog }            from '@/components/ConfirmDialog'
import InviteTeacherForm            from './InviteTeacherForm'
import { removeTeacher, type TeacherItem } from '@/app/actions/teachers'

export default function MaestrosClient({ teachers }: { teachers: TeacherItem[] }) {
  const router = useRouter()
  const [showInvite, setShowInvite] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [pending, start]            = useTransition()

  function handleRemove(t: TeacherItem) {
    setRemovingId(t.id)
    start(async () => {
      const res = await removeTeacher(t.id)
      setRemovingId(null)
      if (res.error) toast.error(res.error)
      else { toast.success('Maestro/a removido de la escuela'); router.refresh() }
    })
  }

  function initials(t: TeacherItem) {
    return [t.first_name?.[0], t.last_name?.[0]].filter(Boolean).join('').toUpperCase() || '?'
  }

  function fullName(t: TeacherItem) {
    return [t.first_name, t.last_name].filter(Boolean).join(' ') || 'Sin nombre'
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-xk-text">Maestros</h1>
          <p className="text-sm text-xk-text-secondary mt-1">
            {teachers.length} maestro{teachers.length !== 1 ? 's' : ''} en tu escuela
          </p>
        </div>
        <Button onClick={() => setShowInvite(true)} className="gap-2">
          <UserPlus size={16} /> Invitar maestro
        </Button>
      </div>

      {/* Content */}
      {teachers.length === 0 ? (
        <div className="bg-xk-card border border-xk-border rounded-2xl p-12 text-center">
          <div className="w-14 h-14 bg-xk-accent-light rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={28} className="text-xk-accent" />
          </div>
          <p className="font-heading text-lg font-semibold text-xk-text mb-1">No hay maestros aún</p>
          <p className="text-sm text-xk-text-muted mb-5">Invita a los maestros de tu escuela para asignarlos a grupos.</p>
          <Button onClick={() => setShowInvite(true)} className="gap-2">
            <UserPlus size={16} /> Invitar primer maestro
          </Button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-xk-card border border-xk-border rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-xk-subtle border-b border-xk-border">
                <tr className="text-xs font-semibold text-xk-text-muted uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Nombre</th>
                  <th className="text-left px-4 py-3">Correo</th>
                  <th className="text-left px-4 py-3">Rol</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {teachers.map(t => (
                  <tr key={t.id} className="border-b border-xk-border last:border-0 hover:bg-xk-subtle/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-xk-accent-light flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-xk-accent">{initials(t)}</span>
                        </div>
                        <span className="font-medium text-xk-text">{fullName(t)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xk-text-secondary">
                        <Mail size={12} className="shrink-0" />
                        <span className="text-xs">{t.email ?? '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-xk-accent-light text-xk-accent px-2 py-0.5 rounded-full font-medium capitalize">
                        {t.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ConfirmDialog
                        trigger={
                          <button
                            disabled={removingId === t.id || pending}
                            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            title="Remover de la escuela"
                          >
                            {removingId === t.id
                              ? <Loader2 size={13} className="animate-spin text-red-400" />
                              : <Trash2 size={13} className="text-red-400" />
                            }
                          </button>
                        }
                        title={`¿Remover a ${fullName(t)}?`}
                        description="El maestro/a perderá acceso a esta escuela. No se eliminará su cuenta."
                        confirmLabel="Sí, remover"
                        destructive
                        onConfirm={() => handleRemove(t)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {teachers.map(t => (
              <div key={t.id} className="bg-xk-card border border-xk-border rounded-2xl p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-xk-accent-light flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-xk-accent">{initials(t)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-xk-text text-sm">{fullName(t)}</p>
                      {t.email && <p className="text-xs text-xk-text-muted">{t.email}</p>}
                    </div>
                  </div>
                  <ConfirmDialog
                    trigger={
                      <button
                        disabled={removingId === t.id}
                        className="p-1.5 rounded-lg hover:bg-red-50"
                      >
                        {removingId === t.id
                          ? <Loader2 size={13} className="animate-spin text-red-400" />
                          : <Trash2 size={13} className="text-red-400" />
                        }
                      </button>
                    }
                    title={`¿Remover a ${fullName(t)}?`}
                    description="El maestro/a perderá acceso a esta escuela."
                    confirmLabel="Sí, remover"
                    destructive
                    onConfirm={() => handleRemove(t)}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-xk-text-muted mt-3">
            {teachers.length} maestro{teachers.length !== 1 ? 's' : ''}
          </p>
        </>
      )}

      {showInvite && (
        <InviteTeacherForm
          onClose={() => setShowInvite(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  )
}
