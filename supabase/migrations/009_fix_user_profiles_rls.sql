-- ============================================================
-- MIGRACIÓN 009 — Corregir RLS de user_profiles
--
-- Problema: La política SELECT no incluía `id = auth.uid()`,
-- lo que impedía que usuarios con roles distintos a 'admin'
-- (ej. 'director') leyeran su propio perfil desde el middleware.
-- Esto causaba que el middleware recibiera `profile = null`
-- y redirigiera al onboarding en cada login.
--
-- Adicionalmente: normaliza usuarios creados con role='director'
-- durante el onboarding (antes de este fix) a role='admin'.
-- ============================================================

-- 1. Recrear política SELECT de user_profiles con id = auth.uid()
DROP POLICY IF EXISTS "user_profiles_select" ON user_profiles;

CREATE POLICY "user_profiles_select" ON user_profiles
  FOR SELECT USING (
    id = auth.uid()
    OR coalesce((SELECT role = 'sysadmin' FROM user_profiles WHERE id = auth.uid()), false)
    OR (
      coalesce((SELECT role FROM user_profiles WHERE id = auth.uid()), '') = 'admin'
      AND school_id = (SELECT school_id FROM user_profiles WHERE id = auth.uid())
    )
  );

-- 2. Normalizar role='director' → role='admin' para usuarios existentes
--    (El onboarding usó 'director' antes de este fix)
UPDATE user_profiles
  SET role = 'admin'
WHERE role = 'director';
