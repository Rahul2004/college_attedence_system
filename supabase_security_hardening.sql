-- ==============================================================================
-- AttendOS Phase 1 Security Hardening Migration: RLS & Role Integrity Enforcement
-- Prevents Self-Privilege Escalation, Broken Access Control & Unauthorized Settings Access
-- ==============================================================================

-- 1. ENFORCE ROLE INTEGRITY: Prevent Non-Admins From Self-Promoting to Admin/Faculty
-- Uses a PostgreSQL BEFORE UPDATE trigger that runs inside the database engine.
CREATE OR REPLACE FUNCTION public.enforce_profile_role_integrity()
RETURNS TRIGGER AS $$
DECLARE
  caller_is_admin BOOLEAN := FALSE;
BEGIN
  -- Determine if the caller is an authenticated Administrator
  IF auth.uid() IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    ) INTO caller_is_admin;
  END IF;

  -- Disallow modifying role if caller is not an admin, service role, or postgres superuser
  IF (OLD.role IS DISTINCT FROM NEW.role) 
     AND NOT caller_is_admin 
     AND (current_user != 'postgres') 
     AND (coalesce(auth.role(), '') != 'service_role') THEN
    RAISE EXCEPTION 'Access Denied: Only institutional Administrators can modify account roles.';
  END IF;

  -- Disallow modifying status unless caller is an admin, reviewer, or legitimate student detail submission
  IF (OLD.status IS DISTINCT FROM NEW.status) 
     AND NOT caller_is_admin 
     AND (current_user != 'postgres') 
     AND (coalesce(auth.role(), '') != 'service_role') THEN
    -- Allow legitimate onboarding submission (details_required -> details_pending_review)
    IF NOT (OLD.status = 'details_required' AND NEW.status = 'details_pending_review') THEN
      RAISE EXCEPTION 'Access Denied: Only institutional Administrators or Reviewers can alter account status.';
    END IF;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Attach trigger to public.profiles
DROP TRIGGER IF EXISTS trg_enforce_profile_role_integrity ON public.profiles;
CREATE TRIGGER trg_enforce_profile_role_integrity
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.enforce_profile_role_integrity();

-- 2. HARDEN RLS ON public.system_settings
-- Prevent unauthorized anonymous data scraping of admissions, audit logs, and attendance rosters
ALTER TABLE IF EXISTS public.system_settings ENABLE ROW LEVEL SECURITY;

-- Drop legacy permissive policies
DROP POLICY IF EXISTS "Allow public read on system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Allow public write on system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Only admins and faculty can write to system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Allow authenticated read on system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Allow anonymous read for public operational settings" ON public.system_settings;

-- 2a. Allow authenticated users (students, faculty, admins) to read system settings & rosters
CREATE POLICY "Allow authenticated read on system_settings" 
ON public.system_settings FOR SELECT 
TO authenticated 
USING (true);

-- 2b. Allow anonymous clients to read ONLY non-sensitive operational config (e.g., statutory threshold)
CREATE POLICY "Allow anonymous read for public operational settings" 
ON public.system_settings FOR SELECT 
TO anon 
USING (key IN ('attendance_threshold'));

-- 2c. Only authenticated Administrators and Faculty can write to system settings
CREATE POLICY "Only admins and faculty can write to system_settings" 
ON public.system_settings FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('admin', 'faculty')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('admin', 'faculty')
  )
);

-- 3. ENSURE ATTENDANCE LOGS & STUDENT ROSTERS WRITE ACCESS IS RESTRICTED
ALTER TABLE IF EXISTS public.attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Faculty can modify attendance logs" ON public.attendance_logs;
CREATE POLICY "Faculty can modify attendance logs"
  ON public.attendance_logs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('faculty', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('faculty', 'admin')
    )
  );
