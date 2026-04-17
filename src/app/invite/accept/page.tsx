'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Lock, Eye, EyeOff, User, AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Suspense } from 'react'
import { signUp } from '@/app/actions/auth'

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z
  .object({
    first_name: z.string().min(1, 'Ingresa tu nombre'),
    last_name: z.string().min(1, 'Ingresa tu apellido'),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Debe incluir al menos una mayúscula')
      .regex(/[0-9]/, 'Debe incluir al menos un número'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm'],
  })

type Form = z.infer<typeof schema>

// ─── Inner form (necesita useSearchParams) ────────────────────────────────────

function InviteAcceptForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const schoolName = searchParams.get('school') ?? 'tu escuela'
  const email = searchParams.get('email') ?? ''

  const [showPw, setShowPw] = useState(false)
  const [showCfm, setShowCfm] = useState(false)
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<Form>({ resolver: zodResolver(schema) })

  async function onSubmit(values: Form) {
    if (!email) {
      setError('root', { message: 'Enlace de invitación inválido. Solicita uno nuevo.' })
      return
    }

    // Registrar la cuenta con el email de la invitación
    const { error } = await signUp(email, values.password)
    if (error) {
      setError('root', { message: error })
      return
    }

    setDone(true)
    toast.success('Cuenta creada. Revisa tu correo para confirmar.')
    setTimeout(() => router.push('/login'), 3000)
  }

  if (done) {
    return (
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-xk-accent-light mb-4">
          <CheckCircle2 size={28} className="text-xk-accent" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-xk-text mb-2">
          ¡Cuenta creada!
        </h2>
        <p className="text-sm text-xk-text-secondary">
          Revisa tu correo y confirma tu cuenta para acceder.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Encabezado con icono de escuela */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-xk-accent-light flex items-center justify-center mb-3">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-xk-accent"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <h1 className="font-heading text-2xl font-bold text-xk-text mb-1">
          Has sido invitado/a
        </h1>
        <p className="text-sm text-xk-text-muted">
          a{' '}
          <span className="font-semibold text-xk-text-secondary">{schoolName}</span>
        </p>
      </div>

      {email && (
        <div className="bg-xk-subtle rounded-xl px-4 py-3 mb-5 text-sm text-xk-text-secondary text-center">
          Crearás tu cuenta con{' '}
          <span className="font-semibold text-xk-text">{email}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {errors.root && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5 mb-4 text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {errors.root.message}
          </div>
        )}

        <div className="space-y-4">
          {/* Nombre */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="fn">
                Nombre(s) <span className="text-xk-danger">*</span>
              </Label>
              <div className="relative mt-1.5">
                <User
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-xk-text-muted pointer-events-none"
                />
                <Input
                  id="fn"
                  placeholder="Ana"
                  className="pl-8"
                  autoComplete="given-name"
                  {...register('first_name')}
                />
              </div>
              {errors.first_name && (
                <p className="text-red-600 text-xs mt-1">{errors.first_name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="ln">
                Apellido(s) <span className="text-xk-danger">*</span>
              </Label>
              <div className="relative mt-1.5">
                <User
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-xk-text-muted pointer-events-none"
                />
                <Input
                  id="ln"
                  placeholder="García"
                  className="pl-8"
                  autoComplete="family-name"
                  {...register('last_name')}
                />
              </div>
              {errors.last_name && (
                <p className="text-red-600 text-xs mt-1">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <Label htmlFor="password">
              Contraseña <span className="text-xk-danger">*</span>
            </Label>
            <div className="relative mt-1.5">
              <Lock
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xk-text-muted pointer-events-none"
              />
              <Input
                id="password"
                type={showPw ? 'text' : 'password'}
                placeholder="Mín. 8 caracteres"
                className="pl-8 pr-10"
                autoComplete="new-password"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xk-text-muted hover:text-xk-text"
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>
            )}
            <p className="text-xs text-xk-text-muted mt-1">
              Mínimo 8 caracteres, una mayúscula y un número
            </p>
          </div>

          {/* Confirmar contraseña */}
          <div>
            <Label htmlFor="confirm">
              Confirmar contraseña <span className="text-xk-danger">*</span>
            </Label>
            <div className="relative mt-1.5">
              <Lock
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xk-text-muted pointer-events-none"
              />
              <Input
                id="confirm"
                type={showCfm ? 'text' : 'password'}
                placeholder="Repite la contraseña"
                className="pl-8 pr-10"
                autoComplete="new-password"
                {...register('confirm')}
              />
              <button
                type="button"
                onClick={() => setShowCfm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xk-text-muted hover:text-xk-text"
                tabIndex={-1}
              >
                {showCfm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.confirm && (
              <p className="text-red-600 text-xs mt-1">{errors.confirm.message}</p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full mt-6 h-10 bg-xk-accent hover:bg-xk-accent-dark text-white rounded-lg font-medium"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? 'Creando cuenta…' : 'Crear mi cuenta'}
        </Button>
      </form>

      <p className="text-xs text-center text-xk-text-muted mt-5">
        ¿Ya tienes cuenta?{' '}
        <a href="/login" className="text-xk-accent hover:text-xk-accent-dark font-medium">
          Iniciar sesión
        </a>
      </p>
    </>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function InviteAcceptPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-xk-accent-light/30 px-4">
      <div className="w-full max-w-[440px]">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-6 justify-center">
          <div className="w-10 h-10 rounded-xl bg-xk-accent flex items-center justify-center shrink-0">
            <span className="font-heading font-bold text-white text-lg leading-none">X</span>
          </div>
          <span className="font-heading font-bold text-xk-text text-xl">Xokai</span>
        </div>

        <div className="bg-white rounded-2xl border border-xk-border shadow-lg p-8">
          <Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-xk-accent" />
            </div>
          }>
            <InviteAcceptForm />
          </Suspense>
        </div>

      </div>
    </div>
  )
}
