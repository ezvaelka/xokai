/**
 * ============================================================
 * XOKAI — Seed de datos de prueba
 * ============================================================
 *
 * Crea datos realistas para probar todas las páginas y flujos
 * del dashboard: grupos, maestros, alumnos, padres, personas
 * autorizadas de pickup.
 *
 * USO:
 *   npx tsx --env-file=.env.local scripts/seed-demo-data.ts
 *
 * OPCIONES:
 *   SCHOOL_ID=<uuid>   Especificar escuela (default: primera escuela activa)
 *   CLEAN=true         Limpiar datos de prueba anteriores antes de insertar
 *
 * Los usuarios creados pueden iniciar sesión con:
 *   contraseña: Test1234!
 * ============================================================
 */

import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('✗ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const TEST_PASSWORD = 'Test1234!'
const CLEAN = process.env.CLEAN === 'true'

// ─── Datos de prueba ──────────────────────────────────────────────────────────

const TEACHERS = [
  { first_name: 'Sarah',    last_name: 'Mitchell',    email: 'sarah.mitchell@test.xokai.app' },
  { first_name: 'Ana',      last_name: 'Rodríguez',   email: 'ana.rodriguez@test.xokai.app'  },
  { first_name: 'Carlos',   last_name: 'Hernández',   email: 'carlos.hernandez@test.xokai.app' },
  { first_name: 'Emily',    last_name: 'Johnson',     email: 'emily.johnson@test.xokai.app'  },
  { first_name: 'Sofía',    last_name: 'Martínez',    email: 'sofia.martinez@test.xokai.app' },
]

const GROUPS = [
  { name: 'Kinder A',    grade: null, level: 'Kinder',     academic_year: '2025-2026', teacher_idx: 0, spanish_idx: 1, assistant_idx: 2 },
  { name: 'Kinder B',    grade: null, level: 'Kinder',     academic_year: '2025-2026', teacher_idx: 3, spanish_idx: 1, assistant_idx: 4 },
  { name: '1° Primaria', grade: 1,   level: 'Primaria',   academic_year: '2025-2026', teacher_idx: 0, spanish_idx: 2, assistant_idx: 4 },
  { name: '2° Primaria', grade: 2,   level: 'Primaria',   academic_year: '2025-2026', teacher_idx: 3, spanish_idx: 1, assistant_idx: 2 },
  { name: '3° Primaria', grade: 3,   level: 'Primaria',   academic_year: '2025-2026', teacher_idx: 4, spanish_idx: 2, assistant_idx: 1 },
]

const STUDENTS_PER_GROUP = [
  // Kinder A — 8 alumnos
  [
    { first_name: 'Mateo',     last_name: 'García Ruiz',       student_code: 'KA-001', date_of_birth: '2020-03-15', allergies: null },
    { first_name: 'Valentina', last_name: 'López Sánchez',     student_code: 'KA-002', date_of_birth: '2020-07-22', allergies: 'Cacahuate' },
    { first_name: 'Sebastián', last_name: 'Martínez Torres',   student_code: 'KA-003', date_of_birth: '2019-11-08', allergies: null },
    { first_name: 'Isabella',  last_name: 'Hernández Cruz',    student_code: 'KA-004', date_of_birth: '2020-01-30', allergies: 'Lactosa' },
    { first_name: 'Lucas',     last_name: 'Ramírez Jiménez',   student_code: 'KA-005', date_of_birth: '2020-05-12', allergies: null },
    { first_name: 'Emma',      last_name: 'Wilson Perez',      student_code: 'KA-006', date_of_birth: '2020-02-18', allergies: null },
    { first_name: 'Alejandro', last_name: 'Flores Vega',       student_code: 'KA-007', date_of_birth: '2020-09-03', allergies: 'Polen' },
    { first_name: 'Sophia',    last_name: 'Brown Castillo',    student_code: 'KA-008', date_of_birth: '2020-06-25', allergies: null },
  ],
  // Kinder B — 7 alumnos
  [
    { first_name: 'Diego',     last_name: 'Morales Ríos',      student_code: 'KB-001', date_of_birth: '2020-04-10', allergies: null },
    { first_name: 'Camila',    last_name: 'Gutiérrez Mora',    student_code: 'KB-002', date_of_birth: '2020-08-14', allergies: 'Gluten' },
    { first_name: 'Nicolás',   last_name: 'Vargas Medina',     student_code: 'KB-003', date_of_birth: '2019-12-20', allergies: null },
    { first_name: 'Renata',    last_name: 'Castro Reyes',      student_code: 'KB-004', date_of_birth: '2020-03-07', allergies: null },
    { first_name: 'Santiago',  last_name: 'Romero Aguilar',    student_code: 'KB-005', date_of_birth: '2020-10-28', allergies: 'Mariscos' },
    { first_name: 'Lucia',     last_name: 'Torres Mendoza',    student_code: 'KB-006', date_of_birth: '2020-01-15', allergies: null },
    { first_name: 'Emilio',    last_name: 'Silva Ramos',       student_code: 'KB-007', date_of_birth: '2020-07-04', allergies: null },
  ],
  // 1° Primaria — 10 alumnos
  [
    { first_name: 'Ana Paula',  last_name: 'Jiménez Ochoa',    student_code: '1PA-001', date_of_birth: '2019-02-14', allergies: null },
    { first_name: 'Rodrigo',    last_name: 'Peña Salazar',     student_code: '1PA-002', date_of_birth: '2018-11-30', allergies: 'Abejas' },
    { first_name: 'Mariana',    last_name: 'Ortiz Fuentes',    student_code: '1PA-003', date_of_birth: '2019-04-22', allergies: null },
    { first_name: 'Fernando',   last_name: 'Navarro Campos',   student_code: '1PA-004', date_of_birth: '2019-01-08', allergies: null },
    { first_name: 'Daniela',    last_name: 'Cruz Herrera',     student_code: '1PA-005', date_of_birth: '2018-09-16', allergies: 'Nueces' },
    { first_name: 'Pablo',      last_name: 'Ríos Guerrero',    student_code: '1PA-006', date_of_birth: '2019-06-05', allergies: null },
    { first_name: 'Valeria',    last_name: 'Mendoza Rojas',    student_code: '1PA-007', date_of_birth: '2019-03-19', allergies: null },
    { first_name: 'Andrés',     last_name: 'Reyes Iglesias',   student_code: '1PA-008', date_of_birth: '2018-12-11', allergies: null },
    { first_name: 'Natalia',    last_name: 'Guerrero Palma',   student_code: '1PA-009', date_of_birth: '2019-07-29', allergies: 'Soya' },
    { first_name: 'Miguel',     last_name: 'Aguilar Serrano',  student_code: '1PA-010', date_of_birth: '2018-10-03', allergies: null },
  ],
  // 2° Primaria — 9 alumnos
  [
    { first_name: 'Regina',     last_name: 'Vargas Ibáñez',    student_code: '2PA-001', date_of_birth: '2018-03-10', allergies: null },
    { first_name: 'Tomás',      last_name: 'Soto Delgado',     student_code: '2PA-002', date_of_birth: '2017-12-05', allergies: 'Látex' },
    { first_name: 'Andrea',     last_name: 'Ramírez Luna',     student_code: '2PA-003', date_of_birth: '2018-06-21', allergies: null },
    { first_name: 'Máximo',     last_name: 'Moreno Espinoza',  student_code: '2PA-004', date_of_birth: '2018-01-17', allergies: null },
    { first_name: 'Camille',    last_name: 'Dupont García',    student_code: '2PA-005', date_of_birth: '2017-09-08', allergies: 'Cacahuate' },
    { first_name: 'Ximena',     last_name: 'Ruiz Carrillo',    student_code: '2PA-006', date_of_birth: '2018-04-30', allergies: null },
    { first_name: 'Arturo',     last_name: 'Medina Bravo',     student_code: '2PA-007', date_of_birth: '2017-11-23', allergies: null },
    { first_name: 'Sofía',      last_name: 'Vega Cortés',      student_code: '2PA-008', date_of_birth: '2018-02-14', allergies: null },
    { first_name: 'Emilio',     last_name: 'Paredes Santos',   student_code: '2PA-009', date_of_birth: '2017-08-16', allergies: 'Huevo' },
  ],
  // 3° Primaria — 8 alumnos
  [
    { first_name: 'Gabriela',   last_name: 'Fuentes Mora',     student_code: '3PA-001', date_of_birth: '2017-05-20', allergies: null },
    { first_name: 'Joaquín',    last_name: 'Ávila Contreras',  student_code: '3PA-002', date_of_birth: '2016-12-12', allergies: null },
    { first_name: 'Laura',      last_name: 'Torres Quintero',  student_code: '3PA-003', date_of_birth: '2017-03-08', allergies: 'Gluten' },
    { first_name: 'Rodrigo',    last_name: 'Sánchez Villa',    student_code: '3PA-004', date_of_birth: '2016-10-25', allergies: null },
    { first_name: 'Luciana',    last_name: 'Mendoza Trejo',    student_code: '3PA-005', date_of_birth: '2017-07-14', allergies: null },
    { first_name: 'Marco',      last_name: 'Herrera Padilla',  student_code: '3PA-006', date_of_birth: '2016-11-03', allergies: 'Mariscos' },
    { first_name: 'Fernanda',   last_name: 'Cruz Alvarado',    student_code: '3PA-007', date_of_birth: '2017-01-29', allergies: null },
    { first_name: 'Bruno',      last_name: 'Garza Domínguez',  student_code: '3PA-008', date_of_birth: '2016-09-06', allergies: null },
  ],
]

const GUARDIANS_DATA = [
  // Padres para Kinder A — Mateo García
  { first_name: 'Carlos',    last_name: 'García',      email: 'carlos.garcia@test.xokai.app',    phone: '+52 33 1234 5001' },
  // Padres para Kinder A — Valentina López
  { first_name: 'Patricia',  last_name: 'López',       email: 'patricia.lopez@test.xokai.app',   phone: '+52 33 1234 5002' },
  // Padres para 1° Primaria — Ana Paula Jiménez
  { first_name: 'Roberto',   last_name: 'Jiménez',     email: 'roberto.jimenez@test.xokai.app',  phone: '+52 33 1234 5003' },
  { first_name: 'Claudia',   last_name: 'Ochoa',       email: 'claudia.ochoa@test.xokai.app',    phone: '+52 33 1234 5004' },
  // Padres para 2° Primaria — Camille Dupont
  { first_name: 'Pierre',    last_name: 'Dupont',      email: 'pierre.dupont@test.xokai.app',    phone: '+52 33 1234 5005' },
  // Padres para 3° Primaria — Gabriela Fuentes
  { first_name: 'Eduardo',   last_name: 'Fuentes',     email: 'eduardo.fuentes@test.xokai.app',  phone: '+52 33 1234 5006' },
  { first_name: 'María',     last_name: 'Mora',        email: 'maria.mora@test.xokai.app',       phone: '+52 33 1234 5007' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ok(label: string, count?: number) {
  const suffix = count !== undefined ? ` (${count})` : ''
  console.log(`  ✓ ${label}${suffix}`)
}

function warn(label: string, msg: string) {
  console.log(`  ⚠ ${label}: ${msg}`)
}

async function createAuthUser(email: string, first_name: string, last_name: string) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password:      TEST_PASSWORD,
    email_confirm: true,
    user_metadata: { first_name, last_name },
  })
  if (error) {
    if (error.message.includes('already been registered')) {
      const { data: list } = await supabase.auth.admin.listUsers()
      const existing = list?.users.find(u => u.email === email)
      if (existing) return existing
    }
    throw new Error(`createUser ${email}: ${error.message}`)
  }
  return data.user
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌱 XOKAI — Seed de datos de prueba\n')

  // 1. Encontrar escuela
  let schoolId = process.env.SCHOOL_ID
  if (!schoolId) {
    const { data: schools, error } = await supabase
      .from('schools')
      .select('id, name')
      .eq('active', true)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()
    if (error || !schools) {
      console.error('✗ No se encontró ninguna escuela activa. Crea una primero vía /onboarding.')
      process.exit(1)
    }
    schoolId = schools.id
    console.log(`📍 Escuela: ${schools.name} (${schoolId})`)
  } else {
    console.log(`📍 Escuela: ${schoolId}`)
  }

  // 2. Limpiar datos de prueba anteriores
  if (CLEAN) {
    console.log('\n🧹 Limpiando datos de prueba anteriores...')

    const testEmails = [
      ...TEACHERS.map(t => t.email),
      ...GUARDIANS_DATA.map(g => g.email),
    ]

    // Limpiar auth users de prueba
    const { data: userList } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    const testUsers = userList?.users.filter(u => testEmails.includes(u.email ?? '')) ?? []
    for (const u of testUsers) {
      await supabase.auth.admin.deleteUser(u.id)
    }

    // Limpiar estudiantes de prueba (los creados por este script tienen student_code con patrón KA-/KB-/1PA-/etc.)
    await supabase.from('students')
      .delete()
      .eq('school_id', schoolId)
      .like('student_code', '%-%')

    // Limpiar grupos de prueba
    const groupNames = GROUPS.map(g => g.name)
    await supabase.from('groups')
      .delete()
      .eq('school_id', schoolId)
      .in('name', groupNames)

    ok('Datos de prueba anteriores eliminados')
  }

  // 3. Crear maestros
  console.log('\n👩‍🏫 Creando maestros...')
  const teacherIds: string[] = []
  for (const t of TEACHERS) {
    try {
      const user = await createAuthUser(t.email, t.first_name, t.last_name)

      // Upsert user_profile
      await supabase.from('user_profiles').upsert({
        id:         user.id,
        role:       'teacher',
        school_id:  schoolId,
        first_name: t.first_name,
        last_name:  t.last_name,
      }, { onConflict: 'id' })

      teacherIds.push(user.id)
      ok(`${t.first_name} ${t.last_name} — ${t.email}`)
    } catch (e) {
      warn(`${t.email}`, String(e))
      teacherIds.push('00000000-0000-0000-0000-000000000000')
    }
  }

  // 4. Crear grupos
  console.log('\n📂 Creando grupos...')
  const groupIds: string[] = []
  for (const g of GROUPS) {
    const { data, error } = await supabase
      .from('groups')
      .insert({
        school_id:            schoolId,
        name:                 g.name,
        grade:                g.grade,
        level:                g.level,
        academic_year:        g.academic_year,
        teacher_primary_id:   teacherIds[g.teacher_idx]   ?? null,
        teacher_spanish_id:   teacherIds[g.spanish_idx]   ?? null,
        teacher_assistant_id: teacherIds[g.assistant_idx] ?? null,
        active:               true,
      })
      .select('id')
      .single()

    if (error || !data) {
      warn(g.name, error?.message ?? 'error desconocido')
      groupIds.push('')
      continue
    }
    groupIds.push(data.id)
    ok(`${g.name}`)
  }

  // 5. Crear alumnos
  console.log('\n🎒 Creando alumnos...')
  let totalStudents = 0
  const createdStudents: Array<{ id: string; groupIdx: number; studentIdx: number }> = []

  for (let gi = 0; gi < GROUPS.length; gi++) {
    const gid = groupIds[gi]
    if (!gid) continue
    const students = STUDENTS_PER_GROUP[gi]

    const rows = students.map(s => ({
      school_id:     schoolId,
      group_id:      gid,
      first_name:    s.first_name,
      last_name:     s.last_name,
      student_code:  s.student_code,
      date_of_birth: s.date_of_birth,
      allergies:     s.allergies ?? null,
      active:        true,
    }))

    const { data, error } = await supabase
      .from('students')
      .insert(rows)
      .select('id')

    if (error || !data) {
      warn(GROUPS[gi].name, error?.message ?? 'error')
      continue
    }
    data.forEach((s, si) => createdStudents.push({ id: s.id, groupIdx: gi, studentIdx: si }))
    totalStudents += data.length
    ok(`${GROUPS[gi].name}: ${data.length} alumnos`)
  }

  // 6. Crear guardians + student_guardians
  console.log('\n👪 Creando padres y tutores...')
  const guardianMap: Map<string, string> = new Map() // email → guardian id

  for (const g of GUARDIANS_DATA) {
    try {
      const user = await createAuthUser(g.email, g.first_name, g.last_name)

      // user_profile como guardian
      await supabase.from('user_profiles').upsert({
        id:         user.id,
        role:       'guardian',
        school_id:  schoolId,
        first_name: g.first_name,
        last_name:  g.last_name,
      }, { onConflict: 'id' })

      // Entrada en tabla guardians
      const { data: guardianRow } = await supabase
        .from('guardians')
        .insert({
          user_id:    user.id,
          first_name: g.first_name,
          last_name:  g.last_name,
          email:      g.email,
          phone:      g.phone,
        })
        .select('id')
        .single()

      if (guardianRow) guardianMap.set(g.email, guardianRow.id)
      ok(`${g.first_name} ${g.last_name} — ${g.email}`)
    } catch (e) {
      warn(g.email, String(e))
    }
  }

  // 7. Vincular guardians con alumnos (student_guardians)
  console.log('\n🔗 Vinculando padres con alumnos...')

  const linksToCreate = [
    // Kinder A — Mateo (idx 0 del grupo 0) con Carlos García
    { studentKey: '0-0', guardianEmail: 'carlos.garcia@test.xokai.app',   relationship: 'father', is_primary: true,  can_pickup: true  },
    // Kinder A — Valentina (idx 1 del grupo 0) con Patricia López
    { studentKey: '0-1', guardianEmail: 'patricia.lopez@test.xokai.app',  relationship: 'mother', is_primary: true,  can_pickup: true  },
    // 1° Primaria — Ana Paula (idx 0 del grupo 2) con Roberto y Claudia
    { studentKey: '2-0', guardianEmail: 'roberto.jimenez@test.xokai.app', relationship: 'father', is_primary: true,  can_pickup: true  },
    { studentKey: '2-0', guardianEmail: 'claudia.ochoa@test.xokai.app',   relationship: 'mother', is_primary: false, can_pickup: true  },
    // 2° Primaria — Camille (idx 4 del grupo 3) con Pierre
    { studentKey: '3-4', guardianEmail: 'pierre.dupont@test.xokai.app',   relationship: 'father', is_primary: true,  can_pickup: true  },
    // 3° Primaria — Gabriela (idx 0 del grupo 4) con Eduardo y María
    { studentKey: '4-0', guardianEmail: 'eduardo.fuentes@test.xokai.app', relationship: 'father', is_primary: true,  can_pickup: true  },
    { studentKey: '4-0', guardianEmail: 'maria.mora@test.xokai.app',      relationship: 'mother', is_primary: false, can_pickup: false },
  ]

  let linkedCount = 0
  for (const link of linksToCreate) {
    const [gi, si] = link.studentKey.split('-').map(Number)
    const student = createdStudents.find(s => s.groupIdx === gi && s.studentIdx === si)
    const guardianId = guardianMap.get(link.guardianEmail)

    if (!student || !guardianId) continue

    const { error } = await supabase.from('student_guardians').insert({
      student_id:   student.id,
      guardian_id:  guardianId,
      relationship: link.relationship,
      is_primary:   link.is_primary,
      can_pickup:   link.can_pickup,
    })
    if (!error) linkedCount++
  }
  ok(`Vínculos alumno-tutor creados`, linkedCount)

  // 8. Crear personas autorizadas pickup
  console.log('\n🚗 Creando personas autorizadas de pickup...')

  const pickupPersons = [
    // Para Mateo García (grupo 0, alumno 0)
    { key: '0-0', first_name: 'Elena',    last_name: 'García',   relationship: 'Abuela',  phone: '+52 33 9876 0001' },
    { key: '0-0', first_name: 'Miguel',   last_name: 'García',   relationship: 'Tío',     phone: '+52 33 9876 0002' },
    // Para Isabella Hernández (grupo 0, alumno 3)
    { key: '0-3', first_name: 'Rosa',     last_name: 'Cruz',     relationship: 'Nana',    phone: '+52 33 9876 0003' },
    // Para Rodrigo Peña (grupo 2, alumno 1)
    { key: '2-1', first_name: 'Jorge',    last_name: 'Salazar',  relationship: 'Abuelo',  phone: '+52 33 9876 0004' },
    { key: '2-1', first_name: 'Cecilia',  last_name: 'Peña',     relationship: 'Tía',     phone: '+52 33 9876 0005' },
    // Para Camille Dupont (grupo 3, alumno 4)
    { key: '3-4', first_name: 'Martine',  last_name: 'Dupont',   relationship: 'Abuela',  phone: '+52 33 9876 0006' },
    // Para Gabriela Fuentes (grupo 4, alumno 0)
    { key: '4-0', first_name: 'Lucía',    last_name: 'Mora',     relationship: 'Hermana mayor', phone: '+52 33 9876 0007' },
    { key: '4-0', first_name: 'Ignacio',  last_name: 'Fuentes',  relationship: 'Tío',     phone: '+52 33 9876 0008' },
  ]

  let pickupCount = 0
  for (const p of pickupPersons) {
    const [gi, si] = p.key.split('-').map(Number)
    const student = createdStudents.find(s => s.groupIdx === gi && s.studentIdx === si)
    if (!student) continue

    const { error } = await supabase.from('authorized_pickups').insert({
      student_id:   student.id,
      first_name:   p.first_name,
      last_name:    p.last_name,
      relationship: p.relationship,
      phone:        p.phone,
      active:       true,
    })
    if (!error) pickupCount++
  }
  ok(`Personas autorizadas de pickup`, pickupCount)

  // ─── Resumen ────────────────────────────────────────────────────────────────
  console.log('\n✅ Seed completado\n')
  console.log('─────────────────────────────────────────────')
  console.log(`  Grupos:      ${groupIds.filter(Boolean).length} / ${GROUPS.length}`)
  console.log(`  Maestros:    ${teacherIds.length} / ${TEACHERS.length}`)
  console.log(`  Alumnos:     ${totalStudents}`)
  console.log(`  Padres:      ${guardianMap.size}`)
  console.log(`  Autorizados: ${pickupCount}`)
  console.log('─────────────────────────────────────────────')
  console.log(`\n  Contraseña de prueba: ${TEST_PASSWORD}`)
  console.log('\n  Páginas para probar:')
  console.log('    /dashboard/grupos')
  console.log('    /dashboard/alumnos')
  console.log('    /dashboard/maestros')
  console.log('    /dashboard/padres')
  console.log()
}

main().catch(e => {
  console.error('\n✗ Error:', e)
  process.exit(1)
})
