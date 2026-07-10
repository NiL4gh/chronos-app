import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, initMockData, isSupabaseConfigured } from '../auth/supabase';

const AppAuthContext = createContext(null);

/**
 * Full app authentication provider.
 * Fetches profile, org, role — everything the main app needs.
 * Separate from the lightweight Gateway provider (no profile fetch).
 */
export function AuthProviderApp({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the profile row for the given user id
  const fetchProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.error('[AuthApp] Supabase tables missing. Run supabase/schema.sql to create them.');
      } else {
        console.error('[AuthProviderApp] fetchProfile error:', error.message);
      }
      return null;
    }
    return data;
  }, []);

  // Bootstrap: get the current session on mount
  useEffect(() => {
    // Lazy-init mock data in React lifecycle (not at module level)
    if (!isSupabaseConfigured) {
      initMockData();
    }

    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (!mounted) return;
      setSession(s);
      setUser(s?.user ?? null);

      if (s?.user) {
        const p = await fetchProfile(s.user.id);
        if (mounted) setProfile(p);
      }

      setLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh, OAuth callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        if (!mounted) return;
        setSession(s);
        setUser(s?.user ?? null);

        if (s?.user) {
          const p = await fetchProfile(s.user.id);
          if (mounted) setProfile(p);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  }, []);

  // Convenience: refresh the profile after the user updates it
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const p = await fetchProfile(user.id);
    setProfile(p);
  }, [user, fetchProfile]);

  const value = {
    session,
    user,
    profile,
    loading,
    signOut,
    refreshProfile,
    // Derived helpers consumed throughout the app
    isAdmin: profile?.role === 'admin',
    orgId: profile?.org_id ?? null,
    displayName: profile?.full_name ?? user?.email ?? '',
  };

  return (
    <AppAuthContext.Provider value={value}>
      {children}
    </AppAuthContext.Provider>
  );
}

export function useAuthApp() {
  const ctx = useContext(AppAuthContext);
  if (!ctx) throw new Error('useAuthApp must be used inside <AuthProviderApp>');
  return ctx;
}