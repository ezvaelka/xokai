'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateSchoolNotes } from '@/app/actions/sysadmin'

export default function SchoolNotes({
  schoolId,
  initialNotes,
}: {
  schoolId:     string
  initialNotes: string | null
}) {
  const [notes, setNotes]     = useState(initialNotes ?? '')
  const [pending, startTransition] = useTransition()

  async function handleSave() {
    startTransition(async () => {
      const res = await updateSchoolNotes(schoolId, notes)
      if (res.error) toast.error(res.error)
      else toast.success('Nota guardada')
    })
  }

  return (
    <div className="space-y-3">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Ej: Pausada por falta de pago enero. Contactar en febrero."
        rows={4}
        className="w-full rounded-xl border border-xk-border bg-xk-bg px-3 py-2.5 text-sm text-xk-text placeholder:text-xk-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-xk-accent focus:border-transparent"
      />
      <Button
        onClick={handleSave}
        disabled={pending}
        size="sm"
        className="gap-2"
      >
        {pending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        Guardar nota
      </Button>
    </div>
  )
}
