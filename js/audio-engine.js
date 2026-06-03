// ============================================
// LexisAI — Audio Engine v3 (Web Audio API)
// Real-time waveform & spectrogram visualization
// Enhanced local-mode phoneme scoring for offline use
// ============================================

const AudioEngine = {
  audioContext: null,
  analyser: null,
  microphone: null,
  stream: null,
  isRecording: false,
  waveformData: null,
  frequencyData: null,
  animationFrame: null,
  mediaRecorder: null,
  recordedChunks: [],
  onAudioData: null,

  // Local mode: voice detection and phoneme scoring
  localModeActive: false,
  voiceDetected: false,
  voiceStartTimer: 0,
  lastPhonemeScore: null,
  continuousFormantBuffer: [],
  formantBufferSize: 10,

  // Canvas references for resize
  _waveformCanvas: null,
  _spectrogramCanvas: null,
  _resizeObserver: null,

  async init() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });

      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.85;

      this.microphone = this.audioContext.createMediaStreamSource(this.stream);
      this.microphone.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      this.waveformData = new Uint8Array(bufferLength);
      this.frequencyData = new Uint8Array(bufferLength);

      this.setupRecorder();

      console.log('%c🔊 AudioEngine initialized — mic ready', 'color:#00FF88;font-weight:bold;');
      return { success: true };
    } catch (err) {
      console.error('AudioEngine init error:', err);
      return { error: err.message };
    }
  },

  setupRecorder() {
    const options = { mimeType: 'audio/webm;codecs=opus' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = 'audio/webm';
    }
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = '';
    }

    this.mediaRecorder = new MediaRecorder(this.stream, options);
    this.recordedChunks = [];

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.recordedChunks.push(e.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
      if (blob.size > 0) {
        this.onRecordingComplete(blob);
      }
    };
  },

  onRecordingComplete(blob) {
    console.log('Recording complete:', blob.size, 'bytes');
  },

  startRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'inactive') {
      this.recordedChunks = [];
      this.mediaRecorder.start(100);
    }
    this.isRecording = true;
  },

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
    this.isRecording = false;
  },

  startVisualization(waveformCanvas, spectrogramCanvas) {
    this._waveformCanvas = waveformCanvas;
    this._spectrogramCanvas = spectrogramCanvas;

    // Fix: Use willReadFrequently ONLY for spectrogram (it uses getImageData)
    // Waveform doesn't need it and it causes console warnings
    const wfCtx = waveformCanvas?.getContext('2d');
    const sgCtx = spectrogramCanvas?.getContext('2d', { willReadFrequently: true });

    // Resize canvases to match their CSS size
    this._resizeCanvases();

    // Setup ResizeObserver for responsive canvas
    if (window.ResizeObserver && !this._resizeObserver) {
      this._resizeObserver = new ResizeObserver(() => {
        this._resizeCanvases();
      });
      if (waveformCanvas?.parentElement) this._resizeObserver.observe(waveformCanvas.parentElement);
      if (spectrogramCanvas?.parentElement && spectrogramCanvas.parentElement !== waveformCanvas?.parentElement) {
        this._resizeObserver.observe(spectrogramCanvas.parentElement);
      }
    }

    let spectrogramOffset = 0;
    let frameCount = 0;

    const draw = () => {
      this.animationFrame = requestAnimationFrame(draw);

      if (!this.analyser) return;

      this.analyser.getByteTimeDomainData(this.waveformData);
      this.analyser.getByteFrequencyData(this.frequencyData);

      // Send data to callback (throttle to ~30fps for callback to reduce spam)
      frameCount++;
      if (this.onAudioData && frameCount % 2 === 0) {
        this.onAudioData({
          waveform: this.waveformData,
          frequency: this.frequencyData,
          volume: this.getVolume(),
          pitch: this.estimatePitch(),
          formants: this.getFormants()
        });
      }

      // Draw waveform
      if (wfCtx) {
        this.drawWaveform(wfCtx, waveformCanvas);
      }

      // Draw spectrogram
      if (sgCtx) {
        this.drawSpectrogram(sgCtx, spectrogramCanvas, spectrogramOffset);
        spectrogramOffset++;
      }
    };

    draw();
  },

  _resizeCanvases() {
    [this._waveformCanvas, this._spectrogramCanvas].forEach(canvas => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height) || 120;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.scale(dpr, dpr);
      }
    });
  },

  stopVisualization() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
  },

  drawWaveform(ctx, canvas) {
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(10, 10, 30, 0.3)';
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 2.5;

    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#00d4ff');
    gradient.addColorStop(0.5, '#7b2ff7');
    gradient.addColorStop(1, '#ff2d95');
    ctx.strokeStyle = gradient;

    ctx.beginPath();

    const bufferLength = this.analyser.frequencyBinCount;
    const sliceWidth = width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = this.waveformData[i] / 128.0;
      const y = (v * height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
  },

  drawSpectrogram(ctx, canvas, offset) {
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const bufferLength = this.analyser.frequencyBinCount;

    // Shift existing image to the left
    try {
      const imageData = ctx.getImageData(1, 0, Math.max(1, width - 1), height);
      ctx.putImageData(imageData, 0, 0);
    } catch(e) {}

    // Draw new column on the right
    for (let i = 0; i < height; i++) {
      const dataIndex = Math.floor((i / height) * bufferLength);
      const value = this.frequencyData[dataIndex];

      const r = Math.min(255, value * 2);
      const g = Math.min(255, Math.max(0, value - 128) * 2);
      const b = Math.min(255, Math.max(0, value - 200) * 3);

      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(width - 1, height - i, 1, 1);
    }
  },

  getVolume() {
    if (!this.analyser || !this.waveformData) return 0;
    let sum = 0;
    for (let i = 0; i < this.waveformData.length; i++) {
      const val = (this.waveformData[i] - 128) / 128;
      sum += val * val;
    }
    return Math.sqrt(sum / this.waveformData.length);
  },

  estimatePitch() {
    if (!this.analyser || !this.frequencyData) return 0;

    const bufferLength = this.frequencyData.length;
    let maxVal = 0;
    let maxIndex = 0;

    for (let i = 0; i < bufferLength; i++) {
      if (this.frequencyData[i] > maxVal) {
        maxVal = this.frequencyData[i];
        maxIndex = i;
      }
    }

    if (maxVal < 20) return 0;
    const nyquist = this.audioContext.sampleRate / 2;
    return (maxIndex / bufferLength) * nyquist;
  },

  // ============================================
  // Formant analysis for phoneme detection
  // ============================================
  getFormants() {
    if (!this.analyser || !this.frequencyData) return [];

    const sampleRate = this.audioContext.sampleRate;
    const binSize = sampleRate / this.analyser.fftSize;

    const peaks = [];
    const threshold = 25;

    for (let i = 1; i < this.frequencyData.length - 1; i++) {
      const prev = this.frequencyData[i - 1];
      const curr = this.frequencyData[i];
      const next = this.frequencyData[i + 1];

      if (curr > prev && curr > next && curr > threshold) {
        peaks.push({
          frequency: i * binSize,
          amplitude: curr
        });
      }
    }

    peaks.sort((a, b) => b.amplitude - a.amplitude);
    return peaks.slice(0, 4);
  },

  getStableFormants() {
    const current = this.getFormants();
    if (current.length === 0) return [];

    this.continuousFormantBuffer.push(current);
    if (this.continuousFormantBuffer.length > this.formantBufferSize) {
      this.continuousFormantBuffer.shift();
    }

    if (this.continuousFormantBuffer.length < 3) return current;

    const avgFormants = [];
    const maxLen = Math.max(...this.continuousFormantBuffer.map(f => f.length));

    for (let i = 0; i < Math.min(4, maxLen); i++) {
      let freqSum = 0;
      let ampSum = 0;
      let count = 0;

      for (const frame of this.continuousFormantBuffer) {
        if (frame[i]) {
          freqSum += frame[i].frequency;
          ampSum += frame[i].amplitude;
          count++;
        }
      }

      if (count > 0) {
        avgFormants.push({
          frequency: freqSum / count,
          amplitude: ampSum / count
        });
      }
    }

    return avgFormants;
  },

  // ============================================
  // Phoneme scoring based on formant comparison
  // ============================================
  scorePhoneme(targetPhoneme, userFormants) {
    const phonemeBases = this.getPhonemeBases();
    const target = phonemeBases[targetPhoneme];

    if (!target) {
      const keys = Object.keys(phonemeBases);
      const match = keys.find(k => k.toLowerCase() === targetPhoneme.toLowerCase());
      if (match) {
        return this._doScorePhoneme(phonemeBases[match], userFormants, targetPhoneme);
      }
      return { score: 0, level: 'try_again', feedback: 'Unknown phoneme — no reference data' };
    }

    return this._doScorePhoneme(target, userFormants, targetPhoneme);
  },

  _doScorePhoneme(target, userFormants, targetName) {
    let score = 100;
    const details = [];

    const formants = (userFormants.length > 0) ? userFormants : this.getStableFormants();

    if (formants.length === 0) {
      return { score: 0, level: 'try_again', feedback: 'No voice detected — speak louder' };
    }

    let matchedFormants = 0;
    for (let i = 0; i < Math.min(target.formants.length, formants.length); i++) {
      const userFreq = formants[i].frequency;
      const targetFreq = target.formants[i];
      const diff = Math.abs(targetFreq - userFreq);
      const tolerance = targetFreq * 0.25;

      if (diff <= tolerance) {
        matchedFormants++;
        details.push(`F${i + 1}: ${Math.round(userFreq)}Hz ✓`);
      } else {
        const penalty = Math.min(25, (diff / tolerance) * 12);
        score -= penalty;
        details.push(`F${i + 1}: ${Math.round(userFreq)}Hz (target: ${targetFreq}Hz)`);
      }
    }

    if (matchedFormants >= 2 && target.formants.length >= 2) {
      score = Math.min(100, score + 5);
    }

    score = Math.max(0, Math.round(score));

    let level;
    if (score >= 90) level = 'excellent';
    else if (score >= 75) level = 'good';
    else if (score >= 50) level = 'fair';
    else level = 'try_again';

    const feedback = matchedFormants >= target.formants.length
      ? `Good formant match! (${details.slice(0, 2).join(', ')})`
      : details.slice(0, 2).join(', ');

    return { score, level, feedback, matchedFormants, totalFormants: target.formants.length };
  },

  // ============================================
  // Detect if user is speaking
  // ============================================
  detectVoiceActivity() {
    const volume = this.getVolume();
    const wasVoice = this.voiceDetected;

    if (volume > 0.04 && !this.voiceDetected) {
      this.voiceDetected = true;
      this.voiceStartTimer = Date.now();
      this.continuousFormantBuffer = [];
      return { started: true, volume };
    }

    if (volume < 0.02 && this.voiceDetected) {
      const duration = Date.now() - this.voiceStartTimer;
      this.voiceDetected = false;
      return { ended: true, duration, volume };
    }

    return { active: this.voiceDetected, volume };
  },

  analyzeLocalPhoneme(targetPhoneme) {
    const formants = this.getStableFormants();
    if (formants.length < 1) {
      return { score: 0, level: 'try_again', feedback: 'No voice detected' };
    }
    return this.scorePhoneme(targetPhoneme, formants);
  },

  // ============================================
  // Detect the CLOSEST phoneme from formant data
  // This tells us WHAT the user actually said,
  // not just how well they matched a target
  // ============================================
  detectClosestPhoneme(userFormants, language = 'en') {
    const phonemeBases = this.getPhonemeBases();
    const formants = (userFormants && userFormants.length > 0) ? userFormants : this.getStableFormants();

    if (formants.length < 2) {
      return { phoneme: '?', score: 0, confidence: 0 };
    }

    let bestMatch = '';
    let bestScore = 0;
    const scores = {};

    for (const [phoneme, data] of Object.entries(phonemeBases)) {
      // Filter by language if possible
      const isBengali = /[\u0980-\u09FF]/.test(phoneme);
      if (language === 'bn' && !isBengali) continue;
      if (language === 'en' && isBengali) continue;

      const result = this._doScorePhoneme(data, formants, phoneme);
      scores[phoneme] = result.score;

      if (result.score > bestScore) {
        bestScore = result.score;
        bestMatch = phoneme;
      }
    }

    return {
      phoneme: bestMatch,
      score: bestScore,
      confidence: bestScore / 100,
      allScores: scores
    };
  },

  // ============================================
  // Base formant frequencies for phonemes
  // ============================================
  getPhonemeBases() {
    return {
      // English vowels
      'ah': { formants: [730, 1090, 2440], example: 'father' },
      'ee': { formants: [270, 2290, 3010], example: 'see' },
      'ih': { formants: [390, 1990, 2550], example: 'sit' },
      'eh': { formants: [530, 1840, 2480], example: 'bed' },
      'ae': { formants: [660, 1720, 2410], example: 'cat' },
      'oo': { formants: [300, 870, 2240], example: 'boot' },
      'uh': { formants: [520, 1190, 2390], example: 'book' },
      'oh': { formants: [570, 840, 2410], example: 'boat' },
      'aw': { formants: [580, 840, 2210], example: 'caught' },
      'er': { formants: [490, 1350, 1690], example: 'bird' },

      // English consonants
      's':  { formants: [4000, 5500, 7000], example: 'sun' },
      'sh': { formants: [2000, 3500, 5000], example: 'ship' },
      'f':  { formants: [1500, 3500, 5500], example: 'fun' },
      'th': { formants: [1000, 2500, 4500], example: 'think' },
      'r':  { formants: [350, 1300, 1700], example: 'run' },
      'l':  { formants: [350, 1100, 2800], example: 'light' },
      'm':  { formants: [250, 1000, 2200], example: 'mom' },
      'n':  { formants: [250, 1400, 2400], example: 'no' },
      'k':  { formants: [300, 1500, 2500], example: 'kit' },
      'p':  { formants: [300, 1500, 2800], example: 'pat' },

      // Bangla vowels
      'আ': { formants: [700, 1100, 2500], example: 'আম' },
      'ই': { formants: [280, 2300, 3100], example: 'ইতি' },
      'উ': { formants: [310, 870, 2250], example: 'উপর' },
      'এ': { formants: [540, 1850, 2500], example: 'এক' },
      'ও': { formants: [560, 850, 2400], example: 'ওঝা' },
      'অ্যা': { formants: [650, 1200, 2500], example: 'অ্যাপেল' },
      'ঐ': { formants: [400, 1800, 2600], example: 'ঐক্য' },
      'ঔ': { formants: [400, 900, 2300], example: 'ঔষধ' },

      // Bangla consonants
      'ক':  { formants: [300, 1500, 2500], example: 'কর' },
      'খ':  { formants: [350, 1600, 2600], example: 'খাও' },
      'গ':  { formants: [300, 1400, 2500], example: 'গাছ' },
      'ঘ':  { formants: [320, 1450, 2550], example: 'ঘর' },
      'ট':  { formants: [350, 1800, 2700], example: 'টাকা' },
      'ঠ':  { formants: [380, 1900, 2800], example: 'ঠাকুর' },
      'ড':  { formants: [340, 1700, 2600], example: 'ডাক' },
      'ত':  { formants: [330, 1600, 2500], example: 'তারা' },
      'দ':  { formants: [320, 1550, 2500], example: 'দিন' },
      'র':  { formants: [350, 1300, 1700], example: 'রাত' },
      'শ':  { formants: [2000, 3500, 5000], example: 'শুরু' },
      'ষ':  { formants: [2100, 3600, 5100], example: 'ষড়' },
      'স':  { formants: [4000, 5500, 7000], example: 'সূর্য' },
      'ল':  { formants: [350, 1100, 2800], example: 'লাল' },
      'ম':  { formants: [250, 1000, 2200], example: 'মাছ' },
      'ন':  { formants: [250, 1400, 2400], example: 'নদী' }
    };
  },

  destroy() {
    this.stopRecording();
    this.stopVisualization();
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
};
