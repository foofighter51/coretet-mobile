// Edge Function: check-usage-thresholds
// Checks usage metrics and sends notifications when thresholds are exceeded
// Run this via cron job or manually to monitor system health

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Thresholds configuration
const THRESHOLDS = {
  storage_gb: 8, // Warn when storage exceeds 8GB
  user_count: 100, // Notify at milestones: 100, 200, 300, etc.
  track_count: 500, // Notify at milestones: 500, 1000, 1500, etc.
  tracks_per_user: 50, // Warn if average tracks per user exceeds this
};

interface UsageMetrics {
  userCount: number;
  trackCount: number;
  storageGB: number;
  tracksPerUser: number;
  timestamp: string;
}

interface Threshold {
  type: string;
  current: number;
  threshold: number;
  percentage: number;
  shouldNotify: boolean;
  message: string;
}

async function getUsageMetrics(): Promise<UsageMetrics> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Get user count
  const { count: userCount, error: userError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  if (userError) throw new Error(`Failed to count users: ${userError.message}`);

  // Get track count
  const { count: trackCount, error: trackError } = await supabase
    .from('tracks')
    .select('*', { count: 'exact', head: true });

  if (trackError) throw new Error(`Failed to count tracks: ${trackError.message}`);

  // Get storage usage (sum of file sizes)
  const { data: tracks, error: storageError } = await supabase
    .from('tracks')
    .select('file_size');

  if (storageError) throw new Error(`Failed to get storage data: ${storageError.message}`);

  const totalStorageBytes = tracks?.reduce((sum, t) => sum + (t.file_size || 0), 0) || 0;
  const storageGB = totalStorageBytes / (1024 * 1024 * 1024);

  const tracksPerUser = userCount && userCount > 0 ? trackCount! / userCount : 0;

  return {
    userCount: userCount || 0,
    trackCount: trackCount || 0,
    storageGB: parseFloat(storageGB.toFixed(2)),
    tracksPerUser: parseFloat(tracksPerUser.toFixed(2)),
    timestamp: new Date().toISOString(),
  };
}

function checkThresholds(metrics: UsageMetrics): Threshold[] {
  const checks: Threshold[] = [];

  // Storage check
  const storagePercentage = (metrics.storageGB / THRESHOLDS.storage_gb) * 100;
  checks.push({
    type: 'Storage',
    current: metrics.storageGB,
    threshold: THRESHOLDS.storage_gb,
    percentage: parseFloat(storagePercentage.toFixed(1)),
    shouldNotify: storagePercentage >= 80,
    message: `${metrics.storageGB} GB / ${THRESHOLDS.storage_gb} GB`,
  });

  // User milestone check
  const userMilestone = Math.floor(metrics.userCount / THRESHOLDS.user_count) * THRESHOLDS.user_count;
  const isUserMilestone = metrics.userCount % THRESHOLDS.user_count === 0 && metrics.userCount > 0;
  checks.push({
    type: 'Users',
    current: metrics.userCount,
    threshold: userMilestone || THRESHOLDS.user_count,
    percentage: 0,
    shouldNotify: isUserMilestone,
    message: `${metrics.userCount} users (milestone: ${userMilestone || THRESHOLDS.user_count})`,
  });

  // Track milestone check
  const trackMilestone = Math.floor(metrics.trackCount / THRESHOLDS.track_count) * THRESHOLDS.track_count;
  const isTrackMilestone = metrics.trackCount % THRESHOLDS.track_count === 0 && metrics.trackCount > 0;
  checks.push({
    type: 'Tracks',
    current: metrics.trackCount,
    threshold: trackMilestone || THRESHOLDS.track_count,
    percentage: 0,
    shouldNotify: isTrackMilestone,
    message: `${metrics.trackCount} tracks (milestone: ${trackMilestone || THRESHOLDS.track_count})`,
  });

  // Tracks per user check
  const tracksPerUserPercentage = (metrics.tracksPerUser / THRESHOLDS.tracks_per_user) * 100;
  checks.push({
    type: 'Tracks per User',
    current: metrics.tracksPerUser,
    threshold: THRESHOLDS.tracks_per_user,
    percentage: parseFloat(tracksPerUserPercentage.toFixed(1)),
    shouldNotify: tracksPerUserPercentage >= 90,
    message: `${metrics.tracksPerUser} tracks/user (threshold: ${THRESHOLDS.tracks_per_user})`,
  });

  return checks;
}

async function sendNotification(threshold: Threshold, metrics: UsageMetrics): Promise<void> {
  const notifyUrl = `${SUPABASE_URL}/functions/v1/notify-admin`;

  const response = await fetch(notifyUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'usage_threshold',
      data: {
        threshold_type: threshold.type,
        current_value: threshold.current,
        threshold_value: threshold.threshold,
        percentage: threshold.percentage,
        message: threshold.message,
        metrics: metrics,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send notification: ${error}`);
  }

  console.log(`✅ Notification sent for ${threshold.type}`);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    console.log('📊 Checking usage thresholds...');

    // Get current usage metrics
    const metrics = await getUsageMetrics();
    console.log('Current metrics:', metrics);

    // Check thresholds
    const thresholds = checkThresholds(metrics);
    console.log('Threshold checks:', thresholds);

    // Send notifications for exceeded thresholds
    const notifications: Promise<void>[] = [];
    for (const threshold of thresholds) {
      if (threshold.shouldNotify) {
        console.log(`⚠️ Threshold exceeded: ${threshold.type}`);
        notifications.push(sendNotification(threshold, metrics));
      }
    }

    // Wait for all notifications to be sent
    await Promise.all(notifications);

    return new Response(
      JSON.stringify({
        success: true,
        metrics,
        thresholds,
        notifications_sent: notifications.length,
      }),
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
