'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm }   from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input }  from '@/components/ui/input'
import { Label }  from '@/components/ui/label'
import { updatePassword } from '@/app/actions/auth'

const schema = z
  .object({
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

export default function ResetPasswordPage() {
  const router = useRouter()
  const [showPw,  setShowPw]  = useState(false)
  const [showCfm, setShowCfm] = useState(false)
  const [done, setDone]       = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } =
    useForm<Form>({ resolver: zodResolver(schema) })

  async function onSubmit(values: Form) {
    const { error } = await updatePassword(values.password)
    if (error) {
      setError('root', { message: error })
      return
    }
    setDone(true)
    toast.success('Contraseña actualizada correctamente')
    setTimeout(() => router.push('/dashboard'), 2000)
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

          {!done ? (
            <>
              <h1 className="font-heading text-2xl font-bold text-xk-text mb-1">
                Nueva contraseña
              </h1>
              <p className="text-sm text-xk-text-muted mb-6">
                Crea una contraseña segura para tu cuenta Xokai.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} noValidate>

                {errors.root && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5 mb-4 text-sm">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    {errors.root.message}
                  </div>
                )}

                <div className="space-y-4">

                  <div>
                    <Label htmlFor="password">Nueva contraseña</Label>
                    <div className="relative mt-1.5">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-xk-text-muted pointer-events-none" />
                      <Input
                        id="password"
                        type={showPw ? 'text' : 'password'}
                        placeholder="Mín. 8 caracteres"
                        className="pl-9 pr-10"
                        autoComplete="new-password"
                        {...register('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xk-text-muted hover:text-xk-text"
                        tabIndex={-1}
                      >
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>
                    )}
                    <p className="text-xs text-xk-text-muted mt-1">Mínimo 8 caracteres, una mayúscula y un número</p>
                  </div>

                  <div>
                    <Label htmlFor="confirm">Confirmar contraseña</Label>
                    <div className="relative mt-1.5">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-xk-text-muted pointer-events-none" />
                      <Input
                        id="confirm"
                        type={showCfm ? 'text' : 'password'}
                        placeholder="Repite la contraseña"
                        className="pl-9 pr-10"
                        autoComplete="new-password"
                        {...register('confirm')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCfm(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xk-text-muted hover:text-xk-text"
                        tabIndex={-1}
                      >
                        {showCfm ? <EyeOff size={16} /> : <Eye size={16} />}
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
                  {isSubmitting ? 'Actualizando…' : 'Actualizar contraseña'}
                </Button>

              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-xk-accent-light mb-4">
                <CheckCircle2 size={28} className="text-xk-accent" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-xk-text mb-2">
                ¡Contraseña actualizada!
              </h2>
              <p className="text-sm text-xk-text-secondary">
                Redirigiendo al dashboard…
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  )
}
