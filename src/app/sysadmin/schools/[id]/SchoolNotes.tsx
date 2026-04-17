'use client'

import { useState, useTransition } from 'react'
import { toast }                   from 'sonner'
import { Loader2, Plus, User }     from 'lucide-react'
import { Button }                  from '@/components/ui/button'
import { addSchoolNote, type SchoolNote } from '@/app/actions/sysadmin'
import { useRouter }               from 'next/navigation'

function fmtRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1)  return 'hace un momento'
  if (mins < 60) return `hace ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `hace ${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 7)  return `hace ${days}d`
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default function SchoolNotes({
  schoolId,
  initialNotes,
}: {
  schoolId:     string
  initialNotes: SchoolNote[]
}) {
  const router                      = useRouter()
  const [text, setText]             = useState('')
  const [pending, startTransition]  = useTransition()

  function handleAdd() {
    if (!text.trim()) return
    startTransition(async () => {
      const res = await addSchoolNote(schoolId, text)
      if (res.error) {
        toast.error(res.error)
      } else {
        setText('')
        toast.success('Nota agregada')
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Historial */}
      {initialNotes.length === 0 ? (
        <p className="text-sm text-xk-text-muted">Aún no hay notas para esta escuela.</p>
      ) : (
        <ul className="space-y-3">
          {initialNotes.map((n) => (
            <li key={n.id} className="flex gap-3">
              <div className="mt-0.5 w-7 h-7 rounded-full bg-xk-accent-light flex items-center justify-center shrink-0">
                <User size={13} className="text-xk-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-xk-text leading-snug break-words">{n.note}</p>
                <p className="text-xs text-xk-text-muted mt-1">
                  {n.author_name ?? n.author_email ?? 'Sysadmin'}
                  {' · '}
                  {fmtRelative(n.created_at)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Agregar nota */}
      <div className="pt-3 border-t border-xk-border space-y-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Agregar nota interna…"
          rows={3}
          className="w-full rounded-xl border border-xk-border bg-xk-bg px-3 py-2.5 text-sm text-xk-text placeholder:text-xk-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-xk-accent focus:border-transparent"
        />
        <Button
          onClick={handleAdd}
          disabled={pending || !text.trim()}
          size="sm"
          className="gap-2"
        >
          {pending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Agregar nota
        </Button>
      </div>
    </div>
  )
}
