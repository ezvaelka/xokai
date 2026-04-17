-- ============================================================
-- MIGRACIÓN 004 — Expandir enum user_role
-- Agrega roles que el frontend ya usa pero no estaban en el enum.
-- IMPORTANTE: ALTER TYPE ADD VALUE no se puede hacer dentro de
-- una transacción, por lo que cada sentencia es independiente.
-- Ejecutar en Supabase SQL Editor.
-- ============================================================

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'director';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'coordinador';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'finanzas';
