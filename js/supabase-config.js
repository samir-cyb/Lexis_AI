// ============================================
// LexisAI — Supabase Configuration
// Reads credentials from js/env-config.js (gitignored)
// See js/env-config.example.js for setup instructions
// ============================================

const _cfg = window.LEXIS_CONFIG || {};
const SUPABASE_URL      = _cfg.supabaseUrl      || '';
const SUPABASE_ANON_KEY = _cfg.supabaseAnonKey  || '';

const SUPABASE_CONFIGURED =
  SUPABASE_URL.startsWith('https://') &&
  SUPABASE_ANON_KEY.length > 20;

if (!SUPABASE_CONFIGURED) {
  console.log('%c🔧 Supabase not configured — running in Demo Mode', 'color:#FFD700;font-weight:bold;');
  console.log('%cCreate js/env-config.js from js/env-config.example.js to enable Supabase.', 'color:#FFD700;');
}

let supabaseClient = null;

function initSupabase() {
  if (!SUPABASE_CONFIGURED) return null;

  if (typeof supabase !== 'undefined' && supabase.createClient) {
    try {
      supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('%c✅ Supabase client initialized — Production Mode', 'color:#00FF88;font-weight:bold;');
      return supabaseClient;
    } catch (e) {
      console.warn('Supabase init failed:', e);
      return null;
    }
  } else {
    console.warn('Supabase library not loaded');
    return null;
  }
}

function getSupabase() {
  if (!SUPABASE_CONFIGURED) return null;
  if (!supabaseClient) return initSupabase();
  return supabaseClient;
}

function isDemoMode() {
  return !SUPABASE_CONFIGURED || !supabaseClient;
}
