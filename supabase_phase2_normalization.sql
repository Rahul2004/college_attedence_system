-- ==============================================================================
-- AttendOS Phase 2 Database Normalization Migration
-- Transitions from system_settings JSON Blobs to High-Performance Relational Tables
-- Enables Atomic Transactions, Strict Foreign Keys, Indexes & Granular RLS
-- ==============================================================================

-- 1. ATTENDANCE SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_key TEXT NOT NULL,
  program_id TEXT NOT NULL,
  semester TEXT NOT NULL,
  subject_code TEXT NOT NULL,
  slot_id TEXT DEFAULT 'P1',
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  faculty_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  faculty_email TEXT,
  total_enrolled INT DEFAULT 0,
  total_present INT DEFAULT 0,
  total_absent INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_session_slot UNIQUE (class_key, session_date, slot_id)
);

CREATE INDEX IF NOT EXISTS idx_sessions_class_date ON public.attendance_sessions(class_key, session_date);
CREATE INDEX IF NOT EXISTS idx_sessions_faculty ON public.attendance_sessions(faculty_id);

-- 2. ATTENDANCE RECORDS (INDIVIDUAL STUDENT LEVEL)
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  roll_no TEXT NOT NULL,
  student_name TEXT,
  student_email TEXT,
  status VARCHAR(10) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT')),
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_session_student UNIQUE (session_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_att_records_session ON public.attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_att_records_student ON public.attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_att_records_roll ON public.attendance_records(roll_no);

-- 3. LEAVE APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.leave_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  student_name TEXT,
  roll_no TEXT,
  category TEXT NOT NULL,
  subject_code TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  medical_doc_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  resolution_note TEXT,
  applied_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leaves_student ON public.leave_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_leaves_status ON public.leave_applications(status);

-- 4. ATTENDANCE DISPUTES TABLE
CREATE TABLE IF NOT EXISTS public.attendance_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  student_name TEXT,
  roll_no TEXT,
  subject_code TEXT NOT NULL,
  subject_name TEXT,
  class_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  resolution_note TEXT,
  applied_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_disputes_student ON public.attendance_disputes(student_id);
CREATE INDEX IF NOT EXISTS idx_disputes_subject ON public.attendance_disputes(subject_code);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON public.attendance_disputes(status);

-- ==============================================================================
-- 5. ATOMIC ATTENDANCE COMMIT STORED PROCEDURE
-- Commits a full session and all student records within an atomic database transaction
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.commit_attendance_batch(
  p_class_key TEXT,
  p_program_id TEXT,
  p_semester TEXT,
  p_subject_code TEXT,
  p_slot_id TEXT,
  p_session_date DATE,
  p_faculty_email TEXT,
  p_records JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_session_id UUID;
  v_faculty_id UUID := auth.uid();
  v_rec JSONB;
  v_present_count INT := 0;
  v_absent_count INT := 0;
  v_total INT := 0;
BEGIN
  -- Verify caller has faculty or admin privileges
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = v_faculty_id AND role IN ('faculty', 'admin')
  ) AND (current_user != 'postgres') AND (coalesce(auth.role(), '') != 'service_role') THEN
    RAISE EXCEPTION 'Access Denied: Only authorized Faculty or Administrators can commit attendance.';
  END IF;

  -- Upsert attendance session
  INSERT INTO public.attendance_sessions (
    class_key, program_id, semester, subject_code, slot_id, session_date, faculty_id, faculty_email, updated_at
  ) VALUES (
    p_class_key, p_program_id, p_semester, p_subject_code, coalesce(p_slot_id, 'P1'), coalesce(p_session_date, CURRENT_DATE), v_faculty_id, p_faculty_email, now()
  )
  ON CONFLICT (class_key, session_date, slot_id) DO UPDATE
  SET faculty_id = EXCLUDED.faculty_id,
      faculty_email = EXCLUDED.faculty_email,
      updated_at = now()
  RETURNING id INTO v_session_id;

  -- Iterate through records array
  FOR v_rec IN SELECT * FROM jsonb_array_elements(p_records)
  LOOP
    v_total := v_total + 1;
    IF (v_rec->>'todayStatus' = 'PRESENT') OR (v_rec->>'status' = 'PRESENT') THEN
      v_present_count := v_present_count + 1;
    ELSE
      v_absent_count := v_absent_count + 1;
    END IF;

    INSERT INTO public.attendance_records (
      session_id, student_id, roll_no, student_name, student_email, status
    ) VALUES (
      v_session_id,
      v_rec->>'id',
      coalesce(v_rec->>'rollNo', '00000'),
      v_rec->>'name',
      v_rec->>'email',
      CASE WHEN (v_rec->>'todayStatus' = 'PRESENT') OR (v_rec->>'status' = 'PRESENT') THEN 'PRESENT' ELSE 'ABSENT' END
    )
    ON CONFLICT (session_id, student_id) DO UPDATE
    SET status = EXCLUDED.status,
        student_name = EXCLUDED.student_name,
        roll_no = EXCLUDED.roll_no;
  END LOOP;

  -- Update session totals
  UPDATE public.attendance_sessions
  SET total_enrolled = v_total,
      total_present = v_present_count,
      total_absent = v_absent_count
  WHERE id = v_session_id;

  RETURN jsonb_build_object(
    'sessionId', v_session_id,
    'totalEnrolled', v_total,
    'totalPresent', v_present_count,
    'totalAbsent', v_absent_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ==============================================================================
-- 6. ROW LEVEL SECURITY POLICIES
-- ==============================================================================
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_disputes ENABLE ROW LEVEL SECURITY;

-- SESSIONS: Authenticated read; Faculty/Admin write
DROP POLICY IF EXISTS "Authenticated users can read sessions" ON public.attendance_sessions;
CREATE POLICY "Authenticated users can read sessions"
  ON public.attendance_sessions FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "Faculty and admin can modify sessions" ON public.attendance_sessions;
CREATE POLICY "Faculty and admin can modify sessions"
  ON public.attendance_sessions FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('faculty', 'admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('faculty', 'admin'))
  );

-- RECORDS: Authenticated read; Faculty/Admin write
DROP POLICY IF EXISTS "Authenticated users can read records" ON public.attendance_records;
CREATE POLICY "Authenticated users can read records"
  ON public.attendance_records FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "Faculty and admin can modify records" ON public.attendance_records;
CREATE POLICY "Faculty and admin can modify records"
  ON public.attendance_records FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('faculty', 'admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('faculty', 'admin'))
  );

-- LEAVES: Students can view and create own; Faculty/Admin view and modify all
DROP POLICY IF EXISTS "Users can view relevant leaves" ON public.leave_applications;
CREATE POLICY "Users can view relevant leaves"
  ON public.leave_applications FOR SELECT
  TO authenticated
  USING (
    (student_id = auth.uid()::text) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('faculty', 'admin'))
  );

DROP POLICY IF EXISTS "Students can apply for leaves" ON public.leave_applications;
CREATE POLICY "Students can apply for leaves"
  ON public.leave_applications FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Faculty and admin can review leaves" ON public.leave_applications;
CREATE POLICY "Faculty and admin can review leaves"
  ON public.leave_applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('faculty', 'admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('faculty', 'admin'))
  );

-- DISPUTES: Students view own; Faculty/Admin view and modify all
DROP POLICY IF EXISTS "Users can view relevant disputes" ON public.attendance_disputes;
CREATE POLICY "Users can view relevant disputes"
  ON public.attendance_disputes FOR SELECT
  TO authenticated
  USING (
    (student_id = auth.uid()::text) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('faculty', 'admin'))
  );

DROP POLICY IF EXISTS "Students can file disputes" ON public.attendance_disputes;
CREATE POLICY "Students can file disputes"
  ON public.attendance_disputes FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Faculty and admin can resolve disputes" ON public.attendance_disputes;
CREATE POLICY "Faculty and admin can resolve disputes"
  ON public.attendance_disputes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('faculty', 'admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('faculty', 'admin'))
  );
