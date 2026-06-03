// ============================================
// LexisAI — Game Engine v2
// Clear, intuitive speech therapy games
// Each game: shows target → listens → scores → advances
// ============================================

// Polyfill for roundRect
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii) {
    const r = typeof radii === 'number' ? radii : (radii?.[0] || 0);
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
  };
}

const GameEngine = {
  currentGame: null,
  canvas: null,
  ctx: null,
  gameLoop: null,
  score: 0,
  level: 1,
  isKidMode: false,
  language: 'en',
  onVoiceTrigger: null,
  currentPhoneme: '',
  currentTarget: '',
  isActive: false,
  attempts: [],
  roundResults: [],

  // Expanded word lists
  wordPools: {
    en: {
      phonemes: ['ah', 'ee', 'oo', 'oh', 'uh', 'ih', 'eh', 'ae', 'er', 'aw'],
      vowels: ['ah', 'ee', 'oo', 'oh', 'uh'],
      consonants: ['s', 'sh', 'f', 'th', 'r', 'l', 'm', 'n', 'k', 'p'],
      easyWords: ['cat', 'dog', 'sun', 'moon', 'star', 'fish', 'ball', 'cup', 'hat', 'red', 'big', 'run', 'jump', 'play', 'tree', 'book', 'car', 'bus', 'pen', 'map'],
      mediumWords: ['apple', 'banana', 'orange', 'purple', 'yellow', 'garden', 'window', 'silver', 'mirror', 'castle', 'bridge', 'planet', 'rocket', 'dragon', 'forest'],
      hardWords: ['elephant', 'butterfly', 'adventure', 'beautiful', 'chocolate', 'dangerous', 'excellent', 'furniture', 'happiness', 'important'],
      sentences: ['The cat sat on the mat', 'I see a big star', 'Hello my friend', 'The sun is bright', 'I like to play', 'Red ball blue ball'],
      tongueTwisters: ['She sells seashells', 'Red lorry yellow lorry', 'Peter Piper picked a peck', 'How much wood would a woodchuck chuck', 'Unique New York unique New York']
    },
    bn: {
      phonemes: ['আ', 'ই', 'উ', 'এ', 'ও', 'অ্যা', 'ঐ', 'ঔ'],
      vowels: ['আ', 'ই', 'উ', 'এ', 'ও'],
      consonants: ['ক', 'খ', 'গ', 'ঘ', 'ট', 'ঠ', 'ড', 'ত', 'দ', 'র', 'শ', 'ষ', 'স', 'ল', 'ম', 'ন'],
      easyWords: ['বাড়ি', 'গাছ', 'ফুল', 'পাখি', 'জল', 'মাছ', 'ভাত', 'দুধ', 'কুকুর', 'বিড়াল', 'সূর্য', 'চাঁদ', 'তারা', 'আকাশ', 'নদী', 'মাঠ', 'বই', 'কলম', 'গাড়ি', 'বাস'],
      mediumWords: ['আপেল', 'কলা', 'কমলা', 'বাগান', 'জানালা', 'আয়না', 'দুর্গ', 'সেতু', 'গ্রহ', 'মহাকাশ', 'বন্য', 'নদী', 'পাহাড়', 'সমুদ্র', 'মেঘ'],
      hardWords: ['হাতি', 'প্রজাপতি', 'অভিযান', 'সুন্দর', 'উচ্চারণ', 'অভ্যাস', 'শক্তি', 'বিকাশ', 'শিক্ষা', 'সংস্কৃতি'],
      sentences: ['বিড়াল বসে আছে মাদুরে', 'আমি একটা তারা দেখছি', 'সূর্য অনেক উজ্জ্বল', 'আমি খেলতে ভালোবাসি', 'লাল বল নীল বল'],
      tongueTwisters: ['কাঠাল গাছে কাঁঠাল', 'চাঁদের হাটে চাঁদ', 'পিঁপড়া পিঁপড়া পা পা']
    }
  },

  init(canvasId, isKid, language) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.isKidMode = isKid;
    this.language = language;
    this.score = 0;
    this.level = 1;
    this.attempts = [];
    this.roundResults = [];
    this.isActive = false;

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  },

  resizeCanvas() {
    if (!this.canvas) return;
    const container = this.canvas.parentElement;
    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientHeight;
  },

  // Get words for current level
  getWordsForLevel() {
    const pool = this.wordPools[this.language] || this.wordPools.en;
    if (this.level <= 2) return pool.easyWords;
    if (this.level <= 4) return pool.mediumWords;
    return pool.hardWords;
  },

  // Get phonemes for current level
  getPhonemesForLevel() {
    const pool = this.wordPools[this.language] || this.wordPools.en;
    if (this.level <= 2) return pool.vowels;
    if (this.level <= 4) return pool.vowels.concat(pool.consonants.slice(0, 3));
    return pool.phonemes.concat(pool.consonants);
  },

  // Get next target (used by external speech system)
  getCurrentTarget() {
    return this.currentTarget;
  },

  // Report a speech result to the game
  reportSpeechResult(spokenText, confidence, phoneticScore) {
    if (!this.isActive) return;

    const result = {
      target: this.currentTarget,
      spoken: spokenText,
      confidence: confidence,
      phoneticScore: phoneticScore,
      timestamp: Date.now()
    };

    this.attempts.push(result);
    this.handleResult(result);
  },

  // Handle the result in the current game context
  handleResult(result) {
    // Override in each game
  },

  // ============================================
  // Game 1: Syllable Jump
  // A character runs forward. Obstacles appear with phonemes.
  // Say the phoneme to jump. Correct pronunciation = clear jump.
  // Wrong pronunciation = weak jump (may hit obstacle).
  // ============================================
  startSyllableJump(onScoreUpdate, onLevelComplete) {
    const self = this;
    const canvas = this.canvas;
    const ctx = this.ctx;
    self.isActive = true;
    self.score = 0;
    self.level = 1;
    self.attempts = [];

    const phonemeList = self.getPhonemesForLevel();

    const character = {
      x: 80,
      y: 0,
      width: self.isKidMode ? 60 : 40,
      height: self.isKidMode ? 60 : 40,
      velocityY: 0,
      isJumping: false,
      jumpForce: -16,
      gravity: 0.7,
      color: self.isKidMode ? '#FF6B9D' : '#00D4FF',
      trail: [],
      expression: 'normal', // normal, happy, sad
      squash: 1.0, // squash/stretch factor for kid mode
      landingTimer: 0
    };

    const obstacles = [];
    let obstacleTimer = 0;
    let obstacleInterval = 150;
    let speed = 2.5;
    let groundY = canvas.height - 60;
    character.y = groundY - character.height;

    let currentObstacle = null;
    let waitingForSpeech = false;
    const particles = [];
    const sparkles = []; // Sparkle trail particles for kid mode
    const bgClouds = []; // Background clouds/stars for kid mode

    // Initialize floating clouds/stars for kid mode
    if (self.isKidMode) {
      for (let i = 0; i < 8; i++) {
        bgClouds.push({
          x: Math.random() * canvas.width,
          y: 30 + Math.random() * (groundY - 100),
          size: 15 + Math.random() * 25,
          speed: 0.2 + Math.random() * 0.4,
          type: Math.random() > 0.5 ? 'cloud' : 'star',
          alpha: 0.15 + Math.random() * 0.2
        });
      }
    }

    // Feedback overlay
    let feedbackText = '';
    let feedbackColor = '';
    let feedbackTimer = 0;
    let comboCount = 0;

    function spawnObstacle() {
      const phoneme = phonemeList[Math.floor(Math.random() * phonemeList.length)];
      const obs = {
        x: canvas.width + 20,
        y: groundY - 50,
        width: 40,
        height: 50,
        phoneme: phoneme,
        passed: false,
        hit: false,
        glow: 1.0
      };
      obstacles.push(obs);
      currentObstacle = obs;
      waitingForSpeech = true;

      // Update external target display
      self.currentTarget = phoneme;
      self.currentPhoneme = phoneme;

      // Update target display in HTML
      const targetEl = document.getElementById('targetPhoneme');
      const targetWrap = document.getElementById('targetDisplay');
      if (targetEl) targetEl.textContent = phoneme;
      if (targetWrap) targetWrap.style.display = 'block';
    }

    function addParticle(x, y, color, count = 8) {
      for (let i = 0; i < count; i++) {
        particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6 - 2,
          life: 30,
          maxLife: 30,
          color: color || '#FFD700',
          size: Math.random() * 4 + 2
        });
      }
    }

    function jump(strength) {
      if (!character.isJumping) {
        character.velocityY = character.jumpForce * strength;
        character.isJumping = true;
        addParticle(character.x, character.y + character.height, '#7B2FF7', 5);
        // Sparkle burst when jumping in kid mode
        if (self.isKidMode) {
          for (let s = 0; s < 6; s++) {
            sparkles.push({
              x: character.x + character.width / 2,
              y: character.y + character.height,
              vx: (Math.random() - 0.5) * 3,
              vy: Math.random() * 2 + 1,
              life: 25,
              maxLife: 25,
              size: 3 + Math.random() * 4,
              color: ['#FFD700', '#FF69B4', '#00CED1', '#FF6B6B'][Math.floor(Math.random() * 4)]
            });
          }
        }
      }
    }

    function showFeedback(text, color) {
      feedbackText = text;
      feedbackColor = color;
      feedbackTimer = 60; // Show for ~1 second at 60fps
    }

    // External voice trigger handler
    self.onVoiceTrigger = function() {
      if (waitingForSpeech && currentObstacle && !currentObstacle.passed) {
        jump(1.0); // Full jump on any voice
      }
    };

    // Handle speech result - THIS IS THE KEY CONNECTION
    self.handleResult = function(result) {
      if (!waitingForSpeech || !currentObstacle || currentObstacle.passed) return;

      const target = currentObstacle.phoneme;
      const spoken = result.spoken;
      const score = result.phoneticScore || Math.round(result.confidence * 100);

      // Use SpeechAPI.compareTexts for proper word-level matching
      // Falls back to simple includes check if compareTexts not available
      let isMatch = false;
      if (typeof SpeechAPI !== 'undefined' && SpeechAPI.compareTexts) {
        const comparison = SpeechAPI.compareTexts(spoken, target);
        isMatch = comparison.match;
      } else {
        const spokenLower = spoken.toLowerCase().trim();
        const targetLower = target.toLowerCase();
        if (spokenLower === targetLower || spokenLower.includes(targetLower) || targetLower.includes(spokenLower)) {
          isMatch = true;
        }
      }

      if (isMatch && score >= 50) {
        // Good pronunciation - successful jump
        currentObstacle.passed = true;
        currentObstacle.glow = 2.0;
        comboCount++;

        const points = Math.round(10 * (score / 100)) + (comboCount > 3 ? 5 : 0);
        self.score += points;

        character.expression = 'happy';
        jump(score >= 80 ? 1.0 : 0.7);

        if (score >= 90) {
          showFeedback(self.isKidMode ? '🌟 Perfect!' : 'Perfect!', '#00FF88');
          addParticle(currentObstacle.x, currentObstacle.y, '#00FF88', 15);
        } else if (score >= 70) {
          showFeedback(self.isKidMode ? '✨ Great!' : 'Great!', '#00D4FF');
          addParticle(currentObstacle.x, currentObstacle.y, '#00D4FF', 10);
        } else {
          showFeedback(self.isKidMode ? '👍 Good!' : 'Good', '#FFD700');
          addParticle(currentObstacle.x, currentObstacle.y, '#FFD700', 6);
        }

        waitingForSpeech = false;
      } else if (isMatch && score < 50) {
        // Weak pronunciation - weak jump
        jump(0.4);
        comboCount = 0;
        character.expression = 'normal';
        showFeedback(self.isKidMode ? '🔄 Try louder!' : 'Try again, speak clearly', '#FFD700');
      } else {
        // Wrong word or no match
        comboCount = 0;
        character.expression = 'sad';
        showFeedback(self.isKidMode ? '❌ Say: ' + target : 'Say: ' + target, '#FF4444');
      }

      if (onScoreUpdate) onScoreUpdate(self.score);

      // Level up every 80 points
      if (self.score >= self.level * 80) {
        self.level++;
        speed = Math.min(6, 2.5 + self.level * 0.4);
        obstacleInterval = Math.max(80, 150 - self.level * 10);
        if (onLevelComplete) onLevelComplete(self.level);
      }
    };

    function update() {
      // Character physics
      character.velocityY += character.gravity;
      character.y += character.velocityY;

      if (character.y >= groundY - character.height) {
        character.y = groundY - character.height;
        character.velocityY = 0;
        // Squash and stretch on landing for kid mode
        if (character.isJumping && self.isKidMode) {
          character.squash = 0.6; // Squash on impact
          character.landingTimer = 12;
        }
        character.isJumping = false;
        if (character.expression !== 'normal') {
          setTimeout(() => { character.expression = 'normal'; }, 300);
        }
      }

      // Animate squash back to normal
      if (character.landingTimer > 0) {
        character.landingTimer--;
        character.squash = 0.6 + 0.4 * (1 - character.landingTimer / 12);
        if (character.landingTimer <= 0) {
          character.squash = 1.0;
        }
      }

      // Sparkle trail for kid mode
      if (self.isKidMode && character.isJumping) {
        if (Math.random() > 0.3) {
          sparkles.push({
            x: character.x + character.width / 2 + (Math.random() - 0.5) * 10,
            y: character.y + character.height + Math.random() * 5,
            vx: -speed * 0.5 + (Math.random() - 0.5),
            vy: Math.random() * 0.5,
            life: 20,
            maxLife: 20,
            size: 2 + Math.random() * 3,
            color: ['#FFD700', '#FF69B4', '#00CED1', '#7B2FF7'][Math.floor(Math.random() * 4)]
          });
        }
      }

      // Update sparkles
      for (let i = sparkles.length - 1; i >= 0; i--) {
        sparkles[i].x += sparkles[i].vx;
        sparkles[i].y += sparkles[i].vy;
        sparkles[i].life--;
        if (sparkles[i].life <= 0) sparkles.splice(i, 1);
      }

      // Trail
      character.trail.push({ x: character.x, y: character.y });
      if (character.trail.length > 10) character.trail.shift();

      // Obstacles
      obstacleTimer++;
      if (obstacleTimer >= obstacleInterval && !waitingForSpeech) {
        spawnObstacle();
        obstacleTimer = 0;
      }

      for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= speed;
        if (obstacles[i].glow > 1) obstacles[i].glow -= 0.02;

        // Check if obstacle hits character (only if not passed)
        if (!obstacles[i].passed && !obstacles[i].hit &&
            character.x < obstacles[i].x + obstacles[i].width &&
            character.x + character.width > obstacles[i].x &&
            character.y + character.height > obstacles[i].y) {
          // Hit!
          obstacles[i].hit = true;
          self.score = Math.max(0, self.score - 3);
          comboCount = 0;
          character.expression = 'sad';
          showFeedback(self.isKidMode ? '💥 Ouch!' : 'Missed!', '#FF4444');
          addParticle(obstacles[i].x, obstacles[i].y, '#FF4444', 6);
          if (onScoreUpdate) onScoreUpdate(self.score);
        }

        // Remove off-screen
        if (obstacles[i].x + obstacles[i].width < -20) {
          obstacles.splice(i, 1);
          if (obstacles.length === 0) {
            waitingForSpeech = false;
          }
        }
      }

      // Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].x += particles[i].vx;
        particles[i].y += particles[i].vy;
        particles[i].vy += 0.1;
        particles[i].life--;
        if (particles[i].life <= 0) particles.splice(i, 1);
      }

      // Background clouds/stars drift for kid mode
      if (self.isKidMode) {
        bgClouds.forEach(c => {
          c.x -= c.speed;
          if (c.x + c.size < 0) {
            c.x = canvas.width + c.size;
            c.y = 30 + Math.random() * (groundY - 100);
          }
        });
      }

      // Feedback timer
      if (feedbackTimer > 0) feedbackTimer--;
    }

    function drawBackground() {
      if (self.isKidMode) {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.6, '#B0E0E6');
        gradient.addColorStop(1, '#90EE90');
        ctx.fillStyle = gradient;
      } else {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#0a0a1e');
        gradient.addColorStop(1, '#1a1a3e');
        ctx.fillStyle = gradient;
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw floating clouds and stars for kid mode
      if (self.isKidMode) {
        bgClouds.forEach(c => {
          ctx.globalAlpha = c.alpha;
          if (c.type === 'cloud') {
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.size * 0.6, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(c.x - c.size * 0.4, c.y + 3, c.size * 0.45, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(c.x + c.size * 0.4, c.y + 3, c.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Twinkling star
            const twinkle = 0.7 + Math.sin(Date.now() / 400 + c.x) * 0.3;
            ctx.globalAlpha = c.alpha * twinkle;
            ctx.fillStyle = '#FFD700';
            const s = c.size * 0.3;
            ctx.beginPath();
            ctx.moveTo(c.x, c.y - s);
            ctx.lineTo(c.x + s * 0.3, c.y - s * 0.3);
            ctx.lineTo(c.x + s, c.y);
            ctx.lineTo(c.x + s * 0.3, c.y + s * 0.3);
            ctx.lineTo(c.x, c.y + s);
            ctx.lineTo(c.x - s * 0.3, c.y + s * 0.3);
            ctx.lineTo(c.x - s, c.y);
            ctx.lineTo(c.x - s * 0.3, c.y - s * 0.3);
            ctx.closePath();
            ctx.fill();
          }
        });
        ctx.globalAlpha = 1;
      }
    }

    function drawGround() {
      if (self.isKidMode) {
        const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF'];
        const segWidth = canvas.width / colors.length;
        colors.forEach((color, i) => {
          ctx.fillStyle = color;
          ctx.fillRect(i * segWidth, groundY, segWidth + 1, canvas.height - groundY);
        });
        ctx.fillStyle = '#4CAF50';
        for (let x = 0; x < canvas.width; x += 10) {
          ctx.beginPath();
          ctx.moveTo(x, groundY);
          ctx.lineTo(x + 5, groundY - 8);
          ctx.lineTo(x + 10, groundY);
          ctx.fill();
        }
      } else {
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.15)';
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += 30) {
          ctx.beginPath();
          ctx.moveTo(x, groundY);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        ctx.fillStyle = 'rgba(0, 212, 255, 0.05)';
        ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

        // Ground line
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(canvas.width, groundY);
        ctx.stroke();
      }
    }

    function drawCharacter() {
      // Sparkle trail for kid mode (draw before character)
      if (self.isKidMode) {
        sparkles.forEach(sp => {
          const alpha = sp.life / sp.maxLife;
          ctx.globalAlpha = alpha;
          ctx.fillStyle = sp.color;
          // Draw 4-point star shape
          const sz = sp.size * alpha;
          ctx.beginPath();
          ctx.moveTo(sp.x, sp.y - sz);
          ctx.lineTo(sp.x + sz * 0.3, sp.y - sz * 0.3);
          ctx.lineTo(sp.x + sz, sp.y);
          ctx.lineTo(sp.x + sz * 0.3, sp.y + sz * 0.3);
          ctx.lineTo(sp.x, sp.y + sz);
          ctx.lineTo(sp.x - sz * 0.3, sp.y + sz * 0.3);
          ctx.lineTo(sp.x - sz, sp.y);
          ctx.lineTo(sp.x - sz * 0.3, sp.y - sz * 0.3);
          ctx.closePath();
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      }

      // Trail
      character.trail.forEach((pos, i) => {
        const alpha = i / character.trail.length * 0.2;
        ctx.fillStyle = self.isKidMode
          ? `rgba(255, 107, 157, ${alpha})`
          : `rgba(0, 212, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(pos.x + character.width / 2, pos.y + character.height / 2, character.width / 2, 0, Math.PI * 2);
        ctx.fill();
      });

      if (self.isKidMode) {
        // Cute bunny with squash and stretch
        ctx.save();
        const cx = character.x + 30;
        const cy = character.y + 30;
        ctx.translate(cx, cy);
        // Apply squash/stretch: squash Y, stretch X
        ctx.scale(2 - character.squash, character.squash);
        ctx.translate(-cx, -cy);

        // Body
        ctx.fillStyle = '#FF6B9D';
        ctx.beginPath();
        ctx.arc(cx, cy, 30, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.fillStyle = '#FF8FB1';
        ctx.beginPath();
        ctx.ellipse(cx - 12, cy - 35, 8, 18, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 12, cy - 35, 8, 18, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Inner ears
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.ellipse(cx - 12, cy - 33, 5, 12, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 12, cy - 33, 5, 12, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        if (character.expression === 'happy') {
          ctx.strokeStyle = '#333';
          ctx.lineWidth = 2;
          // Happy eyes (curved lines)
          ctx.beginPath();
          ctx.arc(cx - 8, cy - 3, 5, Math.PI, 0);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(cx + 8, cy - 3, 5, Math.PI, 0);
          ctx.stroke();
        } else {
          ctx.fillStyle = '#333';
          ctx.beginPath();
          ctx.arc(cx - 8, cy - 3, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(cx + 8, cy - 3, 4, 0, Math.PI * 2);
          ctx.fill();

          // Eye shine
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(cx - 7, cy - 5, 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(cx + 9, cy - 5, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Mouth
        if (character.expression === 'sad') {
          ctx.strokeStyle = '#333';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(cx, cy + 12, 5, 1.1 * Math.PI, 1.9 * Math.PI);
          ctx.stroke();
        } else {
          ctx.strokeStyle = '#333';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(cx, cy + 6, 5, 0.1 * Math.PI, 0.9 * Math.PI);
          ctx.stroke();
        }

        // Cheeks
        ctx.fillStyle = 'rgba(255, 150, 150, 0.3)';
        ctx.beginPath();
        ctx.arc(cx - 18, cy + 4, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + 18, cy + 4, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore(); // End squash/stretch transform
      } else {
        // Sleek geometric character
        const glow = character.expression === 'happy' ? 25 : 15;
        const color = character.expression === 'sad' ? '#FF4444' :
                      character.expression === 'happy' ? '#00FF88' : '#00D4FF';

        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = glow;

        // Triangle body
        ctx.beginPath();
        ctx.moveTo(character.x, character.y + character.height);
        ctx.lineTo(character.x + character.width / 2, character.y);
        ctx.lineTo(character.x + character.width, character.y + character.height);
        ctx.closePath();
        ctx.fill();

        // Inner glow
        ctx.fillStyle = '#7B2FF7';
        ctx.beginPath();
        ctx.moveTo(character.x + 10, character.y + character.height - 5);
        ctx.lineTo(character.x + character.width / 2, character.y + 10);
        ctx.lineTo(character.x + character.width - 10, character.y + character.height - 5);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;
      }
    }

    function drawObstacles() {
      obstacles.forEach(obs => {
        const isWaiting = (obs === currentObstacle && waitingForSpeech);

        if (self.isKidMode) {
          // Cute tree stump
          ctx.fillStyle = '#8B4513';
          ctx.beginPath();
          ctx.roundRect(obs.x - 5, obs.y, obs.width + 10, obs.height, 8);
          ctx.fill();
          ctx.fillStyle = '#A0522D';
          ctx.beginPath();
          ctx.roundRect(obs.x, obs.y + 5, obs.width, obs.height - 10, 6);
          ctx.fill();

          // Phoneme bubble on top (bigger & more colorful for kids)
          if (isWaiting) {
            // Colorful gradient bubble
            const bubbleGrad = ctx.createRadialGradient(obs.x + obs.width / 2, obs.y - 24, 5, obs.x + obs.width / 2, obs.y - 24, 28);
            bubbleGrad.addColorStop(0, '#FFE66D');
            bubbleGrad.addColorStop(1, '#FF6B6B');
            ctx.fillStyle = bubbleGrad;
            ctx.beginPath();
            ctx.arc(obs.x + obs.width / 2, obs.y - 24, 28, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#FF8C00';
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.fillStyle = '#333';
            ctx.font = 'bold 20px Comic Neue, Comic Sans MS, cursive';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(obs.phoneme, obs.x + obs.width / 2, obs.y - 24);

            // Pulse
            const pulse = Math.sin(Date.now() / 200) * 6 + 32;
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(obs.x + obs.width / 2, obs.y - 24, pulse, 0, Math.PI * 2);
            ctx.stroke();
          } else {
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = '12px Comic Neue, Comic Sans MS, cursive';
            ctx.textAlign = 'center';
            ctx.fillText(obs.phoneme, obs.x + obs.width / 2, obs.y - 10);
          }

          // Check mark if passed
          if (obs.passed) {
            ctx.fillStyle = '#00FF88';
            ctx.font = '24px sans-serif';
            ctx.fillText('✓', obs.x + obs.width / 2, obs.y - 20);
          }
        } else {
          // Neon obstacle
          const glowColor = isWaiting ? '#FFD700' : (obs.passed ? '#00FF88' : '#FF2D95');
          const glowAmount = isWaiting ? 15 + Math.sin(Date.now() / 200) * 5 : 8;

          ctx.fillStyle = obs.hit ? '#FF444488' : (obs.passed ? '#00FF8844' : '#1a1a3e');
          ctx.strokeStyle = glowColor;
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = glowAmount;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 4);
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Phoneme label
          ctx.fillStyle = isWaiting ? '#FFD700' : (obs.passed ? '#00FF88' : '#FF2D95');
          ctx.font = isWaiting ? 'bold 16px monospace' : '11px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(obs.phoneme, obs.x + obs.width / 2, obs.y - 8);

          // Status
          if (obs.passed) {
            ctx.fillStyle = '#00FF88';
            ctx.font = '18px sans-serif';
            ctx.fillText('✓', obs.x + obs.width / 2, obs.y + obs.height / 2 + 5);
          }
          if (obs.hit) {
            ctx.fillStyle = '#FF4444';
            ctx.font = '18px sans-serif';
            ctx.fillText('✗', obs.x + obs.width / 2, obs.y + obs.height / 2 + 5);
          }
        }
      });
    }

    function drawParticles() {
      particles.forEach(p => {
        const alpha = p.life / p.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    function drawHUD() {
      // Score
      ctx.fillStyle = '#fff';
      ctx.font = self.isKidMode ? 'bold 20px Comic Neue, Comic Sans MS, cursive' : 'bold 16px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(self.isKidMode ? `⭐ ${self.score}` : `SCORE: ${self.score}`, 15, 15);

      // Level
      ctx.fillText(self.isKidMode ? `🌈 Level ${self.level}` : `LVL: ${self.level}`, 15, 40);

      // Combo
      if (comboCount > 2) {
        ctx.fillStyle = '#FFD700';
        ctx.font = self.isKidMode ? 'bold 16px Comic Neue, cursive' : 'bold 12px monospace';
        ctx.fillText(self.isKidMode ? `🔥 x${comboCount}` : `COMBO x${comboCount}`, 15, 65);
      }

      // Current target instruction
      if (waitingForSpeech && currentObstacle) {
        const sayText = self.language === 'bn' ? 'বলুন: ' : 'Say: ';
        ctx.fillStyle = '#FFD700';
        ctx.font = self.isKidMode ? 'bold 22px Comic Neue, cursive' : 'bold 18px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(sayText + currentObstacle.phoneme, canvas.width - 15, 15);

        // Microphone icon animation
        const micAlpha = 0.5 + Math.sin(Date.now() / 300) * 0.3;
        ctx.fillStyle = `rgba(255, 215, 0, ${micAlpha})`;
        ctx.font = '20px sans-serif';
        ctx.fillText('🎤', canvas.width - 15, 40);
      }

      // Feedback text (larger & more animated for kids)
      if (feedbackTimer > 0) {
        const alpha = feedbackTimer / 60;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = feedbackColor;
        const yOff = (60 - feedbackTimer) * 0.5;
        const feedbackScale = self.isKidMode ? 1 + Math.sin(feedbackTimer * 0.3) * 0.08 : 1;
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2 - 50 - yOff);
        ctx.scale(feedbackScale, feedbackScale);
        ctx.font = self.isKidMode ? 'bold 40px Comic Neue, cursive' : 'bold 28px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(feedbackText, 0, 0);
        ctx.restore();
        ctx.globalAlpha = 1;
      }

      // Instructions at bottom
      if (self.attempts.length === 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = self.isKidMode ? '14px Comic Neue, cursive' : '12px monospace';
        ctx.textAlign = 'center';
        const instructText = self.language === 'bn'
          ? 'প্রথমে মাইক বাটন চাপুন, তারপর দেখানো শব্দটি বলুন'
          : 'Click the mic button, then say the word shown above';
        ctx.fillText(instructText, canvas.width / 2, canvas.height - 20);
      }
    }

    // Spawn first obstacle after a short delay
    setTimeout(() => {
      spawnObstacle();
    }, 1500);

    function gameLoop() {
      if (!self.isActive) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawBackground();
      drawGround();
      update();
      drawObstacles();
      drawCharacter();
      drawParticles();
      drawHUD();

      self.gameLoop = requestAnimationFrame(gameLoop);
    }

    gameLoop();
  },

  // ============================================
  // Game 2: Vowel Chain
  // Orbs light up one by one as you say each vowel correctly
  // Clear visual: current orb pulses, say the word to light it up
  // ============================================
  startVowelChain(onScoreUpdate, onLevelComplete) {
    const self = this;
    const canvas = this.canvas;
    const ctx = this.ctx;
    self.isActive = true;
    self.score = 0;
    self.level = 1;
    self.attempts = [];

    const phonemeList = self.getPhonemesForLevel();

    const orbs = phonemeList.slice(0, 5 + Math.min(self.level, 3)).map((v, i) => ({
      targetX: canvas.width / 2 + Math.cos((i / phonemeList.length) * Math.PI * 2 - Math.PI / 2) * Math.min(canvas.width, canvas.height) * 0.3,
      targetY: canvas.height / 2 + Math.sin((i / phonemeList.length) * Math.PI * 2 - Math.PI / 2) * Math.min(canvas.width, canvas.height) * 0.3,
      radius: self.isKidMode ? 45 : 30,
      vowel: v,
      lit: false,
      color: self.isKidMode
        ? ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#9B59B6', '#FF69B4', '#00CED1', '#FF8C00'][i % 8]
        : ['#00D4FF', '#7B2FF7', '#FF2D95', '#00FF88', '#FFD700', '#FF6B35', '#00CED1', '#8B5CF6'][i % 8]
    }));

    let currentOrbIndex = 0;
    let chainProgress = 0;
    let roundScore = 0;
    const particles = [];
    let celebrationTimer = 0; // Celebration animation timer
    const confetti = []; // Celebration confetti particles

    // Feedback
    let feedbackText = '';
    let feedbackColor = '';
    let feedbackTimer = 0;

    function addParticles(x, y, color, count = 12) {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i;
        particles.push({
          x, y,
          vx: Math.cos(angle) * (2 + Math.random() * 3),
          vy: Math.sin(angle) * (2 + Math.random() * 3),
          life: 40,
          maxLife: 40,
          color,
          size: Math.random() * 5 + 2
        });
      }
    }

    function showFeedback(text, color) {
      feedbackText = text;
      feedbackColor = color;
      feedbackTimer = 60;
    }

    function updateCurrentTarget() {
      if (currentOrbIndex < orbs.length) {
        const orb = orbs[currentOrbIndex];
        self.currentTarget = orb.vowel;
        self.currentPhoneme = orb.vowel;

        const targetEl = document.getElementById('targetPhoneme');
        const targetWrap = document.getElementById('targetDisplay');
        if (targetEl) targetEl.textContent = orb.vowel;
        if (targetWrap) targetWrap.style.display = 'block';
      }
    }

    // Handle speech result
    self.handleResult = function(result) {
      if (currentOrbIndex >= orbs.length) return;

      const target = orbs[currentOrbIndex].vowel;
      const spoken = result.spoken;
      const score = result.phoneticScore || Math.round(result.confidence * 100);

      // Use SpeechAPI.compareTexts for proper matching
      let isMatch;
      if (typeof SpeechAPI !== 'undefined' && SpeechAPI.compareTexts) {
        const comparison = SpeechAPI.compareTexts(spoken, target);
        isMatch = comparison.match;
      } else {
        const spokenLower = spoken.toLowerCase().trim();
        const targetLower = target.toLowerCase();
        isMatch = spokenLower === targetLower || spokenLower.includes(targetLower) || targetLower.includes(spokenLower);
      }

      if (isMatch && score >= 40) {
        const orb = orbs[currentOrbIndex];
        orb.lit = true;
        addParticles(orb.targetX, orb.targetY, orb.color);

        const points = Math.round(20 * (score / 100));
        self.score += points;
        roundScore += points;
        currentOrbIndex++;
        chainProgress = currentOrbIndex / orbs.length;

        if (score >= 90) {
          showFeedback(self.isKidMode ? '🌟 Perfect!' : 'Perfect!', '#00FF88');
        } else if (score >= 70) {
          showFeedback(self.isKidMode ? '✨ Great!' : 'Great!', '#00D4FF');
        } else {
          showFeedback(self.isKidMode ? '👍 OK!' : 'OK', '#FFD700');
        }

        if (onScoreUpdate) onScoreUpdate(self.score);

        if (currentOrbIndex >= orbs.length) {
          // Chain complete - celebration & new round
          self.level++;
          // Celebration animation in kid mode
          if (self.isKidMode) {
            celebrationTimer = 90; // ~1.5 seconds
            for (let c = 0; c < 30; c++) {
              confetti.push({
                x: canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.8,
                y: canvas.height / 2 - 50,
                vx: (Math.random() - 0.5) * 6,
                vy: -3 - Math.random() * 4,
                life: 80,
                maxLife: 80,
                color: ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#9B59B6', '#FF69B4'][Math.floor(Math.random() * 6)],
                size: 4 + Math.random() * 6,
                rotation: Math.random() * Math.PI * 2
              });
            }
          }
          currentOrbIndex = 0;
          orbs.forEach(o => { o.lit = false; });
          chainProgress = 0;
          if (onLevelComplete) onLevelComplete(self.level);

          // Shuffle phonemes for next round
          setTimeout(() => {
            const newPhonemes = phonemeList.sort(() => Math.random() - 0.5).slice(0, 5 + Math.min(self.level, 3));
            orbs.forEach((orb, i) => {
              orb.vowel = newPhonemes[i];
              orb.lit = false;
            });
            updateCurrentTarget();
          }, 500);
        } else {
          updateCurrentTarget();
        }
      } else {
        showFeedback(self.isKidMode ? '🔄 Say: ' + target : 'Say: ' + target, '#FF4444');
      }
    };

    self.onVoiceTrigger = function() {
      // Voice detected but no speech result yet
    };

    updateCurrentTarget();

    let time = 0;

    function gameLoop() {
      if (!self.isActive) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
      gradient.addColorStop(0, self.isKidMode ? '#1a1a4e' : '#1a1a3e');
      gradient.addColorStop(1, self.isKidMode ? '#0a0a2e' : '#050510');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      time += 0.02;

      // Draw connecting lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i < orbs.length; i++) {
        const next = orbs[(i + 1) % orbs.length];
        ctx.beginPath();
        ctx.moveTo(orbs[i].targetX, orbs[i].targetY);
        ctx.lineTo(next.targetX, next.targetY);
        ctx.stroke();
      }

      // Rainbow effect when all orbs are lit (kid mode)
      const allLit = orbs.every(o => o.lit);
      if (self.isKidMode && allLit && orbs.length > 0) {
        const rainbowHue = (Date.now() / 10) % 360;
        ctx.strokeStyle = `hsla(${rainbowHue}, 100%, 70%, 0.3)`;
        ctx.lineWidth = 3;
        for (let i = 0; i < orbs.length; i++) {
          const next = orbs[(i + 1) % orbs.length];
          ctx.beginPath();
          ctx.moveTo(orbs[i].targetX, orbs[i].targetY);
          ctx.lineTo(next.targetX, next.targetY);
          ctx.stroke();
        }
      }

      // Draw orbs
      orbs.forEach((orb, i) => {
        const isActive = i === currentOrbIndex;
        const float = Math.sin(time + i * 0.5) * 5;
        // Bouncy scale for active orb in kid mode
        const bounceScale = (self.isKidMode && isActive && !orb.lit) ? 1 + Math.sin(time * 6) * 0.08 : 1;

        if (orb.lit || isActive) {
          ctx.shadowColor = orb.color;
          ctx.shadowBlur = orb.lit ? 25 : 12 + Math.sin(time * 3) * 5;
        }

        ctx.fillStyle = orb.lit ? orb.color : (isActive ? `${orb.color}66` : 'rgba(255,255,255,0.08)');
        ctx.beginPath();
        ctx.arc(orb.targetX, orb.targetY + float, orb.radius * bounceScale, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = orb.lit ? '#fff' : (isActive ? orb.color : 'rgba(255,255,255,0.15)');
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(orb.targetX, orb.targetY + float, (orb.radius - 5) * bounceScale, 0, Math.PI * 2);
        ctx.stroke();

        ctx.shadowBlur = 0;

        // Label
        ctx.fillStyle = orb.lit ? '#fff' : (isActive ? '#FFD700' : 'rgba(255,255,255,0.4)');
        ctx.font = self.isKidMode ? 'bold 20px Comic Neue, cursive' : 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(orb.vowel, orb.targetX, orb.targetY + float);

        // Cute faces on orbs in kid mode
        if (self.isKidMode && (orb.lit || isActive)) {
          const ox = orb.targetX;
          const oy = orb.targetY + float;
          // Eyes
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(ox - 8, oy - 5, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(ox + 8, oy - 5, 4, 0, Math.PI * 2);
          ctx.fill();
          // Pupils
          ctx.fillStyle = '#333';
          ctx.beginPath();
          ctx.arc(ox - 7, oy - 5, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(ox + 9, oy - 5, 2, 0, Math.PI * 2);
          ctx.fill();
          // Smile
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(ox, oy + 2, 6, 0.1 * Math.PI, 0.9 * Math.PI);
          ctx.stroke();
        }

        // Pulse for active
        if (isActive && !orb.lit) {
          const pulseRadius = orb.radius + Math.sin(time * 4) * 10 + 12;
          ctx.strokeStyle = `${orb.color}33`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(orb.targetX, orb.targetY + float, pulseRadius, 0, Math.PI * 2);
          ctx.stroke();

          // "Say this!" indicator
          ctx.fillStyle = '#FFD700';
          ctx.font = self.isKidMode ? '13px Comic Neue, cursive' : '10px monospace';
          const sayText = self.language === 'bn' ? 'বলুন!' : 'Say this!';
          ctx.fillText(sayText, orb.targetX, orb.targetY + float + orb.radius + 20);
        }
      });

      // Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        const alpha = p.life / p.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        if (p.life <= 0) particles.splice(i, 1);
      }

      // Celebration confetti animation
      if (celebrationTimer > 0) {
        celebrationTimer--;
        const celebAlpha = Math.min(1, celebrationTimer / 30);
        ctx.globalAlpha = celebAlpha;
        ctx.fillStyle = '#FFD700';
        ctx.font = self.isKidMode ? 'bold 36px Comic Neue, cursive' : 'bold 28px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const celebScale = 1 + Math.sin(celebrationTimer * 0.2) * 0.1;
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2 - 30);
        ctx.scale(celebScale, celebScale);
        ctx.fillText(self.isKidMode ? '🎉 Amazing! 🎉' : 'Chain Complete!', 0, 0);
        ctx.restore();
      }
      // Draw and update confetti
      for (let i = confetti.length - 1; i >= 0; i--) {
        const c = confetti[i];
        c.x += c.vx;
        c.y += c.vy;
        c.vy += 0.08;
        c.rotation += 0.1;
        c.life--;
        const alpha = c.life / c.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = c.color;
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rotation);
        ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2);
        ctx.restore();
        if (c.life <= 0) confetti.splice(i, 1);
      }
      ctx.globalAlpha = 1;

      // Progress bar
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(canvas.width / 2 - 100, canvas.height - 35, 200, 8);
      ctx.fillStyle = '#7B2FF7';
      ctx.fillRect(canvas.width / 2 - 100, canvas.height - 35, 200 * chainProgress, 8);

      // HUD
      ctx.fillStyle = '#fff';
      ctx.font = self.isKidMode ? 'bold 18px Comic Neue, cursive' : 'bold 14px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(self.isKidMode ? `⭐ ${self.score}` : `SCORE: ${self.score}`, 15, 15);
      ctx.fillText(self.isKidMode ? `🌈 Level ${self.level}` : `LVL: ${self.level}`, 15, 38);

      // Feedback
      if (feedbackTimer > 0) {
        feedbackTimer--;
        const alpha = feedbackTimer / 60;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = feedbackColor;
        ctx.font = self.isKidMode ? 'bold 28px Comic Neue, cursive' : 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(feedbackText, canvas.width / 2, canvas.height / 2);
        ctx.globalAlpha = 1;
      }

      self.gameLoop = requestAnimationFrame(gameLoop);
    }

    gameLoop();
  },

  // ============================================
  // Game 3: Word Match
  // Cards with words displayed. Target word shown.
  // Say the target word to match it. Match all cards to level up.
  // ============================================
  startWordMatch(words, onScoreUpdate, onMatch) {
    const self = this;
    const canvas = this.canvas;
    const ctx = this.ctx;
    self.isActive = true;
    self.score = 0;
    self.level = 1;
    self.attempts = [];

    const wordList = words && words.length > 0 ? words : self.getWordsForLevel();

    const cards = wordList.slice(0, 6).map((word, i) => ({
      x: (i % 3) * (canvas.width / 3) + canvas.width / 6,
      y: Math.floor(i / 3) * (canvas.height / 2.5) + canvas.height / 3.5,
      word,
      matched: false,
      flipTimer: 0, // Flip animation timer for kid mode
      color: self.isKidMode
        ? ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#9B59B6', '#FF69B4'][i % 6]
        : ['#00D4FF', '#7B2FF7', '#FF2D95', '#00FF88', '#FFD700', '#FF6B35'][i % 6]
    }));

    let targetIndex = 0;
    let matchedCount = 0;
    const starBurstParticles = []; // Star burst particles for kid mode
    let starBurstTimer = 0;

    // Feedback
    let feedbackText = '';
    let feedbackColor = '';
    let feedbackTimer = 0;

    function pickNextTarget() {
      const unmatched = cards.filter(c => !c.matched);
      if (unmatched.length === 0) {
        // All matched! Level up
        self.level++;
        cards.forEach(c => { c.matched = false; });
        matchedCount = 0;

        // New words
        const newWords = self.getWordsForLevel().sort(() => Math.random() - 0.5).slice(0, 6);
        cards.forEach((card, i) => {
          card.word = newWords[i] || card.word;
        });

        if (onMatch) onMatch('level_up');
      }

      const unmatchedCards = cards.filter(c => !c.matched);
      const target = unmatchedCards[Math.floor(Math.random() * unmatchedCards.length)];
      targetIndex = cards.indexOf(target);

      self.currentTarget = target.word;
      self.currentPhoneme = target.word;

      const targetEl = document.getElementById('targetPhoneme');
      if (targetEl) targetEl.textContent = target.word;
    }

    function showFeedback(text, color) {
      feedbackText = text;
      feedbackColor = color;
      feedbackTimer = 60;
    }

    self.handleResult = function(result) {
      const spoken = result.spoken.toLowerCase().trim();
      const score = result.phoneticScore || Math.round(result.confidence * 100);

      const targetCard = cards.find(c => !c.matched && c.word.toLowerCase() === spoken);

      if (targetCard) {
        targetCard.matched = true;
        targetCard.flipTimer = 20; // Start flip animation for kid mode
        matchedCount++;
        const points = Math.round(30 * (score / 100));
        self.score += points;

        if (score >= 90) {
          showFeedback(self.isKidMode ? '🌟 Perfect!' : 'Perfect!', '#00FF88');
        } else if (score >= 70) {
          showFeedback(self.isKidMode ? '✨ Great!' : 'Great!', '#00D4FF');
        } else {
          showFeedback(self.isKidMode ? '👍 Matched!' : 'Matched', '#FFD700');
        }

        if (onScoreUpdate) onScoreUpdate(self.score);
        if (onMatch) onMatch(targetCard.word);

        // Star burst when all cards matched in kid mode
        const allMatched = cards.every(c => c.matched);
        if (self.isKidMode && allMatched) {
          starBurstTimer = 60;
          for (let s = 0; s < 25; s++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = 2 + Math.random() * 4;
            starBurstParticles.push({
              x: canvas.width / 2,
              y: canvas.height / 2,
              vx: Math.cos(angle) * spd,
              vy: Math.sin(angle) * spd,
              life: 50,
              maxLife: 50,
              color: ['#FFD700', '#FF69B4', '#00FF88', '#4D96FF', '#FF6B6B'][Math.floor(Math.random() * 5)],
              size: 3 + Math.random() * 5
            });
          }
        }

        // Pick next target
        setTimeout(() => pickNextTarget(), 500);
      } else {
        // Check if close match
        const allWords = cards.filter(c => !c.matched).map(c => c.word.toLowerCase());
        const closeMatch = allWords.find(w => w.includes(spoken) || spoken.includes(w));
        if (closeMatch) {
          showFeedback(self.isKidMode ? '🔄 Almost! Try: ' + cards.find(c => c.word.toLowerCase() === closeMatch)?.word : 'Almost! Say: ' + closeMatch, '#FFD700');
        } else {
          showFeedback(self.isKidMode ? '❌ Say: ' + self.currentTarget : 'Not quite. Say: ' + self.currentTarget, '#FF4444');
        }
      }
    };

    self.onVoiceTrigger = function() {};

    // Initialize first target
    pickNextTarget();

    let time = 0;

    function gameLoop() {
      if (!self.isActive) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, self.isKidMode ? '#1a1a4e' : '#0a0a1e');
      gradient.addColorStop(1, self.isKidMode ? '#2a1a4e' : '#1a1a3e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      time += 0.02;

      // Target word prompt at top
      ctx.fillStyle = '#FFD700';
      ctx.font = self.isKidMode ? 'bold 26px Comic Neue, cursive' : 'bold 22px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const sayText = self.language === 'bn' ? 'বলুন: ' : 'Say: ';
      ctx.fillText(sayText + self.currentTarget, canvas.width / 2, 20);

      // Draw cards
      cards.forEach((card, i) => {
        const float = Math.sin(time + i) * 3;

        // Flip animation progress for kid mode
        if (card.flipTimer > 0) card.flipTimer--;
        const flipProgress = card.flipTimer > 0 ? (20 - card.flipTimer) / 20 : (card.matched ? 1 : 0);
        const flipScale = card.flipTimer > 0 ? Math.abs(Math.cos(flipProgress * Math.PI)) : 1;

        ctx.save();
        ctx.translate(card.x, card.y + float);

        // Apply flip scale for kid mode when matched
        if (self.isKidMode && card.matched) {
          ctx.scale(flipScale, 1);
        }

        const w = self.isKidMode ? 120 : 90;
        const h = self.isKidMode ? 85 : 60;

        if (card.matched) {
          ctx.shadowColor = card.color;
          ctx.shadowBlur = 20;
          ctx.fillStyle = card.color + '44';
        } else {
          ctx.fillStyle = 'rgba(255,255,255,0.06)';
        }

        ctx.beginPath();
        ctx.roundRect(-w / 2, -h / 2, w, h, 12);
        ctx.fill();

        ctx.strokeStyle = card.matched ? card.color : (cards.indexOf(card) === targetIndex ? '#FFD700' : 'rgba(255,255,255,0.12)');
        ctx.lineWidth = cards.indexOf(card) === targetIndex && !card.matched ? 2 : 1;
        ctx.beginPath();
        ctx.roundRect(-w / 2, -h / 2, w, h, 12);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Cute sticker icon next to word in kid mode
        if (self.isKidMode) {
          const kidStickers = {'cat': '🐱', 'dog': '🐶', 'sun': '☀️', 'moon': '🌙', 'star': '⭐', 'fish': '🐟', 'ball': '⚽', 'cup': '🥤', 'hat': '🎩', 'red': '🔴', 'big': '💪', 'run': '🏃', 'jump': '🦘', 'play': '🎮', 'tree': '🌳', 'book': '📖', 'car': '🚗', 'bus': '🚌', 'pen': '🖊️', 'map': '🗺️', 'apple': '🍎', 'banana': '🍌', 'orange': '🍊', 'purple': '🟣', 'yellow': '🟡', 'garden': '🌷', 'window': '🪟', 'silver': '🪙', 'mirror': '🪞', 'castle': '🏰', 'bridge': '🌉', 'planet': '🪐', 'rocket': '🚀', 'dragon': '🐉', 'forest': '🌲'};
          const sticker = kidStickers[card.word.toLowerCase()];
          if (sticker) {
            ctx.font = '20px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(sticker, -w / 2 + 18, -h / 2 + 18);
          }
        }

        // Text
        ctx.fillStyle = card.matched ? card.color : 'rgba(255,255,255,0.7)';
        ctx.font = self.isKidMode ? 'bold 18px Comic Neue, cursive' : 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(card.word, 0, 0);

        // Matched checkmark
        if (card.matched) {
          ctx.fillStyle = '#00FF88';
          ctx.font = '18px sans-serif';
          ctx.fillText('✓', w / 2 - 12, -h / 2 + 12);
        }

        ctx.restore();
      });

      // Star burst particles for kid mode
      if (starBurstTimer > 0) starBurstTimer--;
      for (let i = starBurstParticles.length - 1; i >= 0; i--) {
        const sp = starBurstParticles[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vy += 0.05;
        sp.life--;
        const alpha = sp.life / sp.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = sp.color;
        const sz = sp.size * alpha;
        ctx.beginPath();
        for (let j = 0; j < 5; j++) {
          const a = (j * 2 * Math.PI / 5) - Math.PI / 2;
          const r = j % 2 === 0 ? sz : sz * 0.4;
          ctx.lineTo(sp.x + Math.cos(a) * r, sp.y + Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fill();
        if (sp.life <= 0) starBurstParticles.splice(i, 1);
      }
      if (starBurstTimer > 30) {
        ctx.globalAlpha = Math.min(1, (starBurstTimer - 30) / 15);
        ctx.fillStyle = '#FFD700';
        ctx.font = self.isKidMode ? 'bold 34px Comic Neue, cursive' : 'bold 26px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(self.isKidMode ? '⭐ All Matched! ⭐' : 'All Matched!', canvas.width / 2, canvas.height / 2 - 30);
      }
      ctx.globalAlpha = 1;

      // HUD
      ctx.fillStyle = '#fff';
      ctx.font = self.isKidMode ? 'bold 18px Comic Neue, cursive' : 'bold 14px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(self.isKidMode ? `⭐ ${self.score}` : `SCORE: ${self.score}`, 15, 15);
      ctx.fillText(self.isKidMode ? `🌈 Level ${self.level}` : `LVL: ${self.level}`, 15, 38);

      // Match progress
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = self.isKidMode ? '14px Comic Neue, cursive' : '12px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${matchedCount}/${cards.length}`, canvas.width - 15, 15);

      // Feedback
      if (feedbackTimer > 0) {
        feedbackTimer--;
        const alpha = feedbackTimer / 60;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = feedbackColor;
        ctx.font = self.isKidMode ? 'bold 28px Comic Neue, cursive' : 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(feedbackText, canvas.width / 2, canvas.height - 60);
        ctx.globalAlpha = 1;
      }

      self.gameLoop = requestAnimationFrame(gameLoop);
    }

    gameLoop();
  },

  // ============================================
  // Game 4: Pronunciation Race (speed challenge)
  // Words appear rapidly - say them as fast as you can
  // ============================================
  startPronunciationRace(onScoreUpdate, onLevelComplete) {
    const self = this;
    const canvas = this.canvas;
    const ctx = this.ctx;
    self.isActive = true;
    self.score = 0;
    self.level = 1;
    self.attempts = [];

    const wordList = self.getWordsForLevel();
    let currentWord = wordList[Math.floor(Math.random() * wordList.length)];
    let wordTimer = 0;
    let timeLimit = 200; // frames (about 3.3 seconds)
    let wordCount = 0;
    let streak = 0;

    // Feedback
    let feedbackText = '';
    let feedbackColor = '';
    let feedbackTimer = 0;
    const particles = [];

    function addParticles(x, y, color, count = 10) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 4;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 30,
          maxLife: 30,
          color,
          size: Math.random() * 5 + 2
        });
      }
    }

    function showFeedback(text, color) {
      feedbackText = text;
      feedbackColor = color;
      feedbackTimer = 50;
    }

    function nextWord() {
      currentWord = wordList[Math.floor(Math.random() * wordList.length)];
      wordTimer = 0;
      self.currentTarget = currentWord;
      self.currentPhoneme = currentWord;

      const targetEl = document.getElementById('targetPhoneme');
      if (targetEl) targetEl.textContent = currentWord;
    }

    self.handleResult = function(result) {
      const spoken = result.spoken.toLowerCase().trim();
      const score = result.phoneticScore || Math.round(result.confidence * 100);

      if (spoken === currentWord.toLowerCase() || spoken.includes(currentWord.toLowerCase())) {
        const timeBonus = Math.max(0, Math.round((1 - wordTimer / timeLimit) * 20));
        const points = 15 + timeBonus + (streak > 3 ? 5 : 0);
        self.score += points;
        streak++;
        wordCount++;

        if (score >= 90) {
          showFeedback(self.isKidMode ? '🌟 Perfect!' : 'Perfect! +' + points, '#00FF88');
          addParticles(canvas.width / 2, canvas.height / 2, '#00FF88', 15);
        } else {
          showFeedback(self.isKidMode ? '✨ Good!' : 'Good! +' + points, '#00D4FF');
          addParticles(canvas.width / 2, canvas.height / 2, '#00D4FF', 8);
        }

        if (onScoreUpdate) onScoreUpdate(self.score);

        if (wordCount >= 5 + self.level * 2) {
          self.level++;
          wordCount = 0;
          timeLimit = Math.max(100, 200 - self.level * 15);
          if (onLevelComplete) onLevelComplete(self.level);
        }

        nextWord();
      } else {
        streak = 0;
        showFeedback(self.isKidMode ? '❌ Say: ' + currentWord : 'Say: ' + currentWord, '#FF4444');
      }
    };

    self.onVoiceTrigger = function() {};

    nextWord();

    function gameLoop() {
      if (!self.isActive) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0a0a1e');
      gradient.addColorStop(1, '#1a1a3e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Timer bar
      wordTimer++;
      const timerProgress = wordTimer / timeLimit;
      const barColor = timerProgress < 0.5 ? '#00FF88' : timerProgress < 0.8 ? '#FFD700' : '#FF4444';
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(50, canvas.height - 40, canvas.width - 100, 10);
      ctx.fillStyle = barColor;
      ctx.fillRect(50, canvas.height - 40, (canvas.width - 100) * (1 - timerProgress), 10);

      if (wordTimer >= timeLimit) {
        streak = 0;
        self.score = Math.max(0, self.score - 2);
        showFeedback(self.isKidMode ? '⏰ Too slow!' : 'Time up!', '#FF4444');
        if (onScoreUpdate) onScoreUpdate(self.score);
        nextWord();
      }

      // Current word display
      const wordScale = 1 + Math.sin(Date.now() / 500) * 0.03;
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2 - 30);
      ctx.scale(wordScale, wordScale);

      ctx.fillStyle = '#FFD700';
      ctx.font = self.isKidMode ? 'bold 48px Comic Neue, cursive' : 'bold 44px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(currentWord, 0, 0);
      ctx.restore();

      // "Say this word" label
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = self.isKidMode ? '18px Comic Neue, cursive' : '14px monospace';
      ctx.textAlign = 'center';
      const sayText = self.language === 'bn' ? 'এই শব্দটি বলুন:' : 'Say this word:';
      ctx.fillText(sayText, canvas.width / 2, canvas.height / 2 - 80);

      // Streak
      if (streak > 1) {
        ctx.fillStyle = '#FFD700';
        ctx.font = self.isKidMode ? 'bold 18px Comic Neue, cursive' : 'bold 14px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(self.isKidMode ? `🔥 x${streak}` : `STREAK x${streak}`, canvas.width - 15, 60);
      }

      // HUD
      ctx.fillStyle = '#fff';
      ctx.font = self.isKidMode ? 'bold 18px Comic Neue, cursive' : 'bold 14px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(self.isKidMode ? `⭐ ${self.score}` : `SCORE: ${self.score}`, 15, 15);
      ctx.fillText(self.isKidMode ? `🌈 Level ${self.level}` : `LVL: ${self.level}`, 15, 38);

      // Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        const alpha = p.life / p.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        if (p.life <= 0) particles.splice(i, 1);
      }
      ctx.globalAlpha = 1;

      // Feedback
      if (feedbackTimer > 0) {
        feedbackTimer--;
        const alpha = feedbackTimer / 50;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = feedbackColor;
        ctx.font = self.isKidMode ? 'bold 28px Comic Neue, cursive' : 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(feedbackText, canvas.width / 2, canvas.height / 2 + 60);
        ctx.globalAlpha = 1;
      }

      self.gameLoop = requestAnimationFrame(gameLoop);
    }

    gameLoop();
  },

  // ============================================
  // Game 5: Sound Catch
  // Phonemes fall from the sky. Say the phoneme to catch it before it hits ground.
  // ============================================
  startSoundCatch(onScoreUpdate, onLevelComplete) {
    const self = this;
    const canvas = this.canvas;
    const ctx = this.ctx;
    self.isActive = true;
    self.score = 0;
    self.level = 1;
    self.attempts = [];

    const phonemeList = self.getPhonemesForLevel();
    const fallingItems = [];
    let spawnTimer = 0;
    let spawnInterval = 120;
    let catchCount = 0;
    let missedCount = 0;

    // Feedback
    let feedbackText = '';
    let feedbackColor = '';
    let feedbackTimer = 0;

    function showFeedback(text, color) {
      feedbackText = text;
      feedbackColor = color;
      feedbackTimer = 50;
    }

    function spawnItem() {
      const phoneme = phonemeList[Math.floor(Math.random() * phonemeList.length)];
      fallingItems.push({
        x: 50 + Math.random() * (canvas.width - 100),
        y: -30,
        phoneme,
        speed: 1 + self.level * 0.3 + Math.random() * 0.5,
        caught: false,
        missed: false,
        color: self.isKidMode
          ? ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#9B59B6'][Math.floor(Math.random() * 5)]
          : ['#00D4FF', '#7B2FF7', '#FF2D95', '#00FF88', '#FFD700'][Math.floor(Math.random() * 5)]
      });

      self.currentTarget = phoneme;
      self.currentPhoneme = phoneme;
      const targetEl = document.getElementById('targetPhoneme');
      if (targetEl) targetEl.textContent = phoneme;
    }

    self.handleResult = function(result) {
      const spoken = result.spoken.toLowerCase().trim();
      const score = result.phoneticScore || Math.round(result.confidence * 100);

      // Find matching falling item closest to bottom (most urgent)
      const matchingItems = fallingItems.filter(item =>
        !item.caught && !item.missed &&
        (item.phoneme === spoken || spoken.includes(item.phoneme) || item.phoneme.includes(spoken))
      );

      if (matchingItems.length > 0) {
        // Catch the one closest to the bottom
        matchingItems.sort((a, b) => b.y - a.y);
        const target = matchingItems[0];
        target.caught = true;
        catchCount++;

        const points = Math.round(15 * (score / 100)) + Math.round(target.y / canvas.height * 10);
        self.score += points;

        if (score >= 90) {
          showFeedback(self.isKidMode ? '🌟 Caught!' : 'Caught!', '#00FF88');
        } else {
          showFeedback(self.isKidMode ? '✨ Got it!' : 'Got it!', '#00D4FF');
        }

        if (onScoreUpdate) onScoreUpdate(self.score);

        if (catchCount >= 5 + self.level * 3) {
          self.level++;
          catchCount = 0;
          spawnInterval = Math.max(50, 120 - self.level * 10);
          if (onLevelComplete) onLevelComplete(self.level);
        }
      } else {
        showFeedback(self.isKidMode ? '❌ No match!' : 'No match', '#FF4444');
      }
    };

    self.onVoiceTrigger = function() {};

    function gameLoop() {
      if (!self.isActive) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, self.isKidMode ? '#1a1a4e' : '#0a0a1e');
      gradient.addColorStop(1, self.isKidMode ? '#0a0a2e' : '#050510');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Ground line
      const groundY = canvas.height - 50;
      ctx.strokeStyle = 'rgba(255, 68, 68, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(canvas.width, groundY);
      ctx.stroke();
      ctx.setLineDash(0);

      // Spawn
      spawnTimer++;
      if (spawnTimer >= spawnInterval) {
        spawnItem();
        spawnTimer = 0;
      }

      // Update & draw falling items
      for (let i = fallingItems.length - 1; i >= 0; i--) {
        const item = fallingItems[i];

        if (item.caught) {
          // Caught animation - float up and fade
          item.y -= 3;
          if (item.y < -50) {
            fallingItems.splice(i, 1);
            continue;
          }
        } else {
          item.y += item.speed;
          if (item.y > groundY) {
            item.missed = true;
            missedCount++;
            self.score = Math.max(0, self.score - 3);
            if (onScoreUpdate) onScoreUpdate(self.score);
            fallingItems.splice(i, 1);
            continue;
          }
        }

        // Draw
        const alpha = item.caught ? Math.max(0, 1 - (-item.y + 50) / 100) : 1;
        ctx.globalAlpha = alpha;

        ctx.fillStyle = item.caught ? '#00FF88' : item.color;
        ctx.shadowColor = item.caught ? '#00FF88' : item.color;
        ctx.shadowBlur = item.caught ? 15 : 8;

        ctx.beginPath();
        ctx.arc(item.x, item.y, self.isKidMode ? 28 : 22, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = self.isKidMode ? 'bold 16px Comic Neue, cursive' : 'bold 13px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.phoneme, item.x, item.y);

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      // HUD
      ctx.fillStyle = '#fff';
      ctx.font = self.isKidMode ? 'bold 18px Comic Neue, cursive' : 'bold 14px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(self.isKidMode ? `⭐ ${self.score}` : `SCORE: ${self.score}`, 15, 15);
      ctx.fillText(self.isKidMode ? `🌈 Level ${self.level}` : `LVL: ${self.level}`, 15, 38);

      // Missed counter
      ctx.fillStyle = '#FF4444';
      ctx.textAlign = 'right';
      ctx.fillText(self.isKidMode ? `💔 ${missedCount} missed` : `MISSED: ${missedCount}`, canvas.width - 15, 15);

      // Feedback
      if (feedbackTimer > 0) {
        feedbackTimer--;
        const alpha = feedbackTimer / 50;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = feedbackColor;
        ctx.font = self.isKidMode ? 'bold 24px Comic Neue, cursive' : 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(feedbackText, canvas.width / 2, canvas.height / 2);
        ctx.globalAlpha = 1;
      }

      self.gameLoop = requestAnimationFrame(gameLoop);
    }

    gameLoop();
  },

  // ============================================
  // Game 6: Tongue Twister
  // Sentences appear - speak them correctly for points
  // ============================================
  startTongueTwister(onScoreUpdate, onLevelComplete) {
    const self = this;
    const canvas = this.canvas;
    const ctx = this.ctx;
    self.isActive = true;
    self.score = 0;
    self.level = 1;
    self.attempts = [];

    const pool = self.wordPools[self.language] || self.wordPools.en;
    const sentenceList = self.level <= 2 ? pool.sentences : pool.tongueTwisters;

    let currentSentence = sentenceList[Math.floor(Math.random() * sentenceList.length)];
    let attemptCount = 0;
    let bestScore = 0;

    // Feedback
    let feedbackText = '';
    let feedbackColor = '';
    let feedbackTimer = 0;

    function showFeedback(text, color) {
      feedbackText = text;
      feedbackColor = color;
      feedbackTimer = 70;
    }

    function nextSentence() {
      const list = self.level <= 2 ? pool.sentences : pool.tongueTwisters;
      currentSentence = list[Math.floor(Math.random() * list.length)];
      attemptCount = 0;
      bestScore = 0;

      self.currentTarget = currentSentence;
      self.currentPhoneme = currentSentence;

      const targetEl = document.getElementById('targetPhoneme');
      if (targetEl) targetEl.textContent = currentSentence.split(' ')[0] + '...';
    }

    self.handleResult = function(result) {
      const spoken = result.spoken.toLowerCase().trim();
      const target = currentSentence.toLowerCase().trim();
      const score = result.phoneticScore || Math.round(result.confidence * 100);

      attemptCount++;

      // Word-by-word comparison
      const targetWords = target.split(/\s+/);
      const spokenWords = spoken.split(/\s+/);
      let correctWords = 0;
      for (let i = 0; i < Math.min(targetWords.length, spokenWords.length); i++) {
        if (spokenWords[i] === targetWords[i]) correctWords++;
      }
      const wordAccuracy = targetWords.length > 0 ? Math.round((correctWords / targetWords.length) * 100) : 0;

      const finalScore = Math.max(wordAccuracy, score);
      bestScore = Math.max(bestScore, finalScore);

      if (finalScore >= 80) {
        const points = Math.round(40 * (finalScore / 100));
        self.score += points;
        showFeedback(self.isKidMode ? '🌟 Excellent!' : 'Excellent! +' + points, '#00FF88');
        if (onScoreUpdate) onScoreUpdate(self.score);

        if (self.score >= self.level * 100) {
          self.level++;
          if (onLevelComplete) onLevelComplete(self.level);
        }

        setTimeout(nextSentence, 1500);
      } else if (finalScore >= 50) {
        showFeedback(self.isKidMode ? '🔄 Good try! Say again!' : `Good try (${finalScore}%)! Try again`, '#FFD700');
        self.score += 5;
        if (onScoreUpdate) onScoreUpdate(self.score);
      } else {
        showFeedback(self.isKidMode ? '🔄 Try again!' : 'Try again! Listen carefully', '#FF4444');
      }
    };

    self.onVoiceTrigger = function() {};

    nextSentence();

    function gameLoop() {
      if (!self.isActive) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, self.isKidMode ? '#1a1a4e' : '#0a0a1e');
      gradient.addColorStop(1, self.isKidMode ? '#2a1a4e' : '#1a1a3e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Current sentence display
      ctx.fillStyle = '#FFD700';
      ctx.font = self.isKidMode ? 'bold 24px Comic Neue, cursive' : 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Wrap text
      const words = currentSentence.split(' ');
      let line = '';
      let y = canvas.height / 2 - 40;
      const maxWidth = canvas.width - 80;
      for (const word of words) {
        const testLine = line + word + ' ';
        if (ctx.measureText(testLine).width > maxWidth && line) {
          ctx.fillText(line.trim(), canvas.width / 2, y);
          line = word + ' ';
          y += 35;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), canvas.width / 2, y);

      // Instruction
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = self.isKidMode ? '16px Comic Neue, cursive' : '13px monospace';
      const instructText = self.language === 'bn' ? 'বাক্যটি পড়ুন:' : 'Read this sentence:';
      ctx.fillText(instructText, canvas.width / 2, canvas.height / 2 - 80);

      // Attempt indicator
      if (attemptCount > 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '12px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(self.isKidMode ? `Try #${attemptCount} | Best: ${bestScore}%` : `Attempt ${attemptCount} | Best: ${bestScore}%`, canvas.width - 15, 60);
      }

      // HUD
      ctx.fillStyle = '#fff';
      ctx.font = self.isKidMode ? 'bold 18px Comic Neue, cursive' : 'bold 14px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(self.isKidMode ? `⭐ ${self.score}` : `SCORE: ${self.score}`, 15, 15);
      ctx.fillText(self.isKidMode ? `🌈 Level ${self.level}` : `LVL: ${self.level}`, 15, 38);

      // Feedback
      if (feedbackTimer > 0) {
        feedbackTimer--;
        const alpha = feedbackTimer / 70;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = feedbackColor;
        ctx.font = self.isKidMode ? 'bold 26px Comic Neue, cursive' : 'bold 22px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(feedbackText, canvas.width / 2, canvas.height / 2 + 80);
        ctx.globalAlpha = 1;
      }

      self.gameLoop = requestAnimationFrame(gameLoop);
    }

    gameLoop();
  },

  // ============================================
  // Stop the current game
  // ============================================
  stop() {
    this.isActive = false;
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
      this.gameLoop = null;
    }
    this.onVoiceTrigger = null;
    this.handleResult = null;
  },

  // Get summary of game performance
  getSummary() {
    if (this.attempts.length === 0) {
      return { totalAttempts: 0, excellent: 0, good: 0, fair: 0, poor: 0, weakestPhonemes: [], strongestPhonemes: [] };
    }

    const byPhoneme = {};
    this.attempts.forEach(a => {
      const key = a.target || 'unknown';
      if (!byPhoneme[key]) byPhoneme[key] = [];
      byPhoneme[key].push(a.phoneticScore || Math.round(a.confidence * 100));
    });

    const phonemeStats = Object.entries(byPhoneme).map(([phoneme, scores]) => ({
      phoneme,
      avgScore: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length),
      attempts: scores.length
    }));

    const excellent = this.attempts.filter(a => a.phoneticScore >= 90).length;
    const good = this.attempts.filter(a => a.phoneticScore >= 75 && a.phoneticScore < 90).length;
    const fair = this.attempts.filter(a => a.phoneticScore >= 50 && a.phoneticScore < 75).length;
    const poor = this.attempts.filter(a => a.phoneticScore < 50).length;

    const weakest = phonemeStats.filter(p => p.attempts >= 2).sort((a, b) => a.avgScore - b.avgScore).slice(0, 3);
    const strongest = phonemeStats.filter(p => p.attempts >= 2).sort((a, b) => b.avgScore - a.avgScore).slice(0, 3);

    return {
      totalAttempts: this.attempts.length,
      excellent, good, fair, poor,
      weakestPhonemes: weakest,
      strongestPhonemes: strongest
    };
  },

  // ============================================
  // Game 7: Minimal Pair Drill
  // Shows two similar-sounding words (শরৎ vs সরৎ)
  // User must say the correct one
  // ============================================
  startMinimalPair(onScoreUpdate, onLevelComplete) {
    const self = this;
    const canvas = this.canvas;
    const ctx = this.ctx;
    self.isActive = true;
    self.score = 0;
    self.level = 1;
    self.attempts = [];

    let pairs = [];
    let currentPair = null;
    let currentTargetWord = '';
    let pairIndex = 0;

    // Feedback
    let feedbackText = '';
    let feedbackColor = '';
    let feedbackTimer = 0;
    const particles = [];

    function loadPairs() {
      if (typeof PhonemeGuide === 'undefined') {
        // Fallback if PhonemeGuide not loaded
        pairs = [
          { phoneme1: 'শ', phoneme2: 'স', words: [{ correct: 'শরৎ', wrong: 'সরৎ' }, { correct: 'শাল', wrong: 'সাল' }, { correct: 'শিব', wrong: 'সিব' }] },
          { phoneme1: 'ণ', phoneme2: 'ন', words: [{ correct: 'বাণী', wrong: 'বানী' }, { correct: 'ণত', wrong: 'নত' }] },
          { phoneme1: 'ব', phoneme2: 'ভ', words: [{ correct: 'বল', wrong: 'ভল' }, { correct: 'বাত', wrong: 'ভাত' }] },
          { phoneme1: 'চ', phoneme2: 'ছ', words: [{ correct: 'চল', wrong: 'ছল' }, { correct: 'চাপ', wrong: 'ছাপ' }] }
        ];
        return;
      }
      // Get weak phonemes from TherapyEngine or default
      let weakPhonemes = ['শ', 'ষ', 'ণ', 'র', 'ব', 'চ', 'ট', 'ড'];
      if (typeof TherapyEngine !== 'undefined') {
        const weak = TherapyEngine.getWeakPhonemes(4);
        weakPhonemes = weak.map(p => typeof p === 'string' ? p : p.phoneme);
      }

      pairs = [];
      weakPhonemes.forEach(phoneme => {
        if (typeof PhonemeGuide !== 'undefined') {
          const mp = PhonemeGuide.getMinimalPairs(phoneme);
          if (mp && mp.length > 0) {
            mp.forEach(pair => {
              pairs.push({
                phoneme1: pair.phoneme1,
                phoneme2: pair.phoneme2,
                words: pair.pairs || []
              });
            });
          }
        }
      });

      if (pairs.length === 0) {
        pairs = [
          { phoneme1: 'শ', phoneme2: 'স', words: [{ correct: 'শরৎ', wrong: 'সরৎ' }, { correct: 'শাল', wrong: 'সাল' }] }
        ];
      }
    }

    loadPairs();

    function showFeedback(text, color) {
      feedbackText = text;
      feedbackColor = color;
      feedbackTimer = 70;
    }

    function addParticles(x, y, color, count = 10) {
      for (let i = 0; i < count; i++) {
        particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 5,
          vy: (Math.random() - 0.5) * 5 - 2,
          life: 35, maxLife: 35,
          color, size: Math.random() * 4 + 2
        });
      }
    }

    function nextPair() {
      if (pairIndex >= pairs.length) {
        pairIndex = 0;
        self.level++;
        if (onLevelComplete) onLevelComplete(self.level);
      }

      currentPair = pairs[pairIndex];
      if (!currentPair || !currentPair.words || currentPair.words.length === 0) {
        pairIndex++;
        nextPair();
        return;
      }

      // Pick a random word pair
      const wordPair = currentPair.words[Math.floor(Math.random() * currentPair.words.length)];
      // Randomly choose which one is the target
      const showCorrect = Math.random() > 0.5;
      currentTargetWord = showCorrect ? wordPair.correct : wordPair.wrong;
      const otherWord = showCorrect ? wordPair.wrong : wordPair.correct;

      self.currentTarget = currentTargetWord;
      self.currentPhoneme = currentTargetWord;

      const targetEl = document.getElementById('targetPhoneme');
      const targetWrap = document.getElementById('targetDisplay');
      const targetInstr = document.getElementById('targetInstruction');
      if (targetEl) targetEl.textContent = currentTargetWord;
      if (targetInstr) targetInstr.textContent = self.language === 'bn' ? 'এটা বলো:' : 'Say this:';
      if (targetWrap) targetWrap.style.display = 'block';
    }

    self.handleResult = function(result) {
      const spoken = result.spoken;
      const score = result.phoneticScore || Math.round(result.confidence * 100);

      let isMatch = false;
      if (typeof SpeechAPI !== 'undefined' && SpeechAPI.compareTexts) {
        const comparison = SpeechAPI.compareTexts(spoken, currentTargetWord);
        isMatch = comparison.match;
      } else {
        isMatch = spoken.trim().includes(currentTargetWord) || currentTargetWord.includes(spoken.trim());
      }

      if (isMatch && score >= 40) {
        const points = Math.round(15 * (score / 100));
        self.score += points;

        if (score >= 80) {
          showFeedback(self.isKidMode ? '🌟 সঠিক!' : 'Correct!', '#00FF88');
          addParticles(canvas.width / 2, canvas.height / 2, '#00FF88', 15);
        } else {
          showFeedback(self.isKidMode ? '✨ ভালো!' : 'Good!', '#00D4FF');
          addParticles(canvas.width / 2, canvas.height / 2, '#00D4FF', 8);
        }

        pairIndex++;
        if (onScoreUpdate) onScoreUpdate(self.score);
        setTimeout(nextPair, 800);
      } else {
        showFeedback(self.isKidMode ? '🔄 বলো: ' + currentTargetWord : 'Say: ' + currentTargetWord, '#FF4444');
      }
    };

    self.onVoiceTrigger = function() {};

    nextPair();

    function gameLoop() {
      if (!self.isActive) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0a0a1e');
      gradient.addColorStop(1, '#1a0a2e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Title
      ctx.fillStyle = '#FFD700';
      ctx.font = self.isKidMode ? 'bold 22px Comic Neue, cursive' : 'bold 18px monospace';
      ctx.textAlign = 'center';
      const title = self.language === 'bn' ? '🔍 পার্থক্য খুঁজে দাও!' : 'Minimal Pair Drill';
      ctx.fillText(title, canvas.width / 2, 40);

      if (currentPair) {
        // Show the pair info
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '14px monospace';
        ctx.fillText(`${currentPair.phoneme1} vs ${currentPair.phoneme2}`, canvas.width / 2, 70);

        // Show the target word prominently
        ctx.fillStyle = '#FFD700';
        ctx.font = self.isKidMode ? 'bold 48px Comic Neue, cursive' : 'bold 40px monospace';
        ctx.fillText(currentTargetWord, canvas.width / 2, canvas.height / 2 - 20);

        // Instruction
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = self.isKidMode ? '16px Comic Neue, cursive' : '14px monospace';
        const sayText = self.language === 'bn' ? '🔊 এটা বলো!' : 'Say this word!';
        ctx.fillText(sayText, canvas.width / 2, canvas.height / 2 + 30);

        // Tip
        if (typeof PhonemeGuide !== 'undefined') {
          const targetPhoneme = currentPair.phoneme1;
          const guide = PhonemeGuide.getGuide(targetPhoneme);
          if (guide && guide.tip) {
            ctx.fillStyle = 'rgba(0,212,255,0.7)';
            ctx.font = '13px sans-serif';
            ctx.fillText(guide.tip, canvas.width / 2, canvas.height / 2 + 60);
          }
        }
      }

      // Score & Level
      ctx.fillStyle = '#fff';
      ctx.font = self.isKidMode ? 'bold 18px Comic Neue, cursive' : 'bold 14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`⭐ ${self.score}  🌈 Lv${self.level}`, 15, 25);

      // Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life--;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Feedback
      if (feedbackTimer > 0) {
        feedbackTimer--;
        ctx.globalAlpha = feedbackTimer / 70;
        ctx.fillStyle = feedbackColor;
        ctx.font = self.isKidMode ? 'bold 32px Comic Neue, cursive' : 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(feedbackText, canvas.width / 2, canvas.height / 2 - 80);
        ctx.globalAlpha = 1;
      }

      self.gameLoop = requestAnimationFrame(gameLoop);
    }

    gameLoop();
  },

  // ============================================
  // Game 8: Focus Drill
  // Practices a single weak phoneme at increasing difficulty
  // Level 1: isolated → Level 2: syllable → Level 3: word → Level 4: sentence
  // ============================================
  startFocusDrill(focusPhoneme, onScoreUpdate, onLevelComplete) {
    const self = this;
    const canvas = this.canvas;
    const ctx = this.ctx;
    self.isActive = true;
    self.score = 0;
    self.level = 1;
    self.attempts = [];

    const phoneme = focusPhoneme || 'শ';
    let currentTarget = phoneme;
    let consecutiveCorrect = 0;
    let currentDifficulty = 1; // 1-5

    const guide = (typeof PhonemeGuide !== 'undefined') ? PhonemeGuide.getGuide(phoneme) : null;
    const practiceWords = (typeof PhonemeGuide !== 'undefined') ? PhonemeGuide.getPracticeWords(phoneme, currentDifficulty) : [phoneme];

    // Feedback
    let feedbackText = '';
    let feedbackColor = '';
    let feedbackTimer = 0;
    const particles = [];

    function showFeedback(text, color) {
      feedbackText = text;
      feedbackColor = color;
      feedbackTimer = 70;
    }

    function addParticles(x, y, color, count = 10) {
      for (let i = 0; i < count; i++) {
        particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 5,
          vy: (Math.random() - 0.5) * 5 - 2,
          life: 35, maxLife: 35,
          color, size: Math.random() * 4 + 2
        });
      }
    }

    function getNextTarget() {
      const words = (typeof PhonemeGuide !== 'undefined') ? PhonemeGuide.getPracticeWords(phoneme, currentDifficulty) : [phoneme];
      if (!words || words.length === 0) return phoneme;
      currentTarget = words[Math.floor(Math.random() * words.length)];
      self.currentTarget = currentTarget;
      self.currentPhoneme = phoneme;

      const targetEl = document.getElementById('targetPhoneme');
      const targetWrap = document.getElementById('targetDisplay');
      const targetInstr = document.getElementById('targetInstruction');
      if (targetEl) targetEl.textContent = currentTarget;
      if (targetInstr) targetInstr.textContent = self.language === 'bn' ? 'বলো:' : 'Say:';
      if (targetWrap) targetWrap.style.display = 'block';
    }

    self.handleResult = function(result) {
      const spoken = result.spoken;
      const score = result.phoneticScore || Math.round(result.confidence * 100);

      let isMatch = false;
      if (typeof SpeechAPI !== 'undefined' && SpeechAPI.compareTexts) {
        const comparison = SpeechAPI.compareTexts(spoken, currentTarget);
        isMatch = comparison.match;
      } else {
        isMatch = spoken.trim().includes(currentTarget) || currentTarget.includes(spoken.trim());
      }

      if (isMatch && score >= 50) {
        consecutiveCorrect++;
        const points = Math.round(12 * (score / 100)) + (consecutiveCorrect > 3 ? 5 : 0);
        self.score += points;

        if (score >= 85) {
          showFeedback(self.isKidMode ? '🌟 দারুণ!' : 'Excellent!', '#00FF88');
          addParticles(canvas.width / 2, canvas.height / 2, '#00FF88', 12);
        } else if (score >= 65) {
          showFeedback(self.isKidMode ? '✨ ভালো!' : 'Good!', '#00D4FF');
          addParticles(canvas.width / 2, canvas.height / 2, '#00D4FF', 8);
        } else {
          showFeedback(self.isKidMode ? '👍 ওকে!' : 'OK', '#FFD700');
          addParticles(canvas.width / 2, canvas.height / 2, '#FFD700', 5);
        }

        // Level up difficulty after 3 consecutive correct
        if (consecutiveCorrect >= 3 && currentDifficulty < 5) {
          currentDifficulty++;
          consecutiveCorrect = 0;
          self.level++;
          if (onLevelComplete) onLevelComplete(self.level);
        }

        if (onScoreUpdate) onScoreUpdate(self.score);
        setTimeout(getNextTarget, 1000);
      } else {
        consecutiveCorrect = 0;
        if (score < 50 && isMatch) {
          showFeedback(self.isKidMode ? '🔄 আরেকটু পরিষ্কার করে বলো' : 'Speak more clearly', '#FFD700');
        } else {
          showFeedback(self.isKidMode ? '❌ বলো: ' + currentTarget : 'Say: ' + currentTarget, '#FF4444');
        }
      }
    };

    self.onVoiceTrigger = function() {};

    getNextTarget();

    function gameLoop() {
      if (!self.isActive) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
      gradient.addColorStop(0, '#1a0a2e');
      gradient.addColorStop(1, '#0a0a1e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Title
      ctx.fillStyle = '#FF6B35';
      ctx.font = self.isKidMode ? 'bold 22px Comic Neue, cursive' : 'bold 18px monospace';
      ctx.textAlign = 'center';
      const title = self.language === 'bn' ? `🎯 ফোকাস: "${phoneme}"` : `Focus: "${phoneme}"`;
      ctx.fillText(title, canvas.width / 2, 40);

      // Difficulty indicator
      const diffLabels = ['', 'একা ধ্বনি', 'সিলেবল', 'শব্দ', 'জোড়া তুলনা', 'বাক্য'];
      const diffLabelsEn = ['', 'Isolated', 'Syllable', 'Word', 'Minimal Pair', 'Sentence'];
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '14px sans-serif';
      const diffText = self.language === 'bn' ? diffLabels[currentDifficulty] : diffLabelsEn[currentDifficulty];
      ctx.fillText(`Level ${currentDifficulty}: ${diffText}`, canvas.width / 2, 70);

      // Progress bar
      const barWidth = canvas.width * 0.6;
      const barX = (canvas.width - barWidth) / 2;
      const barY = 85;
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(barX, barY, barWidth, 6);
      ctx.fillStyle = consecutiveCorrect >= 2 ? '#00FF88' : '#00D4FF';
      ctx.fillRect(barX, barY, barWidth * (consecutiveCorrect / 3), 6);

      // Target word
      ctx.fillStyle = '#FFD700';
      ctx.font = self.isKidMode ? 'bold 48px Comic Neue, cursive' : 'bold 40px monospace';
      ctx.fillText(currentTarget, canvas.width / 2, canvas.height / 2 - 20);

      // Mouth position guide
      if (guide && guide.mouthPosition) {
        ctx.fillStyle = 'rgba(0,212,255,0.6)';
        ctx.font = '13px sans-serif';
        const mp = guide.mouthPosition;
        ctx.fillText(`👄 ${mp.lips || ''}`, canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillText(`👅 ${mp.tongue || ''}`, canvas.width / 2, canvas.height / 2 + 60);
        if (guide.tip) {
          ctx.fillStyle = 'rgba(255,215,0,0.6)';
          ctx.fillText(`💡 ${guide.tip}`, canvas.width / 2, canvas.height / 2 + 85);
        }
      }

      // Score
      ctx.fillStyle = '#fff';
      ctx.font = self.isKidMode ? 'bold 18px Comic Neue, cursive' : 'bold 14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`⭐ ${self.score}  🎯 Lv${currentDifficulty}/5`, 15, 25);

      // Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life--;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Feedback
      if (feedbackTimer > 0) {
        feedbackTimer--;
        ctx.globalAlpha = feedbackTimer / 70;
        ctx.fillStyle = feedbackColor;
        ctx.font = self.isKidMode ? 'bold 32px Comic Neue, cursive' : 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(feedbackText, canvas.width / 2, canvas.height / 2 - 100);
        ctx.globalAlpha = 1;
      }

      self.gameLoop = requestAnimationFrame(gameLoop);
    }

    gameLoop();
  },

  // ============================================
  // Game 9: Sentence Reading
  // Shows a sentence, user reads it aloud
  // Scores phoneme-by-phoneme accuracy
  // ============================================
  startSentenceReading(onScoreUpdate, onLevelComplete) {
    const self = this;
    const canvas = this.canvas;
    const ctx = this.ctx;
    self.isActive = true;
    self.score = 0;
    self.level = 1;
    self.attempts = [];

    const difficulty = ['easy', 'medium', 'hard'];
    let currentSentence = '';
    let sentenceScore = 0;

    // Feedback
    let feedbackText = '';
    let feedbackColor = '';
    let feedbackTimer = 0;
    const particles = [];

    function getSentence() {
      const diff = self.level <= 2 ? 'easy' : (self.level <= 4 ? 'medium' : 'hard');
      if (typeof PhonemeGuide !== 'undefined' && PhonemeGuide.practiceSentences) {
        currentSentence = PhonemeGuide.getPracticeSentence(diff);
      } else {
        const pool = self.wordPools[self.language] || self.wordPools.en;
        const sentences = self.level <= 2 ? pool.sentences : pool.tongueTwisters;
        currentSentence = sentences[Math.floor(Math.random() * sentences.length)];
      }

      self.currentTarget = currentSentence;
      self.currentPhoneme = currentSentence;

      const targetEl = document.getElementById('targetPhoneme');
      const targetWrap = document.getElementById('targetDisplay');
      const targetInstr = document.getElementById('targetInstruction');
      if (targetEl) targetEl.textContent = currentSentence;
      if (targetInstr) targetInstr.textContent = self.language === 'bn' ? 'পড়ো:' : 'Read:';
      if (targetWrap) targetWrap.style.display = 'block';
    }

    function showFeedback(text, color) {
      feedbackText = text;
      feedbackColor = color;
      feedbackTimer = 70;
    }

    function addParticles(x, y, color, count = 10) {
      for (let i = 0; i < count; i++) {
        particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 5,
          vy: (Math.random() - 0.5) * 5 - 2,
          life: 35, maxLife: 35,
          color, size: Math.random() * 4 + 2
        });
      }
    }

    self.handleResult = function(result) {
      const spoken = result.spoken;
      const score = result.phoneticScore || Math.round(result.confidence * 100);

      let comparison = { score: 0, match: false, correct: 0, total: 1 };
      if (typeof SpeechAPI !== 'undefined' && SpeechAPI.compareTexts) {
        comparison = SpeechAPI.compareTexts(spoken, currentSentence);
      } else {
        const sl = spoken.toLowerCase().trim();
        const tl = currentSentence.toLowerCase().trim();
        comparison.match = sl.includes(tl) || tl.includes(sl);
        comparison.score = comparison.match ? 70 : 20;
      }

      if (comparison.match && comparison.score >= 40) {
        const points = Math.round(20 * (comparison.score / 100));
        self.score += points;
        sentenceScore = comparison.score;

        if (comparison.score >= 85) {
          showFeedback(self.isKidMode ? '🌟 চমৎকার!' : 'Excellent reading!', '#00FF88');
          addParticles(canvas.width / 2, canvas.height / 2, '#00FF88', 15);
        } else if (comparison.score >= 65) {
          showFeedback(self.isKidMode ? '✨ ভালো পড়েছো!' : 'Good reading!', '#00D4FF');
          addParticles(canvas.width / 2, canvas.height / 2, '#00D4FF', 8);
        } else {
          showFeedback(self.isKidMode ? '👍 ওকে!' : 'OK, try again', '#FFD700');
        }

        // Level up after 2 good sentences
        if (comparison.score >= 70) {
          self.level++;
          if (onLevelComplete) onLevelComplete(self.level);
        }

        if (onScoreUpdate) onScoreUpdate(self.score);
        setTimeout(getSentence, 1500);
      } else {
        showFeedback(self.isKidMode ? '🔄 আবার পড়ো' : 'Try reading again', '#FF4444');

        // Show correction if TherapyEngine available
        if (typeof TherapyEngine !== 'undefined' && spoken.trim().length > 0) {
          const correction = TherapyEngine.getCorrection(spoken, currentSentence);
          if (correction) {
            setTimeout(() => {
              showFeedback(correction.tip || correction.suggestion || '', '#FFD700');
            }, 1500);
          }
        }
      }
    };

    self.onVoiceTrigger = function() {};

    getSentence();

    function gameLoop() {
      if (!self.isActive) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0a1a2e');
      gradient.addColorStop(1, '#0a0a1e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Title
      ctx.fillStyle = '#00CED1';
      ctx.font = self.isKidMode ? 'bold 22px Comic Neue, cursive' : 'bold 18px monospace';
      ctx.textAlign = 'center';
      const title = self.language === 'bn' ? '📖 বাক্য পড়ো' : 'Read the Sentence';
      ctx.fillText(title, canvas.width / 2, 40);

      // Sentence
      ctx.fillStyle = '#FFD700';
      ctx.font = self.isKidMode ? 'bold 28px Comic Neue, cursive' : 'bold 24px monospace';
      // Word wrap for long sentences
      const maxWidth = canvas.width - 60;
      const words = currentSentence.split(' ');
      let lines = [];
      let currentLine = '';
      words.forEach(word => {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        if (ctx.measureText(testLine).width > maxWidth) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });
      lines.push(currentLine);
      const startY = canvas.height / 2 - (lines.length * 35) / 2;
      lines.forEach((line, i) => {
        ctx.fillText(line, canvas.width / 2, startY + i * 35);
      });

      // Instruction
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '14px sans-serif';
      const instrText = self.language === 'bn' ? '🔊 বাক্যটি পড়ে শোনাও' : 'Read the sentence aloud';
      ctx.fillText(instrText, canvas.width / 2, startY + lines.length * 35 + 30);

      // Score
      ctx.fillStyle = '#fff';
      ctx.font = self.isKidMode ? 'bold 18px Comic Neue, cursive' : 'bold 14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`⭐ ${self.score}  🌈 Lv${self.level}`, 15, 25);

      // Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life--;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Feedback
      if (feedbackTimer > 0) {
        feedbackTimer--;
        ctx.globalAlpha = feedbackTimer / 70;
        ctx.fillStyle = feedbackColor;
        ctx.font = self.isKidMode ? 'bold 28px Comic Neue, cursive' : 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(feedbackText, canvas.width / 2, canvas.height - 60);
        ctx.globalAlpha = 1;
      }

      self.gameLoop = requestAnimationFrame(gameLoop);
    }

    gameLoop();
  }
};
