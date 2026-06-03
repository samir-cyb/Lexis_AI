// ============================================
// LexisAI — Authentication System
// Works with Supabase Auth OR Local Demo Mode
// ============================================

const Auth = {
  currentUser: null,
  userProfile: null,
  useDemoMode: false, // Auto-detected

  // Demo accounts stored in localStorage
  DEMO_KEY: 'lexisai_demo_accounts',
  SESSION_KEY: 'lexisai_demo_session',

  init() {
    // Check if Supabase is available
    const client = getSupabase();
    
    if (client) {
      // Supabase mode
      client.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event);
        if (session?.user) {
          this.currentUser = session.user;
          await this.loadUserProfile();
          this.onSignedIn();
        } else {
          this.currentUser = null;
          this.userProfile = null;
          this.onSignedOut();
        }
      });
    } else {
      // Demo mode — check for existing session
      this.useDemoMode = true;
      console.log('%c🔧 LexisAI running in Demo Mode (no Supabase)', 'color:#FFD700;font-weight:bold;');
      this.loadDemoSession();
    }
  },

  // ========== DEMO MODE METHODS ==========

  getDemoAccounts() {
    const raw = localStorage.getItem(this.DEMO_KEY);
    return raw ? JSON.parse(raw) : {};
  },

  saveDemoAccounts(accounts) {
    localStorage.setItem(this.DEMO_KEY, JSON.stringify(accounts));
  },

  loadDemoSession() {
    const raw = localStorage.getItem(this.SESSION_KEY);
    if (raw) {
      const session = JSON.parse(raw);
      this.currentUser = session.user;
      this.userProfile = session.profile;
    }
  },

  saveDemoSession(user, profile) {
    this.currentUser = user;
    this.userProfile = profile;
    localStorage.setItem(this.SESSION_KEY, JSON.stringify({ user, profile }));
  },

  clearDemoSession() {
    this.currentUser = null;
    this.userProfile = null;
    localStorage.removeItem(this.SESSION_KEY);
  },

  // ========== SIGN UP ==========

  async signUp(email, password, displayName) {
    // Demo mode
    if (this.useDemoMode || !getSupabase()) {
      const accounts = this.getDemoAccounts();
      
      if (accounts[email]) {
        return { error: 'An account with this email already exists' };
      }

      const userId = 'demo-' + Date.now();
      const user = {
        id: userId,
        email: email,
        user_metadata: { display_name: displayName },
        created_at: new Date().toISOString()
      };

      const profile = {
        id: userId,
        email: email,
        display_name: displayName,
        age: 20,
        language_preference: 'en',
        theme: 'mature',
        subscription_status: 'free',
        daily_exercises_used: 0,
        last_exercise_date: null,
        created_at: new Date().toISOString()
      };

      // Save account
      accounts[email] = { password, user, profile };
      this.saveDemoAccounts(accounts);

      // Auto-login
      this.saveDemoSession(user, profile);
      
      return { success: true, user };
    }

    // Supabase mode
    const client = getSupabase();
    if (!client) return { error: 'Supabase not initialized' };

    try {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } }
      });

      if (error) return { error: error.message };

      if (data.user) {
        await client.from('users').insert({
          id: data.user.id,
          email: email,
          display_name: displayName,
          subscription_status: 'free'
        });
      }

      return { success: true, user: data.user };
    } catch (e) {
      return { error: e.message };
    }
  },

  // ========== SIGN IN ==========

  async signIn(email, password) {
    // Demo mode
    if (this.useDemoMode || !getSupabase()) {
      const accounts = this.getDemoAccounts();
      const account = accounts[email];

      if (!account) {
        return { error: 'No account found with this email. Please sign up first.' };
      }

      if (account.password !== password) {
        return { error: 'Incorrect password' };
      }

      this.saveDemoSession(account.user, account.profile);
      return { success: true, user: account.user };
    }

    // Supabase mode
    const client = getSupabase();
    if (!client) return { error: 'Supabase not initialized' };

    try {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return { success: true, user: data.user };
    } catch (e) {
      return { error: e.message };
    }
  },

  // ========== QUICK DEMO LOGIN (no credentials needed) ==========

  async demoQuickLogin() {
    const userId = 'demo-quick-' + Date.now();
    const user = {
      id: userId,
      email: 'demo@lexisai.app',
      user_metadata: { display_name: 'Demo User' },
      created_at: new Date().toISOString()
    };

    const profile = {
      id: userId,
      email: 'demo@lexisai.app',
      display_name: 'Demo User',
      age: 20,
      language_preference: 'en',
      theme: 'mature',
      subscription_status: 'free',
      daily_exercises_used: 0,
      last_exercise_date: null,
      created_at: new Date().toISOString()
    };

    this.saveDemoSession(user, profile);
    return { success: true, user };
  },

  // ========== SOCIAL AUTH ==========

  async signInWithGoogle() {
    const client = getSupabase();
    if (!client || this.useDemoMode) {
      return { error: 'Google sign-in requires Supabase. Use Demo Mode instead.' };
    }
    try {
      const { data, error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/dashboard.html' }
      });
      if (error) return { error: error.message };
      return { success: true };
    } catch (e) {
      return { error: e.message };
    }
  },

  async signInWithGitHub() {
    const client = getSupabase();
    if (!client || this.useDemoMode) {
      return { error: 'GitHub sign-in requires Supabase. Use Demo Mode instead.' };
    }
    try {
      const { data, error } = await client.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: window.location.origin + '/dashboard.html' }
      });
      if (error) return { error: error.message };
      return { success: true };
    } catch (e) {
      return { error: e.message };
    }
  },

  // ========== SIGN OUT ==========

  async signOut() {
    // Demo mode
    if (this.useDemoMode || !getSupabase()) {
      this.clearDemoSession();
      window.location.href = 'index.html';
      return;
    }

    // Supabase mode
    const client = getSupabase();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (e) {
        console.error('Sign out error:', e);
      }
    }
    localStorage.removeItem('lexisai_user_profile');
    window.location.href = 'index.html';
  },

  // ========== LOAD PROFILE ==========

  async loadUserProfile() {
    // Demo mode
    if (this.useDemoMode || !getSupabase()) {
      // Profile is already loaded in demo session
      return;
    }

    const client = getSupabase();
    if (!client || !this.currentUser) return;

    try {
      const { data } = await client
        .from('users')
        .select('*')
        .eq('id', this.currentUser.id)
        .single();

      if (data) {
        this.userProfile = data;
        localStorage.setItem('lexisai_user_profile', JSON.stringify(data));
      }
    } catch (e) {
      console.error('Load profile error:', e);
    }
  },

  // ========== UPDATE PROFILE ==========

  async updateUserProfile(updates) {
    // Demo mode
    if (this.useDemoMode || !getSupabase()) {
      if (this.userProfile) {
        this.userProfile = { ...this.userProfile, ...updates, updated_at: new Date().toISOString() };
        this.saveDemoSession(this.currentUser, this.userProfile);
      }
      return { success: true, profile: this.userProfile };
    }

    // Supabase mode
    const client = getSupabase();
    if (!client || !this.currentUser) return { error: 'Not authenticated' };

    try {
      const { data, error } = await client
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', this.currentUser.id)
        .select()
        .single();

      if (error) return { error: error.message };
      this.userProfile = data;
      localStorage.setItem('lexisai_user_profile', JSON.stringify(data));
      return { success: true, profile: data };
    } catch (e) {
      return { error: e.message };
    }
  },

  // ========== PASSWORD RESET ==========

  async resetPassword(email) {
    if (this.useDemoMode || !getSupabase()) {
      return { error: 'Password reset requires Supabase. In Demo Mode, just create a new account.' };
    }

    const client = getSupabase();
    if (!client) return { error: 'Supabase not initialized' };

    try {
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/login.html?reset=true'
      });
      if (error) return { error: error.message };
      return { success: true };
    } catch (e) {
      return { error: e.message };
    }
  },

  // ========== DAILY LIMIT ==========

  async checkDailyLimit() {
    const profile = this.userProfile;
    if (!profile) return { remaining: 0 };

    const today = new Date().toISOString().split('T')[0];

    if (profile.subscription_status !== 'free') {
      return { remaining: Infinity, unlimited: true };
    }

    if (profile.last_exercise_date !== today) {
      await this.updateUserProfile({
        daily_exercises_used: 0,
        last_exercise_date: today
      });
      return { remaining: 3 };
    }

    const remaining = Math.max(0, 3 - (profile.daily_exercises_used || 0));
    return { remaining, unlimited: false };
  },

  async incrementDailyUsage() {
    const profile = this.userProfile;
    if (!profile) return;

    const today = new Date().toISOString().split('T')[0];
    const currentCount = profile.last_exercise_date === today ? (profile.daily_exercises_used || 0) : 0;

    await this.updateUserProfile({
      daily_exercises_used: currentCount + 1,
      last_exercise_date: today
    });
  },

  // ========== HELPERS ==========

  isKid() {
    return this.userProfile?.age && this.userProfile.age < 10;
  },

  getTheme() {
    return this.isKid() ? 'kid' : 'mature';
  },

  isDemoMode() {
    return this.useDemoMode || !getSupabase();
  },

  onSignedIn() {},
  onSignedOut() {},

  requireAuth() {
    if (!this.currentUser) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }
};
