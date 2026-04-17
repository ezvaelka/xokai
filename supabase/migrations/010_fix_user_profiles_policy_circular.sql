-- ============================================================
-- MIGRACIÓN 010 — Crear funciones helper + restaurar policy
--
-- Las funciones is_sysadmin(), auth_user_role(), auth_school_id()
-- nunca fueron creadas en producción. Sin ellas la policy de
-- user_profiles no puede compilar.
--
-- Estas funciones son SECURITY DEFINER: corren como superuser y
-- bypassean RLS, evitando la recursión circular al leer
-- user_profiles dentro de una policy de user_profiles.
-- ============================================================

-- 1. Funciones helper SECURITY DEFINER
CREATE OR REPLACE FUNCTION auth_school_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT school_id FROM user_profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role::text FROM user_profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION is_sysadmin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT COALESCE((SELECT role = 'sysadmin' FROM user_profiles WHERE id = auth.uid()), false)
$$;

CREATE OR REPLACE FUNCTION is_school_admin(sid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT is_sysadmin() OR EXISTS(
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND school_id = sid AND role = 'admin'
  )
$$;

CREATE OR REPLACE FUNCTION can_access_school(sid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT is_sysadmin() OR EXISTS(
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND school_id = sid
  )
$$;

-- 2. Recrear policy de user_profiles usando las funciones (sin recursión)
DROP POLICY IF EXISTS "user_profiles_select" ON user_profiles;

CREATE POLICY "user_profiles_select" ON user_profiles
  FOR SELECT USING (
    id = auth.uid()
    OR is_sysadmin()
    OR (auth_user_role() = 'admin' AND school_id = auth_school_id())
  );
