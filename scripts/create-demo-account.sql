-- SQL script to create demo account with sample data
-- Run this in Supabase SQL Editor

-- 1. Create the demo user profile (assuming auth user already exists)
-- Replace 'DEMO_USER_ID' with the actual user ID from auth.users
DO $$
DECLARE
  demo_user_id uuid := 'e2b6a171-37ff-49f0-9c86-15935de79a5c'; -- Your demo user ID
  demo_band_id uuid;
  summer_tour_id uuid;
  studio_sessions_id uuid;
  acoustic_set_id uuid;
  practice_session_id uuid;
  track_id uuid;
  keyword_id uuid;
BEGIN
  -- Ensure profile exists
  INSERT INTO profiles (id, name, email)
  VALUES (demo_user_id, 'Alex Rivers', 'demo@coretet.app')
  ON CONFLICT (id) DO UPDATE SET name = 'Alex Rivers';

  -- Get or create the band
  SELECT id INTO demo_band_id
  FROM bands
  WHERE created_by = demo_user_id
  LIMIT 1;

  IF demo_band_id IS NULL THEN
    INSERT INTO bands (name, created_by, is_personal)
    VALUES ('The Midnight Drivers', demo_user_id, false)
    RETURNING id INTO demo_band_id;
  END IF;

  -- Add user as band member
  INSERT INTO band_members (band_id, user_id, role)
  VALUES (demo_band_id, demo_user_id, 'owner')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Band ID: %', demo_band_id;

  -- Create Set Lists (only if they don't exist)
  INSERT INTO set_lists (title, description, created_by, band_id, is_public)
  VALUES
    ('Summer Tour 2025', 'Main set for summer festivals', demo_user_id, demo_band_id, false),
    ('Studio Sessions - Album 3', 'Work in progress tracks for new album', demo_user_id, demo_band_id, false),
    ('Acoustic Set', 'Stripped down versions for intimate venues', demo_user_id, demo_band_id, false),
    ('Practice Session 12/20', 'Rehearsal recordings from last week', demo_user_id, demo_band_id, false)
  ON CONFLICT DO NOTHING;

  -- Get set list IDs
  SELECT id INTO summer_tour_id FROM set_lists WHERE title = 'Summer Tour 2025' AND created_by = demo_user_id;
  SELECT id INTO studio_sessions_id FROM set_lists WHERE title = 'Studio Sessions - Album 3' AND created_by = demo_user_id;
  SELECT id INTO acoustic_set_id FROM set_lists WHERE title = 'Acoustic Set' AND created_by = demo_user_id;
  SELECT id INTO practice_session_id FROM set_lists WHERE title = 'Practice Session 12/20' AND created_by = demo_user_id;

  -- Create keywords
  INSERT INTO keywords (name, band_id, created_by, color)
  VALUES
    ('upbeat', demo_band_id, demo_user_id, '#FF6B6B'),
    ('opener', demo_band_id, demo_user_id, '#4ECDC4'),
    ('energetic', demo_band_id, demo_user_id, '#FFE66D'),
    ('ballad', demo_band_id, demo_user_id, '#A8DADC'),
    ('crowd-favorite', demo_band_id, demo_user_id, '#F4A261'),
    ('synth', demo_band_id, demo_user_id, '#2A9D8F'),
    ('danceable', demo_band_id, demo_user_id, '#E76F51'),
    ('emotional', demo_band_id, demo_user_id, '#E9C46A'),
    ('bridge', demo_band_id, demo_user_id, '#F1FAEE'),
    ('closer', demo_band_id, demo_user_id, '#457B9D'),
    ('epic', demo_band_id, demo_user_id, '#1D3557'),
    ('wip', demo_band_id, demo_user_id, '#F77F00'),
    ('needs-vocals', demo_band_id, demo_user_id, '#D62828'),
    ('rough-mix', demo_band_id, demo_user_id, '#003049'),
    ('demo', demo_band_id, demo_user_id, '#FCBF49'),
    ('alternative-take', demo_band_id, demo_user_id, '#EAE2B7'),
    ('mastered', demo_band_id, demo_user_id, '#06D6A0'),
    ('ready', demo_band_id, demo_user_id, '#118AB2'),
    ('atmospheric', demo_band_id, demo_user_id, '#073B4C'),
    ('experimental', demo_band_id, demo_user_id, '#EF476F'),
    ('acoustic', demo_band_id, demo_user_id, '#FFD166'),
    ('stripped', demo_band_id, demo_user_id, '#06FFA5'),
    ('mellow', demo_band_id, demo_user_id, '#FFFCF2'),
    ('intimate', demo_band_id, demo_user_id, '#CCC5B9'),
    ('solo', demo_band_id, demo_user_id, '#403D39'),
    ('practice', demo_band_id, demo_user_id, '#EB5E28'),
    ('improv', demo_band_id, demo_user_id, '#CCC5B9'),
    ('sketch', demo_band_id, demo_user_id, '#252422'),
    ('work-in-progress', demo_band_id, demo_user_id, '#FFFCF2')
  ON CONFLICT DO NOTHING;

  -- Summer Tour 2025 Tracks
  INSERT INTO tracks (title, duration_seconds, created_by, band_id, file_url, file_size)
  VALUES
    ('Midnight Drive', 245, demo_user_id, demo_band_id, 'demo/midnight-drive.mp3', 3456789)
  ON CONFLICT DO NOTHING
  RETURNING id INTO track_id;

  IF track_id IS NOT NULL THEN
    INSERT INTO set_list_entries (set_list_id, track_id, position, added_by)
    VALUES (summer_tour_id, track_id, 0, demo_user_id) ON CONFLICT DO NOTHING;

    INSERT INTO track_keywords (track_id, keyword_id, added_by)
    SELECT track_id, id, demo_user_id FROM keywords WHERE name IN ('upbeat', 'opener', 'energetic') AND band_id = demo_band_id
    ON CONFLICT DO NOTHING;

    INSERT INTO track_ratings (track_id, user_id, rating)
    VALUES (track_id, demo_user_id, 'loved') ON CONFLICT DO NOTHING;

    INSERT INTO comments (track_id, user_id, content, timestamp_seconds, band_id)
    VALUES (track_id, demo_user_id, 'Love the guitar solo at this part! 🎸', 120, demo_band_id) ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO tracks (title, duration_seconds, created_by, band_id, file_url, file_size)
  VALUES ('Echoes of Tomorrow', 312, demo_user_id, demo_band_id, 'demo/echoes-of-tomorrow.mp3', 4567890)
  ON CONFLICT DO NOTHING RETURNING id INTO track_id;

  IF track_id IS NOT NULL THEN
    INSERT INTO set_list_entries (set_list_id, track_id, position, added_by)
    VALUES (summer_tour_id, track_id, 1, demo_user_id) ON CONFLICT DO NOTHING;
    INSERT INTO track_keywords (track_id, keyword_id, added_by)
    SELECT track_id, id, demo_user_id FROM keywords WHERE name IN ('ballad', 'crowd-favorite') AND band_id = demo_band_id
    ON CONFLICT DO NOTHING;
    INSERT INTO track_ratings (track_id, user_id, rating)
    VALUES (track_id, demo_user_id, 'liked') ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO tracks (title, duration_seconds, created_by, band_id, file_url, file_size)
  VALUES ('Neon Lights', 198, demo_user_id, demo_band_id, 'demo/neon-lights.mp3', 2789012)
  ON CONFLICT DO NOTHING RETURNING id INTO track_id;

  IF track_id IS NOT NULL THEN
    INSERT INTO set_list_entries (set_list_id, track_id, position, added_by)
    VALUES (summer_tour_id, track_id, 2, demo_user_id) ON CONFLICT DO NOTHING;
    INSERT INTO track_keywords (track_id, keyword_id, added_by)
    SELECT track_id, id, demo_user_id FROM keywords WHERE name IN ('synth', 'danceable') AND band_id = demo_band_id
    ON CONFLICT DO NOTHING;
    INSERT INTO comments (track_id, user_id, content, timestamp_seconds, band_id)
    VALUES (track_id, demo_user_id, 'Maybe we could add some reverb here?', 45, demo_band_id) ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO tracks (title, duration_seconds, created_by, band_id, file_url, file_size)
  VALUES ('Lost in the Moment', 267, demo_user_id, demo_band_id, 'demo/lost-in-the-moment.mp3', 3678901)
  ON CONFLICT DO NOTHING RETURNING id INTO track_id;

  IF track_id IS NOT NULL THEN
    INSERT INTO set_list_entries (set_list_id, track_id, position, added_by)
    VALUES (summer_tour_id, track_id, 3, demo_user_id) ON CONFLICT DO NOTHING;
    INSERT INTO track_keywords (track_id, keyword_id, added_by)
    SELECT track_id, id, demo_user_id FROM keywords WHERE name IN ('emotional', 'bridge') AND band_id = demo_band_id
    ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO tracks (title, duration_seconds, created_by, band_id, file_url, file_size)
  VALUES ('Final Hour', 289, demo_user_id, demo_band_id, 'demo/final-hour.mp3', 3890123)
  ON CONFLICT DO NOTHING RETURNING id INTO track_id;

  IF track_id IS NOT NULL THEN
    INSERT INTO set_list_entries (set_list_id, track_id, position, added_by)
    VALUES (summer_tour_id, track_id, 4, demo_user_id) ON CONFLICT DO NOTHING;
    INSERT INTO track_keywords (track_id, keyword_id, added_by)
    SELECT track_id, id, demo_user_id FROM keywords WHERE name IN ('closer', 'epic') AND band_id = demo_band_id
    ON CONFLICT DO NOTHING;
    INSERT INTO track_ratings (track_id, user_id, rating)
    VALUES (track_id, demo_user_id, 'loved') ON CONFLICT DO NOTHING;
    INSERT INTO comments (track_id, user_id, content, timestamp_seconds, band_id)
    VALUES
      (track_id, demo_user_id, 'Great energy! This will kill it live', 0, demo_band_id),
      (track_id, demo_user_id, 'Bridge transition is smooth 👍', 180, demo_band_id)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Studio Sessions Tracks
  INSERT INTO tracks (title, duration_seconds, created_by, band_id, file_url, file_size)
  VALUES ('Unfinished Symphony', 0, demo_user_id, demo_band_id, 'demo/unfinished-symphony.mp3', 1234567)
  ON CONFLICT DO NOTHING RETURNING id INTO track_id;

  IF track_id IS NOT NULL THEN
    INSERT INTO set_list_entries (set_list_id, track_id, position, added_by)
    VALUES (studio_sessions_id, track_id, 0, demo_user_id) ON CONFLICT DO NOTHING;
    INSERT INTO track_keywords (track_id, keyword_id, added_by)
    SELECT track_id, id, demo_user_id FROM keywords WHERE name IN ('wip', 'needs-vocals', 'rough-mix') AND band_id = demo_band_id
    ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO tracks (title, duration_seconds, created_by, band_id, file_url, file_size)
  VALUES ('Broken Promises (Demo)', 234, demo_user_id, demo_band_id, 'demo/broken-promises-demo.mp3', 3234567)
  ON CONFLICT DO NOTHING RETURNING id INTO track_id;

  IF track_id IS NOT NULL THEN
    INSERT INTO set_list_entries (set_list_id, track_id, position, added_by)
    VALUES (studio_sessions_id, track_id, 1, demo_user_id) ON CONFLICT DO NOTHING;
    INSERT INTO track_keywords (track_id, keyword_id, added_by)
    SELECT track_id, id, demo_user_id FROM keywords WHERE name IN ('demo', 'alternative-take') AND band_id = demo_band_id
    ON CONFLICT DO NOTHING;
    INSERT INTO comments (track_id, user_id, content, timestamp_seconds, band_id)
    VALUES (track_id, demo_user_id, 'Drums feel a bit too loud in the mix', 67, demo_band_id) ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO tracks (title, duration_seconds, created_by, band_id, file_url, file_size)
  VALUES ('Electric Dreams', 278, demo_user_id, demo_band_id, 'demo/electric-dreams.mp3', 3789012)
  ON CONFLICT DO NOTHING RETURNING id INTO track_id;

  IF track_id IS NOT NULL THEN
    INSERT INTO set_list_entries (set_list_id, track_id, position, added_by)
    VALUES (studio_sessions_id, track_id, 2, demo_user_id) ON CONFLICT DO NOTHING;
    INSERT INTO track_keywords (track_id, keyword_id, added_by)
    SELECT track_id, id, demo_user_id FROM keywords WHERE name IN ('mastered', 'ready') AND band_id = demo_band_id
    ON CONFLICT DO NOTHING;
    INSERT INTO track_ratings (track_id, user_id, rating)
    VALUES (track_id, demo_user_id, 'loved') ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO tracks (title, duration_seconds, created_by, band_id, file_url, file_size)
  VALUES ('Whispers in the Dark', 301, demo_user_id, demo_band_id, 'demo/whispers-in-the-dark.mp3', 4012345)
  ON CONFLICT DO NOTHING RETURNING id INTO track_id;

  IF track_id IS NOT NULL THEN
    INSERT INTO set_list_entries (set_list_id, track_id, position, added_by)
    VALUES (studio_sessions_id, track_id, 3, demo_user_id) ON CONFLICT DO NOTHING;
    INSERT INTO track_keywords (track_id, keyword_id, added_by)
    SELECT track_id, id, demo_user_id FROM keywords WHERE name IN ('atmospheric', 'experimental') AND band_id = demo_band_id
    ON CONFLICT DO NOTHING;
  END IF;

  -- Acoustic Set Tracks
  INSERT INTO tracks (title, duration_seconds, created_by, band_id, file_url, file_size)
  VALUES ('Midnight Drive (Acoustic)', 223, demo_user_id, demo_band_id, 'demo/midnight-drive-acoustic.mp3', 3123456)
  ON CONFLICT DO NOTHING RETURNING id INTO track_id;

  IF track_id IS NOT NULL THEN
    INSERT INTO set_list_entries (set_list_id, track_id, position, added_by)
    VALUES (acoustic_set_id, track_id, 0, demo_user_id) ON CONFLICT DO NOTHING;
    INSERT INTO track_keywords (track_id, keyword_id, added_by)
    SELECT track_id, id, demo_user_id FROM keywords WHERE name IN ('acoustic', 'stripped') AND band_id = demo_band_id
    ON CONFLICT DO NOTHING;
    INSERT INTO track_ratings (track_id, user_id, rating)
    VALUES (track_id, demo_user_id, 'liked') ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO tracks (title, duration_seconds, created_by, band_id, file_url, file_size)
  VALUES ('Coffee Shop Serenade', 189, demo_user_id, demo_band_id, 'demo/coffee-shop-serenade.mp3', 2678901)
  ON CONFLICT DO NOTHING RETURNING id INTO track_id;

  IF track_id IS NOT NULL THEN
    INSERT INTO set_list_entries (set_list_id, track_id, position, added_by)
    VALUES (acoustic_set_id, track_id, 1, demo_user_id) ON CONFLICT DO NOTHING;
    INSERT INTO track_keywords (track_id, keyword_id, added_by)
    SELECT track_id, id, demo_user_id FROM keywords WHERE name IN ('mellow', 'acoustic') AND band_id = demo_band_id
    ON CONFLICT DO NOTHING;
    INSERT INTO comments (track_id, user_id, content, timestamp_seconds, band_id)
    VALUES (track_id, demo_user_id, 'This chorus is perfect, don''t change anything', 90, demo_band_id) ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO tracks (title, duration_seconds, created_by, band_id, file_url, file_size)
  VALUES ('Unplugged Memories', 256, demo_user_id, demo_band_id, 'demo/unplugged-memories.mp3', 3456789)
  ON CONFLICT DO NOTHING RETURNING id INTO track_id;

  IF track_id IS NOT NULL THEN
    INSERT INTO set_list_entries (set_list_id, track_id, position, added_by)
    VALUES (acoustic_set_id, track_id, 2, demo_user_id) ON CONFLICT DO NOTHING;
    INSERT INTO track_keywords (track_id, keyword_id, added_by)
    SELECT track_id, id, demo_user_id FROM keywords WHERE name IN ('intimate', 'solo') AND band_id = demo_band_id
    ON CONFLICT DO NOTHING;
    INSERT INTO comments (track_id, user_id, content, timestamp_seconds, band_id)
    VALUES (track_id, demo_user_id, 'Vocal harmonies could be tighter', 156, demo_band_id) ON CONFLICT DO NOTHING;
  END IF;

  -- Practice Session Tracks
  INSERT INTO tracks (title, duration_seconds, created_by, band_id, file_url, file_size)
  VALUES ('Warmup Jam', 145, demo_user_id, demo_band_id, 'demo/warmup-jam.mp3', 2123456)
  ON CONFLICT DO NOTHING RETURNING id INTO track_id;

  IF track_id IS NOT NULL THEN
    INSERT INTO set_list_entries (set_list_id, track_id, position, added_by)
    VALUES (practice_session_id, track_id, 0, demo_user_id) ON CONFLICT DO NOTHING;
    INSERT INTO track_keywords (track_id, keyword_id, added_by)
    SELECT track_id, id, demo_user_id FROM keywords WHERE name IN ('practice', 'improv') AND band_id = demo_band_id
    ON CONFLICT DO NOTHING;
    INSERT INTO comments (track_id, user_id, content, timestamp_seconds, band_id)
    VALUES (track_id, demo_user_id, 'Bass line is groovy here', 34, demo_band_id) ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO tracks (title, duration_seconds, created_by, band_id, file_url, file_size)
  VALUES ('New Song Idea', 0, demo_user_id, demo_band_id, 'demo/new-song-idea.mp3', 1567890)
  ON CONFLICT DO NOTHING RETURNING id INTO track_id;

  IF track_id IS NOT NULL THEN
    INSERT INTO set_list_entries (set_list_id, track_id, position, added_by)
    VALUES (practice_session_id, track_id, 1, demo_user_id) ON CONFLICT DO NOTHING;
    INSERT INTO track_keywords (track_id, keyword_id, added_by)
    SELECT track_id, id, demo_user_id FROM keywords WHERE name IN ('sketch', 'work-in-progress') AND band_id = demo_band_id
    ON CONFLICT DO NOTHING;
  END IF;

  RAISE NOTICE '✅ Demo account setup complete!';
  RAISE NOTICE 'User ID: %', demo_user_id;
  RAISE NOTICE 'Band ID: %', demo_band_id;
  RAISE NOTICE 'Created 4 set lists with 14 tracks';
END $$;
