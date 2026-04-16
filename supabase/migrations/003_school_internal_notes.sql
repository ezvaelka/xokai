-- ============================================================
-- MIGRACIÓN 003 — Notas internas por escuela
-- Campo de texto libre solo visible para sysadmin.
-- ============================================================

ALTER TABLE schools
  ADD COLUMN IF NOT EXISTS internal_notes TEXT;
