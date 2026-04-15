'use client'

import { useState, useRef } from 'react'
import { useRouter }        from 'next/navigation'
import { useForm }          from 'react-hook-form'
import { zodResolver }      from '@hookform/resolvers/zod'
import { z }                from 'zod'
import { toast }            from 'sonner'
import {
  Loader2, Building2, FileText, Clock, CheckCircle2,
  ChevronRight, ChevronLeft, Upload, X, AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input }  from '@/components/ui/input'
import { Label }  from '@/components/ui/label'
import { completeOnboarding } from '@/app/actions/onboarding'
import { supabase } from '@/lib/supabase/client'

// ─── Schemas por paso ─────────────────────────────────────────────────────────

const step1Schema = z.object({
  nombre:    z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  shortName: z.string().max(20).optional(),
  direccion: z.string().min(5, 'Ingresa la dirección completa'),
  ciudad:    z.string().min(2, 'Ingresa la ciudad'),
  estado:    z.string().min(2, 'Ingresa el estado'),
  telefono:  z.string().optional(),
  email:     z.string().email('Correo inválido').optional().or(z.literal('')),
})

const step2Schema = z.object({
  rfc:           z.string()
                   .min(12, 'El RFC debe tener 12 o 13 caracteres')
                   .max(13, 'El RFC debe tener 12 o 13 caracteres')
                   .regex(/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/, 'RFC inválido'),
  razonSocial:   z.string().min(3, 'Ingresa la razón social'),
  cpFiscal:      z.string().length(5, 'El CP debe tener 5 dígitos'),
  regimenFiscal: z.string().min(1, 'Selecciona el régimen fiscal'),
})

const step3Schema = z.object({
  pickupInicio:     z.string().min(1, 'Ingresa la hora de inicio'),
  pickupFin:        z.string().min(1, 'Ingresa la hora de fin'),
  pickupTolerancia: z
                      .number()
                      .int()
                      .min(0, 'Mínimo 0 minutos')
                      .max(60, 'Máximo 60 minutos'),
}).refine(
  (d) => d.pickupInicio < d.pickupFin,
  { message: 'La hora de fin debe ser posterior a la de inicio', path: ['pickupFin'] }
)

type Step1 = z.infer<typeof step1Schema>
type Step2 = z.infer<typeof step2Schema>
type Step3 = z.infer<typeof step3Schema>

// ─── Constantes ───────────────────────────────────────────────────────────────

const REGIMENES = [
  { value: '601', label: '601 — General de Ley Personas Morales' },
  { value: '603', label: '603 — Personas Morales con Fines no Lucrativos' },
  { value: '612', label: '612 — Personas Físicas con Actividades Empresariales' },
  { value: '626', label: '626 — Régimen Simplificado de Confianza' },
]

const STEPS = [
  { id: 1, label: 'Escuela',       icon: Building2 },
  { id: 2, label: 'Datos fiscales', icon: FileText  },
  { id: 3, label: 'Pickup',        icon: Clock      },
  { id: 4, label: 'Confirmación',  icon: CheckCircle2 },
]

// ─── Componente ───────────────────────────────────────────────────────────────

interface Props { userEmail: string }

