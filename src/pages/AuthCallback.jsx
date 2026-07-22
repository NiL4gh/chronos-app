import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../auth/supabase';

/**
 * OAuth callback handler - processes the redirect from Google OAuth
 * and redirects to the appropriate page based on user's profile.
 */
export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function handleCallback() {
      try {
        // Supabase handles the session exchange automatically
        // Just need to verify we got a session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          console.error('[AuthCallback] No session:', error);
          navigate('/login', { state: { error: 'Authentication failed' } });
          return;
        }

        // Session exists - check if user has a profile with org_id
        const { data: profile } = await supabase
          .from('profiles')
          .select('org_id')
          .eq('id', session.user.id)
          .single();

        if (profile?.org_id) {
          // User has organization - go to app
          navigate('/app');
        } else {
          // No organization - go to onboarding
          navigate('/onboarding');
        }
      } catch (err) {
        console.error('[AuthCallback] Error:', err);
        navigate('/login', { state: { error: 'Something went wrong' } });
      }
    }

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full mx-auto mb-4" 
             style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
        <p style={{ color: 'var(--text-muted)' }}>Completing sign in...</p>
      </div>
    </div>
  );
}