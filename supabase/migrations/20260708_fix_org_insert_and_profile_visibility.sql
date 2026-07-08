-- =============================================================
-- fix-org-insert-and-profile-visibility
-- Closes the org_insert RLS chicken-and-egg (RETURNING path tripped
-- org_members_read SELECT policy when my_org_id was null) and widens
-- org_members_see_profiles so an authenticated user can read their own
-- profile even before they have an org.
-- Re-stamps the function permission revokes the live DB drifted away from.
-- ACs addressed: AC1, AC3, AC4, AC5.
-- =============================================================

-- A.1 Restore org_insert to schema.sql intent (WITH CHECK true)
DROP POLICY IF EXISTS org_insert ON public.organizations;
CREATE POLICY org_insert ON public.organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- B.1 Widen org_members_see_profiles so org-less users can see their own profile
DROP POLICY IF EXISTS org_members_see_profiles ON public.profiles;
CREATE POLICY org_members_see_profiles ON public.profiles
  FOR SELECT
  TO public
  USING (id = auth.uid() OR org_id = public.my_org_id());

-- C Re-stamp schema.sql's revoke for my_org_id / my_role + handle_new_user
REVOKE EXECUTE ON FUNCTION public.my_org_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_org_id() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.my_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_role() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon;

-- F Clean up four spurious rows from probe artifacts
DELETE FROM public.organizations
WHERE name IN (
  'SDD Bug Repro 2',
  'Test SDD Bug',
  'Should Succeed for NULL-org user',
  'Should FAIL for existing-org user'
);

-- Manual rollback (copy-paste in editor; NOT a separate file):
-- DROP POLICY IF EXISTS org_insert ON public.organizations;
-- CREATE POLICY org_insert ON public.organizations FOR INSERT TO authenticated WITH CHECK (true);
-- DROP POLICY IF EXISTS org_members_see_profiles ON public.profiles;
-- CREATE POLICY org_members_see_profiles ON public.profiles FOR SELECT TO public USING (org_id = public.my_org_id());
-- GRANT EXECUTE ON FUNCTION public.my_org_id() TO PUBLIC, anon;
-- GRANT EXECUTE ON FUNCTION public.my_role() TO PUBLIC, anon;
-- GRANT EXECUTE ON FUNCTION public.handle_new_user() TO PUBLIC, anon;
