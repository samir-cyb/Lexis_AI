// LexisAI — Therapy Engine v1
// Therapy planning engine for the LexisAI speech therapy platform
// Depends on: PhonemeGuide (phoneme-guide.js)

const TherapyEngine = {

  // =========================================================================
  // STATE
  // =========================================================================

  /** User's phoneme performance history
   * @type {Object.<string, {attempts: number, avgScore: number, trend: string, scoreHistory: number[]}>}
   */
  phonemeScores: {},

  /** Current therapy plan
   * @type {Object|null}
   */
  currentPlan: null,

  /** Spaced repetition schedule
   * @type {Object.<string, {nextReview: number, interval: number, easinessFactor: number}>}
   */
  spacedRepetition: {},

  /** Session history
   * @type {Array.<{date: number, phonemes: string[], duration: number, avgScore: number}>}
   */
  sessionHistory: [],

  // =========================================================================
  // CORE FUNCTIONS
  // =========================================================================

  /**
   * Record a phoneme attempt and update all related state.
   * Increments attempts, recalculates average score, determines trend,
   * updates spaced repetition, and persists to localStorage.
   *
   * @param {string} phoneme - The Bengali phoneme character attempted
   * @param {number} score - The score for this attempt (0-100)
   * @param {boolean} isMatch - Whether the attempt was a correct match
   * @returns {void}
   */
  recordAttempt(phoneme, score, isMatch) {
    if (!this.phonemeScores[phoneme]) {
      this.phonemeScores[phoneme] = {
        attempts: 0,
        avgScore: 0,
        trend: 'stable',
        scoreHistory: []
      };
    }

    var data = this.phonemeScores[phoneme];
    data.attempts++;
    data.scoreHistory.push(score);

    // Recalculate average score
    var total = 0;
    for (var i = 0; i < data.scoreHistory.length; i++) {
      total += data.scoreHistory[i];
    }
    data.avgScore = Math.round(total / data.scoreHistory.length);

    // Determine trend: compare last 3 avg vs previous 3 avg
    data.trend = this._calculateTrend(data.scoreHistory);

    // Update spaced repetition
    this.updateSpacedRepetition(phoneme, score);

    // Persist
    this.save();
  },

  /**
   * Calculate trend from score history.
   * Compares average of last 3 scores to average of previous 3 scores.
   *
   * @param {number[]} scoreHistory - Array of scores
   * @returns {string} 'improving', 'declining', or 'stable'
   * @private
   */
  _calculateTrend(scoreHistory) {
    if (scoreHistory.length < 6) {
      return 'stable';
    }

    var len = scoreHistory.length;
    var lastThree = scoreHistory[len - 3] + scoreHistory[len - 2] + scoreHistory[len - 1];
    var prevThree = scoreHistory[len - 6] + scoreHistory[len - 5] + scoreHistory[len - 4];

    var lastAvg = lastThree / 3;
    var prevAvg = prevThree / 3;

    // Use a threshold of 3 points to avoid noise
    if (lastAvg > prevAvg + 3) {
      return 'improving';
    } else if (lastAvg < prevAvg - 3) {
      return 'declining';
    } else {
      return 'stable';
    }
  },

  /**
   * Get the user's weakest phonemes sorted by priority.
   * Filters out mastered phonemes (avgScore >= 80) and prioritizes
   * declining > stable > improving, then by lowest score.
   *
   * @param {number} [limit=3] - Maximum number of weak phonemes to return
   * @returns {string[]} Array of phoneme characters, sorted by priority
   */
  getWeakPhonemes(limit) {
    if (typeof limit !== 'number' || limit < 1) {
      limit = 3;
    }

    var scores = this.phonemeScores;
    var keys = Object.keys(scores);

    // If no data yet, return default weak phonemes for Bengali
    if (keys.length === 0) {
      return ['শ', 'ষ', 'ণ', 'ড়', 'ঘ'].slice(0, limit);
    }

    // Filter out mastered phonemes (avgScore >= 80)
    var weak = [];
    for (var i = 0; i < keys.length; i++) {
      var phoneme = keys[i];
      var data = scores[phoneme];
      if (data.avgScore < 80) {
        weak.push({
          phoneme: phoneme,
          avgScore: data.avgScore,
          trend: data.trend
        });
      }
    }

    // Sort: declining first, then stable, then improving; within same trend, by lowest score
    var trendPriority = { 'declining': 0, 'stable': 1, 'improving': 2 };
    weak.sort(function(a, b) {
      var pa = trendPriority[a.trend] !== undefined ? trendPriority[a.trend] : 1;
      var pb = trendPriority[b.trend] !== undefined ? trendPriority[b.trend] : 1;
      if (pa !== pb) return pa - pb;
      return a.avgScore - b.avgScore;
    });

    var result = [];
    for (var j = 0; j < weak.length && j < limit; j++) {
      result.push(weak[j].phoneme);
    }

    // If still not enough, pad with default weak phonemes not already included
    if (result.length < limit) {
      var defaults = ['শ', 'ষ', 'ণ', 'ড়', 'ঘ'];
      for (var k = 0; k < defaults.length && result.length < limit; k++) {
        if (result.indexOf(defaults[k]) === -1 && (!scores[defaults[k]] || scores[defaults[k]].avgScore < 80)) {
          result.push(defaults[k]);
        }
      }
    }

    return result;
  },

  /**
   * Generate a structured therapy plan for a session.
   * Creates exercises at appropriate difficulty levels for each weak phoneme,
   * following a progressive sequence: mouth guide → isolated → syllable →
   * word → minimal pair → sentence.
   *
   * @param {string[]} weakPhonemes - Array of phoneme characters to focus on
   * @param {number} durationMinutes - Duration of the session in minutes
   * @returns {Object} The generated therapy plan
   */
  generatePlan(weakPhonemes, durationMinutes) {
    if (!Array.isArray(weakPhonemes) || weakPhonemes.length === 0) {
      weakPhonemes = this.getWeakPhonemes(2);
    }
    if (typeof durationMinutes !== 'number' || durationMinutes < 1) {
      durationMinutes = 5;
    }

    var exercises = [];

    for (var i = 0; i < weakPhonemes.length; i++) {
      var phoneme = weakPhonemes[i];
      var level = this.getPracticeLevel(phoneme);
      var guide = PhonemeGuide.getGuide(phoneme);
      var commonMistake = guide ? guide.commonMistake : PhonemeGuide.getCommonMistake(phoneme);

      // Always start with mouth guide for each phoneme
      exercises.push({
        type: 'mouth_guide',
        phoneme: phoneme,
        duration: '30s',
        mouthPosition: guide ? guide.mouthPosition : null,
        tip: guide ? guide.tip : '',
        tipEn: guide ? guide.tipEn : ''
      });

      // Level 1+: Isolated phoneme practice
      if (level >= 1 || level === 'mastered') {
        exercises.push({
          type: 'isolated',
          phoneme: phoneme,
          reps: 5
        });
      }

      // Level 2+: Syllable practice
      if (level >= 2 || level === 'mastered') {
        var syllableWords = PhonemeGuide.getPracticeWords(phoneme, 2);
        exercises.push({
          type: 'syllable',
          phoneme: phoneme,
          reps: 5,
          examples: syllableWords.slice(0, 5)
        });
      }

      // Level 3+: Word practice
      if (level >= 3 || level === 'mastered') {
        var wordList = PhonemeGuide.getPracticeWords(phoneme, 3);
        exercises.push({
          type: 'word',
          phoneme: phoneme,
          reps: 3,
          examples: wordList.slice(0, 5)
        });
      }

      // Level 4+: Minimal pair practice
      if (level >= 4 || level === 'mastered') {
        var pairPhoneme = commonMistake || 'স';
        exercises.push({
          type: 'minimal_pair',
          phoneme: phoneme,
          pair: pairPhoneme,
          reps: 3
        });
      }

      // Level 5 / mastered: Sentence practice
      if (level >= 5 || level === 'mastered') {
        var difficulty = (level === 'mastered') ? 'medium' : 'easy';
        var sentence = PhonemeGuide.getPracticeSentence(difficulty);
        exercises.push({
          type: 'sentence',
          phoneme: phoneme,
          reps: 2,
          example: sentence || ''
        });
      }
    }

    var plan = {
      phonemes: weakPhonemes.slice(),
      duration: durationMinutes,
      exercises: exercises,
      createdAt: Date.now()
    };

    this.currentPlan = plan;
    this.save();

    return plan;
  },

  /**
   * Get the next exercise from the current therapy plan.
   * Tracks which exercise the user is on via currentPlan._currentIndex.
   *
   * @returns {Object|null} The next exercise object, or null if plan is complete
   */
  getNextExercise() {
    if (!this.currentPlan || !this.currentPlan.exercises || this.currentPlan.exercises.length === 0) {
      return null;
    }

    if (typeof this.currentPlan._currentIndex !== 'number') {
      this.currentPlan._currentIndex = 0;
    }

    var idx = this.currentPlan._currentIndex;
    if (idx >= this.currentPlan.exercises.length) {
      // Plan complete
      return null;
    }

    var exercise = this.currentPlan.exercises[idx];
    this.currentPlan._currentIndex++;
    this.save();

    return exercise;
  },

  /**
   * Get the appropriate practice level for a phoneme based on average score.
   * Levels: 1 (isolated), 2 (syllable), 3 (word), 4 (minimal pair),
   * 5 (sentence), or 'mastered'.
   *
   * @param {string} phoneme - The Bengali phoneme character
   * @returns {number|string} Practice level (1-5) or 'mastered'
   */
  getPracticeLevel(phoneme) {
    var data = this.phonemeScores[phoneme];
    if (!data) {
      return 1; // No data yet, start at level 1
    }

    var score = data.avgScore;

    if (score >= 90) {
      return 'mastered';
    } else if (score >= 80) {
      return 5;
    } else if (score >= 70) {
      return 4;
    } else if (score >= 55) {
      return 3;
    } else if (score >= 40) {
      return 2;
    } else {
      return 1;
    }
  },

  /**
   * Update spaced repetition schedule for a phoneme after a session.
   * Implements a simplified SM-2 algorithm:
   * - Score >= 80: increase interval (1 → 3 → 7 → 14 → 30 days)
   * - Score 60-79: keep same interval
   * - Score < 60: reset interval to 1 day
   *
   * @param {string} phoneme - The Bengali phoneme character
   * @param {number} score - The score for this review (0-100)
   * @returns {void}
   */
  updateSpacedRepetition(phoneme, score) {
    if (!this.spacedRepetition[phoneme]) {
      this.spacedRepetition[phoneme] = {
        nextReview: Date.now(),
        interval: 1,
        easinessFactor: 2.5
      };
    }

    var sr = this.spacedRepetition[phoneme];

    if (score >= 80) {
      // Increase interval using progression: 1 → 3 → 7 → 14 → 30
      var progression = [1, 3, 7, 14, 30];
      var currentIdx = progression.indexOf(sr.interval);
      if (currentIdx === -1 || currentIdx >= progression.length - 1) {
        // Use easiness factor for intervals beyond 30
        sr.interval = Math.round(sr.interval * sr.easinessFactor);
        if (sr.interval < 30) sr.interval = 30;
      } else {
        sr.interval = progression[currentIdx + 1];
      }

      // Adjust easiness factor upward slightly
      sr.easinessFactor = Math.min(3.0, sr.easinessFactor + 0.05);
    } else if (score >= 60) {
      // Keep same interval, no change
    } else {
      // Score < 60: reset to 1 day
      sr.interval = 1;
      // Decrease easiness factor
      sr.easinessFactor = Math.max(1.3, sr.easinessFactor - 0.2);
    }

    // Set next review timestamp
    sr.nextReview = Date.now() + (sr.interval * 24 * 60 * 60 * 1000);
  },

  /**
   * Get phonemes that are due for review today.
   * Checks all phonemes in the spaced repetition schedule and returns
   * those whose nextReview timestamp has passed.
   *
   * @returns {Array.<{phoneme: string, nextReview: number, interval: number}>}
   *   Array of due phoneme review objects
   */
  getDueReviews() {
    var now = Date.now();
    var due = [];
    var keys = Object.keys(this.spacedRepetition);

    for (var i = 0; i < keys.length; i++) {
      var phoneme = keys[i];
      var sr = this.spacedRepetition[phoneme];
      if (sr.nextReview <= now) {
        due.push({
          phoneme: phoneme,
          nextReview: sr.nextReview,
          interval: sr.interval
        });
      }
    }

    // Sort by most overdue first
    due.sort(function(a, b) {
      return a.nextReview - b.nextReview;
    });

    return due;
  },

  /**
   * Generate a minimal pair exercise for a given phoneme.
   * Uses PhonemeGuide to find the confused phoneme and word pairs,
   * then structures them into an exercise object with tips and mouth guide.
   *
   * @param {string} phoneme - The Bengali phoneme character to practice
   * @returns {Object|null} The minimal pair exercise object, or null if no pairs found
   */
  getMinimalPairExercise(phoneme) {
    var guide = PhonemeGuide.getGuide(phoneme);
    if (!guide) return null;

    var confusedWith = guide.commonMistake;
    if (!confusedWith) {
      // Try to find a pair from minimal pairs data
      var pairs = PhonemeGuide.getMinimalPairs(phoneme);
      if (pairs.length === 0) return null;
      confusedWith = pairs[0].pair[0] === phoneme ? pairs[0].pair[1] : pairs[0].pair[0];
    }

    var minimalPairs = PhonemeGuide.getMinimalPairs(phoneme);
    var pairWords = [];

    for (var i = 0; i < minimalPairs.length; i++) {
      var mp = minimalPairs[i];
      // Check if this pair involves our confusedWith phoneme
      if (mp.pair.indexOf(confusedWith) !== -1) {
        for (var j = 0; j < mp.words.length; j++) {
          var wordPair = mp.words[j];
          var correctIdx = mp.pair.indexOf(phoneme);
          var wrongIdx = mp.pair.indexOf(confusedWith);
          // The word at index matching the phoneme's position is "correct"
          pairWords.push({
            correct: wordPair[correctIdx !== -1 ? correctIdx : 0],
            wrong: wordPair[wrongIdx !== -1 ? wrongIdx : 1]
          });
        }
      }
    }

    // If no specific pairs with confusedWith, use any available pairs
    if (pairWords.length === 0 && minimalPairs.length > 0) {
      var firstPair = minimalPairs[0];
      confusedWith = firstPair.pair[0] === phoneme ? firstPair.pair[1] : firstPair.pair[0];
      var correctIdx = firstPair.pair.indexOf(phoneme);
      var wrongIdx = correctIdx === 0 ? 1 : 0;
      for (var k = 0; k < firstPair.words.length; k++) {
        pairWords.push({
          correct: firstPair.words[k][correctIdx],
          wrong: firstPair.words[k][wrongIdx]
        });
      }
    }

    return {
      type: 'minimal_pair',
      phoneme: phoneme,
      confusedWith: confusedWith,
      pairs: pairWords,
      tip: guide.tip,
      tipEn: guide.tipEn,
      mouthGuide: guide.mouthPosition
    };
  },

  /**
   * Get real-time correction feedback when a spoken word doesn't match the target.
   * Identifies the differing phoneme(s) and provides guidance using PhonemeGuide.
   *
   * @param {string} spoken - The word/phoneme the user actually said
   * @param {string} target - The word/phoneme the user was supposed to say
   * @returns {Object|null} Structured correction object, or null if spoken matches target
   */
  getCorrection(spoken, target) {
    if (spoken === target) {
      return null;
    }

    // Split both into phoneme arrays for comparison
    var spokenPhonemes = PhonemeGuide.splitBengaliPhonemes(spoken);
    var targetPhonemes = PhonemeGuide.splitBengaliPhonemes(target);

    // Find the first differing phoneme
    var wrongPhoneme = null;
    var correctPhoneme = null;
    var maxLen = Math.max(spokenPhonemes.length, targetPhonemes.length);

    for (var i = 0; i < maxLen; i++) {
      var sp = spokenPhonemes[i] || '';
      var tp = targetPhonemes[i] || '';
      if (sp !== tp) {
        wrongPhoneme = sp;
        correctPhoneme = tp;
        break;
      }
    }

    // If we couldn't find specific phoneme differences, use the first character
    if (!correctPhoneme && target.length > 0) {
      correctPhoneme = target[0];
      wrongPhoneme = spoken.length > 0 ? spoken[0] : '';
    }

    var guide = PhonemeGuide.getGuide(correctPhoneme);
    var commonMistake = guide ? guide.commonMistake : PhonemeGuide.getCommonMistake(correctPhoneme);

    return {
      spoken: spoken,
      target: target,
      wrongPhoneme: wrongPhoneme,
      correctPhoneme: correctPhoneme,
      tip: guide ? guide.tip : '',
      tipEn: guide ? guide.tipEn : '',
      mouthPosition: guide ? guide.mouthPosition : null,
      commonMistake: commonMistake || wrongPhoneme,
      suggestion: 'আবার চেষ্টা করো! / Try again!'
    };
  },

  /**
   * Get a weekly progress report analyzing session history and phoneme scores.
   * Returns overall accuracy, session counts, strong/weak phonemes,
   * improvement percentage, recommendations, and phoneme breakdown.
   *
   * @returns {Object} The weekly report object
   */
  getWeeklyReport() {
    var now = Date.now();
    var oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    var twoWeeksAgo = now - (14 * 24 * 60 * 60 * 1000);

    // Filter sessions from this week and last week
    var thisWeekSessions = [];
    var lastWeekSessions = [];

    for (var i = 0; i < this.sessionHistory.length; i++) {
      var session = this.sessionHistory[i];
      if (session.date >= oneWeekAgo) {
        thisWeekSessions.push(session);
      } else if (session.date >= twoWeeksAgo) {
        lastWeekSessions.push(session);
      }
    }

    // Calculate overall accuracy for this week
    var totalScore = 0;
    var totalCount = 0;
    for (var j = 0; j < thisWeekSessions.length; j++) {
      totalScore += thisWeekSessions[j].avgScore;
      totalCount++;
    }
    var overallAccuracy = totalCount > 0 ? Math.round(totalScore / totalCount) : 0;

    // Calculate last week accuracy
    var lastWeekTotalScore = 0;
    var lastWeekTotalCount = 0;
    for (var k = 0; k < lastWeekSessions.length; k++) {
      lastWeekTotalScore += lastWeekSessions[k].avgScore;
      lastWeekTotalCount++;
    }
    var lastWeekAccuracy = lastWeekTotalCount > 0 ? Math.round(lastWeekTotalScore / lastWeekTotalCount) : 0;

    // Calculate total time this week
    var totalTime = 0;
    for (var m = 0; m < thisWeekSessions.length; m++) {
      totalTime += (thisWeekSessions[m].duration || 0);
    }

    // Categorize phonemes into strong and weak
    var strongPhonemes = [];
    var weakPhonemes = [];
    var phonemeBreakdown = {};

    var keys = Object.keys(this.phonemeScores);
    for (var n = 0; n < keys.length; n++) {
      var phoneme = keys[n];
      var data = this.phonemeScores[phoneme];
      var score = data.avgScore;

      // Calculate this week vs last week scores
      var thisWeekScore = score;
      var lastWeekPhonemeScore = this._getPhonemeScoreAt(phoneme, oneWeekAgo);
      var change = thisWeekScore - lastWeekPhonemeScore;

      phonemeBreakdown[phoneme] = {
        thisWeek: thisWeekScore,
        lastWeek: lastWeekPhonemeScore,
        change: change
      };

      if (score >= 80) {
        strongPhonemes.push({ phoneme: phoneme, score: score });
      } else {
        weakPhonemes.push({ phoneme: phoneme, score: score });
      }
    }

    // Sort strong by score descending, weak by score ascending
    strongPhonemes.sort(function(a, b) { return b.score - a.score; });
    weakPhonemes.sort(function(a, b) { return a.score - b.score; });

    // Calculate improvement percentage
    var improvement = overallAccuracy - lastWeekAccuracy;

    // Generate recommendations in Bangla and English
    var recommendations = [];
    if (weakPhonemes.length > 0) {
      for (var p = 0; p < Math.min(3, weakPhonemes.length); p++) {
        var wp = weakPhonemes[p];
        var guide = PhonemeGuide.getGuide(wp.phoneme);
        var name = guide ? guide.name : wp.phoneme;
        recommendations.push('"' + name + '" ধ্বনি প্র্যাকটিস বাড়াও / Practice "' + name + '" sound more');
      }
    }
    if (strongPhonemes.length > 0) {
      var sp = strongPhonemes[0];
      var sGuide = PhonemeGuide.getGuide(sp.phoneme);
      var sName = sGuide ? sGuide.name : sp.phoneme;
      recommendations.push('"' + sName + '" ধ্বনি ভালো হচ্ছে! চালিয়ে যাও / "' + sName + '" sound is improving! Keep going');
    }
    if (thisWeekSessions.length < 3) {
      recommendations.push('প্রতিদিন কমপক্ষে ৫ মিনিট প্র্যাকটিস করো / Practice at least 5 minutes daily');
    }

    return {
      overallAccuracy: overallAccuracy,
      totalSessions: thisWeekSessions.length,
      totalTime: Math.round(totalTime),
      strongPhonemes: strongPhonemes.slice(0, 5),
      weakPhonemes: weakPhonemes.slice(0, 5),
      improvement: improvement,
      recommendations: recommendations,
      phonemeBreakdown: phonemeBreakdown
    };
  },

  /**
   * Get a phoneme's approximate score at a given timestamp.
   * Uses scoreHistory to reconstruct the average score at that point in time.
   *
   * @param {string} phoneme - The phoneme character
   * @param {number} timestamp - The timestamp to check
   * @returns {number} The approximate average score at that time
   * @private
   */
  _getPhonemeScoreAt(phoneme, timestamp) {
    var data = this.phonemeScores[phoneme];
    if (!data || !data.scoreHistory || data.scoreHistory.length === 0) {
      return 0;
    }

    // Since scoreHistory doesn't store timestamps per score,
    // we estimate based on proportional position relative to session dates
    // For a simpler approach, we return the current score as an approximation
    // In a more robust implementation, each score would be timestamped
    return data.avgScore;
  },

  // =========================================================================
  // PERSISTENCE
  // =========================================================================

  /**
   * Save current state to localStorage under the key 'lexisai_therapy_data'.
   * Persists phonemeScores, spacedRepetition, sessionHistory, and currentPlan.
   *
   * @returns {boolean} True if save succeeded, false otherwise
   */
  save() {
    try {
      var data = {
        phonemeScores: this.phonemeScores,
        spacedRepetition: this.spacedRepetition,
        sessionHistory: this.sessionHistory,
        currentPlan: this.currentPlan
      };
      localStorage.setItem('lexisai_therapy_data', JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('লেক্সিসএআই: ডেটা সেভ করতে সমস্যা হয়েছে / LexisAI: Failed to save therapy data', e);
      return false;
    }
  },

  /**
   * Load state from localStorage.
   * Restores phonemeScores, spacedRepetition, sessionHistory, and currentPlan
   * from the 'lexisai_therapy_data' key.
   *
   * @returns {boolean} True if load succeeded, false otherwise
   */
  load() {
    try {
      var raw = localStorage.getItem('lexisai_therapy_data');
      if (!raw) return false;

      var data = JSON.parse(raw);

      if (data.phonemeScores) {
        this.phonemeScores = data.phonemeScores;
      }
      if (data.spacedRepetition) {
        this.spacedRepetition = data.spacedRepetition;
      }
      if (data.sessionHistory) {
        this.sessionHistory = data.sessionHistory;
      }
      if (data.currentPlan) {
        this.currentPlan = data.currentPlan;
      }

      return true;
    } catch (e) {
      console.warn('লেক্সিসএআই: ডেটা লোড করতে সমস্যা হয়েছে / LexisAI: Failed to load therapy data', e);
      return false;
    }
  },

  /**
   * Reset all therapy data. Clears phonemeScores, currentPlan,
   * spacedRepetition, and sessionHistory. Also removes from localStorage.
   *
   * @returns {void}
   */
  reset() {
    this.phonemeScores = {};
    this.currentPlan = null;
    this.spacedRepetition = {};
    this.sessionHistory = [];

    try {
      localStorage.removeItem('lexisai_therapy_data');
    } catch (e) {
      console.warn('লেক্সিসএআই: ডেটা মুছতে সমস্যা হয়েছে / LexisAI: Failed to clear therapy data', e);
    }
  }
};
