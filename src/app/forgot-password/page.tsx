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
    <div className="min-h-screen flex items-center justify-center bg-xk-accent-light/30 px-4">
      <div className="w-full max-w-[400px]">

        <div className="bg-white rounded-2xl border border-xk-border shadow-lg p-8">

          {/* Logo inline */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-xk-accent flex items-center justify-center shrink-0">
              <span className="font-heading font-bold text-white text-lg leading-none">X</span>
            </div>
            <span className="font-heading font-bold text-xk-text text-xl">Xokai</span>
          </div>

          {!sent ? (
            <>
              <h1 className="font-heading text-2xl font-bold text-xk-text mb-1">
                ¿Olvidaste tu contraseña?
              </h1>
              <p className="text-sm text-xk-text-muted mb-6">
                Ingresa tu email y te enviaremos un enlace de recuperación
              </p>

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
                  className="w-full mt-6 h-10 bg-xk-accent hover:bg-xk-accent-dark text-white rounded-lg font-medium"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {isSubmitting ? 'Enviando…' : 'Enviar instrucciones'}
                </Button>

              </form>

              <div className="mt-5 text-center">
                <a href="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-xk-accent hover:text-xk-accent-dark font-medium">
                  <ArrowLeft size={14} />
                  Volver al inicio de sesión
                </a>
              </div>
            </>
          ) : (
            <>
              <div className="text-center py-2">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-xk-accent-light mb-4">
                  <CheckCircle2 size={28} className="text-xk-accent" />
                </div>
                <h2 className="font-heading text-2xl font-bold text-xk-text mb-2">Correo enviado</h2>
                <p className="text-sm text-xk-text-secondary mb-4">
                  Si <strong>{getValues('email')}</strong> tiene una cuenta en Xokai,
                  recibirás un enlace para restablecer tu contraseña.
                </p>
                <p className="text-xs text-xk-text-muted">
                  Revisa también tu carpeta de spam.
                </p>
              </div>

              <div className="mt-6 text-center">
                <a href="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-xk-accent hover:text-xk-accent-dark font-medium">
                  <ArrowLeft size={14} />
                  Volver al inicio de sesión
                </a>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  )
}
