-- Create feedback table for community feedback/bug reports/feature requests
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('bug', 'feature', 'question', 'other')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'in_progress', 'completed', 'wont_fix')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feedback_votes table for upvoting
CREATE TABLE IF NOT EXISTS feedback_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feedback_id UUID REFERENCES feedback(id) ON DELETE CASCADE NOT NULL,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure a user can only vote once per feedback
  UNIQUE(feedback_id, user_id)
);

-- Create feedback_comments table for replies
CREATE TABLE IF NOT EXISTS feedback_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feedback_id UUID REFERENCES feedback(id) ON DELETE CASCADE NOT NULL,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_feedback_user ON feedback(user_id);
CREATE INDEX idx_feedback_category ON feedback(category);
CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_feedback_created ON feedback(created_at DESC);
CREATE INDEX idx_feedback_votes_feedback ON feedback_votes(feedback_id);
CREATE INDEX idx_feedback_votes_user ON feedback_votes(user_id);
CREATE INDEX idx_feedback_comments_feedback ON feedback_comments(feedback_id);

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feedback
-- Everyone can view feedback
CREATE POLICY "Anyone can view feedback"
  ON feedback
  FOR SELECT
  USING (true);

-- Users can create feedback
CREATE POLICY "Users can create feedback"
  ON feedback
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

-- Users can update their own feedback
CREATE POLICY "Users can update their own feedback"
  ON feedback
  FOR UPDATE
  USING (user_id = auth.uid()::text);

-- Users can delete their own feedback
CREATE POLICY "Users can delete their own feedback"
  ON feedback
  FOR DELETE
  USING (user_id = auth.uid()::text);

-- RLS Policies for feedback_votes
-- Everyone can view votes
CREATE POLICY "Anyone can view votes"
  ON feedback_votes
  FOR SELECT
  USING (true);

-- Users can vote
CREATE POLICY "Users can vote"
  ON feedback_votes
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

-- Users can remove their own votes
CREATE POLICY "Users can remove their votes"
  ON feedback_votes
  FOR DELETE
  USING (user_id = auth.uid()::text);

-- RLS Policies for feedback_comments
-- Everyone can view comments
CREATE POLICY "Anyone can view comments"
  ON feedback_comments
  FOR SELECT
  USING (true);

-- Users can create comments
CREATE POLICY "Users can create comments"
  ON feedback_comments
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
  ON feedback_comments
  FOR UPDATE
  USING (user_id = auth.uid()::text);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON feedback_comments
  FOR DELETE
  USING (user_id = auth.uid()::text);
