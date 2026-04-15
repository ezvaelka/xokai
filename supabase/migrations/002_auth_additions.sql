-- ============================================================
-- MIGRACIÓN 002 — Campos para auth avanzado
-- Agrega: avatar_url a user_profiles
--         RFC, datos fiscales y horarios de pickup a schools
-- ============================================================

-- ─── user_profiles ───────────────────────────────────────────────────────────

alter table user_profiles
  add column if not exists avatar_url  text,
  add column if not exists phone       text;

-- ─── schools — datos fiscales ─────────────────────────────────────────────────

alter table schools
  add column if not exists rfc                   text,
  add column if not exists razon_social          text,
  add column if not exists cp_fiscal             text,
  add column if not exists regimen_fiscal        text,
  add column if not exists uso_cfdi              text not null default 'G03',
  -- Horarios de pickup
  add column if not exists pickup_start          time,
  add column if not exists pickup_end            time,
  add column if not exists pickup_tolerance_mins smallint not null default 10,
  -- Indica si la escuela completó el wizard de onboarding
  add column if not exists onboarding_completed  boolean not null default false;

-- Índice para onboarding pendiente
create index if not exists idx_schools_onboarding
  on schools(onboarding_completed);
