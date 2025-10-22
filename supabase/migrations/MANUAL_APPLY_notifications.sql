-- ============================================================================
-- MANUAL MIGRATION: User Signup Notifications
-- ============================================================================
-- Apply this in Supabase Dashboard → SQL Editor
-- This creates a trigger that sends email notifications when users sign up
-- ============================================================================

-- Step 1: Create notification function for new profiles
CREATE OR REPLACE FUNCTION notify_admin_new_profile()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_created_at TIMESTAMPTZ;
  function_url TEXT;
  service_key TEXT;
BEGIN
  -- Get user email from auth.users
  SELECT email, created_at INTO user_email, user_created_at
  FROM auth.users
  WHERE id = NEW.id;

  -- Build function URL
  function_url := 'https://tvvztlizyciaafqkigwe.supabase.co/functions/v1/notify-admin';

  -- Get service role key from vault (stored securely in Supabase)
  -- NOTE: You'll need to set this up in Supabase Dashboard → Project Settings → Vault
  -- For now, this will fail gracefully and just log a warning

  BEGIN
    -- Try to call the Edge Function using pg_net extension
    PERFORM net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
      ),
      body := jsonb_build_object(
        'type', 'user_signup',
        'data', jsonb_build_object(
          'id', NEW.id,
          'email', user_email,
          'name', NEW.name,
          'created_at', user_created_at
        )
      )::text
    );

    RAISE NOTICE 'Signup notification sent for: %', user_email;
  EXCEPTION
    WHEN OTHERS THEN
      -- Don't fail profile creation if notification fails
      RAISE WARNING 'Failed to send signup notification for %: %', user_email, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_profile_created_notify ON public.profiles;

-- Step 3: Create the trigger
CREATE TRIGGER on_profile_created_notify
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_new_profile();

-- Step 4: Add comments for documentation
COMMENT ON TRIGGER on_profile_created_notify ON public.profiles IS
  'Sends email notification to admin (coretetapp@gmail.com) when a new user signs up';

COMMENT ON FUNCTION notify_admin_new_profile() IS
  'Calls the notify-admin Edge Function to send email notification for new user signups via Resend';

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run this to verify the trigger was created:
--
-- SELECT trigger_name, event_manipulation, action_timing
-- FROM information_schema.triggers
-- WHERE trigger_name = 'on_profile_created_notify';
--
-- Should return: on_profile_created_notify | INSERT | AFTER
-- ============================================================================
