/**
 * Test script to call the create-profile Edge Function
 * Run with: node scripts/test-edge-function.js
 */

const SUPABASE_URL = "https://tvvztlizyciaafqkigwe.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2dnp0bGl6eWNpYWFmcWtpZ3dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MjM2MzcsImV4cCI6MjA3NDQ5OTYzN30.fagEaJdGnM2EGGr5MlXtYrak_KPNt_y6BJhczgo8Eeo";

// Mock Clerk JWT token (just for testing structure)
const MOCK_CLERK_TOKEN = "eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDIyMkFBQSIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzMzT2RRMEhtYWdLVEJVdlRHc0pTSVROcG0waCIsImV4cCI6OTk5OTk5OTk5OX0.test";

async function testEdgeFunction() {
  console.log('🧪 Testing create-profile Edge Function...\n');

  const url = `${SUPABASE_URL}/functions/v1/create-profile`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MOCK_CLERK_TOKEN}`,
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Test User',
      phone_number: '+1234567890',
    }),
  });

  console.log('Status:', response.status, response.statusText);
  console.log('Headers:', Object.fromEntries(response.headers.entries()));

  const text = await response.text();
  console.log('\nResponse body:');
  console.log(text);

  if (response.ok) {
    console.log('\n✅ Success!');
  } else {
    console.log('\n❌ Failed');
  }
}

testEdgeFunction().catch(console.error);