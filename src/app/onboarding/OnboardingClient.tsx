'use client'

import { useState, useRef }  from 'react'
import { useRouter }         from 'next/navigation'
import { useForm }           from 'react-hook-form'
import { zodResolver }       from '@hookform/resolvers/zod'
import { z }                 from 'zod'
import { toast }             from 'sonner'
import {
  Loader2, Building2, FileText, Clock, CheckCircle2,
  ChevronRight, ChevronLeft, Upload, X, AlertCircle,
  ArrowRight, Users, GraduationCap, User, MapPin, Key,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input }  from '@/components/ui/input'
import { Label }  from '@/components/ui/label'
import { completeOnboarding, joinSchool, uploadSchoolLogo } from '@/app/actions/onboarding'

// ─── Schemas ──────────────────────────────────────────────────────────────────

const nameSchema = z.object({
  first_name: z.string().min(1, 'Ingresa tu nombre'),
  last_name:  z.string().min(1, 'Ingresa tu apellido'),
})
const schoolNameSchema = z.object({
  nombre:    z.string().min(2, 'Al menos 2 caracteres'),
  shortName: z.string().max(20).optional(),
})
const detailsSchema = z.object({
  direccion: z.string().optional(),
  ciudad:    z.string().optional(),
  estado:    z.string().optional(),
  telefono:  z.string().optional(),
  email:     z.string().email('Correo inválido').optional().or(z.literal('')),
})
const fiscalSchema = z.object({
  rfc:           z.string().min(12, 'RFC inválido').max(13).regex(/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/, 'RFC inválido'),
  razonSocial:   z.string().min(3, 'Ingresa la razón social'),
  cpFiscal:      z.string().length(5, 'CP debe tener 5 dígitos'),
  regimenFiscal: z.string().min(1, 'Selecciona el régimen'),
})
const pickupSchema = z.object({
  pickupInicio:     z.string().min(1, 'Hora requerida'),
  pickupFin:        z.string().min(1, 'Hora requerida'),
  pickupTolerancia: z.number().int().min(0).max(60),
}).refine((d) => d.pickupInicio < d.pickupFin, { message: 'Fin debe ser posterior al inicio', path: ['pickupFin'] })
const joinSchema = z.object({
  join_code: z.string().min(4, 'Ingresa el código').max(12),
  role:      z.enum(['coordinador', 'maestro', 'portero', 'finanzas'], { required_error: 'Selecciona tu rol' }),
})

type NameForm     = z.infer<typeof nameSchema>
type SchoolForm   = z.infer<typeof schoolNameSchema>
type DetailsForm  = z.infer<typeof detailsSchema>
type FiscalForm   = z.infer<typeof fiscalSchema>
type PickupForm   = z.infer<typeof pickupSchema>
type JoinForm     = z.infer<typeof joinSchema>

// ─── Constantes ───────────────────────────────────────────────────────────────

const REGIMENES = [
  { value: '601', label: '601 — General de Ley Personas Morales' },
  { value: '603', label: '603 — Personas Morales con Fines no Lucrativos' },
  { value: '612', label: '612 — Personas Físicas con Actividades Empresariales' },
  { value: '626', label: '626 — Régimen Simplificado de Confianza' },
]
const DIRECTOR_STEPS = [
  { id: 1, label: 'Perfil',    Icon: User         },
  { id: 2, label: 'Escuela',   Icon: Building2    },
  { id: 3, label: 'Detalles',  Icon: MapPin       },
  { id: 4, label: 'Fiscales',  Icon: FileText     },
  { id: 5, label: 'Pickup',    Icon: Clock        },
  { id: 6, label: 'Confirmar', Icon: CheckCircle2 },
]
const STAFF_STEPS = [
  { id: 1, label: 'Perfil',  Icon: User         },
  { id: 2, label: 'Unirse',  Icon: Key          },
  { id: 3, label: '¡Listo!', Icon: CheckCircle2 },
]

// ─── Componente ───────────────────────────────────────────────────────────────

interface Props { userEmail: string }

