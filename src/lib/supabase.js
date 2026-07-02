import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[Chronos] Missing Supabase env vars. ' +
    'Copy .env.local.example to .env.local and fill in your project URL and anon key.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persist session in localStorage so the user stays logged in across refreshes
    persistSession: true,
    autoRefreshToken: true,
    // Detect OAuth callback tokens from URL hash/query after Google redirect
    detectSessionInUrl: true,
  },
});
