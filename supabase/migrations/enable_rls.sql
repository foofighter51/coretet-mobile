-- Enable Row Level Security on all tables
-- This is CRITICAL for security - prevents users from accessing other users' data

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ensembles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ensemble_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE ensemble_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE versions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view ensembles they are members of" ON ensembles;
DROP POLICY IF EXISTS "Users can create ensembles" ON ensembles;
DROP POLICY IF EXISTS "Ensemble creators can update their ensembles" ON ensembles;

DROP POLICY IF EXISTS "Users can view ensemble members of their ensembles" ON ensemble_members;
DROP POLICY IF EXISTS "Users can add members to their ensembles" ON ensemble_members;

DROP POLICY IF EXISTS "Users can view invitations sent to them" ON ensemble_invitations;
DROP POLICY IF EXISTS "Ensemble members can send invitations" ON ensemble_invitations;

DROP POLICY IF EXISTS "Users can view versions in their ensembles" ON versions;
DROP POLICY IF EXISTS "Ensemble members can upload versions" ON versions;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Ensembles policies
CREATE POLICY "Users can view ensembles they are members of"
  ON ensembles FOR SELECT
  USING (
    id IN (
      SELECT band_id FROM ensemble_members WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can create ensembles"
  ON ensembles FOR INSERT
  WITH CHECK (created_by = auth.uid()::text);

CREATE POLICY "Ensemble creators can update their ensembles"
  ON ensembles FOR UPDATE
  USING (created_by = auth.uid()::text);

-- Ensemble members policies
CREATE POLICY "Users can view ensemble members of their ensembles"
  ON ensemble_members FOR SELECT
  USING (
    band_id IN (
      SELECT band_id FROM ensemble_members WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can add members to their ensembles"
  ON ensemble_members FOR INSERT
  WITH CHECK (
    band_id IN (
      SELECT id FROM ensembles WHERE created_by = auth.uid()::text
    )
  );

-- Ensemble invitations policies
CREATE POLICY "Users can view invitations sent to them"
  ON ensemble_invitations FOR SELECT
  USING (
    phone_number IN (
      SELECT phone_number FROM profiles WHERE user_id = auth.uid()::text
    )
    OR
    band_id IN (
      SELECT id FROM ensembles WHERE created_by = auth.uid()::text
    )
  );

CREATE POLICY "Ensemble members can send invitations"
  ON ensemble_invitations FOR INSERT
  WITH CHECK (
    band_id IN (
      SELECT band_id FROM ensemble_members WHERE user_id = auth.uid()::text
    )
  );

-- Versions (audio files) policies
CREATE POLICY "Users can view versions in their ensembles"
  ON versions FOR SELECT
  USING (
    band_id IN (
      SELECT band_id FROM ensemble_members WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Ensemble members can upload versions"
  ON versions FOR INSERT
  WITH CHECK (
    uploaded_by = auth.uid()::text
    AND
    band_id IN (
      SELECT band_id FROM ensemble_members WHERE user_id = auth.uid()::text
    )
  );
