-- Create wiki_entries table
CREATE TABLE IF NOT EXISTS wiki_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  category TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_public BOOLEAN DEFAULT false,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  file_url TEXT,
  related_links TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_wiki_entries_user_id ON wiki_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_wiki_entries_status ON wiki_entries(status);
CREATE INDEX IF NOT EXISTS idx_wiki_entries_category ON wiki_entries(category);
CREATE INDEX IF NOT EXISTS idx_wiki_entries_tags ON wiki_entries USING GIN(tags);

-- Enable RLS
ALTER TABLE wiki_entries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own wiki entries" ON wiki_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wiki entries" ON wiki_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wiki entries" ON wiki_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wiki entries" ON wiki_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_wiki_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_wiki_entries_updated_at
  BEFORE UPDATE ON wiki_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_wiki_entries_updated_at();
