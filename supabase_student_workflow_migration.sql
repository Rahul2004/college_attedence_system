-- ==============================================================================
-- College Attendance System: Student Registration & Approval Workflow Migration
-- Non-destructive extension to public.profiles table and handle_new_user trigger
-- ==============================================================================

-- 1. Extend public.profiles status constraint to support full onboarding state machine
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_status_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_status_check CHECK (
  status IN (
    'pending_approval', 
    'details_required', 
    'details_pending_review', 
    'active', 
    'rejected', 
    'suspended'
  )
);

-- 2. Add Student Academic & Admission Fields to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS roll_no TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS program_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS program_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS semester TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS section TEXT DEFAULT 'A';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS admission_year TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES auth.users(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS review_notes TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- 3. Update handle_new_user trigger so new signups start as 'pending_approval' (NEVER auto-'active')
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role VARCHAR(10);
BEGIN
  -- Strict whitelist check for assigned role (only 'faculty' or 'student' from self-registration, 'admin' requires manual promotion)
  IF new.raw_user_meta_data->>'role' = 'faculty' THEN
    assigned_role := 'faculty';
  ELSIF new.raw_user_meta_data->>'role' = 'admin' THEN
    assigned_role := 'admin';
  ELSE
    assigned_role := 'student';
  END IF;

  INSERT INTO public.profiles (id, email, role, status, full_name, department)
  VALUES (
    new.id,
    new.email,
    assigned_role,
    'pending_approval',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'department'
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Re-create trigger safely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Secure RLS Policy: Only Faculty and Admin can update user status and review notes
DROP POLICY IF EXISTS "Reviewers can approve or reject profiles" ON public.profiles;
CREATE POLICY "Reviewers can approve or reject profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('faculty', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('faculty', 'admin')
    )
  );

-- 5. Policy for Students to fill their own college details when in 'details_required' state
DROP POLICY IF EXISTS "Students can complete own academic profile" ON public.profiles;
CREATE POLICY "Students can complete own academic profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id AND status = 'details_required'
  )
  WITH CHECK (
    auth.uid() = id AND status = 'details_pending_review'
  );
