-- ============================================================
-- MIGRACIÓN 008 — Sysadmin v2: planes, billing, suspensión, feature flags
-- ============================================================

-- ─── Plan de la escuela ──────────────────────────────────────
-- 'trial'       → 30 días gratis, acceso completo
-- 'base'        → $7 USD / alumno activo / mes
-- 'base_pickup' → $9 USD / alumno activo / mes (incluye GPS Pickup)
-- 'suspended'   → acceso bloqueado por falta de pago o decisión manual
-- 'churned'     → ex-cliente, datos retenidos 90 días

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'school_plan') THEN
    CREATE TYPE school_plan AS ENUM (
      'trial',
      'base',
      'base_pickup',
      'suspended',
      'churned'
    );
  END IF;
END$$;

ALTER TABLE schools
  ADD COLUMN IF NOT EXISTS plan              school_plan NOT NULL DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS trial_ends_at     timestamptz,
  ADD COLUMN IF NOT EXISTS suspended_at      timestamptz,
  ADD COLUMN IF NOT EXISTS suspended_reason  text,
  ADD COLUMN IF NOT EXISTS monthly_rate_usd  numeric(6,2),  -- override manual de precio
  ADD COLUMN IF NOT EXISTS max_students      int,           -- límite por plan (null = ilimitado)
  ADD COLUMN IF NOT EXISTS billing_email     text;          -- email de facturación

-- Default trial de 30 días para escuelas sin trial_ends_at
UPDATE schools
SET trial_ends_at = created_at + interval '30 days'
WHERE plan = 'trial' AND trial_ends_at IS NULL;

-- ─── Feature flags por escuela ────────────────────────────────
-- JSONB: { "pickup": true, "comunicados": false, "pagos": false }
-- Permite activar/desactivar módulos sin deploy

ALTER TABLE schools
  ADD COLUMN IF NOT EXISTS feature_flags jsonb NOT NULL DEFAULT '{}';

-- ─── Support log entries ─────────────────────────────────────
-- Log de acciones del sysadmin sobre la escuela (auditoría)

CREATE TABLE IF NOT EXISTS school_activity_log (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id   uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  actor_id    uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  action      text NOT NULL,  -- 'suspended', 'activated', 'plan_changed', 'impersonated', etc.
  payload     jsonb,          -- datos relevantes del evento
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_school ON school_activity_log(school_id, created_at DESC);

ALTER TABLE school_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sysadmin can read all logs"
  ON school_activity_log FOR SELECT
  USING (coalesce((SELECT role = 'sysadmin' FROM user_profiles WHERE id = auth.uid()), false));

CREATE POLICY "sysadmin can insert logs"
  ON school_activity_log FOR INSERT
  WITH CHECK (coalesce((SELECT role = 'sysadmin' FROM user_profiles WHERE id = auth.uid()), false));

-- ─── RLS para nuevas columnas de schools ─────────────────────
-- Las políticas de schools ya existen; el sysadmin puede UPDATE
-- las nuevas columnas por las políticas existentes de UPDATE ALL.

-- ─── Índices ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_schools_plan ON schools(plan);
CREATE INDEX IF NOT EXISTS idx_schools_trial ON schools(trial_ends_at) WHERE plan = 'trial';
