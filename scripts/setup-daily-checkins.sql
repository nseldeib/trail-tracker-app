-- Create daily_checkins table
CREATE TABLE IF NOT EXISTS daily_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
  notes TEXT,
  emotions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own daily check-ins" ON daily_checkins;
DROP POLICY IF EXISTS "Users can insert their own daily check-ins" ON daily_checkins;
DROP POLICY IF EXISTS "Users can update their own daily check-ins" ON daily_checkins;
DROP POLICY IF EXISTS "Users can delete their own daily check-ins" ON daily_checkins;

-- Create policies
CREATE POLICY "Users can view their own daily check-ins" ON daily_checkins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily check-ins" ON daily_checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily check-ins" ON daily_checkins
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily check-ins" ON daily_checkins
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_daily_checkins_updated_at ON daily_checkins;

-- Create updated_at trigger
CREATE TRIGGER update_daily_checkins_updated_at 
  BEFORE UPDATE ON daily_checkins 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
