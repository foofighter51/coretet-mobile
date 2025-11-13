-- Disable RLS on tracks table for MVP
-- We trust Clerk authentication on the client side
-- Will re-enable with proper JWT integration post-MVP
ALTER TABLE tracks DISABLE ROW LEVEL SECURITY;
