import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

let supabaseClient = null;

if (isSupabaseConfigured) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
} else {
  console.warn(
    '[Chronos] Supabase environment variables are missing (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY). ' +
    'The app will run in Demo / Offline Mode using mock data.'
  );

  const mockUser = {
    id: 'demo-user-id',
    email: 'demo@chronos.app',
    user_metadata: {
      full_name: 'Demo Admin'
    }
  };

  const mockSession = {
    user: mockUser,
    access_token: 'demo-token'
  };

  const mockProfile = {
    id: 'demo-user-id',
    role: 'admin',
    org_id: 'demo-org-id',
    full_name: 'Demo Admin'
  };

  const mockOrg = {
    id: 'demo-org-id',
    name: 'Demo Workspace'
  };

  // Helper chain for DB queries that mimics Supabase's Thenable query builder
  const createQueryChain = (dataToReturn) => {
    const chain = {
      select: () => createQueryChain(dataToReturn),
      eq: () => createQueryChain(dataToReturn),
      single: async () => ({ data: Array.isArray(dataToReturn) ? dataToReturn[0] : dataToReturn, error: null }),
      insert: (inputData) => {
        const resData = Array.isArray(inputData) ? inputData : [inputData];
        return createQueryChain(resData.map(d => ({ id: 'new-id-' + Math.random().toString(36).substr(2, 9), ...d })));
      },
      update: (inputData) => createQueryChain({ ...dataToReturn, ...inputData }),
      delete: () => createQueryChain([]),
      then: (resolve) => resolve({ data: dataToReturn, error: null })
    };
    return chain;
  };

  supabaseClient = {
    auth: {
      getSession: async () => ({ data: { session: mockSession }, error: null }),
      onAuthStateChange: (callback) => {
        // Delay slightly to prevent React state update loops during initialization
        const timer = setTimeout(() => {
          callback('SIGNED_IN', mockSession);
        }, 10);
        return {
          data: {
            subscription: {
              unsubscribe: () => clearTimeout(timer)
            }
          }
        };
      },
      signInWithPassword: async ({ email, password }) => {
        return { data: { user: mockUser, session: mockSession }, error: null };
      },
      signInWithOtp: async ({ email }) => {
        return { data: { user: mockUser, session: mockSession }, error: null };
      },
      signInWithOAuth: async ({ provider }) => {
        return { data: { user: mockUser, session: mockSession }, error: null };
      },
      signUp: async ({ email, password, options }) => {
        const newUser = {
          id: 'demo-user-id',
          email,
          user_metadata: options?.data || {}
        };
        const newSession = {
          user: newUser,
          access_token: 'demo-token'
        };
        return { data: { user: newUser, session: newSession }, error: null };
      },
      signOut: async () => {
        return { error: null };
      }
    },
    from: (table) => {
      if (table === 'profiles') {
        return createQueryChain(mockProfile);
      }
      if (table === 'organizations') {
        return createQueryChain(mockOrg);
      }
      return createQueryChain([]);
    }
  };
}

export const supabase = supabaseClient;
