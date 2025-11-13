-- Migration: Add notifications for new user signups
-- Created: 2025-10-22
-- Description: Automatically notify admin when users confirm their email

-- Create a function to call the Edge Function when a new user is created
CREATE OR REPLACE FUNCTION notify_admin_new_user()
RETURNS TRIGGER AS $$
DECLARE
  function_url TEXT;
  response RECORD;
BEGIN
  -- Only notify if email is confirmed (not just created)
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    -- Get the Supabase project URL from environment
    function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/notify-admin';

    -- Call the Edge Function asynchronously using pg_net
    -- Note: Requires pg_net extension (already enabled in Supabase)
    PERFORM
      net.http_post(
        url := function_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
        ),
        body := jsonb_build_object(
          'type', 'user_signup',
          'data', jsonb_build_object(
            'id', NEW.id,
            'email', NEW.email,
            'created_at', NEW.created_at,
            'confirmed_at', NEW.email_confirmed_at
          )
        )
      );

    -- Log the notification
    RAISE NOTICE 'User signup notification sent for: %', NEW.email;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
-- Note: We need to use a trigger on the profiles table instead since we can't directly
-- trigger on auth.users. The profile is created after email confirmation.

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_profile_created_notify ON public.profiles;

-- Create trigger function for profiles table
CREATE OR REPLACE FUNCTION notify_admin_new_profile()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_created_at TIMESTAMPTZ;
BEGIN
  -- Get user email from auth.users
  SELECT email, created_at INTO user_email, user_created_at
  FROM auth.users
  WHERE id = NEW.id;

  -- Call notification Edge Function using HTTP
  -- This uses the supabase_functions.http_request extension
  PERFORM
    supabase_functions.http_request(
      url := current_setting('app.settings.function_url', true) || '/notify-admin',
      method := 'POST',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := jsonb_build_object(
        'type', 'user_signup',
        'data', jsonb_build_object(
          'id', NEW.id,
          'email', user_email,
          'name', NEW.name,
          'created_at', user_created_at
        )
      )
    );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail the profile creation if notification fails
    RAISE WARNING 'Failed to send signup notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on profiles table (fires when new profile is created)
CREATE TRIGGER on_profile_created_notify
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_new_profile();

-- Add comment for documentation
COMMENT ON TRIGGER on_profile_created_notify ON public.profiles IS
  'Sends email notification to admin when a new user signs up and creates their profile';

COMMENT ON FUNCTION notify_admin_new_profile() IS
  'Calls the notify-admin Edge Function to send email notification for new user signups';
