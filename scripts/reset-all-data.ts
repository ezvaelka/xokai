/**
 * ============================================================
 * XOKAI — Reset completo de datos
 * ============================================================
 *
 * Borra TODOS los usuarios, escuelas y datos asociados de la BD.
 * Deja el sistema como recién instalado.
 *
 * USO:
 *   Requiere Node 20+ (por --env-file).
 *
 *   node --env-file=.env.local --experimental-strip-types scripts/reset-all-data.ts
 *
 *   O con tsx:
 *   npx tsx --env-file=.env.local scripts/reset-all-data.ts
 *
 * REQUISITOS:
 *   - .env.local con NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
 *
 * ADVERTENCIA:
 *   ⚠ Destructivo e irreversible. NUNCA correr contra producción.
 * ============================================================
 */

import { createClient } from '@supabase/supabase-js'
import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('✗ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
  console.error('  Ejemplo: node --env-file=.env.local --experimental-strip-types scripts/reset-all-data.ts')
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function confirm(): Promise<boolean> {
  const rl = readline.createInterface({ input, output })
  console.log('\n⚠  ADVERTENCIA: Vas a borrar TODOS los datos de:')
  console.log(`   ${url}\n`)
  const answer = await rl.question('Escribe "BORRAR TODO" para confirmar: ')
  rl.close()
  return answer.trim() === 'BORRAR TODO'
}

async function deleteAll(table: string) {
  const { error, count } = await supabase
    .from(table)
    .delete({ count: 'exact' })
    .gte('created_at', '1900-01-01')

  if (error) {
    console.error(`✗ ${table}: ${error.message}`)
    throw error
  }
  console.log(`✓ ${table}: ${count ?? 0} filas borradas`)
}

async function deleteAllAuthUsers() {
  let deleted = 0
  let page = 1
  const perPage = 1000

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
    if (error) {
      console.error(`✗ auth.users listUsers: ${error.message}`)
      throw error
    }
    if (!data.users.length) break

    for (const user of data.users) {
      const { error: delErr } = await supabase.auth.admin.deleteUser(user.id)
      if (delErr) {
        console.error(`  ✗ ${user.email ?? user.id}: ${delErr.message}`)
      } else {
        deleted++
      }
    }

    if (data.users.length < perPage) break
    page++
  }

  console.log(`✓ auth.users: ${deleted} usuarios borrados`)
}

async function main() {
  if (!(await confirm())) {
    console.log('Cancelado.')
    process.exit(0)
  }

  console.log('\nBorrando datos en orden de dependencias...\n')

  // Respetar FKs: hijos primero
  await deleteAll('pickup_events')
  await deleteAll('pickup_sessions')
  await deleteAll('authorized_pickups')

  // student_guardians tiene created_at (no PK por id)
  const { error: sgErr, count: sgCount } = await supabase
    .from('student_guardians')
    .delete({ count: 'exact' })
    .gte('created_at', '1900-01-01')
  if (sgErr) throw sgErr
  console.log(`✓ student_guardians: ${sgCount ?? 0} filas borradas`)

  await deleteAll('students')
  await deleteAll('groups')
  await deleteAll('guardians')

  // user_profiles se van a cascadear al borrar auth.users, pero borramos explícito por si acaso
  await deleteAll('user_profiles')

  // schools al final (cascade ya limpió todo lo dependiente)
  await deleteAll('schools')

  // auth.users vía admin API
  await deleteAllAuthUsers()

  console.log('\n✓ Reset completo. La BD está vacía.\n')
}

main().catch((err) => {
  console.error('\n✗ Error fatal:', err)
  process.exit(1)
})
