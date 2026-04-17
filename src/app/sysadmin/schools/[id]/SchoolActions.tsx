'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Power, Mail, Trash2, LogIn, MoreHorizontal, Zap } from 'lucide-react'
import {
  toggleSchoolActive,
  deleteSchool,
  resendMagicLinkToDirector,
  impersonateDirector,
} from '@/app/actions/sysadmin'
import { startImpersonation } from '@/app/actions/impersonate'

export default function SchoolActions({
  schoolId,
  isActive,
  schoolName,
}: {
  schoolId:   string
  isActive:   boolean
  schoolName: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [action, setAction] = useState<'toggle' | 'magic' | 'delete' | 'impersonate' | null>(null)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  async function handleToggle() {
    setOpen(false)
    setAction('toggle')
    startTransition(async () => {
      const res = await toggleSchoolActive(schoolId)
      if (res.error) toast.error(res.error)
      else toast.success(res.active ? 'Escuela activada' : 'Escuela pausada')
      router.refresh()
      setAction(null)
    })
  }

  async function handleMagicLink() {
    setOpen(false)
    setAction('magic')
    startTransition(async () => {
      const res = await resendMagicLinkToDirector(schoolId)
      if (res.error) toast.error(res.error)
      else toast.success(`Magic link enviado a ${res.email}`)
      setAction(null)
    })
  }

  async function handleImpersonate() {
    setOpen(false)
    setAction('impersonate')
    startTransition(async () => {
      const res = await impersonateDirector(schoolId)
      setAction(null)
      if (res.error) { toast.error(res.error); return }
      toast.info('Abriendo sesión como directora en nueva pestaña…')
      window.open(res.magicLink!, '_blank', 'noopener')
    })
  }

  async function handleDelete() {
    setOpen(false)
    const confirmed = window.prompt(
      `Para eliminar "${schoolName}" escribe BORRAR. Esta acción es irreversible.`
    )
    if (confirmed !== 'BORRAR') { toast.info('Cancelado'); return }
    setAction('delete')
    startTransition(async () => {
      const res = await deleteSchool(schoolId)
      if (res.error) { toast.error(res.error); setAction(null); return }
      toast.success('Escuela eliminada')
      router.push('/sysadmin/schools')
    })
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Botón prominente — impersonación directa vía cookie */}
      <form action={startImpersonation.bind(null, schoolId, schoolName)}>
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-xk-accent text-white text-sm font-medium hover:bg-xk-accent-dark transition-colors shadow-sm"
        >
          <Zap className="w-4 h-4" />
          Entrar como Admin
        </button>
      </form>

      {/* Menú de acciones secundarias */}
      <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        disabled={pending}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-xk-border bg-xk-surface text-xs font-medium text-xk-text-secondary hover:bg-xk-subtle hover:text-xk-text disabled:opacity-50 transition-colors"
      >
        {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MoreHorizontal className="w-3.5 h-3.5" />}
        Acciones
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-52 xk-surface-elevated shadow-lg rounded-xl overflow-hidden z-20 border border-xk-border/60">
          <button onClick={handleToggle}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-xk-text hover:bg-xk-subtle transition-colors text-left">
            <Power className="w-4 h-4 text-xk-text-muted" />
            {isActive ? 'Pausar escuela' : 'Activar escuela'}
          </button>
          <button onClick={handleMagicLink}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-xk-text hover:bg-xk-subtle transition-colors text-left">
            <Mail className="w-4 h-4 text-xk-text-muted" />
            Reenviar acceso a directora
          </button>
          <button onClick={handleImpersonate}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-xk-text hover:bg-xk-subtle transition-colors text-left">
            <LogIn className="w-4 h-4 text-xk-text-muted" />
            Entrar como directora
          </button>
          <div className="border-t border-xk-border/50" />
          <button onClick={handleDelete}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left">
            <Trash2 className="w-4 h-4" />
            Eliminar escuela
          </button>
        </div>
      )}
      </div>
    </div>
  )
}
