-- ============================================================
-- MIGRACIÓN 010 — Corregir policy circular de user_profiles
--
-- La migración 009 reemplazó las funciones SECURITY DEFINER
-- con subqueries inline, causando recursión circular en la
-- policy de user_profiles (el check lee la misma tabla que
-- está protegiendo). Esto hace que TODAS las queries a
-- user_profiles fallen silenciosamente → profile = null.
--
-- Este fix restaura la policy original usando las funciones
-- SECURITY DEFINER (is_sysadmin, auth_user_role, auth_school_id)
-- que bypasean RLS y evitan la recursión.
-- ============================================================

DROP POLICY IF EXISTS "user_profiles_select" ON user_profiles;

CREATE POLICY "user_profiles_select" ON user_profiles
  FOR SELECT USING (
    id = auth.uid()
    OR is_sysadmin()
    OR (auth_user_role() = 'admin' AND school_id = auth_school_id())
  );
