'use server'

import { revalidatePath } from 'next/cache'
import { createClient }   from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type AnnouncementItem = {
  id:            string
  title:         string
  body:          string
  image_url:     string | null
  form_url:      string | null
  form_label:    string | null
  segment_type:  'school' | 'group'
  segment_id:    string | null
  segment_label: string | null   // group name when segment_type='group'
  author_name:   string | null
  created_at:    string
  read_count:    number
}

export type CreateAnnouncementInput = {
  title:        string
  body:         string
  image_url?:   string | null
  form_url?:    string | null
  form_label?:  string | null
  segment_type: 'school' | 'group'
  segment_id?:  string | null
}

// ─── Helper interno ───────────────────────────────────────────────────────────

const STAFF_ROLES = ['admin', 'director', 'teacher', 'maestro', 'coordinador'] as const
type StaffRole = (typeof STAFF_ROLES)[number]

async function requireStaff(): Promise<{ user: { id: string }; profile: { school_id: string; role: StaffRole } }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('school_id, role')
    .eq('id', user.id)
    .single()

  if (error || !profile) throw new Error('Perfil no encontrado')
  if (!(STAFF_ROLES as readonly string[]).includes(profile.role)) {
    throw new Error('Acceso denegado: requiere rol de staff')
  }
  if (!profile.school_id) throw new Error('Usuario sin escuela asignada')

  return {
    user:    { id: user.id },
    profile: { school_id: profile.school_id, role: profile.role as StaffRole },
  }
}

// ─── listAnnouncements ────────────────────────────────────────────────────────

export async function listAnnouncements(): Promise<AnnouncementItem[]> {
  // requireStaff validates auth; RLS on the SSR client handles school scoping
  await requireStaff()
  const supabase = await createClient()

  const { data: rows, error } = await supabase
    .from('announcements')
    .select(`
      id,
      title,
      body,
      image_url,
      form_url,
      form_label,
      segment_type,
      segment_id,
      created_at,
      group:groups!announcements_segment_id_fkey (
        name
      ),
      author:user_profiles!announcements_author_id_fkey (
        first_name,
        last_name
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  if (!rows || rows.length === 0) return []

  // Fetch read counts for all announcements in one query
  const ids = rows.map((r) => r.id)

  const { data: readRows, error: readError } = await supabase
    .from('announcement_reads')
    .select('announcement_id')
    .in('announcement_id', ids)

  if (readError) throw new Error(readError.message)

  const readCountMap = new Map<string, number>()
  for (const r of readRows ?? []) {
    readCountMap.set(r.announcement_id, (readCountMap.get(r.announcement_id) ?? 0) + 1)
  }

  return rows.map((r) => {
    // Supabase returns joined rows as arrays when using FK hints
    const groupRaw = r.group as unknown
    const group = Array.isArray(groupRaw)
      ? (groupRaw[0] as { name: string } | undefined)
      : null
    const segment_label = group?.name ?? null

    const authorRaw = r.author as unknown
    const author = Array.isArray(authorRaw)
      ? (authorRaw[0] as { first_name: string | null; last_name: string | null } | undefined)
      : null
    const author_name = author
      ? [author.first_name, author.last_name].filter(Boolean).join(' ').trim() || null
      : null

    return {
      id:            r.id,
      title:         r.title,
      body:          r.body,
      image_url:     r.image_url ?? null,
      form_url:      r.form_url ?? null,
      form_label:    r.form_label ?? null,
      segment_type:  r.segment_type as 'school' | 'group',
      segment_id:    r.segment_id ?? null,
      segment_label,
      author_name,
      created_at:    r.created_at,
      read_count:    readCountMap.get(r.id) ?? 0,
    }
  })
}

// ─── createAnnouncement ───────────────────────────────────────────────────────

export async function createAnnouncement(
  data: CreateAnnouncementInput
): Promise<{ error: string | null; id: string | null }> {
  const { user, profile } = await requireStaff()
  const supabase = await createClient()

  const { data: created, error } = await supabase
    .from('announcements')
    .insert({
      school_id:    profile.school_id,
      author_id:    user.id,
      title:        data.title,
      body:         data.body,
      image_url:    data.image_url ?? null,
      form_url:     data.form_url ?? null,
      form_label:   data.form_label ?? null,
      segment_type: data.segment_type,
      segment_id:   data.segment_id ?? null,
    })
    .select('id')
    .single()

  if (error) return { error: error.message, id: null }

  revalidatePath('/dashboard/comunicados')
  return { error: null, id: created.id }
}

// ─── deleteAnnouncement ───────────────────────────────────────────────────────

export async function deleteAnnouncement(id: string): Promise<{ error: string | null }> {
  // Auth check; RLS policy enforces author-or-admin constraint on DELETE
  await requireStaff()
  const supabase = await createClient()

  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/comunicados')
  return { error: null }
}

// ─── uploadAnnouncementImage ──────────────────────────────────────────────────

const BUCKET = 'announcement-images'
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

export async function uploadAnnouncementImage(
  formData: FormData
): Promise<{ error: string | null; url: string | null }> {
  const { profile } = await requireStaff()
  const admin = createAdminClient()

  const file = formData.get('image')
  if (!(file instanceof File)) {
    return { error: 'Campo "image" requerido', url: null }
  }
  if (!file.type.startsWith('image/')) {
    return { error: 'Solo se permiten archivos de imagen', url: null }
  }
  if (file.size > MAX_BYTES) {
    return { error: 'La imagen no puede superar 5 MB', url: null }
  }

  const ext = file.name.split('.').pop() ?? 'bin'
  const path = `${profile.school_id}/${crypto.randomUUID()}.${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())

  // Create bucket if it doesn't exist yet; ignore error if it already exists
  await admin.storage.createBucket(BUCKET, { public: true })

  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (uploadError) return { error: uploadError.message, url: null }

  const { data: urlData } = admin.storage.from(BUCKET).getPublicUrl(path)

  return { error: null, url: urlData.publicUrl }
}
