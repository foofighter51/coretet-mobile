/**
 * Edge Function: create-band
 * Creates a new band/ensemble with proper authorization
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { verifyClerkSession, generateSupabaseUUID, corsHeaders } from '../_shared/clerk.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY')!;

/**
 * Normalize phone number to E.164 format
 */
function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Add + prefix if not present
  if (!cleaned.startsWith('+')) {
    // Assume US number if no country code
    return cleaned.length === 10 ? `+1${cleaned}` : `+${cleaned}`;
  }

  return `+${cleaned}`;
}

/**
 * Generate cryptographically secure invite code
 */
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

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
    const supabaseUuid = generateSupabaseUUID(clerkUserId);

    // Get band data from request body
    const {
      name,
      description,
      authorizedPhones,
    } = await req.json();

    if (!name || !name.trim()) {
      return new Response(
        JSON.stringify({ error: 'Band name is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Creating band for user ${clerkUserId}`);

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify user profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', supabaseUuid)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'User profile not found. Please create profile first.' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate invite code
    const inviteCode = generateInviteCode();

    // Prepare ensemble data
    const ensembleData: any = {
      name: name.trim(),
      description: description?.trim() || null,
      invite_code: inviteCode,
      created_by: supabaseUuid,
    };

    // Add up to 4 authorized phone numbers
    if (authorizedPhones && Array.isArray(authorizedPhones)) {
      authorizedPhones.slice(0, 4).forEach((phone, index) => {
        if (phone && phone.trim()) {
          ensembleData[`authorized_phone_${index + 1}`] = normalizePhoneNumber(phone);
        }
      });
    }

    // Create ensemble
    const { data: ensemble, error: ensembleError } = await supabase
      .from('ensembles')
      .insert(ensembleData)
      .select()
      .single();

    if (ensembleError) {
      console.error('Error creating ensemble:', ensembleError);

      // Check for duplicate name
      if (ensembleError.message.includes('duplicate') || ensembleError.message.includes('unique')) {
        return new Response(
          JSON.stringify({ error: 'A band with this name already exists' }),
          {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({ error: `Failed to create band: ${ensembleError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Add creator as owner member
    const { error: memberError } = await supabase
      .from('ensemble_members')
      .insert({
        ensemble_id: ensemble.id,
        user_id: supabaseUuid,
        role: 'owner',
      });

    if (memberError) {
      console.error('Error adding creator as member:', memberError);
      // Don't fail the request, ensemble is created
    }

    console.log('Band created successfully:', ensemble.id);

    return new Response(
      JSON.stringify({
        success: true,
        band: ensemble,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});