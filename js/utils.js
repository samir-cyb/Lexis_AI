// ============================================
// LexisAI — Utility Functions
// ============================================

const Utils = {
  // Show toast notification
  showToast(message, type = 'info', duration = 3000) {
    const container = document.querySelector('.toast-container') || this.createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${this.getToastIcon(type)}</span>
      <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Auto remove
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  getToastIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  },

  createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  },

  // Format date
  formatDate(date, locale = 'en') {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US', options);
  },

  // Format time
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  },

  // Debounce
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Local storage helpers
  setLocal(key, value) {
    try {
      localStorage.setItem(`lexisai_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn('localStorage error:', e);
    }
  },

  getLocal(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(`lexisai_${key}`);
      return value ? JSON.parse(value) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },

  removeLocal(key) {
    localStorage.removeItem(`lexisai_${key}`);
  },

  // Check if mobile
  isMobile() {
    return window.innerWidth <= 768;
  },

  // Check if tablet
  isTablet() {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
  },

  // Get device type
  getDeviceType() {
    if (this.isMobile()) return 'mobile';
    if (this.isTablet()) return 'tablet';
    return 'desktop';
  },

  // Random ID generator
  generateId() {
    return Math.random().toString(36).substr(2, 9);
  },

  // Calculate percentage
  percentage(part, total) {
    if (total === 0) return 0;
    return Math.round((part / total) * 100);
  },

  // Audio context check
  hasAudioSupport() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  },

  // Speech recognition check
  hasSpeechRecognition() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  },

  // Smooth scroll to element
  scrollTo(selector) {
    const el = document.querySelector(selector);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  },

  // Copy to clipboard
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showToast('Copied to clipboard!', 'success');
    } catch (e) {
      this.showToast('Failed to copy', 'error');
    }
  },

  // Detect Bangla text
  isBangla(text) {
    return /[\u0980-\u09FF]/.test(text);
  },

  // Get Bangla numeral
  toBanglaNumeral(num) {
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/[0-9]/g, d => banglaDigits[d]);
  }
};
