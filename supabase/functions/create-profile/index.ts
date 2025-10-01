/**
 * Edge Function: create-profile
 * Creates or updates user profile in Supabase after Clerk authentication
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { verifyClerkSession, generateSupabaseUUID, corsHeaders } from '../_shared/clerk.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify Clerk session
    const verification = await verifyClerkSession(req);

    if (!verification.success) {
      return new Response(
        JSON.stringify({ error: verification.error }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const clerkUserId = verification.userId!;

    // Get profile data from request body
    const { name, phone_number } = await req.json();

    if (!name) {
      return new Response(
        JSON.stringify({ error: 'Name is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate Supabase UUID from Clerk user ID
    const supabaseUuid = generateSupabaseUUID(clerkUserId);

    console.log(`Creating/updating profile for Clerk user ${clerkUserId} -> Supabase UUID ${supabaseUuid}`);

    // Create Supabase client with service role (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if profile already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id, name, phone_number')
      .eq('id', supabaseUuid)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is fine for new users
      console.error('Error fetching existing profile:', fetchError);
      return new Response(
        JSON.stringify({ error: `Failed to check existing profile: ${fetchError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const profileData = {
      id: supabaseUuid,
      name: name,
      phone_number: phone_number || 'no-phone',
      updated_at: new Date().toISOString(),
    };

    let result;

    if (existingProfile) {
      // Update existing profile
      console.log('Updating existing profile');
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          phone_number: profileData.phone_number,
          updated_at: profileData.updated_at,
        })
        .eq('id', supabaseUuid)
        .select()
        .single();

      result = { data, error };
    } else {
      // Create new profile
      console.log('Creating new profile');
      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      result = { data, error };
    }

    if (result.error) {
      console.error('Failed to sync user profile:', result.error);
      return new Response(
        JSON.stringify({ error: result.error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Profile synced successfully');
    return new Response(
      JSON.stringify({
        success: true,
        profile: result.data,
        supabaseUserId: supabaseUuid,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';

    console.error('Error message:', errorMessage);
    console.error('Error stack:', errorStack);

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        stack: errorStack,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});