-- verify-auth-fixes.sql
-- Non-side-effecting transactional probes. Safe to replay.

\echo === ACLR3: profile visibility for the calling user ===
BEGIN;
DO $$ DECLARE got int; BEGIN
  SELECT count(*) INTO got FROM public.profiles WHERE id = auth.uid();
  IF got >= 1 THEN RAISE NOTICE 'ACLR3=PASS';
  ELSE RAISE NOTICE 'ACLR3=FAIL (got=%)', got;
  END IF;
END $$;
ROLLBACK;

\echo === ACLR5: spurious rows deleted ===
DO $$ DECLARE c int; BEGIN
  SELECT count(*) INTO c FROM public.organizations
    WHERE name IN ('SDD Bug Repro 2','Test SDD Bug','Should Succeed for NULL-org user','Should FAIL for existing-org user');
  IF c = 0 THEN RAISE NOTICE 'ACLR5=PASS';
  ELSE RAISE NOTICE 'ACLR5=FAIL (count=%)', c;
  END IF;
END $$;

\echo === ACLR4: cross-org profile isolation ===
BEGIN;
DO $$ DECLARE c int; BEGIN
  SELECT count(*) INTO c FROM public.profiles
    WHERE org_id IS NOT NULL
      AND org_id <> public.my_org_id();
  IF c = 0 THEN RAISE NOTICE 'ACLR4=PASS';
  ELSE RAISE NOTICE 'ACLR4=FAIL (count=%)', c;
  END IF;
END $$;
ROLLBACK;
