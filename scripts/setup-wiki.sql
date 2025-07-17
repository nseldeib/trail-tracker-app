-- Create wiki_entries table
CREATE TABLE IF NOT EXISTS wiki_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'General',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_public BOOLEAN DEFAULT false,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  file_url TEXT,
  related_links TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wiki_entries_user_id ON wiki_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_wiki_entries_status ON wiki_entries(status);
CREATE INDEX IF NOT EXISTS idx_wiki_entries_category ON wiki_entries(category);
CREATE INDEX IF NOT EXISTS idx_wiki_entries_priority ON wiki_entries(priority);
CREATE INDEX IF NOT EXISTS idx_wiki_entries_is_public ON wiki_entries(is_public);
CREATE INDEX IF NOT EXISTS idx_wiki_entries_created_at ON wiki_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_wiki_entries_updated_at ON wiki_entries(updated_at);

-- Create GIN index for full-text search on title, summary, and content
CREATE INDEX IF NOT EXISTS idx_wiki_entries_search ON wiki_entries 
USING GIN (to_tsvector('english', title || ' ' || COALESCE(summary, '') || ' ' || COALESCE(content, '')));

-- Create GIN index for tags array
CREATE INDEX IF NOT EXISTS idx_wiki_entries_tags ON wiki_entries USING GIN (tags);

-- Enable Row Level Security
ALTER TABLE wiki_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own wiki entries" ON wiki_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public wiki entries" ON wiki_entries
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert their own wiki entries" ON wiki_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wiki entries" ON wiki_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wiki entries" ON wiki_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_wiki_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_wiki_entries_updated_at
  BEFORE UPDATE ON wiki_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_wiki_entries_updated_at();
