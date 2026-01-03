/**
 * Seed script to create a demo account with sample data for screenshots
 *
 * Creates:
 * - Demo user account
 * - Multiple set lists with descriptive names
 * - Multiple tracks in each set list
 * - Ratings (Like/Love)
 * - Timestamped comments
 * - Keywords on tracks
 *
 * Usage:
 *   npx tsx scripts/seed-demo-account.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tvvztlizyciaafqkigwe.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Demo account credentials
const DEMO_EMAIL = 'demo@coretet.app';
const DEMO_PASSWORD = 'demo123456';
const DEMO_NAME = 'Alex Rivers';

// Sample set lists
const SET_LISTS = [
  {
    name: 'Summer Tour 2025',
    description: 'Main set for summer festivals',
    tracks: [
      { title: 'Midnight Drive', duration: 245, keywords: ['upbeat', 'opener', 'energetic'] },
      { title: 'Echoes of Tomorrow', duration: 312, keywords: ['ballad', 'crowd-favorite'] },
      { title: 'Neon Lights', duration: 198, keywords: ['synth', 'danceable'] },
      { title: 'Lost in the Moment', duration: 267, keywords: ['emotional', 'bridge'] },
      { title: 'Final Hour', duration: 289, keywords: ['closer', 'epic'] },
    ]
  },
  {
    name: 'Studio Sessions - Album 3',
    description: 'Work in progress tracks for new album',
    tracks: [
      { title: 'Unfinished Symphony', duration: 0, keywords: ['wip', 'needs-vocals', 'rough-mix'] },
      { title: 'Broken Promises (Demo)', duration: 234, keywords: ['demo', 'alternative-take'] },
      { title: 'Electric Dreams', duration: 278, keywords: ['mastered', 'ready'] },
      { title: 'Whispers in the Dark', duration: 301, keywords: ['atmospheric', 'experimental'] },
    ]
  },
  {
    name: 'Acoustic Set',
    description: 'Stripped down versions for intimate venues',
    tracks: [
      { title: 'Midnight Drive (Acoustic)', duration: 223, keywords: ['acoustic', 'stripped'] },
      { title: 'Coffee Shop Serenade', duration: 189, keywords: ['mellow', 'acoustic'] },
      { title: 'Unplugged Memories', duration: 256, keywords: ['intimate', 'solo'] },
    ]
  },
  {
    name: 'Practice Session 12/20',
    description: 'Rehearsal recordings from last week',
    tracks: [
      { title: 'Warmup Jam', duration: 145, keywords: ['practice', 'improv'] },
      { title: 'New Song Idea', duration: 0, keywords: ['sketch', 'work-in-progress'] },
    ]
  },
];

// Sample comments (will be added to various tracks)
const SAMPLE_COMMENTS = [
  { text: 'Love the guitar solo at this part! 🎸', timestamp: 120 },
  { text: 'Maybe we could add some reverb here?', timestamp: 45 },
  { text: 'This chorus is perfect, don\'t change anything', timestamp: 90 },
  { text: 'Drums feel a bit too loud in the mix', timestamp: 67 },
  { text: 'Great energy! This will kill it live', timestamp: 0 },
  { text: 'Vocal harmonies could be tighter', timestamp: 156 },
  { text: 'Bridge transition is smooth 👍', timestamp: 180 },
  { text: 'Bass line is groovy here', timestamp: 34 },
];

async function createDemoUser() {
  console.log('🔐 Creating demo user account...');

  // Check if demo user already exists
  const { data: existingUser } = await supabase.auth.admin.listUsers();
  const demoUser = existingUser?.users?.find(u => u.email === DEMO_EMAIL);

  let userId: string;
  let isNewUser = false;

  if (demoUser) {
    console.log('✅ Demo user already exists:', DEMO_EMAIL);
    userId = demoUser.id;
  } else {
    // Create new demo user
    const { data, error } = await supabase.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: DEMO_NAME
      }
    });

    if (error) {
      console.error('❌ Error creating demo user:', error);
      throw error;
    }

    console.log('✅ Demo user created:', DEMO_EMAIL);
    userId = data.user.id;
    isNewUser = true;

    // Wait a moment for profile trigger to create profile
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Ensure profile exists (whether user is new or existing)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!profile) {
    // Create profile if it doesn't exist
    console.log('📝 Creating profile for user...');
    await supabase
      .from('profiles')
      .insert({
        id: userId,
        name: DEMO_NAME,
        email: DEMO_EMAIL
      });
    console.log('✅ Profile created for:', DEMO_NAME);
  } else {
    // Update existing profile name
    await supabase
      .from('profiles')
      .update({ name: DEMO_NAME })
      .eq('id', userId);
    console.log('✅ Profile updated for:', DEMO_NAME);
  }

  return { id: userId, email: DEMO_EMAIL };
}

async function createBandForUser(userId: string) {
  console.log('🎸 Creating demo band...');

  // Check if user already has a band
  const { data: existingBands } = await supabase
    .from('bands')
    .select('*')
    .eq('created_by', userId)
    .limit(1);

  if (existingBands && existingBands.length > 0) {
    console.log('✅ Using existing band:', existingBands[0].name);
    return existingBands[0];
  }

  // Create new band
  const { data: band, error } = await supabase
    .from('bands')
    .insert({
      name: 'The Midnight Drivers',
      created_by: userId,
      is_personal: false
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating band:', error);
    throw error;
  }

  console.log('✅ Band created:', band.name);

  // Add user as band member (owner)
  const { error: memberError } = await supabase
    .from('band_members')
    .insert({
      band_id: band.id,
      user_id: userId,
      role: 'owner'
    });

  if (memberError) {
    console.error('❌ Error adding user to band:', memberError);
  } else {
    console.log('✅ User added to band as owner');
  }

  return band;
}

async function createSetListsWithTracks(userId: string, bandId: string) {
  console.log('📋 Creating set lists and tracks...');

  for (const setList of SET_LISTS) {
    // Create set list
    const { data: createdSetList, error: setListError } = await supabase
      .from('set_lists')
      .insert({
        title: setList.name,
        description: setList.description,
        created_by: userId,
        band_id: bandId,
        is_public: false
      })
      .select()
      .single();

    if (setListError) {
      console.error(`❌ Error creating set list "${setList.name}":`, setListError);
      continue;
    }

    console.log(`  ✅ Set list: ${setList.name}`);

    // Create tracks for this set list
    for (let i = 0; i < setList.tracks.length; i++) {
      const track = setList.tracks[i];

      // Create track
      const { data: createdTrack, error: trackError } = await supabase
        .from('tracks')
        .insert({
          title: track.title,
          duration_seconds: track.duration,
          created_by: userId,
          band_id: bandId,
          file_url: `demo/${userId}/${track.title.toLowerCase().replace(/\s+/g, '-')}.mp3`,
          file_size: Math.floor(Math.random() * 5000000) + 2000000, // Random file size 2-7MB
        })
        .select()
        .single();

      if (trackError) {
        console.error(`    ❌ Error creating track "${track.title}":`, trackError);
        continue;
      }

      // Add track to set list
      const { error: entryError } = await supabase
        .from('set_list_entries')
        .insert({
          set_list_id: createdSetList.id,
          track_id: createdTrack.id,
          position: i,
          added_by: userId
        });

      if (entryError) {
        console.error(`    ❌ Error adding track to set list:`, entryError);
      }

      // Add keywords
      for (const keywordName of track.keywords) {
        // First, create or get the keyword
        const { data: existingKeyword } = await supabase
          .from('keywords')
          .select('*')
          .eq('name', keywordName)
          .eq('band_id', bandId)
          .single();

        let keywordId: string;

        if (existingKeyword) {
          keywordId = existingKeyword.id;
        } else {
          const { data: newKeyword, error: keywordError } = await supabase
            .from('keywords')
            .insert({
              name: keywordName,
              band_id: bandId,
              created_by: userId
            })
            .select()
            .single();

          if (keywordError || !newKeyword) {
            console.error(`    ❌ Error creating keyword "${keywordName}":`, keywordError);
            continue;
          }

          keywordId = newKeyword.id;
        }

        // Link keyword to track
        await supabase
          .from('track_keywords')
          .insert({
            track_id: createdTrack.id,
            keyword_id: keywordId,
            added_by: userId
          });
      }

      // Randomly add ratings (Like or Love)
      const shouldRate = Math.random() > 0.3; // 70% chance of rating
      if (shouldRate) {
        const rating = Math.random() > 0.5 ? 'loved' : 'liked';
        await supabase
          .from('track_ratings')
          .insert({
            track_id: createdTrack.id,
            user_id: userId,
            rating: rating
          });
      }

      // Randomly add 1-3 comments to some tracks
      const shouldComment = Math.random() > 0.5; // 50% chance of having comments
      if (shouldComment) {
        const numComments = Math.floor(Math.random() * 3) + 1;
        for (let c = 0; c < numComments; c++) {
          const randomComment = SAMPLE_COMMENTS[Math.floor(Math.random() * SAMPLE_COMMENTS.length)];
          await supabase
            .from('comments')
            .insert({
              track_id: createdTrack.id,
              user_id: userId,
              content: randomComment.text,
              timestamp_seconds: randomComment.timestamp,
              band_id: bandId
            });
        }
      }

      console.log(`    ✅ Track: ${track.title} (${track.keywords.length} keywords)`);
    }
  }
}

async function main() {
  console.log('🚀 Starting demo account seed script...\n');

  try {
    // Step 1: Create demo user
    const user = await createDemoUser();

    // Step 2: Create band
    const band = await createBandForUser(user.id);

    // Step 3: Create set lists with tracks, ratings, comments, keywords
    await createSetListsWithTracks(user.id, band.id);

    console.log('\n✅ Demo account setup complete!');
    console.log('\n📧 Login credentials:');
    console.log(`   Email: ${DEMO_EMAIL}`);
    console.log(`   Password: ${DEMO_PASSWORD}`);
    console.log('\n📊 Created:');
    console.log(`   - ${SET_LISTS.length} set lists`);
    console.log(`   - ${SET_LISTS.reduce((sum, sl) => sum + sl.tracks.length, 0)} tracks`);
    console.log(`   - Multiple ratings, comments, and keywords`);
    console.log('\n🎨 Ready for screenshots!');

  } catch (error) {
    console.error('\n❌ Error during seed:', error);
    process.exit(1);
  }
}

main();
