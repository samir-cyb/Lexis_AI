// ============================================
// LexisAI — Authentication System
// v3 — Fixed: race condition causing infinite reload loop
// Key change: Auth.init() is now async and uses getSession()
// Pages MUST await Auth.init() before checking Auth.currentUser
// ============================================

const Auth = {
  currentUser: null,
  userProfile: null,
  useDemoMode: false,
  _initialized: false,

  DEMO_KEY: 'lexisai_demo_accounts',
  SESSION_KEY: 'lexisai_demo_session',

  // ==========================================
  // DEBUG LOGGERS
  // ==========================================
  _debug(...args) {
    const ts = new Date().toLocaleTimeString();
    console.log(`%c[AUTH ${ts}]`, 'color:#7B47F6;font-weight:bold;', ...args);
  },

  _error(...args) {
    const ts = new Date().toLocaleTimeString();
    console.error(`%c[AUTH ERR ${ts}]`, 'color:#FF2D55;font-weight:bold;', ...args);
  },

  // ==========================================
  // INIT — now returns a Promise
  // Must be awaited before checking Auth.currentUser
  // ==========================================
  async init() {
    const client = getSupabase();

    if (client) {
      this._debug('Supabase mode — getting session...');

      // STEP 1: Get current session immediately (no callback delay)
      try {
        const { data: { session }, error } = await client.auth.getSession();

        if (error) {
          this._error('getSession error:', error.message);
        } else if (session?.user) {
          this.currentUser = session.user;
          this._debug('Session found:', session.user.id.substring(0, 8) + '...');
          await this.loadUserProfile();
          this._debug('Profile loaded — theme:', this.userProfile?.theme, 'age:', this.userProfile?.age);
        } else {
          this._debug('No active session');
        }
      } catch (e) {
        this._error('getSession exception:', e.message);
      }

      // STEP 2: Listen for future auth changes (login, logout, signup)
      client.auth.onAuthStateChange(async (event, session) => {
        this._debug('Auth state changed:', event, session ? session.user?.id?.substring(0, 8) + '...' : 'no session');

        // Skip INITIAL_SESSION — we already handled it above via getSession()
        if (event === 'INITIAL_SESSION') {
          this._debug('Skipping INITIAL_SESSION (already handled)');
          return;
        }

        if (session?.user) {
          this.currentUser = session.user;
          await this.loadUserProfile();
          this._debug('Profile after state change — theme:', this.userProfile?.theme);
          this.onSignedIn();
        } else {
          this.currentUser = null;
          this.userProfile = null;
          this._debug('User signed out');
          this.onSignedOut();
        }
      });

      this._initialized = true;
    } else {
      // Demo mode
      this.useDemoMode = true;
      this._debug('Demo Mode (no Supabase)');
      this.loadDemoSession();
      this._initialized = true;
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
      this._debug('Demo session restored:', session.user?.email);
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

  // ========== PASSWORD HASHING (Demo Mode) ==========
  // Uses Web Crypto SHA-256 with random salt — much better than plaintext

  async _generateSalt() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  },

  async _hashPassword(password, salt) {
    const encoder = new TextEncoder();
    const data = encoder.encode(salt + password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  },

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
        age: null,
        language_preference: 'en',
        theme: null,
        subscription_status: 'free',
        daily_exercises_used: 0,
        last_exercise_date: null,
        created_at: new Date().toISOString()
      };

      const salt = await this._generateSalt();
      const hash = await this._hashPassword(password, salt);
      accounts[email] = { hash, salt, user, profile };
      this.saveDemoAccounts(accounts);
      this.saveDemoSession(user, profile);
      this._debug('Demo signup OK:', email);
      return { success: true, user };
    }

    // ==========================================
    // Supabase mode
    // ==========================================
    const client = getSupabase();
    if (!client) return { error: 'Supabase not initialized' };

    try {
      this._debug('Supabase signUp starting:', email);

      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
          emailRedirectTo: window.location.origin + '/login.html'
        }
      });

      if (error) {
        this._error('Supabase signUp error:', error.message);
        return { error: error.message };
      }

      // Email confirmation required (no session returned)
      if (data.user && !data.session) {
        this._debug('Email confirmation required');
        return {
          success: true,
          needsConfirmation: true,
          message: 'Check your email! We sent a confirmation link to ' + email,
          user: data.user
        };
      }

      // Auto-confirmed — session exists
      if (data.user && data.session) {
        this.currentUser = data.user;
        this._debug('Auto-confirmed signup, user ID:', data.user.id);

        // Wait for the SQL trigger to create the profile row
        await new Promise(r => setTimeout(r, 800));

        // Load the profile (trigger should have created it)
        await this.loadUserProfile();

        this._debug('After signup — profile:', this.userProfile ? 'found' : 'NOT found');
        return { success: true, user: data.user };
      }

      return { success: true, user: data.user };
    } catch (e) {
      this._error('SignUp exception:', e.message);
      return { error: e.message };
    }
  },

  // ========== SIGN IN ==========

  async signIn(email, password) {
    // Demo mode
    if (this.useDemoMode || !getSupabase()) {
      const accounts = this.getDemoAccounts();
      const account = accounts[email];
      if (!account) return {
        error: 'Demo Mode: No local account found for this email. ' +
               'If you signed up via Supabase, reload the page — Demo Mode means Supabase is not connected.'
      };
      // Support both new hashed format and legacy plaintext (backwards compat)
      if (account.hash && account.salt) {
        const hash = await this._hashPassword(password, account.salt);
        if (hash !== account.hash) return { error: 'Incorrect password' };
      } else if (account.password !== password) {
        return { error: 'Incorrect password' };
      }

      this.saveDemoSession(account.user, account.profile);
      this._debug('Demo signIn OK:', email);
      return { success: true, user: account.user };
    }

    // Supabase mode
    const client = getSupabase();
    if (!client) return { error: 'Supabase not initialized' };

    try {
      this._debug('Supabase signIn:', email);

      const { data, error } = await client.auth.signInWithPassword({ email, password });

      if (error) {
        this._error('signIn error:', error.message, '| code:', error.status);
        // Supabase v2: unconfirmed email
        const msg = error.message || '';
        if (
          msg.includes('Email not confirmed') ||
          msg.includes('email_not_confirmed') ||
          (error.status === 400 && msg.toLowerCase().includes('confirm'))
        ) {
          return {
            error: 'Please confirm your email first. Check your inbox (and spam folder) for the confirmation link.',
            needsConfirmation: true
          };
        }
        if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
          return { error: 'Wrong email or password. Please try again.' };
        }
        if (msg.includes('User not found') || msg.includes('user_not_found')) {
          return { error: 'No account found with this email in Supabase. Please sign up first.' };
        }
        return { error: msg || 'Login failed. Please try again.' };
      }

      this.currentUser = data.user;
      await this.loadUserProfile();

      this._debug('signIn OK — profile:', this.userProfile ? 'found' : 'NOT found');
      return { success: true, user: data.user };
    } catch (e) {
      this._error('signIn exception:', e.message);
      return { error: e.message };
    }
  },

  // ========== QUICK DEMO LOGIN ==========

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
      age: null,
      language_preference: 'en',
      theme: null,
      subscription_status: 'free',
      daily_exercises_used: 0,
      last_exercise_date: null,
      created_at: new Date().toISOString()
    };

    this.saveDemoSession(user, profile);
    this._debug('Demo quick login OK');
    return { success: true, user };
  },

  // ========== SOCIAL AUTH ==========

  async signInWithGoogle() {
    const client = getSupabase();
    if (!client || this.useDemoMode) {
      return { error: 'Google sign-in requires Supabase. Use Demo Mode instead.' };
    }
    try {
      const { error } = await client.auth.signInWithOAuth({
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
      const { error } = await client.auth.signInWithOAuth({
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
    if (this.useDemoMode || !getSupabase()) {
      this.clearDemoSession();
      window.location.href = 'index.html';
      return;
    }

    const client = getSupabase();
    if (client) {
      try {
        await client.auth.signOut();
        this._debug('Signed out from Supabase');
      } catch (e) {
        this._error('Sign out error:', e);
      }
    }
    this.currentUser = null;
    this.userProfile = null;
    localStorage.removeItem('lexisai_user_profile');
    window.location.href = 'index.html';
  },

  // ========== LOAD PROFILE ==========

  async loadUserProfile() {
    if (this.useDemoMode || !getSupabase()) return;

    const client = getSupabase();
    if (!client || !this.currentUser) {
      this._debug('loadUserProfile: no client or no currentUser');
      return;
    }

    try {
      this._debug('Loading profile for:', this.currentUser.id.substring(0, 8) + '...');

      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('id', this.currentUser.id)
        .maybeSingle();

      if (error) {
        this._error('loadUserProfile DB error:', error.message);
        return;
      }

      if (data) {
        this.userProfile = data;
        localStorage.setItem('lexisai_user_profile', JSON.stringify(data));
        this._debug('Profile loaded — theme:', data.theme, 'age:', data.age, 'onboarding:', data.onboarding_completed);
      } else {
        this._debug('No profile row found — creating one...');

        try {
          const { data: newProfile, error: insertErr } = await client
            .from('users')
            .insert({
              id: this.currentUser.id,
              email: this.currentUser.email,
              display_name: this.currentUser.user_metadata?.display_name ||
                            this.currentUser.email.split('@')[0],
              subscription_status: 'free',
              theme: null,
              age: null
            })
            .select()
            .single();

          if (insertErr) {
            this._error('Emergency profile insert FAILED:', insertErr.message);
          } else {
            this.userProfile = newProfile;
            localStorage.setItem('lexisai_user_profile', JSON.stringify(newProfile));
            this._debug('Emergency profile created OK');
          }
        } catch (e) {
          this._error('Emergency profile insert exception:', e.message);
        }
      }
    } catch (e) {
      this._error('loadUserProfile exception:', e.message);
    }
  },

  // ========== UPDATE PROFILE ==========

  async updateUserProfile(updates) {
    if (this.useDemoMode || !getSupabase()) {
      if (this.userProfile) {
        this.userProfile = { ...this.userProfile, ...updates, updated_at: new Date().toISOString() };
        this.saveDemoSession(this.currentUser, this.userProfile);
        this._debug('Demo profile updated:', updates);
      }
      return { success: true, profile: this.userProfile };
    }

    const client = getSupabase();
    if (!client || !this.currentUser) return { error: 'Not authenticated' };

    try {
      const { data, error } = await client
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', this.currentUser.id)
        .select()
        .single();

      if (error) {
        this._error('updateProfile DB error:', error.message);
        return { error: error.message };
      }

      this.userProfile = data;
      localStorage.setItem('lexisai_user_profile', JSON.stringify(data));
      this._debug('Profile updated — theme:', data.theme, 'age:', data.age);
      return { success: true, profile: data };
    } catch (e) {
      this._error('updateProfile exception:', e.message);
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
    if (!this.userProfile?.theme) return null;
    return this.isKid() ? 'kid' : 'mature';
  },

  needsOnboarding() {
    return !this.userProfile?.theme || this.userProfile?.age === null || this.userProfile?.age === undefined;
  },

  isDemoMode() {
    return this.useDemoMode || !getSupabase();
  },

  onSignedIn() {},
  onSignedOut() {},

  requireAuth() {
    if (!this.currentUser) {
      this._debug('requireAuth: no user → login');
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }
};
