'use client'

import { useState }   from 'react'
import { useRouter }  from 'next/navigation'
import { useForm }    from 'react-hook-form'
import { zodResolver }from '@hookform/resolvers/zod'
import { z }          from 'zod'
import { Loader2, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input }  from '@/components/ui/input'
import { Label }  from '@/components/ui/label'
import { signUp } from '@/app/actions/auth'

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z
  .object({
    email:    z.string().email('Correo inválido'),
    password: z
      .string()
      .min(8,    'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Incluye al menos una mayúscula')
      .regex(/[0-9]/, 'Incluye al menos un número'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Las contraseñas no coinciden',
    path:    ['confirm'],
  })

type Form = z.infer<typeof schema>

// ─── Componente ──────────────────────────────────────────────────────────────

export default function SignupPage() {
  const router = useRouter()
  const [showPw,  setShowPw]  = useState(false)
  const [showCfm, setShowCfm] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } =
    useForm<Form>({ resolver: zodResolver(schema) })

  async function onSubmit(values: Form) {
    const { error } = await signUp(values.email, values.password)
    if (error) { setError('root', { message: error }); return }
    router.push('/onboarding')
    router.refresh()
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
          <p className="text-xk-text-secondary text-sm mt-1">Crea tu cuenta</p>
        </div>

        {/* Card */}
        <div className="bg-xk-card rounded-2xl border border-xk-border shadow-sm p-8">
          <h2 className="text-xl font-semibold text-xk-text mb-6">Registro</h2>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>

            {errors.root && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5 mb-4 text-sm">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                {errors.root.message}
              </div>
            )}

            <div className="space-y-4">

              <div>
                <Label htmlFor="su-email">Correo electrónico</Label>
                <div className="relative mt-1.5">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-xk-text-muted pointer-events-none" />
                  <Input
                    id="su-email"
                    type="email"
                    placeholder="director@colegio.edu.mx"
                    className="pl-9"
                    autoComplete="email"
                    {...register('email')}
                  />
                </div>
                {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <Label htmlFor="su-password">Contraseña</Label>
                <div className="relative mt-1.5">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-xk-text-muted pointer-events-none" />
                  <Input
                    id="su-password"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Mín. 8 caracteres"
                    className="pl-9 pr-10"
                    autoComplete="new-password"
                    {...register('password')}
                  />
                  <button type="button" tabIndex={-1}
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xk-text-muted hover:text-xk-text">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <Label htmlFor="su-confirm">Confirmar contraseña</Label>
                <div className="relative mt-1.5">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-xk-text-muted pointer-events-none" />
                  <Input
                    id="su-confirm"
                    type={showCfm ? 'text' : 'password'}
                    placeholder="Repite la contraseña"
                    className="pl-9 pr-10"
                    autoComplete="new-password"
                    {...register('confirm')}
                  />
                  <button type="button" tabIndex={-1}
                    onClick={() => setShowCfm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xk-text-muted hover:text-xk-text">
                    {showCfm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.confirm && <p className="text-red-600 text-xs mt-1">{errors.confirm.message}</p>}
              </div>

              <ul className="text-xs text-xk-text-muted space-y-0.5">
                <li>· Mínimo 8 caracteres</li>
                <li>· Al menos una mayúscula y un número</li>
              </ul>

            </div>

            <Button type="submit" className="w-full mt-6 h-11" disabled={isSubmitting}>
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
            </Button>

          </form>
        </div>

        <p className="text-center text-sm text-xk-text-secondary mt-5">
          ¿Ya tienes cuenta?{' '}
          <a href="/login" className="text-xk-accent hover:text-xk-accent-dark font-semibold">
            Iniciar sesión
          </a>
        </p>

        <p className="text-center text-xs text-xk-text-muted mt-3">
          © {new Date().getFullYear()} Xokai · Todos los derechos reservados
        </p>
      </div>
    </div>
  )
}
