// ============================================
// LexisAI — Configuration (SECRETS)
// ============================================
// ⚠️ NO API keys stored in this file!
// ⚠️ Keys are loaded from localStorage at runtime.
// ⚠️ This file is safe to commit to Git.
// ============================================

const LexisConfig = {
  // Gemini API Key — loaded from localStorage (user enters once in browser)
  // If not set, user will be prompted to enter it on first use
  get geminiApiKey() {
    return localStorage.getItem('lexisai_gemini_key') || '';
  },

  // Gemini model to use
  geminiModel: 'gemini-2.0-flash',

  // Save the API key to localStorage
  saveGeminiKey(key) {
    if (key && key.trim()) {
      localStorage.setItem('lexisai_gemini_key', key.trim());
      console.log('%c✅ Gemini API key saved', 'color:#00FF88;font-weight:bold');
    }
  },

  // Check if key is configured
  get hasGeminiKey() {
    return !!(localStorage.getItem('lexisai_gemini_key') || '').trim();
  },

  // Prompt user for key if not set
  ensureKey() {
    if (!this.hasGeminiKey) {
      const key = prompt(
        '🔮 Enter your Gemini API Key for AI speech recognition\n\n' +
        'Get a free key at: https://aistudio.google.com/apikey\n\n' +
        '(This is stored locally in your browser only — never sent to our servers)'
      );
      if (key) {
        this.saveGeminiKey(key);
        return true;
      }
      return false;
    }
    return true;
  }
};