export default function OnboardingClient({ userEmail }: Props) {
  const router = useRouter()

  const [step,       setStep]       = useState(1)
  const [logoUrl,    setLogoUrl]    = useState<string | null>(null)
  const [uploading,  setUploading]  = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Acumular datos de pasos anteriores
  const [data1, setData1] = useState<Step1 | null>(null)
  const [data2, setData2] = useState<Step2 | null>(null)
  const [data3, setData3] = useState<Step3 | null>(null)

  const form1 = useForm<Step1>({ resolver: zodResolver(step1Schema) })
  const form2 = useForm<Step2>({ resolver: zodResolver(step2Schema), defaultValues: { regimenFiscal: '' } })
  const form3 = useForm<Step3>({ resolver: zodResolver(step3Schema), defaultValues: { pickupTolerancia: 10 } })

  // ─── Upload logo ────────────────────────────────────────────────────────────

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('El logo debe pesar menos de 2 MB')
      return
    }
    setUploading(true)
    try {
      const ext  = file.name.split('.').pop()
      const path = `logos/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('school-assets').upload(path, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from('school-assets').getPublicUrl(path)
      setLogoUrl(data.publicUrl)
      toast.success('Logo subido correctamente')
    } catch {
      toast.error('Error al subir el logo. Intenta de nuevo.')
    } finally {
      setUploading(false)
    }
  }

  // ─── Pasos ──────────────────────────────────────────────────────────────────

  function onStep1(values: Step1) { setData1(values); setStep(2) }
  function onStep2(values: Step2) { setData2(values); setStep(3) }
  function onStep3(values: Step3) { setData3(values); setStep(4) }

  async function handleFinish() {
    if (!data1 || !data2 || !data3) return
    setSubmitting(true)
    try {
      const { error } = await completeOnboarding({
        nombre:           data1.nombre,
        shortName:        data1.shortName ?? '',
        logoUrl,
        direccion:        data1.direccion,
        ciudad:           data1.ciudad,
        estado:           data1.estado,
        telefono:         data1.telefono ?? '',
        email:            data1.email ?? '',
        rfc:              data2.rfc,
        razonSocial:      data2.razonSocial,
        cpFiscal:         data2.cpFiscal,
        regimenFiscal:    data2.regimenFiscal,
        pickupInicio:     data3.pickupInicio,
        pickupFin:        data3.pickupFin,
        pickupTolerancia: data3.pickupTolerancia,
      })
      if (error) {
        toast.error(error)
        setSubmitting(false)
        return
      }
      toast.success('¡Escuela configurada exitosamente!')
      router.push('/dashboard')
      router.refresh()
    } catch {
      toast.error('Ocurrió un error. Intenta de nuevo.')
      setSubmitting(false)
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-xk-bg flex flex-col">

      {/* Header */}
      <header className="border-b border-xk-border bg-xk-card px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-xk-accent flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff"
            strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <span className="font-heading text-xl font-bold text-xk-accent">Xokai</span>
        <span className="text-xk-text-muted text-sm">— Configura tu escuela</span>
      </header>

      <div className="flex-1 flex items-start justify-center py-10 px-4">
        <div className="w-full max-w-2xl">

          {/* Stepper */}
          <div className="flex items-center mb-10">
            {STEPS.map((s, i) => {
              const Icon    = s.icon
              const done    = step > s.id
              const current = step === s.id
              return (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    <div className={[
                      'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
                      done    ? 'bg-xk-accent text-white'
                      : current ? 'bg-xk-accent text-white ring-4 ring-xk-accent-light'
                      :           'bg-xk-subtle text-xk-text-muted',
                    ].join(' ')}>
                      {done ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                    </div>
                    <span className={[
                      'text-xs font-medium hidden sm:block',
                      current ? 'text-xk-accent' : done ? 'text-xk-text-secondary' : 'text-xk-text-muted',
                    ].join(' ')}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={[
                      'h-0.5 flex-1 mx-2 transition-colors',
                      step > s.id ? 'bg-xk-accent' : 'bg-xk-border',
                    ].join(' ')} />
                  )}
                </div>
              )
            })}
          </div>

          {/* ── Paso 1: Datos de la escuela ── */}
          {step === 1 && (
            <div className="bg-xk-card rounded-2xl border border-xk-border shadow-sm p-8">
              <h2 className="font-heading text-2xl font-bold text-xk-text mb-1">Datos de la escuela</h2>
              <p className="text-sm text-xk-text-secondary mb-6">Información principal de tu institución.</p>

              <form onSubmit={form1.handleSubmit(onStep1)} noValidate>
                <div className="space-y-4">

                  {/* Logo */}
                  <div>
                    <Label>Logo (opcional)</Label>
                    <div className="mt-1.5 flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl border-2 border-dashed border-xk-border bg-xk-subtle flex items-center justify-center overflow-hidden">
                        {logoUrl
                          ? <img src={logoUrl} alt="logo" className="w-full h-full object-cover rounded-xl" />
                          : <Building2 size={24} className="text-xk-text-muted" />
                        }
                      </div>
                      <div>
                        <Button type="button" variant="outline" size="sm"
                          onClick={() => fileRef.current?.click()}
                          disabled={uploading}>
                          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                          {uploading ? 'Subiendo…' : 'Subir logo'}
                        </Button>
                        {logoUrl && (
                          <button type="button" onClick={() => setLogoUrl(null)}
                            className="ml-2 text-xs text-xk-text-muted hover:text-xk-danger flex items-center gap-1">
                            <X size={12} /> Quitar
                          </button>
                        )}
                        <p className="text-xs text-xk-text-muted mt-1">PNG o JPG · Máx. 2 MB</p>
                      </div>
                    </div>
                    <input ref={fileRef} type="file" accept="image/*"
                      className="hidden" onChange={handleLogoUpload} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Label htmlFor="nombre">Nombre de la escuela *</Label>
                      <Input id="nombre" placeholder="Hábitat Learning Community"
                        className="mt-1.5" {...form1.register('nombre')} />
                      {form1.formState.errors.nombre && (
                        <p className="text-red-600 text-xs mt-1">{form1.formState.errors.nombre.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="shortName">Nombre corto</Label>
                      <Input id="shortName" placeholder="Hábitat"
                        className="mt-1.5" {...form1.register('shortName')} />
                    </div>
                    <div>
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input id="telefono" placeholder="33 1234 5678"
                        className="mt-1.5" {...form1.register('telefono')} />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="direccion">Dirección *</Label>
                      <Input id="direccion" placeholder="Calle, número, colonia"
                        className="mt-1.5" {...form1.register('direccion')} />
                      {form1.formState.errors.direccion && (
                        <p className="text-red-600 text-xs mt-1">{form1.formState.errors.direccion.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="ciudad">Ciudad *</Label>
                      <Input id="ciudad" placeholder="Guadalajara"
                        className="mt-1.5" {...form1.register('ciudad')} />
                      {form1.formState.errors.ciudad && (
                        <p className="text-red-600 text-xs mt-1">{form1.formState.errors.ciudad.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="estado">Estado *</Label>
                      <Input id="estado" placeholder="Jalisco"
                        className="mt-1.5" {...form1.register('estado')} />
                      {form1.formState.errors.estado && (
                        <p className="text-red-600 text-xs mt-1">{form1.formState.errors.estado.message}</p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="email-esc">Correo institucional</Label>
                      <Input id="email-esc" type="email" placeholder="contacto@miescuela.edu.mx"
                        className="mt-1.5" {...form1.register('email')} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-8">
                  <Button type="submit" className="gap-2">
                    Siguiente <ChevronRight size={16} />
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* ── Paso 2: Datos fiscales ── */}
          {step === 2 && (
            <div className="bg-xk-card rounded-2xl border border-xk-border shadow-sm p-8">
              <h2 className="font-heading text-2xl font-bold text-xk-text mb-1">Datos fiscales</h2>
              <p className="text-sm text-xk-text-secondary mb-6">
                Necesarios para generar CFDI 4.0 en pagos de colegiaturas.
              </p>

              <form onSubmit={form2.handleSubmit(onStep2)} noValidate>
                <div className="space-y-4">

                  <div>
                    <Label htmlFor="rfc">RFC *</Label>
                    <Input id="rfc" placeholder="XAXX010101000"
                      className="mt-1.5 uppercase"
                      {...form2.register('rfc')}
                      onChange={(e) => {
                        e.target.value = e.target.value.toUpperCase()
                        form2.register('rfc').onChange(e)
                      }}
                    />
                    {form2.formState.errors.rfc && (
                      <p className="text-red-600 text-xs mt-1">{form2.formState.errors.rfc.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="razonSocial">Razón social *</Label>
                    <Input id="razonSocial" placeholder="MI COLEGIO S.C."
                      className="mt-1.5" {...form2.register('razonSocial')} />
                    {form2.formState.errors.razonSocial && (
                      <p className="text-red-600 text-xs mt-1">{form2.formState.errors.razonSocial.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cpFiscal">Código postal fiscal *</Label>
                      <Input id="cpFiscal" placeholder="44100"
                        maxLength={5} className="mt-1.5"
                        {...form2.register('cpFiscal')} />
                      {form2.formState.errors.cpFiscal && (
                        <p className="text-red-600 text-xs mt-1">{form2.formState.errors.cpFiscal.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="regimenFiscal">Régimen fiscal *</Label>
                      <select
                        id="regimenFiscal"
                        {...form2.register('regimenFiscal')}
                        className="mt-1.5 flex h-9 w-full rounded-xl border border-xk-border bg-xk-card px-3 py-2 text-sm text-xk-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xk-accent"
                      >
                        <option value="">Seleccionar…</option>
                        {REGIMENES.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                      {form2.formState.errors.regimenFiscal && (
                        <p className="text-red-600 text-xs mt-1">{form2.formState.errors.regimenFiscal.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-xk-accent-light rounded-xl p-3 text-sm text-xk-accent">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    Estos datos se usarán en todos los CFDI generados por Xokai.
                    Asegúrate de que coincidan con tu constancia de situación fiscal.
                  </div>

                </div>

                <div className="flex items-center justify-between mt-8">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="gap-2">
                    <ChevronLeft size={16} /> Anterior
                  </Button>
                  <Button type="submit" className="gap-2">
                    Siguiente <ChevronRight size={16} />
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* ── Paso 3: Horarios de pickup ── */}
          {step === 3 && (
            <div className="bg-xk-card rounded-2xl border border-xk-border shadow-sm p-8">
              <h2 className="font-heading text-2xl font-bold text-xk-text mb-1">Horarios de pickup</h2>
              <p className="text-sm text-xk-text-secondary mb-6">
                Define cuándo se activa el semáforo de salida.
              </p>

              <form onSubmit={form3.handleSubmit(onStep3)} noValidate>
                <div className="space-y-5">

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pickupInicio">Hora de inicio *</Label>
                      <Input id="pickupInicio" type="time"
                        className="mt-1.5" {...form3.register('pickupInicio')} />
                      {form3.formState.errors.pickupInicio && (
                        <p className="text-red-600 text-xs mt-1">{form3.formState.errors.pickupInicio.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="pickupFin">Hora de fin *</Label>
                      <Input id="pickupFin" type="time"
                        className="mt-1.5" {...form3.register('pickupFin')} />
                      {form3.formState.errors.pickupFin && (
                        <p className="text-red-600 text-xs mt-1">{form3.formState.errors.pickupFin.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="pickupTolerancia">Tolerancia (minutos)</Label>
                    <p className="text-xs text-xk-text-muted mt-0.5 mb-1.5">
                      Tiempo extra tras la hora de fin antes de cerrar el semáforo.
                    </p>
                    <Input id="pickupTolerancia" type="number"
                      min={0} max={60} className="w-32"
                      {...form3.register('pickupTolerancia', { valueAsNumber: true })} />
                    {form3.formState.errors.pickupTolerancia && (
                      <p className="text-red-600 text-xs mt-1">{form3.formState.errors.pickupTolerancia.message}</p>
                    )}
                  </div>

                  <div className="bg-xk-subtle rounded-xl p-4 space-y-2 text-sm">
                    <p className="font-medium text-xk-text">¿Cómo funciona el semáforo?</p>
                    <p className="text-xk-text-secondary">
                      🔴 Cerrado — fuera de horario<br />
                      🟡 En espera — padre llegó, alumno aún no baja<br />
                      🟢 Listo — alumno llamado al portón
                    </p>
                  </div>

                </div>

                <div className="flex items-center justify-between mt-8">
                  <Button type="button" variant="outline" onClick={() => setStep(2)} className="gap-2">
                    <ChevronLeft size={16} /> Anterior
                  </Button>
                  <Button type="submit" className="gap-2">
                    Siguiente <ChevronRight size={16} />
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* ── Paso 4: Confirmación ── */}
          {step === 4 && data1 && data2 && data3 && (
            <div className="bg-xk-card rounded-2xl border border-xk-border shadow-sm p-8">
              <h2 className="font-heading text-2xl font-bold text-xk-text mb-1">Confirmación</h2>
              <p className="text-sm text-xk-text-secondary mb-6">
                Revisa los datos antes de activar tu escuela en Xokai.
              </p>

              <div className="space-y-5">

                {/* Resumen escuela */}
                <div className="bg-xk-subtle rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-xk-text-muted uppercase tracking-wider mb-3">
                    Escuela
                  </p>
                  <Row label="Nombre"    value={data1.nombre} />
                  <Row label="Dirección" value={`${data1.direccion}, ${data1.ciudad}, ${data1.estado}`} />
                  {data1.telefono && <Row label="Teléfono" value={data1.telefono} />}
                </div>

                {/* Resumen fiscal */}
                <div className="bg-xk-subtle rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-xk-text-muted uppercase tracking-wider mb-3">
                    Datos fiscales
                  </p>
                  <Row label="RFC"          value={data2.rfc} />
                  <Row label="Razón social" value={data2.razonSocial} />
                  <Row label="CP fiscal"    value={data2.cpFiscal} />
                </div>

                {/* Resumen pickup */}
                <div className="bg-xk-subtle rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-xk-text-muted uppercase tracking-wider mb-3">
                    Pickup
                  </p>
                  <Row label="Horario"     value={`${data3.pickupInicio} — ${data3.pickupFin}`} />
                  <Row label="Tolerancia"  value={`${data3.pickupTolerancia} minutos`} />
                </div>

              </div>

              <div className="flex items-center justify-between mt-8">
                <Button type="button" variant="outline" onClick={() => setStep(3)} className="gap-2">
                  <ChevronLeft size={16} /> Anterior
                </Button>
                <Button onClick={handleFinish} disabled={submitting} className="gap-2 h-11 px-6">
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {submitting ? 'Activando…' : '¡Activar mi escuela!'}
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <span className="text-xk-text-secondary shrink-0">{label}</span>
      <span className="text-xk-text font-medium text-right">{value}</span>
    </div>
  )
}
