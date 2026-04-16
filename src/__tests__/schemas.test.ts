import { describe, it, expect } from 'vitest'
import {
  nameSchema, schoolNameSchema, detailsSchema,
  fiscalSchema, pickupSchema, joinSchema, signupSchema,
} from '@/lib/schemas/onboarding'

// ─── nameSchema ───────────────────────────────────────────────────────────────

describe('nameSchema', () => {
  it('happy path: nombre y apellido válidos', () => {
    const r = nameSchema.safeParse({ first_name: 'Ana', last_name: 'García' })
    expect(r.success).toBe(true)
  })

  it('edge: nombre vacío falla', () => {
    const r = nameSchema.safeParse({ first_name: '', last_name: 'García' })
    expect(r.success).toBe(false)
    expect(r.error?.issues[0].message).toBe('Ingresa tu nombre')
  })

  it('edge: apellido vacío falla', () => {
    const r = nameSchema.safeParse({ first_name: 'Ana', last_name: '' })
    expect(r.success).toBe(false)
    expect(r.error?.issues[0].message).toBe('Ingresa tu apellido')
  })
})

// ─── schoolNameSchema ─────────────────────────────────────────────────────────

describe('schoolNameSchema', () => {
  it('happy path: nombre largo, sin shortName', () => {
    const r = schoolNameSchema.safeParse({ nombre: 'Colegio Hábitat' })
    expect(r.success).toBe(true)
  })

  it('happy path: con shortName', () => {
    const r = schoolNameSchema.safeParse({ nombre: 'Colegio Hábitat', shortName: 'Hábitat' })
    expect(r.success).toBe(true)
  })

  it('edge: nombre de 1 caracter falla', () => {
    const r = schoolNameSchema.safeParse({ nombre: 'A' })
    expect(r.success).toBe(false)
  })

  it('edge: shortName mayor a 20 chars falla', () => {
    const r = schoolNameSchema.safeParse({ nombre: 'Colegio', shortName: 'A'.repeat(21) })
    expect(r.success).toBe(false)
  })
})

// ─── detailsSchema ────────────────────────────────────────────────────────────

describe('detailsSchema', () => {
  it('happy path: todos los campos opcionales vacíos', () => {
    const r = detailsSchema.safeParse({})
    expect(r.success).toBe(true)
  })

  it('happy path: correo válido', () => {
    const r = detailsSchema.safeParse({ email: 'contacto@colegio.edu.mx' })
    expect(r.success).toBe(true)
  })

  it('edge: correo inválido falla', () => {
    const r = detailsSchema.safeParse({ email: 'no-es-un-correo' })
    expect(r.success).toBe(false)
    expect(r.error?.issues[0].message).toBe('Correo inválido')
  })

  it('edge: string vacío en email pasa (campo omitido)', () => {
    const r = detailsSchema.safeParse({ email: '' })
    expect(r.success).toBe(true)
  })
})

// ─── fiscalSchema ─────────────────────────────────────────────────────────────

describe('fiscalSchema', () => {
  it('happy path: RFC persona moral válido', () => {
    const r = fiscalSchema.safeParse({
      rfc: 'HAB010101AAA', razonSocial: 'Habitat SA de CV',
      cpFiscal: '44900', regimenFiscal: '601',
    })
    expect(r.success).toBe(true)
  })

  it('edge: RFC corto falla', () => {
    const r = fiscalSchema.safeParse({
      rfc: 'ABC123', razonSocial: 'Empresa', cpFiscal: '44900', regimenFiscal: '601',
    })
    expect(r.success).toBe(false)
    expect(r.error?.issues[0].message).toContain('RFC')
  })

  it('edge: CP de 4 dígitos falla', () => {
    const r = fiscalSchema.safeParse({
      rfc: 'HAB010101AAA', razonSocial: 'Habitat SA de CV',
      cpFiscal: '4490', regimenFiscal: '601',
    })
    expect(r.success).toBe(false)
    expect(r.error?.issues[0].message).toBe('CP debe tener 5 dígitos')
  })

  it('edge: razón social menor a 3 chars falla', () => {
    const r = fiscalSchema.safeParse({
      rfc: 'HAB010101AAA', razonSocial: 'AB',
      cpFiscal: '44900', regimenFiscal: '601',
    })
    expect(r.success).toBe(false)
  })
})

