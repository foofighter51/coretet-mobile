# CoreTet Backend Setup Guide

## 🚀 Quick Setup (5 minutes)

### 1. Supabase Project Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a name like "coretet-music" and set a secure password
3. Wait for the project to be created (2-3 minutes)

### 2. Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `database/schema.sql`
3. Paste and run the SQL to create all tables and policies

### 3. Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. Create a new bucket called `audio-files`
3. Set it to **Public** for easier file access
4. Configure CORS settings for file uploads

### 4. Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase credentials from **Settings > API**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

### 5. Install Dependencies

```bash
npm install @supabase/supabase-js uuid
npm install --save-dev @types/uuid
```

### 6. Test Connection

Create a simple test file:

```typescript
// test-connection.ts
import { supabase } from './lib/supabase';

async function testConnection() {
  const { data, error } = await supabase
    .from('profiles')
    .select('count', { count: 'exact' });

  if (error) {
    console.error('Connection failed:', error);
  } else {
    console.log('✅ Connected! Profile count:', data);
  }
}

testConnection();
```

## 📱 SMS Authentication Setup (Optional)

### Twilio Configuration

1. Create account at [twilio.com](https://twilio.com)
2. Get phone number and credentials
3. Add to `.env.local`:
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

4. Configure Supabase Auth:
   - Go to **Authentication > Settings**
   - Enable **Phone** provider
   - Add Twilio credentials

## 💾 File Storage Setup

### Option 1: Supabase Storage (Recommended for MVP)

Already configured! Just use the `audio-files` bucket.

### Option 2: Backblaze B2 (Production)

1. Create account at [backblaze.com](https://backblaze.com)
2. Create B2 bucket
3. Get application keys
4. Add to `.env.local`:
   ```env
   B2_APPLICATION_KEY_ID=your_key_id
   B2_APPLICATION_KEY=your_application_key
   B2_BUCKET_NAME=your_bucket_name
   B2_ENDPOINT=your_endpoint_url
   ```

## 🔧 Development Workflow

### 1. Start Development Server

```bash
npm run dev
```

### 2. Database Migrations

When you update the schema:

1. Edit `database/schema.sql`
2. Run the updated SQL in Supabase SQL Editor
3. Update `lib/database.types.ts` if needed

### 3. Auth Flow Testing

```typescript
// Test auth in browser console
import { auth } from './lib/supabase';

// Test phone auth
await auth.signUpWithPhone('+1234567890');

// Test OTP verification
await auth.verifyOtp('+1234567890', '123456');
```

## 📊 Database Overview

### Core Tables

- **profiles**: User information (name, phone, avatar)
- **ensembles**: Bands/groups
- **versions**: Individual audio files
- **songs**: Containers for multiple versions
- **playlists**: Track collections
- **ratings**: Like/love system
- **comments**: Timestamped feedback

### Key Features

- **Row Level Security**: Users only see their data + shared content
- **Phone Authentication**: SMS-based login for collaborators
- **Version Management**: Multiple versions per song
- **Playlist Sharing**: Public/private playlists with share codes

## 🧪 Testing

### Manual Testing Checklist

1. **Authentication**:
   - [ ] Phone number signup
   - [ ] OTP verification
   - [ ] Profile creation

2. **File Upload**:
   - [ ] Audio file validation
   - [ ] Upload progress tracking
   - [ ] Metadata extraction

3. **Collaboration**:
   - [ ] Create ensemble
   - [ ] Invite members
   - [ ] Share playlists

4. **Playback**:
   - [ ] Audio streaming
   - [ ] Rating system
   - [ ] Comment system

### Example Test Data

```sql
-- Insert test ensemble
INSERT INTO ensembles (name, description, created_by)
VALUES ('Test Band', 'Demo ensemble for testing', 'user-id-here');

-- Insert test version
INSERT INTO versions (title, file_url, uploaded_by, duration_seconds)
VALUES ('Test Track', 'https://example.com/test.mp3', 'user-id-here', 180);
```

## 🚀 Production Deployment

### Supabase Production

1. Upgrade to Pro plan for production usage
2. Configure custom domain
3. Set up backups
4. Monitor usage and performance

### Security Checklist

- [ ] RLS policies tested and verified
- [ ] Service role key secured
- [ ] CORS configured properly
- [ ] File upload size limits enforced
- [ ] Rate limiting configured

### Performance Optimization

- [ ] Database indexes verified
- [ ] File CDN configured
- [ ] Audio compression optimized
- [ ] Caching strategy implemented

## 📞 Support

### Common Issues

**Connection Errors**: Check Supabase URL and keys
**Auth Issues**: Verify phone provider settings
**Upload Failures**: Check bucket permissions and CORS
**RLS Errors**: Review row-level security policies

### Helpful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Twilio SMS Docs](https://www.twilio.com/docs/sms)
- [Backblaze B2 API](https://www.backblaze.com/b2/docs/)

---

**Ready to build!** 🎵 Your CoreTet backend is now configured for music collaboration.