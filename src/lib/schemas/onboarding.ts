import { z } from 'zod'

export const nameSchema = z.object({
  first_name: z.string().min(1, 'Ingresa tu nombre'),
  last_name:  z.string().min(1, 'Ingresa tu apellido'),
})

export const schoolNameSchema = z.object({
  nombre:    z.string().min(2, 'Al menos 2 caracteres'),
  shortName: z.string().max(20).optional(),
})

export const detailsSchema = z.object({
  direccion: z.string().optional(),
  ciudad:    z.string().optional(),
  estado:    z.string().optional(),
  telefono:  z.string().optional(),
  email:     z.string().email('Correo inválido').optional().or(z.literal('')),
})

export const fiscalSchema = z.object({
  rfc:           z.string().min(12, 'RFC inválido').max(13).regex(/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/, 'RFC inválido'),
  razonSocial:   z.string().min(3, 'Ingresa la razón social'),
  cpFiscal:      z.string().length(5, 'CP debe tener 5 dígitos'),
  regimenFiscal: z.string().min(1, 'Selecciona el régimen'),
})

export const pickupSchema = z.object({
  pickupInicio:     z.string().min(1, 'Hora requerida'),
  pickupFin:        z.string().min(1, 'Hora requerida'),
  pickupTolerancia: z.number().int().min(0).max(60),
}).refine(
  (d) => d.pickupInicio < d.pickupFin,
  { message: 'Fin debe ser posterior al inicio', path: ['pickupFin'] },
)

export const joinSchema = z.object({
  join_code: z.string().min(4, 'Ingresa el código').max(12),
  role:      z.string().refine(
    (v) => ['coordinador', 'maestro', 'portero', 'finanzas'].includes(v),
    { message: 'Selecciona tu rol' },
  ),
})

export const signupSchema = z
  .object({
    email:    z.string().email('Correo inválido'),
    password: z.string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Incluye al menos una mayúscula')
      .regex(/[0-9]/, 'Incluye al menos un número'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Las contraseñas no coinciden',
    path:    ['confirm'],
  })
