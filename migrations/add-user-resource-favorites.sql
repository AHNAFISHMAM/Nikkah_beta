-- =============================================
-- USER RESOURCE FAVORITES TABLE
-- Allows users to mark resources as favorites/highlights
-- Best Practices: Many-to-many relationship, RLS enabled, efficient indexing
-- =============================================

BEGIN;

-- Create user_resource_favorites junction table
CREATE TABLE IF NOT EXISTS user_resource_favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, resource_id)
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_user_resource_favorites_user_id ON user_resource_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_resource_favorites_resource_id ON user_resource_favorites(resource_id);

-- Enable Row Level Security
ALTER TABLE user_resource_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own favorites"
  ON user_resource_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites"
  ON user_resource_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON user_resource_favorites FOR DELETE
  USING (auth.uid() = user_id);

COMMIT;

