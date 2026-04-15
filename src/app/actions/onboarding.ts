'use server'

import { createClient }      from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect }          from 'next/navigation'

export interface OnboardingData {
  // Paso 1
  nombre:      string
  shortName:   string
  logoUrl:     string | null
  direccion:   string
  ciudad:      string
  estado:      string
  telefono:    string
  email:       string
  // Paso 2
  rfc:              string
  razonSocial:      string
  cpFiscal:         string
  regimenFiscal:    string
  // Paso 3
  pickupInicio:     string   // "HH:MM"
  pickupFin:        string   // "HH:MM"
  pickupTolerancia: number   // minutos
}

export async function completeOnboarding(data: OnboardingData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const admin = createAdminClient()

  // Crear escuela
  const { data: school, error: schoolError } = await admin
    .from('schools')
    .insert({
      name:                   data.nombre,
      short_name:             data.shortName || null,
      address:                data.direccion,
      city:                   data.ciudad,
      state:                  data.estado,
      phone:                  data.telefono,
      email:                  data.email,
      logo_url:               data.logoUrl,
      rfc:                    data.rfc,
      razon_social:           data.razonSocial,
      cp_fiscal:              data.cpFiscal,
      regimen_fiscal:         data.regimenFiscal,
      pickup_start:           data.pickupInicio,
      pickup_end:             data.pickupFin,
      pickup_tolerance_mins:  data.pickupTolerancia,
      onboarding_completed:   true,
    })
    .select()
    .single()

  if (schoolError) return { error: schoolError.message }

  // Vincular usuario como admin de la escuela
  const { error: profileError } = await admin
    .from('user_profiles')
    .upsert({
      id:        user.id,
      school_id: school.id,
      role:      'admin',
    })

  if (profileError) return { error: profileError.message }

  return { error: null, schoolId: school.id }
}

export async function redirectToDashboard() {
  redirect('/dashboard')
}
