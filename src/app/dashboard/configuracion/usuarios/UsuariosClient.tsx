'use client'

import { useState, useTransition } from 'react'
import { useRouter }               from 'next/navigation'
import { useForm }                 from 'react-hook-form'
import { zodResolver }             from '@hookform/resolvers/zod'
import { z }                       from 'zod'
import { toast }                   from 'sonner'
import { format, addDays, isPast, differenceInHours } from 'date-fns'
import { es }                      from 'date-fns/locale'
import {
  UserPlus, Trash2, Loader2, Mail, ShieldCheck, AlertCircle, Clock, RotateCcw, Timer,
} from 'lucide-react'
import { Button }      from '@/components/ui/button'
import { Input }       from '@/components/ui/input'
import { Label }       from '@/components/ui/label'
import {
  inviteUser, removeUser, resendInvite, cancelInvite,
} from '@/app/actions/invite'
import type { PendingInvite } from '@/app/actions/invite'

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface UserRow {
  id:         string
  first_name: string | null
  last_name:  string | null
  role:       string
  created_at: string
}

interface Props {
  initialUsers:   UserRow[]
  initialPending: PendingInvite[]
  currentUserId:  string
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const inviteSchema = z.object({
  email: z.string().email('Correo inválido'),
  role:  z.enum(['admin', 'teacher', 'portero']),
})
type InviteForm = z.infer<typeof inviteSchema>

// ─── Helpers ─────────────────────────────────────────────────────────────────

const INVITE_EXPIRY_DAYS = 7

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

function ExpiryBadge({ invitedAt }: { invitedAt: string }) {
  const expiry  = addDays(new Date(invitedAt), INVITE_EXPIRY_DAYS)
  const expired = isPast(expiry)
  const hoursLeft = differenceInHours(expiry, new Date())

  if (expired) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
        <Timer size={11} />
        Expiró
      </span>
    )
  }

  const urgent = hoursLeft < 48
  return (
    <span className={`text-xs ${urgent ? 'text-amber-600 font-semibold' : 'text-xk-text-secondary'}`}>
      {format(expiry, "d MMM yyyy", { locale: es })}
    </span>
  )
}

