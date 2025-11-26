-- =============================================
-- COUPLES/PARTNERS TABLE FOR REAL-TIME COLLABORATION
-- =============================================
-- Run this in Supabase SQL Editor to enable partner data sharing

-- Create couples table to link partners
CREATE TABLE IF NOT EXISTS couples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  relationship_status TEXT CHECK (relationship_status IN ('engaged', 'married', 'preparing')) DEFAULT 'preparing',
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique pairing and no self-pairing
  CONSTRAINT different_users CHECK (user1_id != user2_id),
  CONSTRAINT unique_couple UNIQUE (user1_id, user2_id)
);

-- Create indexes for efficient partner lookups
CREATE INDEX IF NOT EXISTS idx_couples_user1 ON couples(user1_id);
CREATE INDEX IF NOT EXISTS idx_couples_user2 ON couples(user2_id);

-- Create function to get partner ID
CREATE OR REPLACE FUNCTION get_partner_id(current_user_id UUID)
RETURNS UUID AS $$
DECLARE
  partner_id UUID;
BEGIN
  -- Check if user is user1
  SELECT user2_id INTO partner_id
  FROM couples
  WHERE user1_id = current_user_id;

  -- If not found, check if user is user2
  IF partner_id IS NULL THEN
    SELECT user1_id INTO partner_id
    FROM couples
    WHERE user2_id = current_user_id;
  END IF;

  RETURN partner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if two users are partners
CREATE OR REPLACE FUNCTION are_partners(user_a UUID, user_b UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM couples
    WHERE (user1_id = user_a AND user2_id = user_b)
       OR (user1_id = user_b AND user2_id = user_a)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create server action to link partners via email
CREATE OR REPLACE FUNCTION link_partner_by_email(partner_email_input TEXT)
RETURNS JSON AS $$
DECLARE
  current_user_id UUID;
  partner_user_id UUID;
  result JSON;
BEGIN
  -- Get current authenticated user
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Not authenticated'
    );
  END IF;

  -- Find partner by email
  SELECT id INTO partner_user_id
  FROM profiles
  WHERE email = partner_email_input OR partner_email = partner_email_input
  LIMIT 1;

  IF partner_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Partner email not found'
    );
  END IF;

  -- Check if already linked
  IF are_partners(current_user_id, partner_user_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Already linked to this partner'
    );
  END IF;

  -- Create couple link
  INSERT INTO couples (user1_id, user2_id)
  VALUES (current_user_id, partner_user_id)
  ON CONFLICT DO NOTHING;

  RETURN json_build_object(
    'success', true,
    'partner_id', partner_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;

-- RLS Policies for couples table
CREATE POLICY "Users can view their own couple relationship"
  ON couples FOR SELECT
  USING (
    auth.uid() = user1_id
    OR auth.uid() = user2_id
  );

CREATE POLICY "Users can create couple relationship"
  ON couples FOR INSERT
  WITH CHECK (
    auth.uid() = user1_id
    OR auth.uid() = user2_id
  );

CREATE POLICY "Users can update their own couple relationship"
  ON couples FOR UPDATE
  USING (
    auth.uid() = user1_id
    OR auth.uid() = user2_id
  );

CREATE POLICY "Users can delete their own couple relationship"
  ON couples FOR DELETE
  USING (
    auth.uid() = user1_id
    OR auth.uid() = user2_id
  );

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_couples_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER couples_updated_at
  BEFORE UPDATE ON couples
  FOR EACH ROW
  EXECUTE FUNCTION update_couples_updated_at();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Couples table created successfully!';
  RAISE NOTICE 'Partner collaboration features are now ready.';
  RAISE NOTICE 'Next: Update RLS policies for data sharing.';
END $$;
