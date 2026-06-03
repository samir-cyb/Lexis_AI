// ============================================
// LexisAI — Supabase Configuration
// ============================================
// When Supabase is NOT configured yet, the app
// automatically runs in DEMO MODE using localStorage.
// Once you add your credentials, it switches to Supabase.
// ============================================

const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

// Detect if Supabase is actually configured
const SUPABASE_CONFIGURED = SUPABASE_URL !== 'https://YOUR_PROJECT_ID.supabase.co' && 
                             SUPABASE_ANON_KEY !== 'YOUR_ANON_KEY';

// Initialize Supabase client (only if configured)
let supabaseClient = null;

function initSupabase() {
  if (!SUPABASE_CONFIGURED) {
    console.log('%c🔧 Supabase not configured — running in Demo Mode', 'color:#FFD700;font-weight:bold;');
    return null;
  }

  if (typeof supabase !== 'undefined' && supabase.createClient) {
    try {
      supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('%c✅ Supabase client initialized', 'color:#00FF88;font-weight:bold;');
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

// Get or initialize client
function getSupabase() {
  if (!SUPABASE_CONFIGURED) return null;
  if (!supabaseClient) {
    return initSupabase();
  }
  return supabaseClient;
}

// Check if running in demo mode
function isDemoMode() {
  return !SUPABASE_CONFIGURED || !supabaseClient;
}

// ============================================
// Database Schema Reference (for developers)
// Run this SQL in your Supabase SQL Editor
// when you're ready to set up the database
// ============================================
/*
-- Users table
CREATE TABLE users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  age INTEGER,
  language_preference TEXT DEFAULT 'en',
  theme TEXT DEFAULT 'mature',
  avatar_url TEXT,
  daily_exercises_used INTEGER DEFAULT 0,
  last_exercise_date DATE,
  subscription_status TEXT DEFAULT 'free',
  subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercise sessions
CREATE TABLE exercise_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  exercise_type TEXT NOT NULL,
  language TEXT NOT NULL,
  duration_minutes INTEGER,
  phoneme_targets TEXT[],
  accuracy_score FLOAT,
  completed BOOLEAN DEFAULT FALSE,
  audio_recording_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Phoneme progress tracking
CREATE TABLE phoneme_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  phoneme TEXT NOT NULL,
  language TEXT NOT NULL,
  attempts INTEGER DEFAULT 0,
  correct INTEGER DEFAULT 0,
  best_score FLOAT DEFAULT 0,
  last_practiced TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RL state tracking
CREATE TABLE rl_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  state_vector JSONB,
  q_table JSONB,
  last_action TEXT,
  last_reward FLOAT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  plan TEXT NOT NULL,
  payment_method TEXT,
  payment_id TEXT,
  amount FLOAT,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Voice recordings (metadata)
CREATE TABLE voice_recordings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  session_id UUID REFERENCES exercise_sessions(id),
  storage_path TEXT NOT NULL,
  duration_seconds FLOAT,
  phoneme TEXT,
  language TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE phoneme_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE rl_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own data" ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users access own sessions" ON exercise_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own progress" ON phoneme_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own RL state" ON rl_states FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own subscriptions" ON subscriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own recordings" ON voice_recordings FOR ALL USING (auth.uid() = user_id);

-- Storage bucket for voice recordings
INSERT INTO storage.buckets (id, name, public) VALUES ('voice-recordings', 'voice-recordings', false);

CREATE POLICY "Users upload own recordings" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'voice-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users read own recordings" ON storage.objects FOR SELECT USING (bucket_id = 'voice-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);
*/
