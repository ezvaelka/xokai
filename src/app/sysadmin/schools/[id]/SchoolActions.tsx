'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Power, Mail, Trash2, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  toggleSchoolActive,
  deleteSchool,
  resendMagicLinkToDirector,
  impersonateDirector,
} from '@/app/actions/sysadmin'

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

  async function handleToggle() {
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
    setAction('magic')
    startTransition(async () => {
      const res = await resendMagicLinkToDirector(schoolId)
      if (res.error) toast.error(res.error)
      else toast.success(`Magic link enviado a ${res.email}`)
      setAction(null)
    })
  }

  async function handleDelete() {
    const confirmed = window.prompt(
      `Para eliminar "${schoolName}" escribe BORRAR. Esta acción es irreversible y borra todos sus datos.`
    )
    if (confirmed !== 'BORRAR') {
      toast.info('Cancelado')
      return
    }
    setAction('delete')
    startTransition(async () => {
      const res = await deleteSchool(schoolId)
      if (res.error) {
        toast.error(res.error)
        setAction(null)
        return
      }
      toast.success('Escuela eliminada')
      router.push('/sysadmin/schools')
    })
  }

  async function handleImpersonate() {
    setAction('impersonate')
    startTransition(async () => {
      const res = await impersonateDirector(schoolId)
      setAction(null)
      if (res.error) { toast.error(res.error); return }
      toast.info('Abriendo sesión como directora en nueva pestaña…')
      window.open(res.magicLink!, '_blank', 'noopener')
    })
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={handleToggle}
        disabled={pending}
        className="gap-2"
      >
        {pending && action === 'toggle' ? <Loader2 size={14} className="animate-spin" /> : <Power size={14} />}
        {isActive ? 'Pausar escuela' : 'Activar escuela'}
      </Button>

      <Button
        variant="outline"
        onClick={handleMagicLink}
        disabled={pending}
        className="gap-2"
      >
        {pending && action === 'magic' ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
        Reenviar acceso a directora
      </Button>

      <Button
        variant="outline"
        onClick={handleImpersonate}
        disabled={pending}
        className="gap-2"
        title="Abre una nueva pestaña con sesión de la directora. Cierra la pestaña para volver a Sysadmin."
      >
        {pending && action === 'impersonate' ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />}
        Entrar como directora
      </Button>

      <Button
        variant="outline"
        onClick={handleDelete}
        disabled={pending}
        className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
      >
        {pending && action === 'delete' ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
        Eliminar escuela
      </Button>
    </div>
  )
}
