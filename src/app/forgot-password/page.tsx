'use client'

import { useState } from 'react'
import { useForm }  from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input }  from '@/components/ui/input'
import { Label }  from '@/components/ui/label'
import { sendPasswordRecovery } from '@/app/actions/auth'

const schema = z.object({
  email: z.string().email('Correo inválido'),
})
type Form = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError, getValues } =
    useForm<Form>({ resolver: zodResolver(schema) })

  async function onSubmit(values: Form) {
    const { error } = await sendPasswordRecovery(values.email)
    if (error) {
      setError('root', { message: error })
      return
    }
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-xk-bg px-4 py-12">
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
          <h1 className="font-heading text-4xl font-bold text-xk-accent tracking-tight">Xokai</h1>
        </div>

        <div className="bg-xk-card rounded-2xl border border-xk-border shadow-sm p-8">

          {!sent ? (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-xk-text">Recuperar contraseña</h2>
                <p className="text-sm text-xk-text-secondary mt-1">
                  Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} noValidate>

                {errors.root && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5 mb-4 text-sm">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    {errors.root.message}
                  </div>
                )}

                <div>
                  <Label htmlFor="email">Correo electrónico</Label>
                  <div className="relative mt-1.5">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-xk-text-muted pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@correo.com"
                      className="pl-9"
                      autoComplete="email"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full mt-6 h-11"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {isSubmitting ? 'Enviando…' : 'Enviar enlace de recuperación'}
                </Button>

              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-xk-accent-light mb-4">
                <CheckCircle2 size={28} className="text-xk-accent" />
              </div>
              <h3 className="font-semibold text-xk-text text-base mb-2">Correo enviado</h3>
              <p className="text-sm text-xk-text-secondary mb-6">
                Si <strong>{getValues('email')}</strong> tiene una cuenta en Xokai,
                recibirás un enlace para restablecer tu contraseña.
              </p>
              <p className="text-xs text-xk-text-muted">
                Revisa también tu carpeta de spam.
              </p>
            </div>
          )}

        </div>

        <div className="mt-6 text-center">
          <a href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-xk-accent hover:text-xk-accent-dark font-medium">
            <ArrowLeft size={14} />
            Volver al inicio de sesión
          </a>
        </div>

      </div>
    </div>
  )
}
