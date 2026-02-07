-- Add water_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS water_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  amount_ml INTEGER NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on water_logs
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for water_logs
DROP POLICY IF EXISTS "Users can manage their own water logs" ON water_logs;
CREATE POLICY "Users can manage their own water logs" ON water_logs
  FOR ALL USING (auth.uid() = user_id);

-- Verify all tables exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
        RAISE EXCEPTION 'user_profiles table does not exist! Please run the full schema first.';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'food_logs') THEN
        RAISE EXCEPTION 'food_logs table does not exist! Please run the full schema first.';
    END IF;
    
    RAISE NOTICE 'All tables verified successfully!';
END $$;
