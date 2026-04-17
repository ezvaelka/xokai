-- ============================================================
-- MIGRACIÓN 006 — Historial de notas internas por escuela
-- Reemplaza el campo schools.internal_notes (texto plano) por
-- una tabla con autor, contenido y timestamp.
-- ============================================================

CREATE TABLE school_notes (
  id         uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id  uuid        NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  author_id  uuid        REFERENCES user_profiles(id) ON DELETE SET NULL,
  note       text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_school_notes_school ON school_notes(school_id, created_at DESC);

-- RLS: solo sysadmin puede leer/escribir notas internas
ALTER TABLE school_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sysadmin_all_school_notes" ON school_notes
  FOR ALL USING (is_sysadmin()) WITH CHECK (is_sysadmin());
