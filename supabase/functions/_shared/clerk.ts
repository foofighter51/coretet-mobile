/**
 * Shared Clerk authentication utilities for Supabase Edge Functions
 */

import { decode } from 'https://deno.land/std@0.168.0/encoding/base64.ts';

const clerkSecretKey = Deno.env.get('CLERK_SECRET_KEY');

if (!clerkSecretKey) {
  throw new Error('Missing CLERK_SECRET_KEY environment variable');
}

/**
 * Verify Clerk JWT token from request headers
 */
export async function verifyClerkSession(request: Request): Promise<{
  success: boolean;
  userId?: string;
  error?: string;
}> {
  try {
    // Get Clerk JWT token from custom header (not Authorization, which Supabase validates)
    const clerkToken = request.headers.get('x-clerk-token');

    console.log('Clerk token header:', clerkToken ? 'Present (length: ' + clerkToken.length + ')' : 'Missing');

    if (!clerkToken) {
      return {
        success: false,
        error: 'Missing x-clerk-token header',
      };
    }

    const token = clerkToken;
    console.log('Token received (length:', token.length, ')');
    console.log('Token preview:', token.substring(0, 30) + '...');

    // Decode JWT to extract user ID
    try {
      const parts = token.split('.');
      console.log('JWT parts:', parts.length);
      
      if (parts.length !== 3) {
        return {
          success: false,
          error: 'Invalid JWT format - expected 3 parts, got ' + parts.length,
        };
      }

      // Decode payload (second part of JWT)
      const payloadBase64 = parts[1];
      
      // Add padding if needed for base64 decoding
      const paddedPayload = payloadBase64 + '='.repeat((4 - payloadBase64.length % 4) % 4);
      
      const payloadJson = new TextDecoder().decode(decode(paddedPayload));
      console.log('Decoded payload:', payloadJson);
      
      const payload = JSON.parse(payloadJson);

      // Extract user ID from 'sub' claim
      const userId = payload.sub;
      console.log('Extracted user ID:', userId);

      if (!userId) {
        return {
          success: false,
          error: 'No user ID in token (sub claim missing)',
        };
      }

      // Verify token hasn't expired
      const exp = payload.exp;
      const now = Date.now() / 1000;
      
      console.log('Token expiry:', exp, 'Current time:', now, 'Expired:', exp < now);
      
      if (exp && exp < now) {
        return {
          success: false,
          error: 'Token expired',
        };
      }

      console.log('✅ Verified Clerk token for user:', userId);

      return {
        success: true,
        userId: userId,
      };
    } catch (decodeError) {
      console.error('Error decoding JWT:', decodeError);
      return {
        success: false,
        error: 'Failed to decode token: ' + (decodeError instanceof Error ? decodeError.message : 'Unknown error'),
      };
    }
  } catch (error) {
    console.error('Error verifying Clerk session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate deterministic UUID from Clerk user ID
 * Must match the client-side implementation
 */
export function generateSupabaseUUID(clerkUserId: string): string {
  // Use the same algorithm as client-side for consistency
  let hash = 0;
  for (let i = 0; i < clerkUserId.length; i++) {
    const char = clerkUserId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Convert to a valid UUID format (version 4 style)
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const uuid = `${hex.substring(0, 8)}-${hex.substring(0, 4)}-4${hex.substring(1, 4)}-a${hex.substring(2, 5)}-${clerkUserId.replace(/[^a-f0-9]/gi, '').substring(0, 12).padEnd(12, '0')}`;

  return uuid;
}

/**
 * CORS headers for Edge Functions
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-clerk-token',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};
