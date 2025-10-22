// Edge Function: notify-admin
// Sends notifications to CoreTet admin for important events
// Triggered by database webhooks or direct calls

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'ericexley@gmail.com';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface NotificationPayload {
  type: 'user_signup' | 'usage_threshold' | 'error_alert';
  data: Record<string, any>;
}

async function sendEmail(subject: string, html: string): Promise<void> {
  if (!RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not configured');
    throw new Error('Email service not configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'CoreTet Notifications <notifications@coretet.app>',
      to: [ADMIN_EMAIL],
      subject: subject,
      html: html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ Resend API error:', error);
    throw new Error(`Failed to send email: ${error}`);
  }

  const data = await response.json();
  console.log('✅ Email sent:', data);
}

function formatUserSignupEmail(data: any): { subject: string; html: string } {
  const { email, name, created_at, id } = data;

  return {
    subject: `🎉 New User Signup: ${email}`,
    html: `
      <h2>New User Signed Up!</h2>
      <p>A new user has joined CoreTet:</p>
      <ul>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Name:</strong> ${name || 'Not set'}</li>
        <li><strong>User ID:</strong> ${id}</li>
        <li><strong>Signed up:</strong> ${new Date(created_at).toLocaleString()}</li>
      </ul>
      <p><a href="https://supabase.com/dashboard/project/tvvztlizyciaafqkigwe/auth/users">View in Supabase Dashboard</a></p>
    `,
  };
}

async function getUsageStats() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Get user count
  const { count: userCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // Get track count
  const { count: trackCount } = await supabase
    .from('tracks')
    .select('*', { count: 'exact', head: true });

  // Get storage usage (approximate - sum of file sizes)
  const { data: tracks } = await supabase
    .from('tracks')
    .select('file_size');

  const totalStorageBytes = tracks?.reduce((sum, t) => sum + (t.file_size || 0), 0) || 0;
  const totalStorageGB = (totalStorageBytes / (1024 * 1024 * 1024)).toFixed(2);

  return {
    userCount: userCount || 0,
    trackCount: trackCount || 0,
    storageGB: totalStorageGB,
  };
}

function formatUsageThresholdEmail(data: any): { subject: string; html: string } {
  const { threshold_type, current_value, threshold_value, percentage } = data;

  let icon = '⚠️';
  if (percentage >= 90) icon = '🔴';
  else if (percentage >= 75) icon = '🟡';

  return {
    subject: `${icon} Usage Alert: ${threshold_type} at ${percentage}%`,
    html: `
      <h2>${icon} Usage Threshold Alert</h2>
      <p>A usage threshold has been reached:</p>
      <ul>
        <li><strong>Type:</strong> ${threshold_type}</li>
        <li><strong>Current:</strong> ${current_value}</li>
        <li><strong>Threshold:</strong> ${threshold_value}</li>
        <li><strong>Percentage:</strong> ${percentage}%</li>
      </ul>
      <p><a href="https://supabase.com/dashboard/project/tvvztlizyciaafqkigwe">View Supabase Dashboard</a></p>
      <p style="color: #666; font-size: 14px; margin-top: 20px;">
        ${threshold_type === 'storage' ? 'Consider upgrading your Supabase plan or cleaning up old files.' : ''}
        ${threshold_type === 'users' ? 'Great growth! Consider reviewing your infrastructure capacity.' : ''}
      </p>
    `,
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Parse request body
    const payload: NotificationPayload = await req.json();
    console.log('📬 Notification request:', payload);

    let emailData: { subject: string; html: string };

    switch (payload.type) {
      case 'user_signup':
        emailData = formatUserSignupEmail(payload.data);
        break;

      case 'usage_threshold':
        // Fetch current stats if not provided
        if (!payload.data.current_value) {
          const stats = await getUsageStats();
          payload.data = { ...payload.data, ...stats };
        }
        emailData = formatUsageThresholdEmail(payload.data);
        break;

      case 'error_alert':
        emailData = {
          subject: `🚨 CoreTet Error Alert: ${payload.data.error_type}`,
          html: `
            <h2>🚨 Error Alert</h2>
            <p>An error occurred in CoreTet:</p>
            <pre style="background: #f5f5f5; padding: 12px; border-radius: 4px;">${JSON.stringify(payload.data, null, 2)}</pre>
          `,
        };
        break;

      default:
        throw new Error(`Unknown notification type: ${payload.type}`);
    }

    // Send email
    await sendEmail(emailData.subject, emailData.html);

    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('❌ Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
