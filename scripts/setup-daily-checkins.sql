-- Create daily_checkins table
CREATE TABLE IF NOT EXISTS daily_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
  notes TEXT,
  emotions TEXT[], -- Array of emotion/condition tags
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date) -- One check-in per user per day
);

-- Enable Row Level Security
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;

-- Create policies for daily_checkins table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_checkins' AND policyname = 'Users can view own check-ins') THEN
    CREATE POLICY "Users can view own check-ins" ON daily_checkins FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_checkins' AND policyname = 'Users can insert own check-ins') THEN
    CREATE POLICY "Users can insert own check-ins" ON daily_checkins FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_checkins' AND policyname = 'Users can update own check-ins') THEN
    CREATE POLICY "Users can update own check-ins" ON daily_checkins FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_checkins' AND policyname = 'Users can delete own check-ins') THEN
    CREATE POLICY "Users can delete own check-ins" ON daily_checkins FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;
