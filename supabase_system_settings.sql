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
CREATE POLICY "Allow public read on system_settings" 
ON public.system_settings FOR SELECT USING (true);

-- Allow authenticated users (or service role) to insert/update settings
CREATE POLICY "Allow public write on system_settings" 
ON public.system_settings FOR ALL USING (true);

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
