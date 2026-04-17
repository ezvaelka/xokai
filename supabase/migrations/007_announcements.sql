-- ============================================================
-- MIGRACIÓN 007 — Comunicados internos por escuela
-- ============================================================

CREATE TABLE announcements (
  id           uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id    uuid        NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  author_id    uuid        REFERENCES user_profiles(id) ON DELETE SET NULL,
  title        text        NOT NULL,
  body         text        NOT NULL,
  image_url    text,
  form_url     text,
  form_label   text,
  segment_type text        NOT NULL DEFAULT 'school' CHECK (segment_type IN ('school', 'group')),
  segment_id   uuid        REFERENCES groups(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_announcements_school ON announcements(school_id, created_at DESC);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Staff de la escuela puede leer
CREATE POLICY "school_staff_read_announcements" ON announcements
  FOR SELECT USING (
    coalesce((select role = 'sysadmin' from user_profiles where id = auth.uid()), false)
    OR school_id = (select school_id from user_profiles where id = auth.uid())
  );

-- Staff autorizado puede insertar
CREATE POLICY "school_staff_insert_announcements" ON announcements
  FOR INSERT WITH CHECK (
    school_id = (select school_id from user_profiles where id = auth.uid())
    AND (select role from user_profiles where id = auth.uid()) IN ('admin', 'director', 'teacher', 'maestro', 'coordinador')
  );

-- Autor o admin puede eliminar
CREATE POLICY "school_staff_delete_announcements" ON announcements
  FOR DELETE USING (
    coalesce((select role = 'sysadmin' from user_profiles where id = auth.uid()), false)
    OR author_id = auth.uid()
    OR (select role from user_profiles where id = auth.uid()) IN ('admin', 'director')
  );

-- Lecturas (para app móvil futura)
CREATE TABLE announcement_reads (
  announcement_id uuid        NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  guardian_id     uuid        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  read_at         timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (announcement_id, guardian_id)
);

ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_read_announcement_reads" ON announcement_reads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM announcements a
      WHERE a.id = announcement_id
      AND a.school_id = (select school_id from user_profiles where id = auth.uid())
    )
  );

CREATE POLICY "guardian_insert_own_read" ON announcement_reads
  FOR INSERT WITH CHECK (guardian_id = auth.uid());
