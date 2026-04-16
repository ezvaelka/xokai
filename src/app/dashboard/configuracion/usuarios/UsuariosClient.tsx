'use client'

import { useState, useTransition } from 'react'
import { useForm }                 from 'react-hook-form'
import { zodResolver }             from '@hookform/resolvers/zod'
import { z }                       from 'zod'
import { toast }                   from 'sonner'
import { format }                  from 'date-fns'
import { es }                      from 'date-fns/locale'
import {
  Trash2, Loader2, ShieldCheck, Copy, CheckCircle2,
} from 'lucide-react'
import { removeUser } from '@/app/actions/invite'

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface UserRow {
  id:         string
  first_name: string | null
  last_name:  string | null
  role:       string
  created_at: string
}

interface Props {
  initialUsers:  UserRow[]
  joinCode:      string
  currentUserId: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  sysadmin:    { label: 'Sysadmin',     color: '#4C1D95', bg: '#EDE9FE' },
  admin:       { label: 'Director',     color: '#6D4AE8', bg: '#EDE9FE' },
  director:    { label: 'Director',     color: '#6D4AE8', bg: '#EDE9FE' },
  coordinador: { label: 'Coordinador',  color: '#0369A1', bg: '#E0F2FE' },
  maestro:     { label: 'Maestro',      color: '#D97706', bg: '#FEF3C7' },
  teacher:     { label: 'Maestro',      color: '#D97706', bg: '#FEF3C7' },
  portero:     { label: 'Portero',      color: '#6B6760', bg: '#EFEDE8' },
  finanzas:    { label: 'Finanzas',     color: '#059669', bg: '#D1FAE5' },
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

// ─── Componente ───────────────────────────────────────────────────────────────

export default function UsuariosClient({ initialUsers, joinCode, currentUserId }: Props) {
  const [users,      setUsers]    = useState<UserRow[]>(initialUsers)
  const [deleting,   setDeleting] = useState<string | null>(null)
  const [copyDone,   setCopyDone] = useState(false)
  const [,           startTransition] = useTransition()

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

  return (
    <div className="max-w-4xl">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-xk-text">Usuarios</h1>
        <p className="text-xk-text-secondary mt-1">
          Administra quién tiene acceso al dashboard de tu escuela.
        </p>
      </div>

      {/* Join code banner */}
      {joinCode && (
        <div className="bg-xk-card rounded-2xl border border-xk-border p-5 mb-6">
          <p className="text-xs font-semibold text-xk-text-muted uppercase tracking-wider mb-3">
            Código de acceso de tu escuela
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <code className="text-2xl font-bold text-xk-accent tracking-widest font-mono bg-xk-accent-light px-4 py-2 rounded-xl">
              {joinCode}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(joinCode)
                setCopyDone(true)
                setTimeout(() => setCopyDone(false), 2000)
              }}
              className="flex items-center gap-1.5 text-sm font-medium text-xk-accent hover:text-xk-accent-dark transition-colors"
            >
              {copyDone ? <CheckCircle2 size={15} /> : <Copy size={15} />}
              {copyDone ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <p className="text-xs text-xk-text-muted mt-2.5">
            Comparte este código con tu equipo. Al crear su cuenta en Xokai, lo usan para unirse a tu escuela.
          </p>
        </div>
      )}

      {users.length === 0 ? (
        <div className="bg-xk-card rounded-2xl border border-xk-border py-16 text-center">
          <p className="font-semibold text-xk-text">Sin usuarios aún</p>
          <p className="text-sm text-xk-text-muted mt-1">
            Comparte el código de acceso con tu equipo para que se registren.
          </p>
        </div>
      ) : (
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
            <div className="hidden sm:grid sm:grid-cols-[1fr_140px_140px_64px] gap-4 px-6 py-3 bg-xk-subtle border-b border-xk-border">
              {['Nombre', 'Rol', 'Fecha de alta', ''].map((col) => (
                <span key={col} className="text-xs font-semibold text-xk-text-secondary uppercase tracking-wide">
                  {col}
                </span>
              ))}
            </div>

            {users.map((u) => (
              <div key={u.id} className="border-b border-xk-border last:border-0 hover:bg-xk-subtle transition-colors">
                {/* Desktop */}
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
                  ) : <div />}
                </div>
                {/* Mobile */}
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
  )
}