function userName(u: UserRow) {
  const name = [u.first_name, u.last_name].filter(Boolean).join(' ')
  return name || 'Sin nombre'
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function UsuariosClient({ initialUsers, initialPending, currentUserId }: Props) {
  const router = useRouter()
  const [users,      setUsers]      = useState<UserRow[]>(initialUsers)
  const [pending,    setPending]    = useState<PendingInvite[]>(initialPending)
  const [showModal,  setShowModal]  = useState(false)
  const [deleting,   setDeleting]   = useState<string | null>(null)
  const [resending,  setResending]  = useState<string | null>(null)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [,           startTransition] = useTransition()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting }, setError } =
    useForm<InviteForm>({ resolver: zodResolver(inviteSchema) })

  // ─── Invitar ─────────────────────────────────────────────────────────────────

  async function onInvite(values: InviteForm) {
    const { error } = await inviteUser({ email: values.email, role: values.role })
    if (error) { setError('root', { message: error }); return }
    toast.success(`Invitación enviada a ${values.email}`)
    reset()
    setShowModal(false)
    router.refresh()
  }

  // ─── Reenviar invitación ──────────────────────────────────────────────────────

  async function handleResend(inv: PendingInvite) {
    setResending(inv.email)
    const { error } = await resendInvite(inv.email, inv.role)
    if (error) { toast.error(error) }
    else { toast.success(`Invitación reenviada a ${inv.email}`) }
    setResending(null)
  }

  // ─── Cancelar invitación ──────────────────────────────────────────────────────

  async function handleCancelInvite(inv: PendingInvite) {
    if (!window.confirm(`¿Cancelar la invitación a ${inv.email}?`)) return
    setCancelling(inv.id)
    startTransition(async () => {
      const { error } = await cancelInvite(inv.id)
      if (error) { toast.error(error) }
      else {
        toast.success('Invitación cancelada')
        setPending(prev => prev.filter(p => p.id !== inv.id))
      }
      setCancelling(null)
    })
  }

  // ─── Eliminar usuario ─────────────────────────────────────────────────────────

  async function handleDelete(userId: string, name: string) {
    if (!window.confirm(`¿Eliminar a ${name}? Esta acción no se puede deshacer.`)) return
    setDeleting(userId)
    startTransition(async () => {
      const { error } = await removeUser(userId)
      if (error) { toast.error(error) }
      else {
        toast.success(`${name} eliminado correctamente`)
        setUsers(prev => prev.filter(u => u.id !== userId))
      }
      setDeleting(null)
    })
  }

  const isEmpty = users.length === 0 && pending.length === 0

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
          <span className="hidden sm:inline">Invitar usuario</span>
          <span className="sm:hidden">Invitar</span>
        </Button>
      </div>

      {isEmpty ? (
        <div className="bg-xk-card rounded-2xl border border-xk-border py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-xk-accent-light flex items-center justify-center mx-auto mb-3">
            <UserPlus size={22} className="text-xk-accent" />
          </div>
          <p className="font-semibold text-xk-text">Sin usuarios aún</p>
          <p className="text-sm text-xk-text-muted mt-1">
            Invita a tu equipo con el botón de arriba.
          </p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* ── Sección: Invitaciones pendientes ── */}
          {pending.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold text-xk-text-secondary uppercase tracking-wide">
                  Invitaciones pendientes
                </h2>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                  {pending.length}
                </span>
              </div>

              <div className="bg-xk-card rounded-2xl border border-xk-border overflow-hidden">
                {/* Header tabla pendientes */}
                <div className="hidden sm:grid sm:grid-cols-[1fr_130px_110px_110px_80px] gap-3 px-5 py-3 bg-xk-subtle border-b border-xk-border">
                  {['Correo', 'Rol', 'Enviada', 'Expira', ''].map((col) => (
                    <span key={col} className="text-xs font-semibold text-xk-text-secondary uppercase tracking-wide">
                      {col}
                    </span>
                  ))}
                </div>

                {pending.map((inv) => (
                  <div key={inv.id}
                    className="border-b border-xk-border last:border-0 bg-amber-50/20 hover:bg-amber-50/40 transition-colors">

                    {/* Desktop row */}
                    <div className="hidden sm:grid sm:grid-cols-[1fr_130px_110px_110px_80px] gap-3 px-5 py-4 items-center">
                      <div className="min-w-0">
                        <p className="font-medium text-xk-text text-sm truncate">{inv.email}</p>
                        <span className="inline-flex items-center gap-1 mt-0.5 bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 text-xs font-semibold">
                          <Clock size={10} />
                          Pendiente
                        </span>
                      </div>
                      <RoleBadge role={inv.role} />
                      <span className="text-xs text-xk-text-secondary">
                        {format(new Date(inv.invited_at), "d MMM yyyy", { locale: es })}
                      </span>
                      <ExpiryBadge invitedAt={inv.invited_at} />
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleResend(inv)}
                          disabled={resending === inv.email}
                          title="Reenviar invitación"
                          className="flex items-center justify-center w-8 h-8 rounded-lg text-xk-text-muted hover:bg-xk-accent-light hover:text-xk-accent transition-colors disabled:opacity-50"
                        >
                          {resending === inv.email
                            ? <Loader2 size={14} className="animate-spin" />
                            : <RotateCcw size={14} />}
                        </button>
                        <button
                          onClick={() => handleCancelInvite(inv)}
                          disabled={cancelling === inv.id}
                          title="Cancelar invitación"
                          className="flex items-center justify-center w-8 h-8 rounded-lg text-xk-text-muted hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                          {cancelling === inv.id
                            ? <Loader2 size={14} className="animate-spin" />
                            : <Trash2 size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Mobile card */}
                    <div className="sm:hidden px-4 py-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-xk-text text-sm truncate">{inv.email}</p>
                        <div className="flex items-center flex-wrap gap-2 mt-1.5">
                          <RoleBadge role={inv.role} />
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 text-xs font-semibold">
                            <Clock size={10} /> Pendiente
                          </span>
                        </div>
                        <p className="text-xs text-xk-text-muted mt-1.5">
                          Enviada {format(new Date(inv.invited_at), "d MMM yyyy", { locale: es })}
                          {' · '}
                          Expira <ExpiryBadge invitedAt={inv.invited_at} />
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 mt-0.5">
                        <button
                          onClick={() => handleResend(inv)}
                          disabled={resending === inv.email}
                          title="Reenviar"
                          className="flex items-center justify-center w-8 h-8 rounded-lg text-xk-text-muted hover:bg-xk-accent-light hover:text-xk-accent transition-colors disabled:opacity-50"
                        >
                          {resending === inv.email
                            ? <Loader2 size={14} className="animate-spin" />
                            : <RotateCcw size={14} />}
                        </button>
                        <button
                          onClick={() => handleCancelInvite(inv)}
                          disabled={cancelling === inv.id}
                          title="Cancelar"
                          className="flex items-center justify-center w-8 h-8 rounded-lg text-xk-text-muted hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                          {cancelling === inv.id
                            ? <Loader2 size={14} className="animate-spin" />
                            : <Trash2 size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Sección: Usuarios activos ── */}
          {users.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold text-xk-text-secondary uppercase tracking-wide">
                  Usuarios activos
                </h2>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-xk-accent-light text-xk-accent text-xs font-bold">
                  {users.length}
                </span>
              </div>

              <div className="bg-xk-card rounded-2xl border border-xk-border overflow-hidden">
                {/* Header tabla activos */}
                <div className="hidden sm:grid sm:grid-cols-[1fr_140px_140px_64px] gap-4 px-6 py-3 bg-xk-subtle border-b border-xk-border">
                  {['Nombre', 'Rol', 'Fecha de alta', ''].map((col) => (
                    <span key={col} className="text-xs font-semibold text-xk-text-secondary uppercase tracking-wide">
                      {col}
                    </span>
                  ))}
                </div>

                {users.map((u) => (
                  <div key={u.id}
                    className="border-b border-xk-border last:border-0 hover:bg-xk-subtle transition-colors">

                    {/* Desktop row */}
                    <div className="hidden sm:grid sm:grid-cols-[1fr_140px_140px_64px] gap-4 px-6 py-4 items-center">
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

                    {/* Mobile card */}
                    <div className="sm:hidden px-4 py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-xk-text text-sm">{userName(u)}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <RoleBadge role={u.role} />
                        </div>
                        <p className="text-xs text-xk-text-muted mt-1">
                          Alta {format(new Date(u.created_at), "d MMM yyyy", { locale: es })}
                        </p>
                      </div>
                      {u.id !== currentUserId && (
                        <button
                          onClick={() => handleDelete(u.id, userName(u))}
                          disabled={deleting === u.id}
                          title="Eliminar usuario"
                          className="flex items-center justify-center w-8 h-8 rounded-lg text-xk-text-muted hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50 shrink-0"
                        >
                          {deleting === u.id
                            ? <Loader2 size={14} className="animate-spin" />
                            : <Trash2 size={14} />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <p className="text-xs text-xk-text-muted mt-4">
        Los usuarios invitados recibirán un correo con un enlace para crear su cuenta.
        {pending.length > 0 && ` · ${pending.length} invitación${pending.length > 1 ? 'es' : ''} pendiente${pending.length > 1 ? 's' : ''}.`}
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
