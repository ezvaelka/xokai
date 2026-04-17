'use server'

import { createClient }      from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath }    from 'next/cache'

export interface OnboardingData {
  // Requeridos
  nombre:     string
  first_name: string
  last_name:  string
  // Opcionales
  shortName:        string
  logoUrl:          string | null
  direccion:        string
  ciudad:           string
  estado:           string
  telefono:         string
  email:            string
  rfc:              string
  razonSocial:      string
  cpFiscal:         string
  regimenFiscal:    string
  pickupInicio:     string
  pickupFin:        string
  pickupTolerancia: number
}

// ─── Completar onboarding (director / admin) ──────────────────────────────────

export async function completeOnboarding(data: OnboardingData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const admin = createAdminClient()

  // Generar join_code único para la escuela
  const joinCode = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()

  const { data: school, error: schoolError } = await admin
    .from('schools')
    .insert({
      name:                   data.nombre,
      short_name:             data.shortName || null,
      address:                data.direccion || null,
      city:                   data.ciudad    || null,
      state:                  data.estado    || null,
      phone:                  data.telefono  || null,
      email:                  data.email     || null,
      logo_url:               data.logoUrl,
      rfc:                    data.rfc       || null,
      razon_social:           data.razonSocial    || null,
      cp_fiscal:              data.cpFiscal       || null,
      regimen_fiscal:         data.regimenFiscal  || null,
      pickup_start:           data.pickupInicio   || null,
      pickup_end:             data.pickupFin      || null,
      pickup_tolerance_mins:  data.pickupTolerancia,
      onboarding_completed:   true,
      active:                 false,
      join_code:              joinCode,
    })
    .select()
    .single()

  if (schoolError) return { error: schoolError.message }

  const { error: profileError } = await admin
    .from('user_profiles')
    .upsert({
      id:         user.id,
      school_id:  school.id,
      role:       'director',
      first_name: data.first_name,
      last_name:  data.last_name,
    })

  if (profileError) return { error: profileError.message }

  revalidatePath('/dashboard')
  return { error: null, schoolId: school.id }
}

// ─── Unirse a escuela con código (staff) ──────────────────────────────────────

export async function joinSchool(data: {
  join_code:  string
  role:       string
  first_name: string
  last_name:  string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const admin = createAdminClient()

  const { data: school, error: schoolErr } = await admin
    .from('schools')
    .select('id')
    .eq('join_code', data.join_code.toUpperCase())
    .single()

  if (schoolErr || !school) {
    return { error: 'Código de escuela inválido. Verifica con tu director.' }
  }

  const { error: profileErr } = await admin
    .from('user_profiles')
    .upsert({
      id:         user.id,
      school_id:  school.id,
      role:       data.role,
      first_name: data.first_name,
      last_name:  data.last_name,
    })

  if (profileErr) return { error: profileErr.message }

  revalidatePath('/dashboard')
  return { error: null }
}

// ─── Subir logo de escuela ────────────────────────────────────────────────────

export async function uploadSchoolLogo(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado', url: null }

  const file = formData.get('file') as File
  if (!file || file.size === 0) return { error: 'Archivo inválido', url: null }
  if (file.size > 2 * 1024 * 1024) return { error: 'El logo debe pesar menos de 2 MB', url: null }

  const ext  = file.name.split('.').pop() ?? 'png'
  const path = `logos/${Date.now()}.${ext}`

  const admin = createAdminClient()
  const { error: upErr } = await admin.storage
    .from('school-assets')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (upErr) return { error: upErr.message, url: null }
  const { data } = admin.storage.from('school-assets').getPublicUrl(path)
  return { error: null, url: data.publicUrl }
}
