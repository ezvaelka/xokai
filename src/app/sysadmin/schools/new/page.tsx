'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2, Loader2 } from 'lucide-react'
import { createSchoolWithAdmin } from '@/app/actions/sysadmin'

export default function NewSchoolPage() {
  const router  = useRouter()
  const [form,  setForm]   = useState({ schoolName: '', city: '', email: '' })
  const [error, setError]  = useState<string | null>(null)
  const [ok,    setOk]     = useState(false)
  const [busy,  setBusy]   = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const result = await createSchoolWithAdmin(form)
    setBusy(false)
    if (result.error) { setError(result.error); return }
    setOk(true)
    setTimeout(() => router.push(`/sysadmin/schools/${result.schoolId}`), 1500)
  }

  if (ok) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-6 h-6 text-emerald-600" />
        </div>
        <h2 className="text-lg font-semibold text-xk-text mb-1">Escuela creada</h2>
        <p className="text-sm text-xk-text-secondary">Redirigiendo al detalle…</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <Link href="/sysadmin/schools" className="inline-flex items-center gap-1.5 text-sm text-xk-text-secondary hover:text-xk-text mb-4">
          <ArrowLeft className="w-4 h-4" /> Volver a escuelas
        </Link>
        <p className="text-xs font-medium text-xk-text-muted uppercase tracking-widest mb-1">Sysadmin</p>
        <h1 className="text-2xl font-semibold tracking-tight text-xk-text">Nueva escuela</h1>
        <p className="text-sm text-xk-text-secondary mt-1">Se enviará una invitación por email a la directora.</p>
      </div>

      <form onSubmit={submit} className="xk-surface-elevated p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-xk-text mb-1.5">Nombre de la escuela *</label>
          <input
            required
            value={form.schoolName}
            onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
            placeholder="Ej. Colegio Montessori del Valle"
            className="w-full px-3 py-2.5 rounded-lg border border-xk-border bg-xk-surface text-sm text-xk-text placeholder:text-xk-text-muted focus:outline-none focus:ring-2 focus:ring-xk-accent/30 focus:border-xk-accent transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-xk-text mb-1.5">Ciudad</label>
          <input
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            placeholder="Ej. Guadalajara"
            className="w-full px-3 py-2.5 rounded-lg border border-xk-border bg-xk-surface text-sm text-xk-text placeholder:text-xk-text-muted focus:outline-none focus:ring-2 focus:ring-xk-accent/30 focus:border-xk-accent transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-xk-text mb-1.5">Email de la directora *</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="directora@escuela.edu.mx"
            className="w-full px-3 py-2.5 rounded-lg border border-xk-border bg-xk-surface text-sm text-xk-text placeholder:text-xk-text-muted focus:outline-none focus:ring-2 focus:ring-xk-accent/30 focus:border-xk-accent transition-colors"
          />
          <p className="text-[11px] text-xk-text-muted mt-1.5">Recibirá un email de invitación para activar su cuenta.</p>
        </div>

        {error && (
          <div className="px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-xk-accent text-white text-sm font-medium hover:bg-xk-accent-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
          {busy ? 'Creando…' : 'Crear escuela'}
        </button>
      </form>
    </div>
  )
}
