-- ============================================================
-- MIGRACIÓN 005 — Columnas multi-maestro en groups
-- Agrega columnas para modelo multi-maestro de Hábitat Learning Community.
-- teacher_id existente se mantiene como teacher_primary_id (alias/retrocompat).
-- Ejecutar en Supabase SQL Editor.
-- ============================================================

ALTER TABLE groups
  ADD COLUMN IF NOT EXISTS teacher_primary_id   uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS teacher_spanish_id   uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS teacher_assistant_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL;

-- Copiar datos existentes de teacher_id a teacher_primary_id
UPDATE groups SET teacher_primary_id = teacher_id WHERE teacher_id IS NOT NULL;
