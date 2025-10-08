-- Add screenshot support to feedback
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_feedback_with_images ON feedback(image_url) WHERE image_url IS NOT NULL;
