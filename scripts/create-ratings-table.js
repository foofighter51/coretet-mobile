import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createRatingsTable() {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS track_ratings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        track_id UUID REFERENCES tracks(id) ON DELETE CASCADE NOT NULL,
        user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
        rating TEXT CHECK (rating IN ('listened', 'liked', 'loved')) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(track_id, user_id)
      );

      ALTER TABLE track_ratings ENABLE ROW LEVEL SECURITY;

      CREATE POLICY "Allow all operations on track_ratings for MVP"
        ON track_ratings
        FOR ALL
        USING (true)
        WITH CHECK (true);

      CREATE INDEX IF NOT EXISTS idx_track_ratings_user_id ON track_ratings(user_id);
      CREATE INDEX IF NOT EXISTS idx_track_ratings_track_id ON track_ratings(track_id);
    `
  });

  if (error) {
    console.error('Error creating table:', error);
  } else {
    console.log('Success:', data);
  }
}

createRatingsTable();
