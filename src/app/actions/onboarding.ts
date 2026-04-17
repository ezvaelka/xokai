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
      role:       'admin',
      first_name: data.first_name,
      last_name:  data.last_name,
    })

  if (profileError) return { error: profileError.message }

  // Notificar a sysadmin — best effort, no bloquea el onboarding
  void notifySysadmin({
    schoolName:    data.nombre,
    directorName:  `${data.first_name} ${data.last_name}`,
    directorEmail: user.email ?? '',
    city:          data.ciudad,
    schoolId:      school.id,
  })

  revalidatePath('/dashboard')
  return { error: null, schoolId: school.id, joinCode: school.join_code as string }
}

// ─── Notificación interna a sysadmin ─────────────────────────────────────────

async function notifySysadmin(data: {
  schoolName:    string
  directorName:  string
  directorEmail: string
  city:          string
  schoolId:      string
}) {
  const apiKey = process.env.RESEND_API_KEY
  const to     = process.env.SYSADMIN_EMAIL ?? 'ez@vaelka.com'
  if (!apiKey) return

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://admin.xokai.app'
  const schoolUrl = `${appUrl}/sysadmin/schools/${data.schoolId}`

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Xokai <hola@xokai.app>',
      to:   [to],
      subject: `Nueva escuela pendiente: ${data.schoolName}`,
      html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva escuela pendiente de aprobación</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background:#0f172a;padding:28px 36px 24px;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Xokai</p>
              <p style="margin:4px 0 0;font-size:12px;color:#94a3b8;letter-spacing:0.5px;text-transform:uppercase;">Panel sysadmin</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 36px 28px;">
              <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#f59e0b;text-transform:uppercase;letter-spacing:1px;">⏳ Pendiente de aprobación</p>
              <h1 style="margin:0 0 20px;font-size:20px;font-weight:700;color:#0f172a;line-height:1.3;">Nueva escuela registrada</h1>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;overflow:hidden;margin-bottom:24px;">
                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Escuela</p>
                    <p style="margin:3px 0 0;font-size:15px;font-weight:600;color:#0f172a;">${data.schoolName}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Directora</p>
                    <p style="margin:3px 0 0;font-size:15px;font-weight:600;color:#0f172a;">${data.directorName}</p>
                    <p style="margin:2px 0 0;font-size:13px;color:#64748b;">${data.directorEmail}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Ciudad</p>
                    <p style="margin:3px 0 0;font-size:15px;font-weight:600;color:#0f172a;">${data.city || '—'}</p>
                  </td>
                </tr>
              </table>
              <a href="${schoolUrl}" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:13px 28px;border-radius:10px;font-size:14px;font-weight:600;letter-spacing:0.2px;">Ver escuela en sysadmin →</a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 36px 24px;border-top:1px solid #f1f5f9;">
              <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">© 2026 Xokai · hola@xokai.app</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    }),
  })
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
