'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Mail, Lock, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input }  from '@/components/ui/input'
import { Label }  from '@/components/ui/label'
import { signInWithPassword, signInWithMagicLink } from '@/app/actions/auth'

// ─── Schemas ─────────────────────────────────────────────────────────────────

const passwordSchema = z.object({
  email:    z.string().email('Correo inválido'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
})

const magicSchema = z.object({
  email: z.string().email('Correo inválido'),
})

type PasswordForm = z.infer<typeof passwordSchema>
type MagicForm    = z.infer<typeof magicSchema>

// ─── Manejador de errores de URL (requiere Suspense) ─────────────────────────

function UrlErrorHandler() {
  const searchParams = useSearchParams()
  useEffect(() => {
    if (searchParams.get('error') === 'link_invalido') {
      toast.error('El enlace ha expirado o es inválido. Solicita uno nuevo.')
    }
  }, [searchParams])
  return null
}

// ─── Componente ──────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter()

  const [tab, setTab]           = useState<'password' | 'magic'>('password')
  const [magicSent, setMagicSent] = useState(false)

  const pwForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { email: '', password: '' },
  })

  const magicForm = useForm<MagicForm>({
    resolver: zodResolver(magicSchema),
    defaultValues: { email: '' },
  })

  // ─── Handlers ──────────────────────────────────────────────────────────────

  async function onPasswordSubmit(values: PasswordForm) {
    const { error } = await signInWithPassword(values.email, values.password)
    if (error) {
      pwForm.setError('root', { message: error })
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  async function onMagicSubmit(values: MagicForm) {
    const { error } = await signInWithMagicLink(values.email)
    if (error) {
      magicForm.setError('root', { message: error })
      return
    }
    setMagicSent(true)
  }

  // ─── UI ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center bg-xk-bg px-4 py-12">
      <Suspense fallback={null}><UrlErrorHandler /></Suspense>
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-xk-accent mb-4 shadow-lg">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff"
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <h1 className="font-heading text-4xl font-bold text-xk-accent tracking-tight">
            Xokai
          </h1>
          <p className="text-xk-text-secondary text-sm mt-1">
            Plataforma de gestión escolar · México y LATAM
          </p>
        </div>

        {/* Card */}
        <div className="bg-xk-card rounded-2xl border border-xk-border shadow-sm p-8">

          <h2 className="text-xl font-semibold text-xk-text mb-6">Iniciar sesión</h2>

          {/* Tabs */}
          <div className="flex rounded-xl border border-xk-border bg-xk-subtle p-1 mb-6">
            <button
              type="button"
              onClick={() => setTab('password')}
              className={[
                'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all',
                tab === 'password'
                  ? 'bg-xk-card text-xk-accent shadow-sm'
                  : 'text-xk-text-secondary hover:text-xk-text',
              ].join(' ')}
            >
              <Lock size={14} />
              Contraseña
            </button>
            <button
              type="button"
              onClick={() => { setTab('magic'); setMagicSent(false) }}
              className={[
                'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all',
                tab === 'magic'
                  ? 'bg-xk-card text-xk-accent shadow-sm'
                  : 'text-xk-text-secondary hover:text-xk-text',
              ].join(' ')}
            >
              <Sparkles size={14} />
              Magic link
            </button>
          </div>

          {/* ── Tab: contraseña ── */}
          {tab === 'password' && (
            <form onSubmit={pwForm.handleSubmit(onPasswordSubmit)} noValidate>

              {pwForm.formState.errors.root && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5 mb-4 text-sm">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  {pwForm.formState.errors.root.message}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="email-pw">Correo electrónico</Label>
                  <div className="relative mt-1.5">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-xk-text-muted pointer-events-none" />
                    <Input
                      id="email-pw"
                      type="email"
                      placeholder="director@colegio.edu.mx"
                      className="pl-9"
                      autoComplete="email"
                      {...pwForm.register('email')}
                    />
                  </div>
                  {pwForm.formState.errors.email && (
                    <p className="text-red-600 text-xs mt-1">{pwForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label htmlFor="password">Contraseña</Label>
                    <a href="/forgot-password"
                      className="text-xs text-xk-accent hover:text-xk-accent-dark font-medium">
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-xk-text-muted pointer-events-none" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-9"
                      autoComplete="current-password"
                      {...pwForm.register('password')}
                    />
                  </div>
                  {pwForm.formState.errors.password && (
                    <p className="text-red-600 text-xs mt-1">{pwForm.formState.errors.password.message}</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full mt-6 h-11"
                disabled={pwForm.formState.isSubmitting}
              >
                {pwForm.formState.isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {pwForm.formState.isSubmitting ? 'Entrando…' : 'Entrar'}
              </Button>

            </form>
          )}

          {/* ── Tab: magic link ── */}
          {tab === 'magic' && !magicSent && (
            <form onSubmit={magicForm.handleSubmit(onMagicSubmit)} noValidate>

              {magicForm.formState.errors.root && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5 mb-4 text-sm">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  {magicForm.formState.errors.root.message}
                </div>
              )}

              <p className="text-sm text-xk-text-secondary mb-4">
                Te enviamos un enlace mágico por correo. Sin contraseña, sin complicaciones.
              </p>

              <div>
                <Label htmlFor="email-magic">Correo electrónico</Label>
                <div className="relative mt-1.5">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-xk-text-muted pointer-events-none" />
                  <Input
                    id="email-magic"
                    type="email"
                    placeholder="director@colegio.edu.mx"
                    className="pl-9"
                    autoComplete="email"
                    {...magicForm.register('email')}
                  />
                </div>
                {magicForm.formState.errors.email && (
                  <p className="text-red-600 text-xs mt-1">{magicForm.formState.errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full mt-6 h-11"
                disabled={magicForm.formState.isSubmitting}
              >
                {magicForm.formState.isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {magicForm.formState.isSubmitting ? 'Enviando…' : 'Enviar enlace mágico'}
              </Button>

            </form>
          )}

          {/* ── Magic link enviado ── */}
          {tab === 'magic' && magicSent && (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-xk-accent-light mb-4">
                <CheckCircle2 size={28} className="text-xk-accent" />
              </div>
              <h3 className="font-semibold text-xk-text text-base mb-2">
                ¡Revisa tu correo!
              </h3>
              <p className="text-sm text-xk-text-secondary mb-6">
                Enviamos un enlace de acceso a{' '}
                <strong>{magicForm.getValues('email')}</strong>.
                Haz clic en él para entrar.
              </p>
              <button
                type="button"
                onClick={() => setMagicSent(false)}
                className="text-sm text-xk-accent hover:text-xk-accent-dark font-medium"
              >
                Intentar con otro correo
              </button>
            </div>
          )}

        </div>

        <p className="text-center text-xs text-xk-text-muted mt-6">
          © {new Date().getFullYear()} Xokai · Todos los derechos reservados
        </p>
      </div>
    </div>
  )
}