// ─── pickupSchema ─────────────────────────────────────────────────────────────

describe('pickupSchema', () => {
  it('happy path: horario válido 13:00 - 14:00', () => {
    const r = pickupSchema.safeParse({
      pickupInicio: '13:00', pickupFin: '14:00', pickupTolerancia: 10,
    })
    expect(r.success).toBe(true)
  })

  it('edge: fin antes que inicio falla (refine)', () => {
    const r = pickupSchema.safeParse({
      pickupInicio: '15:00', pickupFin: '13:00', pickupTolerancia: 5,
    })
    expect(r.success).toBe(false)
    expect(r.error?.issues[0].message).toBe('Fin debe ser posterior al inicio')
  })

  it('edge: tolerancia mayor a 60 falla', () => {
    const r = pickupSchema.safeParse({
      pickupInicio: '13:00', pickupFin: '14:00', pickupTolerancia: 61,
    })
    expect(r.success).toBe(false)
  })

  it('edge: fin igual a inicio falla (no es posterior)', () => {
    const r = pickupSchema.safeParse({
      pickupInicio: '13:00', pickupFin: '13:00', pickupTolerancia: 0,
    })
    expect(r.success).toBe(false)
  })
})

// ─── joinSchema ───────────────────────────────────────────────────────────────

describe('joinSchema', () => {
  it('happy path: código válido + rol válido', () => {
    const r = joinSchema.safeParse({ join_code: 'ABCD1234', role: 'maestro' })
    expect(r.success).toBe(true)
  })

  it('happy path: todos los roles válidos', () => {
    for (const role of ['coordinador', 'maestro', 'portero', 'finanzas']) {
      const r = joinSchema.safeParse({ join_code: 'ABCD1234', role })
      expect(r.success).toBe(true)
    }
  })

  it('edge: rol vacío (select sin seleccionar) falla', () => {
    const r = joinSchema.safeParse({ join_code: 'ABCD1234', role: '' })
    expect(r.success).toBe(false)
    expect(r.error?.issues[0].message).toBe('Selecciona tu rol')
  })

  it('edge: rol "director" no está permitido para staff', () => {
    const r = joinSchema.safeParse({ join_code: 'ABCD1234', role: 'director' })
    expect(r.success).toBe(false)
  })

  it('edge: código menor a 4 chars falla', () => {
    const r = joinSchema.safeParse({ join_code: 'AB', role: 'maestro' })
    expect(r.success).toBe(false)
    expect(r.error?.issues[0].message).toBe('Ingresa el código')
  })
})

// ─── signupSchema ─────────────────────────────────────────────────────────────

describe('signupSchema', () => {
  it('happy path: credenciales válidas', () => {
    const r = signupSchema.safeParse({
      email: 'director@colegio.edu.mx',
      password: 'Password1',
      confirm: 'Password1',
    })
    expect(r.success).toBe(true)
  })

  it('edge: contraseñas no coinciden', () => {
    const r = signupSchema.safeParse({
      email: 'director@colegio.edu.mx',
      password: 'Password1',
      confirm: 'Password2',
    })
    expect(r.success).toBe(false)
    expect(r.error?.issues[0].message).toBe('Las contraseñas no coinciden')
  })

  it('edge: password sin mayúscula falla', () => {
    const r = signupSchema.safeParse({
      email: 'a@b.com', password: 'password1', confirm: 'password1',
    })
    expect(r.success).toBe(false)
    expect(r.error?.issues[0].message).toContain('mayúscula')
  })

  it('edge: password sin número falla', () => {
    const r = signupSchema.safeParse({
      email: 'a@b.com', password: 'Password', confirm: 'Password',
    })
    expect(r.success).toBe(false)
    expect(r.error?.issues[0].message).toContain('número')
  })

  it('edge: password menor a 8 chars falla', () => {
    const r = signupSchema.safeParse({
      email: 'a@b.com', password: 'Pass1', confirm: 'Pass1',
    })
    expect(r.success).toBe(false)
  })

  it('edge: correo inválido falla', () => {
    const r = signupSchema.safeParse({
      email: 'no-es-correo', password: 'Password1', confirm: 'Password1',
    })
    expect(r.success).toBe(false)
    expect(r.error?.issues[0].message).toBe('Correo inválido')
  })
})
