// src/auth/errors.js
// Translates raw Supabase / Postgres errors into user-friendly strings.
// Never leaks SQLSTATE codes, table names, or stack traces to the UI.
// Use: setError(friendlyAuthError(err)) instead of setError(err.message)

const AUTH_ERROR_MAP = [
  // SQLSTATE codes
  { match: (e) => e?.code === '42501', message: "We couldn't save your changes. Please try again." },
  { match: (e) => e?.code === '23505', message: 'That workspace name is taken. Try a different name.' },
  { match: (e) => e?.code === '23514', message: "Your input didn't meet the requirements. Please review and try again." },
  { match: (e) => e?.code === 'PGRST116', message: 'Setup incomplete. Please contact support.' },
  // string patterns
  { match: (e) => /permission denied/i.test(e?.message ?? ''), message: "We couldn't save your changes. Please try again." },
  { match: (e) => /relation .* does not exist/i.test(e?.message ?? ''), message: 'Setup incomplete. Please contact support.' },
  { match: (e) => /failed to fetch/i.test(e?.message ?? ''), message: 'Network error — check your connection and try again.' },
  { match: (e) => /typeerror/i.test(e?.constructor?.name ?? ''), message: 'Network error — check your connection and try again.' },
  { match: (e) => /network/i.test(e?.message ?? ''), message: 'Network error — check your connection and try again.' },
  // fallbacks
  { match: (e) => e instanceof Error, message: 'Something went wrong. Please try again.' },
];

export function friendlyAuthError(err) {
  for (const rule of AUTH_ERROR_MAP) {
    try {
      if (rule.match(err)) return rule.message;
    } catch { /* never throw out */ }
  }
  return 'Something went wrong. Please try again.';
}

export default friendlyAuthError;
