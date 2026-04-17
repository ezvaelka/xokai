'use client'

import { useState, useRef }   from 'react'
import { useRouter }          from 'next/navigation'
import { useForm }            from 'react-hook-form'
import { zodResolver }        from '@hookform/resolvers/zod'
import { z }                  from 'zod'
import { toast }              from 'sonner'
import {
  Loader2, User, Lock, Eye, EyeOff, Upload, LogOut,
  ShieldAlert, Camera, AlertCircle, Key, Copy, Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input }  from '@/components/ui/input'
import { Label }  from '@/components/ui/label'
import { updateProfile, updatePassword, signOutAll, uploadAvatar } from '@/app/actions/auth'

// ─── Schemas ─────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  first_name: z.string().min(1, 'Ingresa tu nombre'),
  last_name:  z.string().min(1, 'Ingresa tu apellido'),
})

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8,    'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Incluye al menos una mayúscula')
      .regex(/[0-9]/, 'Incluye al menos un número'),
    confirm:  z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Las contraseñas no coinciden',
    path:    ['confirm'],
  })

type ProfileForm  = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

// ─── Etiquetas de rol ─────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  sysadmin:    'Sysadmin',
  admin:       'Director',      // backward compat
  director:    'Director',
  coordinador: 'Coordinador',
  maestro:     'Maestro',
  teacher:     'Maestro',       // backward compat
  portero:     'Portero',
  finanzas:    'Finanzas',
  guardian:    'Padre / Tutor',
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface Props {
  userId:           string
  email:            string
  initialFirstName: string
  initialLastName:  string
  initialAvatarUrl: string | null
  role:             string
  joinCode:         string | null
}

