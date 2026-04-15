'use client'

import { useState, useTransition } from 'react'
import { useForm }                  from 'react-hook-form'
import { zodResolver }              from '@hookform/resolvers/zod'
import { z }                        from 'zod'
import { toast }                    from 'sonner'
import { format }                   from 'date-fns'
import { es }                       from 'date-fns/locale'
import {
  UserPlus, Trash2, Loader2, Mail, ShieldCheck, AlertCircle
} from 'lucide-react'
import { Button }      from '@/components/ui/button'
import { Input }       from '@/components/ui/input'
import { Label }       from '@/components/ui/label'
import { inviteUser, removeUser } from '@/app/actions/invite'

// ─── Tipos ───────────────────────────────────────────────────────────────────

type UserRole = 'admin' | 'teacher' | 'portero'

interface UserRow {
  id:         string
  first_name: string | null
  last_name:  string | null
  role:       string
  created_at: string
}

interface Props {
  initialUsers:  UserRow[]
  currentUserId: string
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const inviteSchema = z.object({
  email: z.string().email('Correo inválido'),
  role:  z.enum(['admin', 'teacher', 'portero']),
})
type InviteForm = z.infer<typeof inviteSchema>

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  admin:    { label: 'Administrador', color: '#6D4AE8', bg: '#EDE9FE' },
  teacher:  { label: 'Maestro',       color: '#D97706', bg: '#FEF3C7' },
  portero:  { label: 'Portero',       color: '#6B6760', bg: '#EFEDE8' },
  sysadmin: { label: 'Sysadmin',      color: '#4C1D95', bg: '#EDE9FE' },
}

function RoleBadge({ role }: { role: string }) {
  const cfg = ROLE_LABELS[role] ?? { label: role, color: '#6B6760', bg: '#EFEDE8' }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ color: cfg.color, backgroundColor: cfg.bg }}>
      <ShieldCheck size={12} />
      {cfg.label}
    </span>
  )
}

function userName(u: UserRow) {
  const name = [u.first_name, u.last_name].filter(Boolean).join(' ')
  return name || 'Sin nombre'
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function UsuariosClient({ initialUsers, currentUserId }: Props) {
  const [users,      setUsers]      = useState<UserRow[]>(initialUsers)
  const [showModal,  setShowModal]  = useState(false)
  const [deleting,   setDeleting]   = useState<string | null>(null)
  const [isPending,  startTransition] = useTransition()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting }, setError } =
    useForm<InviteForm>({ resolver: zodResolver(inviteSchema) })

  // ─── Invitar ────────────────────────────────────────────────────────────────

  async function onInvite(values: InviteForm) {
    const { error } = await inviteUser({ email: values.email, role: values.role })
    if (error) {
      setError('root', { message: error })
      return
    }
    toast.success(`Invitación enviada a ${values.email}`)
    reset()
    setShowModal(false)
  }

  // ─── Eliminar ────────────────────────────────────────────────────────────────

  async function handleDelete(userId: string, name: string) {
    if (!window.confirm(`¿Eliminar a ${name}? Esta acción no se puede deshacer.`)) return
    setDeleting(userId)
    startTransition(async () => {
      const { error } = await removeUser(userId)
      if (error) {
        toast.error(error)
      } else {
        toast.success(`${name} eliminado correctamente`)
        setUsers(prev => prev.filter(u => u.id !== userId))
      }
      setDeleting(null)
    })
  }

  return (
    <div className="max-w-4xl">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-xk-text">Usuarios</h1>
          <p className="text-xk-text-secondary mt-1">
            Administra quién tiene acceso al dashboard de tu escuela.
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2 shrink-0">
          <UserPlus size={16} />
          Invitar usuario
        </Button>
      </div>

      {/* Tabla */}
      <div className="bg-xk-card rounded-2xl border border-xk-border overflow-hidden">
        {/* Header tabla */}
        <div className="grid grid-cols-[1fr_140px_140px_64px] gap-4 px-6 py-3 bg-xk-subtle border-b border-xk-border">
          {['Nombre', 'Rol', 'Fecha de alta', ''].map((col) => (
            <span key={col} className="text-xs font-semibold text-xk-text-secondary uppercase tracking-wide">
              {col}
            </span>
          ))}
        </div>

        {users.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-xk-accent-light flex items-center justify-center mx-auto mb-3">
              <UserPlus size={22} className="text-xk-accent" />
            </div>
            <p className="font-semibold text-xk-text">Sin usuarios aún</p>
            <p className="text-sm text-xk-text-muted mt-1">
              Invita a tu equipo con el botón de arriba.
            </p>
          </div>
        ) : (
          users.map((u) => (
            <div key={u.id}
              className="grid grid-cols-[1fr_140px_140px_64px] gap-4 px-6 py-4 items-center border-b border-xk-border last:border-0 hover:bg-xk-subtle transition-colors">

              <div>
                <p className="font-medium text-xk-text text-sm">{userName(u)}</p>
                <p className="text-xs text-xk-text-muted">ID: {u.id.slice(0, 8)}…</p>
              </div>

              <RoleBadge role={u.role} />

              <span className="text-xs text-xk-text-secondary">
                {format(new Date(u.created_at), "d MMM yyyy", { locale: es })}
              </span>

              {u.id !== currentUserId ? (
                <button
                  onClick={() => handleDelete(u.id, userName(u))}
                  disabled={deleting === u.id}
                  title="Eliminar usuario"
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-xk-text-muted hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                >
                  {deleting === u.id
                    ? <Loader2 size={14} className="animate-spin" />
                    : <Trash2 size={14} />}
                </button>
              ) : (
                <div />
              )}
            </div>
          ))
        )}
      </div>

      {/* Info */}
      <p className="text-xs text-xk-text-muted mt-4">
        Los usuarios invitados recibirán un correo con un enlace para crear su cuenta.
      </p>

      {/* ── Modal invitar ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-xk-card rounded-2xl border border-xk-border shadow-xl w-full max-w-md p-6">
            <h3 className="font-heading text-xl font-bold text-xk-text mb-1">Invitar usuario</h3>
            <p className="text-sm text-xk-text-secondary mb-5">
              Enviaremos un correo de invitación con instrucciones para crear su cuenta.
            </p>

            <form onSubmit={handleSubmit(onInvite)} noValidate>
              {errors.root && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5 mb-4 text-sm">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  {errors.root.message}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="invite-email">Correo electrónico</Label>
                  <div className="relative mt-1.5">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-xk-text-muted" />
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="maestro@colegio.edu.mx"
                      className="pl-9"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="invite-role">Rol</Label>
                  <select
                    id="invite-role"
                    {...register('role')}
                    className="mt-1.5 flex h-9 w-full rounded-xl border border-xk-border bg-xk-card px-3 py-2 text-sm text-xk-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xk-accent"
                  >
                    <option value="">Seleccionar rol…</option>
                    <option value="admin">Administrador — acceso total</option>
                    <option value="teacher">Maestro — grupos y comunicados</option>
                    <option value="portero">Portero — solo pickup</option>
                  </select>
                  {errors.role && (
                    <p className="text-red-600 text-xs mt-1">{errors.role.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <Button type="button" variant="outline"
                  onClick={() => { setShowModal(false); reset() }}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                  {isSubmitting ? 'Enviando…' : 'Enviar invitación'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
