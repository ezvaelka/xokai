'use client'

import { useState }         from 'react'
import { useRouter }        from 'next/navigation'
import { useForm }          from 'react-hook-form'
import { zodResolver }      from '@hookform/resolvers/zod'
import { z }                from 'zod'
import { toast }            from 'sonner'
import {
  Loader2, User, Lock, Eye, EyeOff, AlertCircle, CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input }  from '@/components/ui/input'
import { Label }  from '@/components/ui/label'
import { acceptInvitation } from '@/app/actions/invite'

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z
  .object({
    first_name: z.string().min(1, 'Ingresa tu nombre'),
    last_name:  z.string().min(1, 'Ingresa tu apellido'),
    password:   z
      .string()
      .min(8,    'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Incluye al menos una mayúscula')
      .regex(/[0-9]/, 'Incluye al menos un número'),
    confirm:    z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm'],
  })

type Form = z.infer<typeof schema>

// ─── Componente ───────────────────────────────────────────────────────────────

export default function InviteAcceptPage() {
  const router = useRouter()
  const [showPw,  setShowPw]  = useState(false)
  const [showCfm, setShowCfm] = useState(false)
  const [done,    setDone]    = useState(false)

  const {
    register, handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<Form>({ resolver: zodResolver(schema) })

  async function onSubmit(values: Form) {
    const { error } = await acceptInvitation({
      first_name: values.first_name,
      last_name:  values.last_name,
      password:   values.password,
    })

    if (error) {
      setError('root', { message: error })
      return
    }

    setDone(true)
    toast.success('¡Bienvenido a Xokai!')
    setTimeout(() => {
      router.push('/dashboard')
      router.refresh()
    }, 1500)
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
          <p className="text-xk-text-secondary text-sm mt-1">
            Fuiste invitado a unirte a la plataforma
          </p>
        </div>

        <div className="bg-xk-card rounded-2xl border border-xk-border shadow-sm p-8">

          {!done ? (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-xk-text">Crea tu cuenta</h2>
                <p className="text-sm text-xk-text-secondary mt-1">
                  Completa tu perfil para comenzar a usar Xokai.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} noValidate>

                {errors.root && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5 mb-4 text-sm">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    {errors.root.message}
                  </div>
                )}

                <div className="space-y-4">

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="first_name">Nombre(s)</Label>
                      <div className="relative mt-1.5">
                        <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-xk-text-muted" />
                        <Input
                          id="first_name"
                          placeholder="Ana"
                          className="pl-9"
                          autoComplete="given-name"
                          {...register('first_name')}
                        />
                      </div>
                      {errors.first_name && (
                        <p className="text-red-600 text-xs mt-1">{errors.first_name.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="last_name">Apellido(s)</Label>
                      <Input
                        id="last_name"
                        placeholder="García"
                        className="mt-1.5"
                        autoComplete="family-name"
                        {...register('last_name')}
                      />
                      {errors.last_name && (
                        <p className="text-red-600 text-xs mt-1">{errors.last_name.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="inv-password">Contraseña</Label>
                    <div className="relative mt-1.5">
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-xk-text-muted" />
                      <Input
                        id="inv-password"
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
                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="inv-confirm">Confirmar contraseña</Label>
                    <div className="relative mt-1.5">
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-xk-text-muted" />
                      <Input
                        id="inv-confirm"
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
                        {showCfm ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {errors.confirm && (
                      <p className="text-red-600 text-xs mt-1">{errors.confirm.message}</p>
                    )}
                  </div>

                  <ul className="text-xs text-xk-text-muted space-y-0.5">
                    <li>· Mínimo 8 caracteres</li>
                    <li>· Al menos una mayúscula y un número</li>
                  </ul>

                </div>

                <Button
                  type="submit"
                  className="w-full mt-6 h-11"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {isSubmitting ? 'Creando cuenta…' : 'Crear mi cuenta'}
                </Button>

              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-xk-accent-light mb-4">
                <CheckCircle2 size={32} className="text-xk-accent" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-xk-text mb-2">
                ¡Bienvenido!
              </h3>
              <p className="text-sm text-xk-text-secondary">
                Tu cuenta está lista. Entrando al dashboard…
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  )
}