export default function OnboardingClient({ userEmail }: Props) {
  const router = useRouter()

  const [userType,   setUserType]   = useState<'director' | 'staff' | null>(null)
  const [step,       setStep]       = useState(0)
  const [logoUrl,    setLogoUrl]    = useState<string | null>(null)
  const [uploading,  setUploading]  = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success,    setSuccess]    = useState<{ schoolName: string } | null>(null)
  const [staffDone,  setStaffDone]  = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [nameData,    setNameData]    = useState<NameForm | null>(null)
  const [schoolData,  setSchoolData]  = useState<SchoolForm | null>(null)
  const [detailsData, setDetailsData] = useState<DetailsForm | null>(null)
  const [fiscalData,  setFiscalData]  = useState<FiscalForm | null>(null)
  const [pickupData,  setPickupData]  = useState<PickupForm | null>(null)

  const fName    = useForm<NameForm>   ({ resolver: zodResolver(nameSchema)     })
  const fSchool  = useForm<SchoolForm> ({ resolver: zodResolver(schoolNameSchema) })
  const fDetails = useForm<DetailsForm>({ resolver: zodResolver(detailsSchema)  })
  const fFiscal  = useForm<FiscalForm> ({ resolver: zodResolver(fiscalSchema), defaultValues: { regimenFiscal: '' } })
  const fPickup  = useForm<PickupForm> ({ resolver: zodResolver(pickupSchema),  defaultValues: { pickupTolerancia: 10 } })
  const fJoin    = useForm<JoinForm>   ({ resolver: zodResolver(joinSchema)     })

  // ─── Handlers ─────────────────────────────────────────────────────────────

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { error, url } = await uploadSchoolLogo(fd)
      if (error) { toast.error(error); return }
      setLogoUrl(url)
      toast.success('Logo subido')
    } catch { toast.error('Error al subir el logo') }
    finally { setUploading(false) }
  }

  async function handleFinish() {
    if (!nameData || !schoolData) return
    setSubmitting(true)
    const { error } = await completeOnboarding({
      nombre: schoolData.nombre, shortName: schoolData.shortName ?? '',
      first_name: nameData.first_name, last_name: nameData.last_name, logoUrl,
      direccion: detailsData?.direccion ?? '', ciudad: detailsData?.ciudad ?? '',
      estado: detailsData?.estado ?? '', telefono: detailsData?.telefono ?? '',
      email: detailsData?.email ?? '',
      rfc: fiscalData?.rfc ?? '', razonSocial: fiscalData?.razonSocial ?? '',
      cpFiscal: fiscalData?.cpFiscal ?? '', regimenFiscal: fiscalData?.regimenFiscal ?? '',
      pickupInicio: pickupData?.pickupInicio ?? '', pickupFin: pickupData?.pickupFin ?? '',
      pickupTolerancia: pickupData?.pickupTolerancia ?? 10,
    })
    if (error) { toast.error(error); setSubmitting(false); return }
    setSuccess({ schoolName: schoolData.nombre })
  }

  async function handleJoin(values: JoinForm) {
    if (!nameData) return
    const { error } = await joinSchool({
      join_code: values.join_code, role: values.role,
      first_name: nameData.first_name, last_name: nameData.last_name,
    })
    if (error) { fJoin.setError('join_code', { message: error }); return }
    setStaffDone(true)
  }

  // ─── Stepper helper ────────────────────────────────────────────────────────

  function Stepper() {
    const steps = userType === 'staff' ? STAFF_STEPS : DIRECTOR_STEPS
    return (
      <div className="flex items-center mb-10">
        {steps.map((s, i) => {
          const done = step > s.id, current = step === s.id
          return (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div className={['w-10 h-10 rounded-full flex items-center justify-center transition-all',
                  done ? 'bg-xk-accent text-white' : current ? 'bg-xk-accent text-white ring-4 ring-xk-accent-light' : 'bg-xk-subtle text-xk-text-muted'].join(' ')}>
                  {done ? <CheckCircle2 size={18} /> : <s.Icon size={18} />}
                </div>
                <span className={['text-xs font-medium hidden sm:block', current ? 'text-xk-accent' : done ? 'text-xk-text-secondary' : 'text-xk-text-muted'].join(' ')}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={['h-0.5 flex-1 mx-2 transition-colors', step > s.id ? 'bg-xk-accent' : 'bg-xk-border'].join(' ')} />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // ─── Director success ──────────────────────────────────────────────────────

  if (success) return (
    <div className="min-h-screen bg-xk-bg flex flex-col">
      <Header subtitle="¡Ya casi terminas!" />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-xk-accent-light mb-5 ring-8 ring-xk-accent-light/50">
            <CheckCircle2 size={40} className="text-xk-accent" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-xk-text mb-2">¡{success.schoolName} está lista!</h1>
          <p className="text-xk-text-secondary mb-8">Tu escuela fue activada en Xokai.</p>
          <div className="bg-xk-card rounded-2xl border border-xk-border shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-xk-border bg-xk-subtle">
              <p className="text-xs font-semibold text-xk-text-muted uppercase tracking-wider">Próximos pasos</p>
            </div>
            <div className="divide-y divide-xk-border">
              <NextStepBtn icon={Users} label="Ver código de acceso" sub="Compártelo con tu equipo" onClick={() => router.push('/dashboard/configuracion/usuarios')} />
              <NextStepBtn icon={GraduationCap} label="Registrar alumnos" sub="Importa o agrega alumnos" onClick={() => router.push('/dashboard/alumnos')} />
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard')} className="w-full h-11 gap-2">
            Ir al dashboard <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  )

  // ─── Staff success ─────────────────────────────────────────────────────────

  if (staffDone) return (
    <div className="min-h-screen bg-xk-bg flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-xk-accent-light mb-5 ring-8 ring-xk-accent-light/50">
            <CheckCircle2 size={40} className="text-xk-accent" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-xk-text mb-2">¡Bienvenido a Xokai!</h1>
          <p className="text-xk-text-secondary mb-8">Ya tienes acceso a tu escuela. Entra al dashboard para comenzar.</p>
          <Button onClick={() => { router.push('/dashboard'); router.refresh() }} className="w-full h-11 gap-2">
            Ir al dashboard <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  )

  // ─── Wizard ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-xk-bg flex flex-col">
      <Header subtitle={step === 0 ? undefined : 'Configura tu cuenta'} />
      <div className="flex-1 flex items-start justify-center py-10 px-4">
        <div className="w-full max-w-2xl">

          {step > 0 && <Stepper />}

          {/* ── Step 0: Elegir tipo ── */}
          {step === 0 && (
            <div className="flex flex-col items-center py-8">
              <h2 className="font-heading text-3xl font-bold text-xk-text mb-2 text-center">¿Cómo vas a usar Xokai?</h2>
              <p className="text-xk-text-secondary mb-10 text-center">Cuéntanos sobre ti para personalizar tu experiencia.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                <button onClick={() => { setUserType('director'); setStep(1) }}
                  className="group bg-xk-card border-2 border-xk-border hover:border-xk-accent rounded-2xl p-8 text-left transition-all hover:shadow-lg">
                  <div className="w-14 h-14 rounded-2xl bg-xk-accent-light flex items-center justify-center mb-4 group-hover:bg-xk-accent transition-colors">
                    <Building2 size={28} className="text-xk-accent group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-xk-text mb-1">Soy director/a</h3>
                  <p className="text-sm text-xk-text-secondary">Voy a crear y gestionar mi escuela en Xokai.</p>
                </button>
                <button onClick={() => { setUserType('staff'); setStep(1) }}
                  className="group bg-xk-card border-2 border-xk-border hover:border-xk-accent rounded-2xl p-8 text-left transition-all hover:shadow-lg">
                  <div className="w-14 h-14 rounded-2xl bg-xk-accent-light flex items-center justify-center mb-4 group-hover:bg-xk-accent transition-colors">
                    <Users size={28} className="text-xk-accent group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-xk-text mb-1">Me uno a una escuela</h3>
                  <p className="text-sm text-xk-text-secondary">Mi escuela ya está en Xokai. Tengo un código de acceso.</p>
                </button>
              </div>
            </div>
          )}

          {/* ── Step 1: Tu nombre (ambos) ── */}
          {step === 1 && (
            <div className="bg-xk-card rounded-2xl border border-xk-border shadow-sm p-8">
              <h2 className="font-heading text-2xl font-bold text-xk-text mb-1">Tu nombre</h2>
              <p className="text-sm text-xk-text-secondary mb-6">Así te identificarás en la plataforma.</p>
              <form onSubmit={fName.handleSubmit((v) => { setNameData(v); setStep(2) })} noValidate>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fn">Nombre(s) <span className="text-xk-danger">*</span></Label>
                    <Input id="fn" placeholder="Ana" className="mt-1.5" {...fName.register('first_name')} />
                    {fName.formState.errors.first_name && <p className="text-red-600 text-xs mt-1">{fName.formState.errors.first_name.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="ln">Apellido(s) <span className="text-xk-danger">*</span></Label>
                    <Input id="ln" placeholder="García" className="mt-1.5" {...fName.register('last_name')} />
                    {fName.formState.errors.last_name && <p className="text-red-600 text-xs mt-1">{fName.formState.errors.last_name.message}</p>}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-8">
                  <Button type="button" variant="outline" onClick={() => { setStep(0); setUserType(null) }} className="gap-2">
                    <ChevronLeft size={16} /> Atrás
                  </Button>
                  <Button type="submit" className="gap-2">Siguiente <ChevronRight size={16} /></Button>
                </div>
              </form>
            </div>
          )}

          {/* ── Staff Step 2: Código + Rol ── */}
          {step === 2 && userType === 'staff' && (
            <div className="bg-xk-card rounded-2xl border border-xk-border shadow-sm p-8">
              <h2 className="font-heading text-2xl font-bold text-xk-text mb-1">Únete a tu escuela</h2>
              <p className="text-sm text-xk-text-secondary mb-6">Ingresa el código que te dio tu director/a.</p>
              <form onSubmit={fJoin.handleSubmit(handleJoin)} noValidate>
                {fJoin.formState.errors.join_code?.message && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5 mb-4 text-sm">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />{fJoin.formState.errors.join_code.message}
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="jc">Código de tu escuela <span className="text-xk-danger">*</span></Label>
                    <Input id="jc" placeholder="XXXXXXXX" className="mt-1.5 uppercase tracking-widest font-mono text-lg"
                      {...fJoin.register('join_code')}
                      onChange={(e) => { e.target.value = e.target.value.toUpperCase(); fJoin.register('join_code').onChange(e) }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Tu rol <span className="text-xk-danger">*</span></Label>
                    <select id="role" {...fJoin.register('role')}
                      className="mt-1.5 flex h-9 w-full rounded-xl border border-xk-border bg-xk-card px-3 py-2 text-sm text-xk-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xk-accent">
                      <option value="">Seleccionar…</option>
                      <option value="coordinador">Coordinador</option>
                      <option value="maestro">Maestro/a</option>
                      <option value="portero">Portero</option>
                      <option value="finanzas">Finanzas</option>
                    </select>
                    {fJoin.formState.errors.role && <p className="text-red-600 text-xs mt-1">{fJoin.formState.errors.role.message}</p>}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-8">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="gap-2">
                    <ChevronLeft size={16} /> Atrás
                  </Button>
                  <Button type="submit" disabled={fJoin.formState.isSubmitting} className="gap-2">
                    {fJoin.formState.isSubmitting && <Loader2 size={14} className="animate-spin" />}
                    {fJoin.formState.isSubmitting ? 'Uniéndome…' : 'Unirme a la escuela'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* ── Director Step 2: Nombre de la escuela ── */}
          {step === 2 && userType === 'director' && (
            <div className="bg-xk-card rounded-2xl border border-xk-border shadow-sm p-8">
              <h2 className="font-heading text-2xl font-bold text-xk-text mb-1">Tu escuela</h2>
              <p className="text-sm text-xk-text-secondary mb-6">¿Cómo se llama tu colegio?</p>
              <form onSubmit={fSchool.handleSubmit((v) => { setSchoolData(v); setStep(3) })} noValidate>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="sn">Nombre oficial <span className="text-xk-danger">*</span></Label>
                    <Input id="sn" placeholder="Colegio Hábitat Learning Community" className="mt-1.5" {...fSchool.register('nombre')} />
                    {fSchool.formState.errors.nombre && <p className="text-red-600 text-xs mt-1">{fSchool.formState.errors.nombre.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="sh">Nombre corto <span className="text-xk-text-muted text-xs">(opcional)</span></Label>
                    <Input id="sh" placeholder="Hábitat" className="mt-1.5" {...fSchool.register('shortName')} />
                    <p className="text-xs text-xk-text-muted mt-1">Aparece en notificaciones y encabezados.</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-8">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="gap-2"><ChevronLeft size={16} /> Atrás</Button>
                  <Button type="submit" className="gap-2">Siguiente <ChevronRight size={16} /></Button>
                </div>
              </form>
            </div>
          )}

          {/* ── Director Step 3: Detalles (opcional) ── */}
          {step === 3 && userType === 'director' && (
            <div className="bg-xk-card rounded-2xl border border-xk-border shadow-sm p-8">
              <h2 className="font-heading text-2xl font-bold text-xk-text mb-1">Datos de contacto</h2>
              <p className="text-sm text-xk-text-secondary mb-6">Puedes completarlos ahora o más tarde desde Configuración.</p>
              <form onSubmit={fDetails.handleSubmit((v) => { setDetailsData(v); setStep(4) })} noValidate>
                <div className="space-y-4">
                  {/* Logo */}
                  <div>
                    <Label>Logo de la escuela <span className="text-xk-text-muted text-xs">(opcional)</span></Label>
                    <div className="mt-1.5 flex items-center gap-4">
                      {logoUrl ? (
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-xk-border">
                          <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => setLogoUrl(null)}
                            className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-white">
                            <X size={10} />
                          </button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => fileRef.current?.click()}
                          disabled={uploading}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-xk-border hover:border-xk-accent text-sm text-xk-text-secondary hover:text-xk-accent transition-colors">
                          {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                          {uploading ? 'Subiendo…' : 'Subir logo'}
                        </button>
                      )}
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dir">Dirección</Label>
                      <Input id="dir" placeholder="Av. Principal 123" className="mt-1.5" {...fDetails.register('direccion')} />
                    </div>
                    <div>
                      <Label htmlFor="ciu">Ciudad</Label>
                      <Input id="ciu" placeholder="Guadalajara" className="mt-1.5" {...fDetails.register('ciudad')} />
                    </div>
                    <div>
                      <Label htmlFor="est">Estado</Label>
                      <Input id="est" placeholder="Jalisco" className="mt-1.5" {...fDetails.register('estado')} />
                    </div>
                    <div>
                      <Label htmlFor="tel">Teléfono</Label>
                      <Input id="tel" placeholder="33 1234 5678" className="mt-1.5" {...fDetails.register('telefono')} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="eml">Correo de la escuela</Label>
                    <Input id="eml" type="email" placeholder="contacto@colegio.edu.mx" className="mt-1.5" {...fDetails.register('email')} />
                    {fDetails.formState.errors.email && <p className="text-red-600 text-xs mt-1">{fDetails.formState.errors.email.message}</p>}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-8">
                  <Button type="button" variant="outline" onClick={() => setStep(2)} className="gap-2"><ChevronLeft size={16} /> Atrás</Button>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => { setDetailsData(null); setStep(4) }}>Omitir</Button>
                    <Button type="submit" className="gap-2">Siguiente <ChevronRight size={16} /></Button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* ── Director Step 4: Datos fiscales (opcional) ── */}
          {step === 4 && userType === 'director' && (
            <div className="bg-xk-card rounded-2xl border border-xk-border shadow-sm p-8">
              <h2 className="font-heading text-2xl font-bold text-xk-text mb-1">Datos fiscales</h2>
              <p className="text-sm text-xk-text-secondary mb-6">Necesarios para emitir CFDI. Puedes agregarlos después.</p>
              <form onSubmit={fFiscal.handleSubmit((v) => { setFiscalData(v); setStep(5) })} noValidate>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="rfc">RFC</Label>
                      <Input id="rfc" placeholder="HAB010101AAA" className="mt-1.5 uppercase" {...fFiscal.register('rfc')} onChange={(e) => { e.target.value = e.target.value.toUpperCase(); fFiscal.register('rfc').onChange(e) }} />
                      {fFiscal.formState.errors.rfc && <p className="text-red-600 text-xs mt-1">{fFiscal.formState.errors.rfc.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="cp">CP Fiscal</Label>
                      <Input id="cp" placeholder="44900" maxLength={5} className="mt-1.5" {...fFiscal.register('cpFiscal')} />
                      {fFiscal.formState.errors.cpFiscal && <p className="text-red-600 text-xs mt-1">{fFiscal.formState.errors.cpFiscal.message}</p>}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="rs">Razón social</Label>
                    <Input id="rs" placeholder="HABITAT LEARNING COMMUNITY SA DE CV" className="mt-1.5" {...fFiscal.register('razonSocial')} />
                    {fFiscal.formState.errors.razonSocial && <p className="text-red-600 text-xs mt-1">{fFiscal.formState.errors.razonSocial.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="reg">Régimen fiscal</Label>
                    <select id="reg" {...fFiscal.register('regimenFiscal')}
                      className="mt-1.5 flex h-9 w-full rounded-xl border border-xk-border bg-xk-card px-3 py-2 text-sm text-xk-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xk-accent">
                      <option value="">Seleccionar…</option>
                      {REGIMENES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                    {fFiscal.formState.errors.regimenFiscal && <p className="text-red-600 text-xs mt-1">{fFiscal.formState.errors.regimenFiscal.message}</p>}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-8">
                  <Button type="button" variant="outline" onClick={() => setStep(3)} className="gap-2"><ChevronLeft size={16} /> Atrás</Button>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => { setFiscalData(null); setStep(5) }}>Omitir</Button>
                    <Button type="submit" className="gap-2">Siguiente <ChevronRight size={16} /></Button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* ── Director Step 5: Horario Pickup (opcional) ── */}
          {step === 5 && userType === 'director' && (
            <div className="bg-xk-card rounded-2xl border border-xk-border shadow-sm p-8">
              <h2 className="font-heading text-2xl font-bold text-xk-text mb-1">Horario de salida</h2>
              <p className="text-sm text-xk-text-secondary mb-6">Define la ventana de recogida de alumnos (módulo Pickup).</p>
              <form onSubmit={fPickup.handleSubmit((v) => { setPickupData(v); setStep(6) })} noValidate>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pi">Inicio</Label>
                      <Input id="pi" type="time" className="mt-1.5" {...fPickup.register('pickupInicio')} />
                      {fPickup.formState.errors.pickupInicio && <p className="text-red-600 text-xs mt-1">{fPickup.formState.errors.pickupInicio.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="pf">Fin</Label>
                      <Input id="pf" type="time" className="mt-1.5" {...fPickup.register('pickupFin')} />
                      {fPickup.formState.errors.pickupFin && <p className="text-red-600 text-xs mt-1">{fPickup.formState.errors.pickupFin.message}</p>}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="pt">Tolerancia (minutos)</Label>
                    <Input id="pt" type="number" min={0} max={60} className="mt-1.5 w-32" {...fPickup.register('pickupTolerancia', { valueAsNumber: true })} />
                    <p className="text-xs text-xk-text-muted mt-1">Tiempo extra permitido después del horario de fin.</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-8">
                  <Button type="button" variant="outline" onClick={() => setStep(4)} className="gap-2"><ChevronLeft size={16} /> Atrás</Button>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => { setPickupData(null); setStep(6) }}>Omitir</Button>
                    <Button type="submit" className="gap-2">Siguiente <ChevronRight size={16} /></Button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* ── Director Step 6: Confirmación ── */}
          {step === 6 && userType === 'director' && schoolData && (
            <div className="bg-xk-card rounded-2xl border border-xk-border shadow-sm p-8">
              <h2 className="font-heading text-2xl font-bold text-xk-text mb-1">¡Todo listo!</h2>
              <p className="text-sm text-xk-text-secondary mb-6">Revisa los datos antes de activar tu escuela.</p>
              <div className="space-y-3 mb-6">
                <Row label="Director/a" value={nameData ? `${nameData.first_name} ${nameData.last_name}` : ''} />
                <Row label="Escuela" value={schoolData.nombre} />
                {schoolData.shortName && <Row label="Nombre corto" value={schoolData.shortName} />}
                {detailsData ? (
                  <>
                    {detailsData.ciudad && <Row label="Ciudad" value={detailsData.ciudad} />}
                    {detailsData.telefono && <Row label="Teléfono" value={detailsData.telefono} />}
                  </>
                ) : <SkippedBadge label="Datos de contacto" onEdit={() => setStep(3)} />}
                {fiscalData ? (
                  <Row label="RFC" value={fiscalData.rfc} />
                ) : <SkippedBadge label="Datos fiscales" onEdit={() => setStep(4)} />}
                {pickupData ? (
                  <Row label="Pickup" value={`${pickupData.pickupInicio} – ${pickupData.pickupFin}`} />
                ) : <SkippedBadge label="Horario de pickup" onEdit={() => setStep(5)} />}
              </div>
              <div className="flex items-center justify-between mt-6">
                <Button type="button" variant="outline" onClick={() => setStep(5)} className="gap-2"><ChevronLeft size={16} /> Atrás</Button>
                <Button onClick={handleFinish} disabled={submitting} className="gap-2 bg-xk-accent hover:bg-xk-accent-dark">
                  {submitting && <Loader2 size={14} className="animate-spin" />}
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Header({ subtitle }: { subtitle?: string }) {
  return (
    <header className="border-b border-xk-border bg-xk-card px-6 py-4 flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl bg-xk-accent flex items-center justify-center">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </div>
      <span className="font-heading text-xl font-bold text-xk-accent">Xokai</span>
      {subtitle && <span className="text-xk-text-muted text-sm">— {subtitle}</span>}
    </header>
  )
}

function NextStepBtn({ icon: Icon, label, sub, onClick }: { icon: any; label: string; sub: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-xk-subtle transition-colors text-left group">
      <div className="w-10 h-10 rounded-xl bg-xk-accent-light flex items-center justify-center shrink-0 group-hover:bg-xk-accent transition-colors">
        <Icon size={18} className="text-xk-accent group-hover:text-white transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-xk-text">{label}</p>
        <p className="text-xs text-xk-text-muted mt-0.5">{sub}</p>
      </div>
      <ArrowRight size={16} className="text-xk-text-muted group-hover:text-xk-accent transition-colors shrink-0" />
    </button>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <span className="text-xk-text-secondary shrink-0">{label}</span>
      <span className="text-xk-text font-medium text-right">{value}</span>
    </div>
  )
}

function SkippedBadge({ label, onEdit }: { label: string; onEdit: () => void }) {
  return (
    <div className="flex items-center justify-between bg-xk-subtle rounded-xl px-4 py-3 border border-dashed border-xk-border">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-xk-text-muted" />
        <span className="text-sm text-xk-text-muted">{label}</span>
        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Pendiente</span>
      </div>
      <button onClick={onEdit} className="text-xs text-xk-accent hover:text-xk-accent-dark font-medium">Completar ahora</button>
    </div>
  )
}