export default function PerfilClient({
  userId, email, initialFirstName, initialLastName, initialAvatarUrl, role, joinCode
}: Props) {
  const router = useRouter()

  const [avatarUrl,    setAvatarUrl]    = useState<string | null>(initialAvatarUrl)
  const [uploading,    setUploading]    = useState(false)
  const [showPw,       setShowPw]       = useState(false)
  const [showCfm,      setShowCfm]      = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [loggingOut,   setLoggingOut]   = useState(false)
  const [copied,       setCopied]       = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { first_name: initialFirstName, last_name: initialLastName },
  })

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  // ─── Avatar ─────────────────────────────────────────────────────────────────

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { error, url } = await uploadAvatar(fd)
      if (error) { toast.error(error); return }
      setAvatarUrl(url)
      await updateProfile({
        first_name: profileForm.getValues('first_name'),
        last_name:  profileForm.getValues('last_name'),
        avatar_url: url ?? undefined,
      })
      toast.success('Foto actualizada')
    } catch {
      toast.error('Error al subir la foto. Intenta de nuevo.')
    } finally {
      setUploading(false)
    }
  }

  // ─── Perfil ─────────────────────────────────────────────────────────────────

  async function onProfileSave(values: ProfileForm) {
    const { error } = await updateProfile({ ...values, avatar_url: avatarUrl ?? undefined })
    if (error) {
      profileForm.setError('root', { message: error })
      return
    }
    toast.success('Perfil actualizado correctamente')
    router.refresh()
  }

  // ─── Contraseña ─────────────────────────────────────────────────────────────

  async function onPasswordSave(values: PasswordForm) {
    const { error } = await updatePassword(values.password)
    if (error) {
      passwordForm.setError('root', { message: error })
      return
    }
    toast.success('Contraseña actualizada correctamente')
    passwordForm.reset()
  }

  // ─── Cerrar sesión global ────────────────────────────────────────────────────

  async function handleSignOutAll() {
    setLoggingOut(true)
    await signOutAll()
  }

  const initials = ([initialFirstName[0], initialLastName[0]]
    .filter(Boolean)
    .join('') || email[0])
    .toUpperCase()

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl space-y-8">

      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-xk-text">Mi perfil</h1>
        <p className="text-xk-text-secondary mt-1">Gestiona tu información personal y seguridad.</p>
      </div>

      {/* ── Sección: foto + info básica ── */}
      <section className="bg-xk-card rounded-2xl border border-xk-border p-6">
        <h2 className="font-semibold text-xk-text mb-5 flex items-center gap-2">
          <User size={18} className="text-xk-accent" /> Información personal
        </h2>

        {/* Avatar */}
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-xk-border">
          <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="avatar" className="w-20 h-20 rounded-full object-cover border-2 border-xk-border" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-xk-accent to-xk-accent-dark flex items-center justify-center text-2xl font-bold text-white">
                {initials}
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {uploading
                ? <Loader2 size={20} className="text-white animate-spin" />
                : <Camera size={20} className="text-white" />
              }
            </div>
          </div>
          <div>
            <p className="font-medium text-xk-text">Foto de perfil</p>
            <p className="text-xs text-xk-text-muted mt-0.5">JPG o PNG · Máx. 3 MB</p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="mt-2 text-sm text-xk-accent hover:text-xk-accent-dark font-medium disabled:opacity-50"
            >
              {uploading ? 'Subiendo…' : 'Cambiar foto'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
        </div>

        {/* Correo (solo lectura) */}
        <div className="mb-4">
          <Label>Correo electrónico</Label>
          <div className="mt-1.5 flex h-9 w-full items-center rounded-xl border border-xk-border bg-xk-subtle px-3 text-sm text-xk-text-secondary">
            {email}
          </div>
          <p className="text-xs text-xk-text-muted mt-1">
            El correo no se puede cambiar desde aquí.
          </p>
        </div>

        {/* Rol */}
        <div className="mb-6">
          <Label>Rol</Label>
          <div className="mt-1.5 flex h-9 w-full items-center rounded-xl border border-xk-border bg-xk-subtle px-3 text-sm text-xk-text-secondary">
            {ROLE_LABELS[role] ?? role}
          </div>
        </div>

        {/* Nombre */}
        <form onSubmit={profileForm.handleSubmit(onProfileSave)} noValidate>
          {profileForm.formState.errors.root && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5 mb-4 text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {profileForm.formState.errors.root.message}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">Nombre(s)</Label>
              <Input id="first_name" placeholder="Ana" className="mt-1.5"
                autoComplete="given-name" {...profileForm.register('first_name')} />
              {profileForm.formState.errors.first_name && (
                <p className="text-red-600 text-xs mt-1">{profileForm.formState.errors.first_name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="last_name">Apellido(s)</Label>
              <Input id="last_name" placeholder="García" className="mt-1.5"
                autoComplete="family-name" {...profileForm.register('last_name')} />
              {profileForm.formState.errors.last_name && (
                <p className="text-red-600 text-xs mt-1">{profileForm.formState.errors.last_name.message}</p>
              )}
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button type="submit" disabled={profileForm.formState.isSubmitting} className="gap-2">
              {profileForm.formState.isSubmitting && <Loader2 size={14} className="animate-spin" />}
              {profileForm.formState.isSubmitting ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </section>

      {/* ── Sección: código de escuela ── */}
      {joinCode && (
        <section className="bg-xk-card rounded-2xl border border-xk-border p-6">
          <h2 className="font-semibold text-xk-text mb-1 flex items-center gap-2">
            <Key size={18} className="text-xk-accent" /> Código de acceso de la escuela
          </h2>
          <p className="text-sm text-xk-text-secondary mb-4">
            Comparte este código con maestros y staff para que se unan a tu escuela en Xokai.
          </p>
          <div className="flex items-center gap-3 bg-xk-subtle border border-xk-border rounded-xl px-4 py-3">
            <span className="font-mono text-2xl font-bold text-xk-text tracking-[0.2em] flex-1">
              {joinCode}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(joinCode)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-xk-card border border-xk-border text-xs font-medium text-xk-text-secondary hover:text-xk-accent hover:border-xk-accent transition-colors"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        </section>
      )}

      {/* ── Sección: cambiar contraseña ── */}
      <section className="bg-xk-card rounded-2xl border border-xk-border p-6">
        <h2 className="font-semibold text-xk-text mb-5 flex items-center gap-2">
          <Lock size={18} className="text-xk-accent" /> Contraseña
        </h2>

        <form onSubmit={passwordForm.handleSubmit(onPasswordSave)} noValidate>
          {passwordForm.formState.errors.root && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5 mb-4 text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {passwordForm.formState.errors.root.message}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="new-pw">Nueva contraseña</Label>
              <div className="relative mt-1.5">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-xk-text-muted" />
                <Input
                  id="new-pw"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Mín. 8 caracteres"
                  className="pl-9 pr-10"
                  autoComplete="new-password"
                  {...passwordForm.register('password')}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xk-text-muted hover:text-xk-text"
                  tabIndex={-1}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {passwordForm.formState.errors.password && (
                <p className="text-red-600 text-xs mt-1">{passwordForm.formState.errors.password.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="cfm-pw">Confirmar contraseña</Label>
              <div className="relative mt-1.5">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-xk-text-muted" />
                <Input
                  id="cfm-pw"
                  type={showCfm ? 'text' : 'password'}
                  placeholder="Repite la contraseña"
                  className="pl-9 pr-10"
                  autoComplete="new-password"
                  {...passwordForm.register('confirm')}
                />
                <button type="button" onClick={() => setShowCfm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xk-text-muted hover:text-xk-text"
                  tabIndex={-1}>
                  {showCfm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {passwordForm.formState.errors.confirm && (
                <p className="text-red-600 text-xs mt-1">{passwordForm.formState.errors.confirm.message}</p>
              )}
            </div>
          </div>

          <ul className="mt-3 text-xs text-xk-text-muted space-y-0.5">
            <li>· Mínimo 8 caracteres</li>
            <li>· Al menos una mayúscula y un número</li>
          </ul>

          <div className="flex justify-end mt-5">
            <Button type="submit" disabled={passwordForm.formState.isSubmitting} className="gap-2">
              {passwordForm.formState.isSubmitting && <Loader2 size={14} className="animate-spin" />}
              {passwordForm.formState.isSubmitting ? 'Guardando…' : 'Cambiar contraseña'}
            </Button>
          </div>
        </form>
      </section>

      {/* ── Sección: sesiones ── */}
      <section className="bg-xk-card rounded-2xl border border-xk-border p-6">
        <h2 className="font-semibold text-xk-text mb-1 flex items-center gap-2">
          <ShieldAlert size={18} className="text-xk-danger" /> Seguridad de sesión
        </h2>
        <p className="text-sm text-xk-text-secondary mb-5">
          Cierra sesión en todos los dispositivos donde tengas Xokai activo.
          Útil si perdiste acceso a algún dispositivo.
        </p>

        {!confirmLogout ? (
          <Button
            variant="outline"
            onClick={() => setConfirmLogout(true)}
            className="gap-2 border-xk-danger text-xk-danger hover:bg-red-50"
          >
            <LogOut size={16} />
            Cerrar sesión en todos los dispositivos
          </Button>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-700 font-medium mb-3">
              ¿Confirmas que quieres cerrar sesión en TODOS los dispositivos?
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleSignOutAll}
                disabled={loggingOut}
                className="gap-2"
              >
                {loggingOut && <Loader2 size={14} className="animate-spin" />}
                {loggingOut ? 'Cerrando…' : 'Sí, cerrar todas las sesiones'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmLogout(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </section>

    </div>
  )
}
