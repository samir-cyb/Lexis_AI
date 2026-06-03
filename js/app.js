// ============================================
// LexisAI — Main App Controller
// Shared initialization and utilities
// ============================================

const App = {
  version: '1.0.0',
  isDev: false,
  
  init() {
    // Check developer mode
    this.isDev = window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1' ||
                 Utils.getLocal('dev_mode');
    
    if (this.isDev) {
      Utils.setLocal('dev_mode', true);
      console.log('%c🔧 LexisAI Developer Mode', 'font-size:16px;font-weight:bold;color:#7B2FF7;');
      console.log('%cDouble-click the DEV MODE badge to activate free premium', 'color:#FFD700;');
    }

    // Register service worker for PWA capabilities
    if ('serviceWorker' in navigator) {
      // Service worker registration can be added later for offline support
    }
  }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
