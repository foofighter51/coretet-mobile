-- Add archive functionality to feedback system
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

-- Add index for archived feedback queries
CREATE INDEX IF NOT EXISTS idx_feedback_archived ON feedback(archived);

-- Add admin_response flag to feedback_comments to distinguish admin replies
ALTER TABLE feedback_comments ADD COLUMN IF NOT EXISTS is_admin_response BOOLEAN DEFAULT false;

-- Update RLS policies to allow admins to archive/unarchive
-- Note: This assumes you'll implement admin role checking in your app
-- For now, any authenticated user can archive (you can restrict this later with custom claims)

CREATE POLICY "Users can archive their own feedback" ON feedback
  FOR UPDATE
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

-- Add policy to allow status updates by anyone (admin feature, restrict later if needed)
CREATE POLICY "Authenticated users can update feedback status" ON feedback
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);
