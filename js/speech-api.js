// ============================================
// LexisAI — Speech-to-Text API v7
// Primary: Browser SpeechRecognition (with smart timeout)
// Fallback: Gemini API (multimodal transcription)
// Last resort: Local formant-based phoneme analysis
// Shows detected text visually to the user
//
// v7 FIXES:
// - Increased browser STT timeout to 30s (was 6s — too aggressive)
// - Timer resets on every result so it doesn't fire during active use
// - Once browser STT produces results, NEVER switch to Gemini mid-session
// - Graceful handling of "aborted" error when switching to Gemini
// - bn-IN first in locale chain (bn-BD always fails)
// - Added _switchingToGemini flag to suppress confusing abort logs
// ============================================

const SpeechAPI = {
  recognition: null,
  isListening: false,
  shouldRestart: false,
  onResult: null,
  onError: null,
  onEnd: null,
  useBrowserAPI: true,
  isOnlineMode: false,
  isLocalMode: false,
  currentLanguage: 'en-US',
  restartAttempts: 0,
  maxRestartAttempts: 5,
  restartDelay: 1000,
  lastResultTime: 0,
  silenceTimeout: null,
  networkFailCount: 0,
  maxNetworkFails: 3,
  localeIndex: 0,
  localeFallbackChain: [],
  destroyed: false,

  // Browser STT timeout — if no result within this time, try Gemini
  // v7: Increased from 6s to 30s — user needs time to think and speak!
  // Timer resets on every result, so it only fires after 30s of NO results
  browserSttTimeout: 30000,
  browserSttTimer: null,
  browserSttGotResult: false,

  // v7: Once browser STT has produced at least one good result,
  // don't switch to Gemini even if there's a temporary silence
  browserSttEverWorked: false,

  // v7: Flag to suppress "aborted" error log when WE are the ones aborting
  _switchingToGemini: false,

  // Gemini API — key loaded from localStorage via config.js (NEVER hardcoded)
  // LexisConfig.geminiApiKey is a getter that reads from localStorage
  get geminiApiKey() {
    return (typeof LexisConfig !== 'undefined' && LexisConfig.geminiApiKey) ? LexisConfig.geminiApiKey : '';
  },
  geminiModel: (typeof LexisConfig !== 'undefined' && LexisConfig.geminiModel) ? LexisConfig.geminiModel : 'gemini-2.0-flash',
  geminiTranscribing: false,
  geminiLastTranscript: '',
  geminiInterval: null,
  geminiAudioChunks: [],
  useGemini: false,
  geminiFailCount: 0,
  maxGeminiFails: 3,

  // Audio recording for Gemini
  mediaRecorder: null,
  audioChunks: [],
  recordingStartTime: 0,
  geminiRecordingActive: false,

  debugLog: [],
  maxDebugLog: 100,
  lastDetectedText: '',

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const entry = { timestamp, message, type };
    this.debugLog.push(entry);
    if (this.debugLog.length > this.maxDebugLog) this.debugLog.shift();

    const colors = {
      info: 'color:#00D4FF',
      success: 'color:#00FF88;font-weight:bold',
      warn: 'color:#FFD700',
      error: 'color:#FF4444',
      debug: 'color:#9B59B6'
    };

    const consoleFn = type === 'error' ? console.error : type === 'warn' ? console.warn : type === 'success' ? console.info : console.log;
    consoleFn(`%c[SpeechAPI ${timestamp}] ${message}`, colors[type] || colors.info);
  },

  // Build locale fallback chain
  // v7: bn-IN first because bn-BD always fails on Google servers
  buildLocaleChain(language) {
    const chains = {
      'bn-BD': ['bn-IN', 'bn-BD', 'en-US'],   // v7: bn-IN first!
      'bn': ['bn-IN', 'bn-BD', 'en-US'],       // v7: bn-IN first!
      'bn-IN': ['bn-IN', 'bn-BD', 'en-US'],
      'en-US': ['en-US', 'en-GB'],
      'en': ['en-US', 'en-GB']
    };
    return chains[language] || [language, 'en-US'];
  },

  init(language = 'en-US') {
    this.destroyed = false;
    this._switchingToGemini = false;
    this.localeFallbackChain = this.buildLocaleChain(language);
    this.localeIndex = 0;
    this.restartAttempts = 0;
    this.networkFailCount = 0;
    this.isOnlineMode = false;
    this.isLocalMode = false;
    this.useGemini = false;
    this.currentLanguage = language;
    this.lastDetectedText = '';
    this.browserSttGotResult = false;
    this.browserSttEverWorked = false;  // v7: reset on init
    this.geminiFailCount = 0;

    // Cleanup
    if (this.recognition) {
      this._switchingToGemini = true;  // suppress abort error
      try { this.recognition.abort(); } catch(e) {}
      this._switchingToGemini = false;
      this.recognition = null;
    }
    this._stopGeminiInterval();
    this._clearBrowserSttTimer();

    this.log(`🎤 Initializing Speech Recognition...`, 'info');
    this.log(`Locale fallback chain: ${this.localeFallbackChain.join(' → ')}`, 'debug');
    this.log(`Gemini API key configured: ${this.geminiApiKey ? 'YES' : 'NO'}`, 'debug');

    this._tryNextLocale();
    return { success: true, mode: 'browser' };
  },

  _clearBrowserSttTimer() {
    if (this.browserSttTimer) {
      clearTimeout(this.browserSttTimer);
      this.browserSttTimer = null;
    }
  },

  _startBrowserSttTimer() {
    // v7: Don't start the timer if browser STT has already produced results
    // It's working — don't switch to Gemini just because of a pause!
    if (this.browserSttEverWorked) {
      this.log(`⏱️ Browser STT is working — skipping Gemini fallback timer`, 'debug');
      return;
    }

    this._clearBrowserSttTimer();
    this.browserSttGotResult = false;

    this.browserSttTimer = setTimeout(() => {
      if (!this.browserSttGotResult && !this.useGemini && !this.isLocalMode && this.shouldRestart && !this.browserSttEverWorked) {
        this.log(`⏱️ Browser STT: No results after ${this.browserSttTimeout}ms — switching to Gemini`, 'warn');
        this._switchToGemini();
      }
    }, this.browserSttTimeout);
  },

  _tryNextLocale() {
    if (this.localeIndex >= this.localeFallbackChain.length) {
      this.log('🔌 All browser locales failed — switching to Gemini API...', 'warn');
      this._switchToGemini();
      return;
    }

    const locale = this.localeFallbackChain[this.localeIndex];
    this.log(`Trying locale: ${locale} (${this.localeIndex + 1}/${this.localeFallbackChain.length})`, 'info');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.log('⚠️ Browser SpeechRecognition not available.', 'warn');
      this._switchToGemini();
      return;
    }

    if (this.recognition) {
      this._switchingToGemini = true;  // suppress abort error during cleanup
      try { this.recognition.abort(); } catch(e) {}
      this._switchingToGemini = false;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = locale;
    this.recognition.maxAlternatives = 3;

    this.recognition.onresult = (event) => {
      this.lastResultTime = Date.now();
      this.restartAttempts = 0;
      this.networkFailCount = 0;
      this.browserSttGotResult = true;
      this.browserSttEverWorked = true;  // v7: mark as working!
      this._clearBrowserSttTimer();

      if (!this.isOnlineMode) {
        this.isOnlineMode = true;
        this.useGemini = false;
        this._stopGeminiInterval();
        this.log(`✅ Browser Speech Recognition ONLINE — locale: ${locale}`, 'success');
      }

      let finalTranscript = '';
      let interimTranscript = '';
      let confidence = 0;

      // Log ALL results and alternatives for debug
      this.log(`[DEBUG] onresult fired: resultIndex=${event.resultIndex}, results.length=${event.results.length}`, 'debug');

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        // Log each alternative
        for (let a = 0; a < result.length; a++) {
          this.log(`[DEBUG] alt[${a}]: "${result[a].transcript}" conf=${Math.round(result[a].confidence * 100)}% ${result.isFinal ? 'FINAL' : 'interim'}`, a === 0 ? 'debug' : 'debug');
        }

        if (result.isFinal) {
          finalTranscript += result[0].transcript;
          confidence = result[0].confidence;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      const text = finalTranscript || interimTranscript;
      if (text) {
        this.lastDetectedText = text;
        this.log(`🗣️ HEARD: "${text}" (confidence: ${Math.round((confidence || 0) * 100)}%, locale: ${locale}, final: ${!!finalTranscript}, charLen: ${text.length})`, 'success');

        // Extra debug: check if detected text looks like single phoneme characters
        if (text.length <= 2 && /[\u0980-\u09FF]/.test(text)) {
          this.log(`⚠️ WARNING: Detected text is very short (${text.length} chars) — this looks like a single Bengali phoneme, not a full word. Browser STT may not be working properly for Bengali.`, 'warn');
        }
      }

      if (this.onResult) {
        this.onResult({
          final: finalTranscript,
          interim: interimTranscript,
          confidence: confidence || 0.5,
          isFinal: !!finalTranscript,
          locale: locale,
          source: 'browser'
        });
      }

      this.resetSilenceTimeout();

      // v7: Restart the browser STT timer for next result (in case STT dies silently)
      // But only if it hasn't worked yet — once working, trust it
      // Actually, let's keep a "health check" timer that restarts if no result for 30s
      // But DON'T switch to Gemini — just restart the recognition
    };

    this.recognition.onerror = (event) => {
      const error = event.error;

      // v7: If we're switching to Gemini, "aborted" is expected — don't log as error
      if (error === 'aborted' && this._switchingToGemini) {
        this.log(`Recognition aborted (expected — switching to Gemini)`, 'debug');
        return;
      }

      // v7: If browser STT was working and we get "aborted", it's likely a
      // Chrome auto-stop — just restart, don't switch to Gemini
      if (error === 'aborted' && this.browserSttEverWorked) {
        this.log(`Recognition aborted (was working before — restarting browser STT)`, 'debug');
        if (this.shouldRestart && !this.destroyed) {
          setTimeout(() => this.doStart(), 300);
        }
        return;
      }

      this.log(`Error: ${error} (locale: ${locale}, message: ${event.message || 'none'})`, 'warn');

      if (error === 'not-allowed' || error === 'service-not-allowed') {
        this.shouldRestart = false;
        this.log('🚫 Microphone access denied.', 'error');
        if (this.onError) this.onError(error);
        return;
      }

      if (error === 'network') {
        this.networkFailCount++;
        this.log(`Network error with ${locale} (fail #${this.networkFailCount}) — trying next locale...`, 'warn');
        this.localeIndex++;
        if (this.shouldRestart) {
          setTimeout(() => this._tryNextLocale(), 500);
        }
        return;
      }

      if (error === 'no-speech') {
        this.log('No speech detected — still listening...', 'debug');
        // v7: Don't switch to Gemini on no-speech, it's normal
        return;
      }

      // v7: Only schedule restart for non-aborted errors
      // And DON'T switch to Gemini if browser STT was previously working
      if (error !== 'aborted') {
        if (this.shouldRestart) {
          this.scheduleRestart();
        }
      } else {
        // Aborted but NOT from our switch — might be Chrome auto-stop
        // Restart if we should be listening
        if (this.shouldRestart && !this.destroyed) {
          this.log(`Recognition was aborted — restarting...`, 'info');
          setTimeout(() => this.doStart(), 500);
        }
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onEnd) this.onEnd();

      // v7: If browser STT was working, always restart — never give up to Gemini
      if (this.shouldRestart && this.isOnlineMode && !this.isLocalMode && !this.destroyed && !this.useGemini) {
        this.scheduleRestart();
      }
    };

    this.useBrowserAPI = true;
    this.log(`🎤 Speech Recognition created with locale: ${locale}`, 'info');
  },

  // ============================================
  // Gemini API Fallback
  // Switches from browser STT to Gemini when browser fails
  // Records audio via AudioEngine's MediaRecorder and sends to Gemini
  // ============================================
  _switchToGemini() {
    // Try to get key from LexisConfig (localStorage)
    const key = this.geminiApiKey;

    if (!key) {
      // Prompt user to enter their key
      if (typeof LexisConfig !== 'undefined' && LexisConfig.ensureKey) {
        const got = LexisConfig.ensureKey();
        if (!got || !this.geminiApiKey) {
          this.log('⚠️ No Gemini API key — switching to local mode', 'warn');
          this.switchToLocalMode();
          return;
        }
      } else {
        this.log('⚠️ No Gemini API key — switching to local mode', 'warn');
        this.switchToLocalMode();
        return;
      }
    }

    this.log('🔮 Switching to Gemini API fallback...', 'info');
    this._switchingToGemini = true;  // v7: flag to suppress abort error
    this.useGemini = true;
    this.isOnlineMode = true;
    this.isLocalMode = false;
    this._clearBrowserSttTimer();

    // Stop browser STT
    if (this.recognition) {
      try { this.recognition.abort(); } catch(e) {}
    }
    this._switchingToGemini = false;  // v7: reset flag

    if (this.onError) {
      this.onError('gemini-mode');
    }

    this.log('✅ Gemini API mode ENABLED — audio will be transcribed via AI', 'success');
  },

  // Start periodic Gemini transcription
  _startGeminiInterval() {
    if (this.geminiInterval) return;
    this.log('🔮 Starting Gemini transcription interval (every 3s)', 'info');

    this.geminiInterval = setInterval(async () => {
      if (!this.shouldRestart || this.destroyed || this.geminiTranscribing) return;
      if (!this.geminiRecordingActive) return;

      // Collect audio chunks from AudioEngine
      if (AudioEngine && AudioEngine.isRecording && AudioEngine.recordedChunks.length > 0) {
        await this._transcribeWithGemini();
      }
    }, 3000);
  },

  _stopGeminiInterval() {
    if (this.geminiInterval) {
      clearInterval(this.geminiInterval);
      this.geminiInterval = null;
    }
  },

  // Transcribe audio using Gemini API
  async _transcribeWithGemini() {
    if (this.geminiTranscribing) return;

    this.geminiTranscribing = true;

    try {
      // Collect recorded audio chunks from AudioEngine
      if (!AudioEngine || !AudioEngine.recordedChunks || AudioEngine.recordedChunks.length === 0) {
        this.geminiTranscribing = false;
        return;
      }

      // Take a snapshot of current chunks and clear
      const chunks = [...AudioEngine.recordedChunks];
      AudioEngine.recordedChunks = [];

      const blob = new Blob(chunks, { type: 'audio/webm' });

      if (blob.size < 2000) {
        this.geminiTranscribing = false;
        return; // Too small, skip
      }

      this.log(`🔮 Sending ${Math.round(blob.size / 1024)}KB audio to Gemini...`, 'debug');

      // Convert to base64
      const base64Audio = await this._blobToBase64(blob);

      const langCode = this.currentLanguage.startsWith('bn') ? 'Bengali' : 'English';
      const prompt = `Transcribe the following audio in ${langCode}. Return ONLY the transcribed text, nothing else. If the audio is unclear or empty, return an empty string. Do not add any explanation or formatting.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: 'audio/webm',
                    data: base64Audio
                  }
                }
              ]
            }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 200
            }
          })
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        this.log(`Gemini API error: ${response.status} — ${errText.substring(0, 200)}`, 'error');

        this.geminiFailCount++;

        // If Gemini fails multiple times, fall back to local mode
        if (this.geminiFailCount >= this.maxGeminiFails) {
          this.log(`Gemini failed ${this.geminiFailCount} times — switching to local mode`, 'warn');
          this.useGemini = false;
          this._stopGeminiInterval();
          this.switchToLocalMode();
        }
        this.geminiTranscribing = false;
        return;
      }

      // Reset fail count on success
      this.geminiFailCount = 0;

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (text && text.length > 0) {
        this.lastDetectedText = text;
        this.log(`🔮 GEMINI HEARD: "${text}"`, 'success');

        if (this.onResult) {
          this.onResult({
            final: text,
            interim: '',
            confidence: 0.85,
            isFinal: true,
            locale: this.currentLanguage,
            source: 'gemini'
          });
        }
      } else {
        this.log('Gemini: No speech detected in audio chunk', 'debug');
      }

    } catch (e) {
      this.log(`Gemini transcription error: ${e.message}`, 'error');
      this.geminiFailCount++;
      if (this.geminiFailCount >= this.maxGeminiFails) {
        this.useGemini = false;
        this._stopGeminiInterval();
        this.switchToLocalMode();
      }
    }

    this.geminiTranscribing = false;
  },

  // Convert blob to base64
  _blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  },

  switchToLocalMode() {
    this.isLocalMode = true;
    this.isOnlineMode = false;
    this.useGemini = false;
    this.shouldRestart = false;
    this._stopGeminiInterval();
    this._clearBrowserSttTimer();

    if (this.recognition) {
      this._switchingToGemini = true;
      try { this.recognition.abort(); } catch(e) {}
      this._switchingToGemini = false;
    }

    this.log('🔴 ONLINE Speech Recognition: DISABLED', 'info');
    this.log('🟢 LOCAL Audio Analysis Mode: ENABLED', 'success');
    this.log('Mode: Mic captures audio → Formant analysis → Phoneme scoring', 'info');
    this.log('This works 100% offline — no servers needed!', 'info');

    if (this.onError) {
      this.onError('local-mode');
    }
  },

  start() {
    this.destroyed = false;

    if (this.isLocalMode) {
      this.isListening = true;
      this.shouldRestart = true;
      this.log('🎙️ Local audio mode active — speak into your mic', 'info');
      return;
    }

    if (this.useGemini) {
      this.isListening = true;
      this.shouldRestart = true;
      this.geminiRecordingActive = true;
      this._startGeminiInterval();
      this.log('🔮 Gemini mode active — speak into your mic', 'info');
      return;
    }

    this.shouldRestart = true;
    this.restartAttempts = 0;
    this.doStart();
    this.resetSilenceTimeout();

    // Start browser STT timeout — if no results, switch to Gemini
    // v7: Timer only fires if browser STT has NEVER produced a result
    this._startBrowserSttTimer();
  },

  stop() {
    this.shouldRestart = false;
    this.destroyed = true;
    this._switchingToGemini = true;  // v7: suppress abort error on manual stop
    this._stopGeminiInterval();
    this._clearBrowserSttTimer();
    this.geminiRecordingActive = false;

    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
      this.silenceTimeout = null;
    }
    if (this.recognition) {
      try { this.recognition.abort(); } catch (e) {}
    }
    this._switchingToGemini = false;
    this.isListening = false;
    this.log('⏹️ Speech recognition stopped', 'info');
  },

  doStart() {
    if (!this.recognition || this.destroyed) return;

    try {
      this.recognition.start();
      this.isListening = true;
      this.lastResultTime = Date.now();
      this.log(`🎤 Listening... (locale: ${this.recognition.lang})`, 'info');
    } catch (e) {
      if (e.message && e.message.includes('already started')) {
        this.isListening = true;
        return;
      }
      this.log(`Start error: ${e.message}`, 'error');

      if (this.shouldRestart && this.restartAttempts < this.maxRestartAttempts) {
        setTimeout(() => this.doStart(), 1000);
      }
    }
  },

  scheduleRestart() {
    if (this.restartAttempts >= this.maxRestartAttempts) {
      this.log(`Max restart attempts reached (${this.maxRestartAttempts}). Stopping.`, 'warn');
      return;
    }

    this.restartAttempts++;
    const delay = this.restartDelay * this.restartAttempts;

    this.log(`Restarting in ${delay}ms (attempt ${this.restartAttempts}/${this.maxRestartAttempts})...`, 'info');

    setTimeout(() => {
      if (this.shouldRestart && !this.isListening && !this.isLocalMode && !this.destroyed && !this.useGemini) {
        this.doStart();
      }
    }, delay);
  },

  resetSilenceTimeout() {
    if (this.silenceTimeout) clearTimeout(this.silenceTimeout);
    if (this.shouldRestart && this.isOnlineMode) {
      // v7: Increased silence timeout from 10s to 15s
      // Also, if browser STT was working, just restart — don't give up
      this.silenceTimeout = setTimeout(() => {
        if (this.shouldRestart && Date.now() - this.lastResultTime > 15000 && !this.destroyed) {
          this.log('Silence timeout — restarting recognition...', 'info');
          if (this.recognition) {
            try { this.recognition.abort(); } catch(e) {}
            setTimeout(() => this.doStart(), 500);
          }
        }
      }, 15000);
    }
  },

  setLanguage(lang) {
    // v7: bn maps to bn-IN first (not bn-BD which always fails)
    const langMap = { 'en': 'en-US', 'bn': 'bn-IN' };
    this.currentLanguage = langMap[lang] || lang;
    this.localeFallbackChain = this.buildLocaleChain(this.currentLanguage);
    this.localeIndex = 0;

    if (!this.isLocalMode && !this.useGemini) {
      this.init(this.currentLanguage);
    }
    this.log(`Language set to ${this.currentLanguage} (chain: ${this.localeFallbackChain.join(' → ')})`, 'info');
  },

  // Feed audio data for Gemini transcription
  feedAudioChunk(chunk) {
    if (this.useGemini && chunk && chunk.size > 0) {
      this.audioChunks.push(chunk);
    }
  },

  getDebugInfo() {
    return {
      mode: this.isLocalMode ? 'LOCAL AUDIO' : (this.useGemini ? 'GEMINI API' : (this.isOnlineMode ? 'BROWSER STT' : 'CONNECTING...')),
      locale: this.recognition?.lang || 'none',
      localeChain: this.localeFallbackChain,
      currentLocaleIndex: this.localeIndex,
      isListening: this.isListening,
      networkFails: this.networkFailCount,
      restartAttempts: this.restartAttempts,
      lastDetectedText: this.lastDetectedText,
      geminiEnabled: this.useGemini,
      geminiFailCount: this.geminiFailCount,
      browserSttGotResult: this.browserSttGotResult,
      browserSttEverWorked: this.browserSttEverWorked,
      recentLogs: this.debugLog.slice(-15)
    };
  },

  // ============================================
  // Text comparison utility for word-level matching
  // Supports both English and Bengali
  // ============================================
  compareTexts(spoken, target) {
    const normalize = (text) => text.toLowerCase()
      .replace(/[^a-zA-Z\u0980-\u09FF\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const normalizedSpoken = normalize(spoken);
    const normalizedTarget = normalize(target);

    // Exact match
    if (normalizedSpoken === normalizedTarget) {
      return { score: 100, correct: 1, total: 1, match: true, spokenText: spoken, targetText: target };
    }

    // Spoken contains target
    if (normalizedSpoken.includes(normalizedTarget)) {
      return { score: 90, correct: 1, total: 1, match: true, spokenText: spoken, targetText: target };
    }

    // Target contains spoken
    if (normalizedTarget.includes(normalizedSpoken)) {
      return { score: 75, correct: 1, total: 1, match: true, spokenText: spoken, targetText: target };
    }

    // Word-by-word comparison
    const spokenWords = normalizedSpoken.split(' ').filter(w => w);
    const targetWords = normalizedTarget.split(' ').filter(w => w);

    let correct = 0;
    const results = [];

    for (let i = 0; i < targetWords.length; i++) {
      const isCorrect = spokenWords[i] === targetWords[i];
      if (isCorrect) correct++;
      results.push({
        target: targetWords[i],
        spoken: spokenWords[i] || '',
        correct: isCorrect
      });
    }

    const wordScore = targetWords.length > 0 ? Math.round((correct / targetWords.length) * 100) : 0;
    const match = wordScore >= 50;

    return { score: wordScore, correct, total: targetWords.length, match, results, spokenText: spoken, targetText: target };
  }
};
