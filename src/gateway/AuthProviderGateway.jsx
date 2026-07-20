import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../auth/supabase';

/**
 * Lightweight gateway auth provider.
 * Manages session state AND fetches profile (for org_id check).
 * Does NOT call onAuthSuccess automatically - GatewayRoutes handles routing.
 */
const GatewayAuthContext = createContext(null);

export function AuthProviderGateway({ children, onAuthSuccess }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('org_id, full_name, avatar_url')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.error('[AuthGateway] Supabase tables missing. Run supabase/schema.sql to create them.');
      } else {
        console.error('[AuthGateway] fetchProfile error:', error.message);
      }
      setProfile(null);
      return null;
    }
    setProfile(data);
    return data;
  }, []);

  useEffect(() => {
    let mounted = true;

    // On mount, check for existing session (page refresh, OAuth callback, magic link)
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (!mounted) return;
      setSession(s);
      setUser(s?.user ?? null);
      
      if (s?.user) {
        await fetchProfile(s.user.id);
      }

      setLoading(false);

      // Only auto-signal on mount — not from the listener below.
      // This handles OAuth redirects and page refreshes where no
      // page-level handler runs.
      if (s?.user && onAuthSuccess) {
        onAuthSuccess();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        if (!mounted) return;
        setSession(s);
        setUser(s?.user ?? null);
        
        if (s?.user) {
          await fetchProfile(s.user.id);
        } else {
          setProfile(null);
        }
        // NOTE: No onAuthSuccess call here — GatewayRoutes handles routing
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [onAuthSuccess]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  return (
    <GatewayAuthContext.Provider value={{ session, user, profile, loading, signOut }}>
      {children}
    </GatewayAuthContext.Provider>
  );
}

export function useGatewayAuth() {
  const ctx = useContext(GatewayAuthContext);
  if (!ctx) throw new Error('useGatewayAuth must be used inside <AuthProviderGateway>');
  return ctx;
}