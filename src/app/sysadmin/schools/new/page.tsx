import Link             from 'next/link'
import { ArrowLeft }    from 'lucide-react'
import CreateSchoolForm from './CreateSchoolForm'

export default function NewSchoolPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/sysadmin/schools"
        className="inline-flex items-center gap-1.5 text-sm text-xk-text-secondary hover:text-xk-accent mb-4"
      >
        <ArrowLeft size={14} /> Volver a escuelas
      </Link>

      <div className="bg-xk-card border border-xk-border rounded-2xl p-6">
        <h1 className="font-heading text-xl font-bold text-xk-text mb-1">Nueva escuela</h1>
        <p className="text-sm text-xk-text-muted mb-6">
          Crea una escuela manualmente. El onboarding quedará marcado como completado.
        </p>
        <CreateSchoolForm />
      </div>
    </div>
  )
}
