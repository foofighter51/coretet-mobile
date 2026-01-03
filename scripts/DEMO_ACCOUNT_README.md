# Demo Account for Screenshots

## Quick Start

Run this script to create a fully populated demo account perfect for screenshots:

```bash
# Set your Supabase service role key (get from Supabase dashboard)
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# Run the seed script
npx tsx scripts/seed-demo-account.ts
```

## What Gets Created

### User Account
- **Email:** `demo@coretet.app`
- **Password:** `demo123456`
- **Name:** Alex Rivers

### Band
- **Name:** The Midnight Drivers

### Set Lists (4 total)

1. **Summer Tour 2025** - Main set for summer festivals
   - 5 tracks (Midnight Drive, Echoes of Tomorrow, Neon Lights, etc.)
   - Keywords: upbeat, opener, ballad, synth, etc.
   - Mix of ratings and comments

2. **Studio Sessions - Album 3** - Work in progress tracks
   - 4 tracks (includes demos and WIP)
   - Keywords: wip, needs-vocals, mastered, etc.
   - Realistic studio workflow

3. **Acoustic Set** - Stripped down versions
   - 3 tracks (acoustic arrangements)
   - Keywords: acoustic, mellow, intimate

4. **Practice Session 12/20** - Rehearsal recordings
   - 2 tracks (warmup, sketches)
   - Keywords: practice, improv, work-in-progress

### Sample Data Includes

- ✅ **14 total tracks** across all set lists
- ✅ **Ratings:** Mix of "Liked" and "Loved" tracks
- ✅ **Comments:** Timestamped feedback like:
  - "Love the guitar solo at this part! 🎸"
  - "Maybe we could add some reverb here?"
  - "This chorus is perfect, don't change anything"
  - And more realistic band feedback
- ✅ **Keywords:** Descriptive tags like:
  - Genre tags: acoustic, synth, atmospheric
  - Status: wip, demo, mastered, ready
  - Usage: opener, closer, crowd-favorite
  - Mood: upbeat, mellow, energetic, emotional

## After Running

1. Sign in to the app:
   - Email: `demo@coretet.app`
   - Password: `demo123456`

2. You'll see:
   - 4 set lists in the main view
   - Each set list populated with tracks
   - Tracks with various ratings (hearts/stars)
   - Comments on several tracks
   - Keywords visible on track details

3. Perfect for taking screenshots of:
   - Set list overview
   - Track detail with comments
   - Ratings visualization
   - Keywords in action
   - Overall app usage

## Cleaning Up

To delete the demo account and start fresh:

```bash
# Delete from Supabase dashboard:
# 1. Go to Authentication → Users
# 2. Find demo@coretet.app
# 3. Click "..." → Delete user
# 4. Cascade deletes will remove all related data
```

Or run the script again - it checks if the account exists and reuses it.

## Notes

- The script uses the Supabase service role key to bypass RLS policies
- All data is fake but realistic
- Track files are NOT actually uploaded (just metadata)
- Ready for screenshots immediately after running
