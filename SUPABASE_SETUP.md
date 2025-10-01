# CoreTet Supabase Setup Guide

## 🚀 Quick Setup Checklist

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose organization (or create one)
4. Project details:
   - **Name**: `coretet-music-collaboration`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
5. Wait 2-3 minutes for project creation

### 2. Database Schema Setup

Copy and paste this SQL in **SQL Editor** → **New Query**:

```sql
-- CoreTet Database Schema
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  phone_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensembles (bands/groups) table
CREATE TABLE ensembles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  invite_code TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(6), 'base64'),
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensemble members table
CREATE TABLE ensemble_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ensemble_id UUID REFERENCES ensembles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ensemble_id, user_id)
);

-- Songs table (containers for versions)
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  ensemble_id UUID REFERENCES ensembles(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Version types enum
CREATE TYPE version_type AS ENUM (
  'voice_memo',
  'rough_demo',
  'rehearsal',
  'working_mix',
  'final',
  'live',
  'other'
);

-- Versions table (individual audio files)
CREATE TABLE versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  duration_seconds INTEGER,
  version_type version_type DEFAULT 'other',
  uploaded_by UUID REFERENCES profiles(id) NOT NULL,
  recording_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Playlists table
CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  ensemble_id UUID REFERENCES ensembles(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  is_public BOOLEAN DEFAULT false,
  share_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(8), 'base64'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Playlist items table
CREATE TABLE playlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE NOT NULL,
  version_id UUID REFERENCES versions(id) ON DELETE CASCADE NOT NULL,
  position INTEGER NOT NULL,
  added_by UUID REFERENCES profiles(id) NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(playlist_id, version_id)
);

-- Rating types enum
CREATE TYPE rating_type AS ENUM ('listened', 'like', 'love');

-- Ratings table
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version_id UUID REFERENCES versions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  rating rating_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(version_id, user_id, playlist_id)
);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version_id UUID REFERENCES versions(id) ON DELETE CASCADE NOT NULL,
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  timestamp_seconds INTEGER, -- Position in audio for timestamped comments
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SMS verification sessions table
CREATE TABLE sms_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number TEXT NOT NULL,
  verification_code TEXT NOT NULL,
  playlist_id UUID REFERENCES playlists(id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File uploads tracking table
CREATE TABLE file_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  upload_status TEXT DEFAULT 'pending' CHECK (upload_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ensembles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ensemble_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Ensembles policies
CREATE POLICY "Users can view ensembles they're members of" ON ensembles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ensemble_members
      WHERE ensemble_id = ensembles.id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create ensembles" ON ensembles
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Ensemble owners can update their ensembles" ON ensembles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM ensemble_members
      WHERE ensemble_id = ensembles.id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Ensemble members policies
CREATE POLICY "Users can view ensemble memberships" ON ensemble_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM ensemble_members em
      WHERE em.ensemble_id = ensemble_members.ensemble_id
      AND em.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join ensembles" ON ensemble_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Songs policies
CREATE POLICY "Ensemble members can view songs" ON songs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ensemble_members
      WHERE ensemble_id = songs.ensemble_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Ensemble members can create songs" ON songs
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM ensemble_members
      WHERE ensemble_id = songs.ensemble_id
      AND user_id = auth.uid()
    )
  );

-- Versions policies
CREATE POLICY "Users can view versions in their ensembles" ON versions
  FOR SELECT USING (
    song_id IS NULL OR
    EXISTS (
      SELECT 1 FROM songs s
      JOIN ensemble_members em ON s.ensemble_id = em.ensemble_id
      WHERE s.id = versions.song_id
      AND em.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create versions" ON versions
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

-- Playlists policies
CREATE POLICY "Users can view accessible playlists" ON playlists
  FOR SELECT USING (
    is_public = true OR
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM ensemble_members
      WHERE ensemble_id = playlists.ensemble_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create playlists" ON playlists
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Playlist items policies
CREATE POLICY "Users can view playlist items for accessible playlists" ON playlist_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM playlists p
      WHERE p.id = playlist_items.playlist_id
      AND (
        p.is_public = true OR
        p.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM ensemble_members
          WHERE ensemble_id = p.ensemble_id
          AND user_id = auth.uid()
        )
      )
    )
  );

-- Ratings policies
CREATE POLICY "Users can view ratings" ON ratings
  FOR SELECT USING (true); -- Public ratings for social features

CREATE POLICY "Users can manage own ratings" ON ratings
  FOR ALL USING (user_id = auth.uid());

-- Comments policies
CREATE POLICY "Users can view comments on accessible content" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM versions v
      LEFT JOIN songs s ON v.song_id = s.id
      LEFT JOIN ensemble_members em ON s.ensemble_id = em.ensemble_id
      WHERE v.id = comments.version_id
      AND (s.id IS NULL OR em.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- File uploads policies
CREATE POLICY "Users can view own file uploads" ON file_uploads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create file uploads" ON file_uploads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions for common operations
CREATE OR REPLACE FUNCTION get_ensemble_member_count(ensemble_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM ensemble_members
    WHERE ensemble_id = ensemble_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_version_rating_counts(version_uuid UUID)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'listened', COUNT(*) FILTER (WHERE rating = 'listened'),
      'like', COUNT(*) FILTER (WHERE rating = 'like'),
      'love', COUNT(*) FILTER (WHERE rating = 'love')
    )
    FROM ratings
    WHERE version_id = version_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes for performance
CREATE INDEX idx_ensemble_members_ensemble_id ON ensemble_members(ensemble_id);
CREATE INDEX idx_ensemble_members_user_id ON ensemble_members(user_id);
CREATE INDEX idx_songs_ensemble_id ON songs(ensemble_id);
CREATE INDEX idx_versions_song_id ON versions(song_id);
CREATE INDEX idx_versions_uploaded_by ON versions(uploaded_by);
CREATE INDEX idx_playlist_items_playlist_id ON playlist_items(playlist_id);
CREATE INDEX idx_playlist_items_version_id ON playlist_items(version_id);
CREATE INDEX idx_ratings_version_id ON ratings(version_id);
CREATE INDEX idx_ratings_user_id ON ratings(user_id);
CREATE INDEX idx_comments_version_id ON comments(version_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ensembles_updated_at BEFORE UPDATE ON ensembles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_songs_updated_at BEFORE UPDATE ON songs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_versions_updated_at BEFORE UPDATE ON versions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON playlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ratings_updated_at BEFORE UPDATE ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3. Storage Setup

1. Go to **Storage** in Supabase dashboard
2. Create a new bucket:
   - **Name**: `audio-files`
   - **Public**: ✅ Enabled
   - **File size limit**: 100MB
   - **Allowed MIME types**: `audio/*`

3. Set bucket policies (in Storage → audio-files → Policies → "New policy"):

   **Policy 1: Allow authenticated users to upload audio files**
   - **Policy name**: `Authenticated users can upload audio files`
   - **Allowed operation**: ✅ INSERT
   - **Target roles**: `authenticated`
   - **Policy definition**: `bucket_id = 'audio-files'`

   **Policy 2: Allow public access to audio files**
   - **Policy name**: `Public access to audio files`
   - **Allowed operation**: ✅ SELECT
   - **Target roles**: `public` (or leave default)
   - **Policy definition**: `bucket_id = 'audio-files'`

   **Policy 3: Allow users to delete their own files**
   - **Policy name**: `Users can delete their own audio files`
   - **Allowed operation**: ✅ DELETE
   - **Target roles**: `authenticated`
   - **Policy definition**:
   ```sql
   y
   ```

   Click "Review" then "Save policy" for each one.

### 4. Authentication Setup

1. Go to **Authentication** → **Settings** → **Auth Providers**
2. **Enable Phone authentication**:
   - ✅ Enable phone signups
   - ✅ Enable phone confirmations
   - Set message template (optional)

3. **Twilio Integration** (for SMS):
   - Get Twilio Account SID and Auth Token
   - Go to **Authentication** → **Settings** → **SMS Auth**
   - Add Twilio credentials

### 5. Environment Variables

Update your `.env.local` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Twilio SMS Configuration (optional)
VITE_TWILIO_ACCOUNT_SID=your-twilio-account-sid
VITE_TWILIO_AUTH_TOKEN=your-twilio-auth-token
VITE_TWILIO_PHONE_NUMBER=+1234567890
```

**Where to find these values:**
- Go to **Settings** → **API** in your Supabase dashboard
- Copy:
  - **Project URL** → `VITE_SUPABASE_URL`
  - **Project API Keys** → `anon public` → `VITE_SUPABASE_ANON_KEY`
  - **Project API Keys** → `service_role` → `VITE_SUPABASE_SERVICE_ROLE_KEY` ⚠️ Keep this secret!

### 6. Real-time Subscriptions

Enable real-time for collaborative features:

1. Go to **Database** → **Replication**
2. Enable real-time for these tables:
   - ✅ `comments` (for live commenting)
   - ✅ `ratings` (for live reactions)
   - ✅ `versions` (for new uploads)
   - ✅ `ensemble_members` (for member activities)

### 7. Test the Connection

Run this test in your browser console after setup:

```javascript
// Test Supabase connection
import { supabase } from './lib/supabase';

// Test database connection
const testConnection = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('count', { count: 'exact' });

  if (error) {
    console.error('❌ Connection failed:', error);
  } else {
    console.log('✅ Connected! Profile count:', data);
  }
};

testConnection();
```

## 🔐 Security Features

- **Row Level Security (RLS)**: Users only see their own data and shared content
- **Phone Authentication**: SMS-based secure login
- **Ensemble Isolation**: Strict access control per band/group
- **File Upload Validation**: Size limits and MIME type restrictions
- **Audit Trails**: All actions timestamped with user attribution

## 📊 Key Features Enabled

### Audio Collaboration
- ✅ **Multi-version tracking** per song
- ✅ **Timestamped comments** on audio
- ✅ **Rating system** (listened/like/love)
- ✅ **File compression** tracking
- ✅ **Upload progress** monitoring

### Team Management
- ✅ **Ensemble creation** with invite codes
- ✅ **Role-based permissions** (owner/admin/member)
- ✅ **Phone-based invites** via SMS
- ✅ **Member activity** tracking

### Playlist Features
- ✅ **Shared playlists** within ensembles
- ✅ **Public playlists** with share codes
- ✅ **Ordered track lists** with position management
- ✅ **Cross-ensemble** playlist sharing

## 🚀 Production Deployment

### Security Checklist
- [ ] RLS policies tested and verified
- [ ] Service role key secured (never exposed to client)
- [ ] CORS configured properly
- [ ] File upload size limits enforced (100MB)
- [ ] Rate limiting configured in Supabase dashboard
- [ ] Backup strategy implemented

### Performance Optimization
- [ ] Database indexes verified (already included in schema)
- [ ] CDN configured for audio files
- [ ] Connection pooling enabled (automatic in Supabase)
- [ ] Monitoring and alerts set up

## 📞 Support & Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth with Phone](https://supabase.com/docs/guides/auth/phone-login)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)

---

**Next Steps After Setup:**
1. Update environment variables
2. Restart development server
3. Test audio upload functionality
4. Set up phone authentication
5. Create first ensemble and test collaboration features

🎵 **Your CoreTet backend is now ready for music collaboration!**