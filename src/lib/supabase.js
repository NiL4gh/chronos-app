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

  // Initialize mock localStorage database if empty/new
  try {
    if (!localStorage.getItem('chronos_mock_initialized')) {
      localStorage.setItem('chronos_mock_initialized', 'true');
      localStorage.setItem('chronos_mock_users', JSON.stringify([
        { id: mockUser.id, email: mockUser.email, password: 'password', user_metadata: mockUser.user_metadata }
      ]));
      localStorage.setItem('chronos_mock_profiles', JSON.stringify([mockProfile]));
      localStorage.setItem('chronos_mock_organizations', JSON.stringify([mockOrg]));
      localStorage.setItem('chronos_mock_session', JSON.stringify(mockSession));
    }
  } catch (e) {
    console.error('[Chronos] Failed to initialize mock databases:', e);
  }

  // Active auth listeners
  const authListeners = new Set();

  const getSessionFromStorage = () => {
    try {
      const val = localStorage.getItem('chronos_mock_session');
      return val ? JSON.parse(val) : null;
    } catch {
      return null;
    }
  };

  const setSessionInStorage = (session) => {
    try {
      if (session) {
        localStorage.setItem('chronos_mock_session', JSON.stringify(session));
      } else {
        localStorage.removeItem('chronos_mock_session');
      }
    } catch {}
  };

  const getUsersFromStorage = () => {
    try {
      const val = localStorage.getItem('chronos_mock_users');
      return val ? JSON.parse(val) : [];
    } catch {
      return [];
    }
  };

  const saveUserToStorage = (user) => {
    try {
      const users = getUsersFromStorage();
      users.push(user);
      localStorage.setItem('chronos_mock_users', JSON.stringify(users));
    } catch {}
  };

  supabaseClient = {
    auth: {
      getSession: async () => {
        return { data: { session: getSessionFromStorage() }, error: null };
      },
      onAuthStateChange: (callback) => {
        authListeners.add(callback);
        
        // Trigger initial state
        const currentSession = getSessionFromStorage();
        const event = currentSession ? 'SIGNED_IN' : 'SIGNED_OUT';
        
        // Delay slightly to prevent React render state loops during startup
        const timer = setTimeout(() => {
          callback(event, currentSession);
        }, 10);

        return {
          data: {
            subscription: {
              unsubscribe: () => {
                clearTimeout(timer);
                authListeners.delete(callback);
              }
            }
          }
        };
      },
      signInWithPassword: async ({ email, password }) => {
        const users = getUsersFromStorage();
        const matched = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        // If matched and password matches (we allow 'password' as default for simplicity)
        if (matched && (matched.password === password || password === 'password')) {
          const user = { id: matched.id, email: matched.email, user_metadata: matched.user_metadata || {} };
          const session = { user, access_token: 'mock-token-' + Math.random().toString(36).substr(2, 9) };
          setSessionInStorage(session);
          
          // Notify listeners
          authListeners.forEach(cb => cb('SIGNED_IN', session));
          
          return { data: { user, session }, error: null };
        }
        
        return { data: null, error: { message: 'Invalid credentials. Use email demo@chronos.app and password password' } };
      },
      signInWithOtp: async ({ email }) => {
        // Mock magic link by logging in or registering immediately
        const users = getUsersFromStorage();
        let matched = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!matched) {
          matched = { id: 'user-' + Math.random().toString(36).substr(2, 9), email, password: 'password', user_metadata: {} };
          saveUserToStorage(matched);
        }
        const user = { id: matched.id, email: matched.email, user_metadata: matched.user_metadata };
        const session = { user, access_token: 'mock-token' };
        setSessionInStorage(session);
        authListeners.forEach(cb => cb('SIGNED_IN', session));
        return { data: { user, session }, error: null };
      },
      signInWithOAuth: async ({ provider }) => {
        // Mock OAuth login using the demo user
        const user = mockUser;
        const session = mockSession;
        setSessionInStorage(session);
        authListeners.forEach(cb => cb('SIGNED_IN', session));
        return { data: { user, session }, error: null };
      },
      signUp: async ({ email, password, options }) => {
        const users = getUsersFromStorage();
        const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
        if (exists) {
          return { data: null, error: { message: 'A user with this email already exists' } };
        }
        
        const newUser = {
          id: 'user-' + Math.random().toString(36).substr(2, 9),
          email,
          password,
          user_metadata: options?.data || {}
        };
        
        saveUserToStorage(newUser);
        
        const user = { id: newUser.id, email: newUser.email, user_metadata: newUser.user_metadata };
        const session = { user, access_token: 'mock-token' };
        
        // Auto-create profile trigger mock
        const newProfile = {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata.full_name || email.split('@')[0],
          role: 'employee',
          org_id: null
        };
        try {
          const profiles = JSON.parse(localStorage.getItem('chronos_mock_profiles') || '[]');
          profiles.push(newProfile);
          localStorage.setItem('chronos_mock_profiles', JSON.stringify(profiles));
        } catch {}

        setSessionInStorage(session);
        authListeners.forEach(cb => cb('SIGNED_IN', session));
        
        return { data: { user, session }, error: null };
      },
      signOut: async () => {
        setSessionInStorage(null);
        authListeners.forEach(cb => cb('SIGNED_OUT', null));
        return { error: null };
      }
    },
    from: (table) => {
      const getData = () => {
        try {
          const key = `chronos_mock_${table}`;
          const val = localStorage.getItem(key);
          if (val) return JSON.parse(val);
        } catch {}
        if (table === 'profiles') return [mockProfile];
        if (table === 'organizations') return [mockOrg];
        return [];
      };

      const saveData = (data) => {
        try {
          localStorage.setItem(`chronos_mock_${table}`, JSON.stringify(data));
        } catch {}
      };

      let action = 'select';
      let actionData = null;
      let filters = [];

      const executeQuery = () => {
        let allData = getData();
        
        if (action === 'insert') {
          const arr = Array.isArray(actionData) ? actionData : [actionData];
          const newItems = arr.map(item => ({
            id: item.id || `${table.slice(0, 3)}-${Math.random().toString(36).substr(2, 9)}`,
            created_at: new Date().toISOString(),
            ...item
          }));
          saveData([...allData, ...newItems]);
          return { data: newItems, error: null };
        }
        
        if (action === 'update') {
          let matches = [...allData];
          filters.forEach(f => {
            matches = matches.filter(item => item[f.field] === f.value);
          });
          
          const updatedData = allData.map(item => {
            const isMatch = matches.some(m => m.id === item.id);
            if (isMatch) {
              return { ...item, ...actionData };
            }
            return item;
          });
          
          saveData(updatedData);
          
          const updatedMatches = matches.map(item => ({ ...item, ...actionData }));
          return { data: updatedMatches, error: null };
        }
        
        // Default select
        let results = [...allData];
        filters.forEach(f => {
          results = results.filter(item => item[f.field] === f.value);
        });
        return { data: results, error: null };
      };

      const chain = {
        select: () => {
          action = 'select';
          return chain;
        },
        eq: (field, value) => {
          filters.push({ field, value });
          return chain;
        },
        insert: (data) => {
          action = 'insert';
          actionData = data;
          return chain;
        },
        update: (data) => {
          action = 'update';
          actionData = data;
          return chain;
        },
        single: async () => {
          const { data, error } = executeQuery();
          const row = data && data.length > 0 ? data[0] : null;
          return { data: row, error: row ? null : { message: 'Not found' } };
        },
        then: (resolve) => {
          const res = executeQuery();
          resolve(res);
        }
      };

      return chain;
    }
  };
}

export const supabase = supabaseClient;
