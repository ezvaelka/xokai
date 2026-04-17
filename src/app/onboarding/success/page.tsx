import { redirect }   from 'next/navigation'
import Link           from 'next/link'
import { CheckCircle2, Key, GraduationCap, Users, ArrowRight, Clock } from 'lucide-react'
import CopyButton     from './CopyButton'

export default async function OnboardingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; code?: string }>
}) {
  const { name, code } = await searchParams
  if (!name) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-xk-bg flex flex-col">
      {/* Header */}
      <header className="border-b border-xk-border bg-xk-card px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-xk-accent flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <span className="font-heading text-xl font-bold text-xk-accent">Xokai</span>
        <span className="text-xk-text-muted text-sm">— Solicitud enviada</span>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">

          {/* Hero */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-xk-accent-light mb-5 ring-8 ring-xk-accent-light/50">
              <CheckCircle2 size={40} className="text-xk-accent" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-xk-text mb-3">
              ¡{decodeURIComponent(name)} fue registrada!
            </h1>
            <p className="text-xk-text-secondary text-base leading-relaxed">
              Tu solicitud está <strong className="text-amber-600">pendiente de aprobación</strong>.
              Recibirás un correo cuando tu escuela esté activa.
              Mientras tanto, ya puedes configurar alumnos y grupos.
            </p>
          </div>

          {/* Join code */}
          {code && (
            <div className="bg-xk-card border border-xk-border rounded-2xl p-5 mb-5">
              <p className="text-xs font-semibold text-xk-text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Key size={12} /> Código de acceso para tu equipo
              </p>
              <div className="flex items-center gap-3 bg-xk-subtle rounded-xl px-4 py-3 mb-3">
                <span className="font-mono text-3xl font-bold text-xk-text tracking-[0.2em] flex-1">
                  {decodeURIComponent(code)}
                </span>
                <CopyButton text={decodeURIComponent(code)} />
              </div>
              <p className="text-xs text-xk-text-muted">
                Comparte este código con maestros y staff para que se unan a tu escuela.
                También lo encuentras en <strong>Mi perfil</strong> cuando quieras.
              </p>
            </div>
          )}

          {/* Estado + próximos pasos */}
          <div className="bg-xk-card border border-xk-border rounded-2xl overflow-hidden mb-5">
            <div className="px-5 py-4 border-b border-xk-border bg-xk-subtle">
              <p className="text-xs font-semibold text-xk-text-muted uppercase tracking-wider">Qué sigue</p>
            </div>
            <div className="divide-y divide-xk-border">

              <div className="flex items-center gap-4 px-5 py-4">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <Clock size={16} className="text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-xk-text">Revisión del equipo Xokai</p>
                  <p className="text-xs text-xk-text-muted mt-0.5">Activamos tu escuela en menos de 24 horas hábiles</p>
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 shrink-0">
                  Pendiente
                </span>
              </div>

              <Link href="/dashboard/alumnos"
                className="flex items-center gap-4 px-5 py-4 hover:bg-xk-subtle transition-colors group">
                <div className="w-9 h-9 rounded-xl bg-xk-accent-light flex items-center justify-center shrink-0 group-hover:bg-xk-accent transition-colors">
                  <GraduationCap size={16} className="text-xk-accent group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-xk-text">Registrar alumnos</p>
                  <p className="text-xs text-xk-text-muted mt-0.5">Puedes hacerlo ahora, sin esperar activación</p>
                </div>
                <ArrowRight size={15} className="text-xk-text-muted group-hover:text-xk-accent transition-colors shrink-0" />
              </Link>

              <Link href="/dashboard/configuracion/usuarios"
                className="flex items-center gap-4 px-5 py-4 hover:bg-xk-subtle transition-colors group">
                <div className="w-9 h-9 rounded-xl bg-xk-accent-light flex items-center justify-center shrink-0 group-hover:bg-xk-accent transition-colors">
                  <Users size={16} className="text-xk-accent group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-xk-text">Invitar a tu equipo</p>
                  <p className="text-xs text-xk-text-muted mt-0.5">Comparte el código con maestros y staff</p>
                </div>
                <ArrowRight size={15} className="text-xk-text-muted group-hover:text-xk-accent transition-colors shrink-0" />
              </Link>

            </div>
          </div>

          <Link href="/dashboard"
            className="flex items-center justify-center gap-2 w-full h-11 bg-xk-accent hover:bg-xk-accent-dark text-white font-semibold text-sm rounded-xl transition-colors">
            Ir al dashboard <ArrowRight size={16} />
          </Link>

        </div>
      </div>
    </div>
  )
}
