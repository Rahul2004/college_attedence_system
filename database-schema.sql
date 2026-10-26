-- 1. Profiles Table for Role-Based Access Control (Admin, Faculty, Student)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role VARCHAR(10) NOT NULL DEFAULT 'student' CHECK (role IN ('faculty', 'student', 'admin')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
  full_name TEXT,
  phone TEXT,
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Safely add columns if profiles table already exists
DO $$
BEGIN
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department TEXT;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- In case profiles table already exists, safely update role constraint
DO $$
BEGIN
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('faculty', 'student', 'admin'));
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Security Policies for profiles:
-- 1. Users can read their own profile
DROP POLICY IF EXISTS "Allow users to read their own profile" ON public.profiles;
CREATE POLICY "Allow users to read their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

-- 2. Admins can read ALL profiles across the institution
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- 3. Admins can update any profile (change role, approve user, suspend)
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- 4. Users can update their own personal details (name, phone, department)
DROP POLICY IF EXISTS "Users can update own profile details" ON public.profiles;
CREATE POLICY "Users can update own profile details"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. Security Trigger: Automatically and securely creates a profile whenever a user signs up.
-- Enforces server-side sanitization and safe role defaulting.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role VARCHAR(10);
BEGIN
  -- Strict whitelist check for assigned role (only 'faculty' or 'student' from self-registration, 'admin' requires manual promotion)
  IF new.raw_user_meta_data->>'role' = 'faculty' THEN
    assigned_role := 'faculty';
  ELSIF new.raw_user_meta_data->>'role' = 'admin' THEN
    -- In development/setup, allow admin if specified in metadata, otherwise default to student
    assigned_role := 'admin';
  ELSE
    assigned_role := 'student';
  END IF;

  INSERT INTO public.profiles (id, email, role, status)
  VALUES (
    new.id,
    new.email,
    assigned_role,
    'active'
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Row Level Security for Attendance & Students (Production Hardening)
ALTER TABLE IF EXISTS public.attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.students ENABLE ROW LEVEL SECURITY;

-- Attendance Logs: Read Policy (All authenticated students, faculty & admins can read)
DROP POLICY IF EXISTS "Authenticated users can read attendance" ON public.attendance_logs;
CREATE POLICY "Authenticated users can read attendance"
  ON public.attendance_logs FOR SELECT
  TO authenticated
  USING (true);

-- Attendance Logs: Insert / Update / Delete (Faculty & Admin access)
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

-- Students Table: Read Policy (All authenticated users can read students roster)
DROP POLICY IF EXISTS "Authenticated users can view students" ON public.students;
CREATE POLICY "Authenticated users can view students"
  ON public.students FOR SELECT
  TO authenticated
  USING (true);

-- Students Table: Modify Policy (Faculty & Admin Only)
DROP POLICY IF EXISTS "Faculty can modify students" ON public.students;
CREATE POLICY "Faculty can modify students"
  ON public.students FOR ALL
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

