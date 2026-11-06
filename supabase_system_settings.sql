-- ================================================================
-- AttendOS: System Settings & Real-Time Sync Schema for Supabase
-- Run this in your Supabase SQL Editor if not already created.
-- ================================================================

-- 1. System Settings & Entity Sync Table (JSON payloads for attendance, disputes, announcements, etc.)
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated and anonymous users
DROP POLICY IF EXISTS "Allow public read on system_settings" ON public.system_settings;
CREATE POLICY "Allow public read on system_settings" 
ON public.system_settings FOR SELECT USING (true);

-- Harden Write Access: Only authenticated Faculty and Administrators can insert/update settings
DROP POLICY IF EXISTS "Allow public write on system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Only admins and faculty can write to system_settings" ON public.system_settings;

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

-- Insert default threshold (75%)
INSERT INTO public.system_settings (key, value)
VALUES ('attendance_threshold', '75')
ON CONFLICT (key) DO NOTHING;

-- 2. Enable Realtime Replication for system_settings (if postgres publication exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'system_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.system_settings;
  END IF;
END $$;
