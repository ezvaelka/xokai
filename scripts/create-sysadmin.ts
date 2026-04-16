/**
 * ============================================================
 * XOKAI — Crear usuario sysadmin
 * ============================================================
 *
 * Crea un usuario en auth.users + user_profiles con role=sysadmin.
 * No pasa por onboarding. Solo Ez debe correr esto.
 *
 * USO:
 *   npx tsx --env-file=.env.local scripts/create-sysadmin.ts
 * ============================================================
 */

import { createClient } from '@supabase/supabase-js'
import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('✗ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  const rl = readline.createInterface({ input, output })

  console.log('\n── Crear sysadmin ──────────────────────────────\n')
  const email    = await rl.question('Email:    ')
  const password = await rl.question('Password: ')
  rl.close()

  if (!email || !password) {
    console.error('✗ Email y password son requeridos')
    process.exit(1)
  }

  if (password.length < 8) {
    console.error('✗ El password debe tener al menos 8 caracteres')
    process.exit(1)
  }

  // Crear en auth.users
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authErr) {
    console.error(`✗ Error creando usuario: ${authErr.message}`)
    process.exit(1)
  }

  const userId = authData.user.id

  // Crear user_profile con role=sysadmin y school_id=null
  const { error: profileErr } = await supabase
    .from('user_profiles')
    .insert({ id: userId, role: 'sysadmin', school_id: null })

  if (profileErr) {
    console.error(`✗ Error creando perfil: ${profileErr.message}`)
    // Limpiar el auth user si falla el perfil
    await supabase.auth.admin.deleteUser(userId)
    process.exit(1)
  }

  console.log(`\n✓ Sysadmin creado: ${email}`)
  console.log(`  ID: ${userId}`)
  console.log(`  Entra en: admin.xokai.app/login\n`)
}

main().catch((err) => {
  console.error('\n✗ Error fatal:', err)
  process.exit(1)
})
