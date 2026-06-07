-- ============================================
-- LexisAI — Complete Supabase Database Setup
-- v2 — Fixed: theme defaults to NULL (user picks in onboarding)
-- ============================================
-- Run this ENTIRE script in your Supabase SQL Editor
-- (Dashboard → SQL Editor → New Query → Paste all → Run)
-- ============================================

-- ============================================
-- 1. USERS TABLE
-- ============================================
-- Drop existing table if you want a clean start (WARNING: deletes all data)
-- DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  age INTEGER,                          -- NULL until user picks in onboarding
  language_preference TEXT DEFAULT 'en',
  theme TEXT DEFAULT NULL,              -- NULL until user picks in onboarding ('kid' or 'mature')
  avatar_url TEXT,
  daily_exercises_used INTEGER DEFAULT 0,
  last_exercise_date DATE,
  subscription_status TEXT DEFAULT 'free',
  subscription_id TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,  -- Track if onboarding was done
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- If the table already exists and has DEFAULT 'mature', fix it:
ALTER TABLE users ALTER COLUMN theme SET DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Auto-create user profile on signup
-- This trigger fires when a new user registers via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, theme, age)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NULL,   -- theme is NULL — user picks in onboarding
    NULL    -- age is NULL — user picks in onboarding
  )
  ON CONFLICT (id) DO NOTHING;  -- Don't error if row already exists
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. EXERCISE SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS exercise_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  exercise_type TEXT NOT NULL,
  language TEXT NOT NULL,
  duration_minutes INTEGER,
  phoneme_targets TEXT[],
  accuracy_score FLOAT,
  score INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  audio_recording_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. PHONEME PROGRESS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS phoneme_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  phoneme TEXT NOT NULL,
  language TEXT NOT NULL,
  attempts INTEGER DEFAULT 0,
  correct INTEGER DEFAULT 0,
  best_score FLOAT DEFAULT 0,
  last_practiced TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, phoneme, language)
);

-- ============================================
-- 4. RL STATE TRACKING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS rl_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  state_vector JSONB DEFAULT '{}',
  q_table JSONB DEFAULT '{}',
  last_action TEXT,
  last_reward FLOAT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- 5. SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',
  payment_method TEXT,
  payment_id TEXT,
  amount FLOAT,
  currency TEXT DEFAULT 'BDT',
  status TEXT DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- ============================================
-- 6. VOICE RECORDINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS voice_recordings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES exercise_sessions(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  duration_seconds FLOAT,
  phoneme TEXT,
  language TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. STREAKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_practice_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- 8. ACHIEVEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_data JSONB DEFAULT '{}',
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_type)
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE phoneme_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE rl_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Drop old policies first (in case they already exist)
DROP POLICY IF EXISTS "Users read own data" ON users;
DROP POLICY IF EXISTS "Users update own data" ON users;
DROP POLICY IF EXISTS "Users insert own data" ON users;

DROP POLICY IF EXISTS "Users read own sessions" ON exercise_sessions;
DROP POLICY IF EXISTS "Users insert own sessions" ON exercise_sessions;
DROP POLICY IF EXISTS "Users update own sessions" ON exercise_sessions;
DROP POLICY IF EXISTS "Users delete own sessions" ON exercise_sessions;

DROP POLICY IF EXISTS "Users read own progress" ON phoneme_progress;
DROP POLICY IF EXISTS "Users insert own progress" ON phoneme_progress;
DROP POLICY IF EXISTS "Users update own progress" ON phoneme_progress;

DROP POLICY IF EXISTS "Users read own RL state" ON rl_states;
DROP POLICY IF EXISTS "Users insert own RL state" ON rl_states;
DROP POLICY IF EXISTS "Users update own RL state" ON rl_states;

DROP POLICY IF EXISTS "Users read own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users insert own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users update own subscriptions" ON subscriptions;

DROP POLICY IF EXISTS "Users read own recordings" ON voice_recordings;
DROP POLICY IF EXISTS "Users insert own recordings" ON voice_recordings;
DROP POLICY IF EXISTS "Users delete own recordings" ON voice_recordings;

DROP POLICY IF EXISTS "Users read own streaks" ON streaks;
DROP POLICY IF EXISTS "Users insert own streaks" ON streaks;
DROP POLICY IF EXISTS "Users update own streaks" ON streaks;

DROP POLICY IF EXISTS "Users read own achievements" ON achievements;
DROP POLICY IF EXISTS "Users insert own achievements" ON achievements;

-- Users: can read/update own data only
CREATE POLICY "Users read own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own data" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Exercise Sessions
CREATE POLICY "Users read own sessions" ON exercise_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own sessions" ON exercise_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own sessions" ON exercise_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own sessions" ON exercise_sessions FOR DELETE USING (auth.uid() = user_id);

-- Phoneme Progress
CREATE POLICY "Users read own progress" ON phoneme_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own progress" ON phoneme_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own progress" ON phoneme_progress FOR UPDATE USING (auth.uid() = user_id);

-- RL States
CREATE POLICY "Users read own RL state" ON rl_states FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own RL state" ON rl_states FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own RL state" ON rl_states FOR UPDATE USING (auth.uid() = user_id);

-- Subscriptions
CREATE POLICY "Users read own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own subscriptions" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own subscriptions" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Voice Recordings
CREATE POLICY "Users read own recordings" ON voice_recordings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own recordings" ON voice_recordings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own recordings" ON voice_recordings FOR DELETE USING (auth.uid() = user_id);

-- Streaks
CREATE POLICY "Users read own streaks" ON streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own streaks" ON streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own streaks" ON streaks FOR UPDATE USING (auth.uid() = user_id);

-- Achievements
CREATE POLICY "Users read own achievements" ON achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own achievements" ON achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- STORAGE BUCKET FOR VOICE RECORDINGS
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-recordings', 'voice-recordings', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users upload own recordings" ON storage.objects;
DROP POLICY IF EXISTS "Users read own recordings" ON storage.objects;

CREATE POLICY "Users upload own recordings" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'voice-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users read own recordings" ON storage.objects
  FOR SELECT USING (bucket_id = 'voice-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- INDEXES for faster queries
-- ============================================
CREATE INDEX IF NOT EXISTS idx_exercise_sessions_user ON exercise_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_sessions_created ON exercise_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_phoneme_progress_user ON phoneme_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_streaks_user ON streaks(user_id);

-- ============================================
-- REALTIME SUBSCRIPTIONS (optional)
-- ============================================
-- Enable realtime for exercise_sessions if you want live updates
ALTER PUBLICATION supabase_realtime ADD TABLE exercise_sessions;
