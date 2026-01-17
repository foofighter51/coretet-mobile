import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../../lib/supabase';

interface AdminRouteGuardProps {
  children: React.ReactNode;
  userId: string;
}

/**
 * AdminRouteGuard protects routes that should only be accessible to admin users
 * Redirects non-authenticated users to the home page
 * Redirects non-admin users to the main app
 */
export function AdminRouteGuard({ children, userId }: AdminRouteGuardProps) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await db.profiles.getById(userId);
        setProfile(data);

        // Redirect if user is not an admin
        if (data && !data.is_admin) {
          navigate('/app');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId, navigate]);

  // Show loading state
  if (loading) {
    return null;
  }

  // Don't render children until we've verified admin status
  if (!profile?.is_admin) {
    return null;
  }

  return <>{children}</>;
}
