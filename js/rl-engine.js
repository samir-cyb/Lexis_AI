// ============================================
// LexisAI — Reinforcement Learning Engine
// Multi-Armed Bandit / Q-Learning for Adaptive Curriculum
// ============================================

const RLEngine = {
  qTable: {},
  learningRate: 0.1,
  discountFactor: 0.9,
  explorationRate: 0.3,
  minExploration: 0.05,
  explorationDecay: 0.995,

  // State representation for a user
  getUserState(userProfile, sessionHistory) {
    const recentSessions = sessionHistory.slice(-5);
    
    const avgAccuracy = recentSessions.length > 0
      ? recentSessions.reduce((sum, s) => sum + (s.accuracy_score || 0), 0) / recentSessions.length
      : 50;

    const sessionCount = sessionHistory.length;
    const fatigue = this.estimateFatigue(recentSessions);
    const weakPhonemes = this.identifyWeakPhonemes(sessionHistory);

    return {
      accuracyRange: this.discretize(avgAccuracy, [0, 25, 50, 75, 100]),
      sessionCount: this.discretize(sessionCount, [0, 5, 15, 30, 100]),
      fatigue: fatigue,
      weakPhonemes: weakPhonemes.slice(0, 3),
      rawAccuracy: avgAccuracy
    };
  },

  // Discretize a value into ranges for Q-table
  discretize(value, ranges) {
    for (let i = ranges.length - 1; i >= 0; i--) {
      if (value >= ranges[i]) return i;
    }
    return 0;
  },

  // Available actions the AI can take
  getActions() {
    return [
      { id: 'easier', name: 'Easier Exercise', description: 'Slower, simpler phonemes' },
      { id: 'same_vowel', name: 'Same Level, New Vowel', description: 'Keep difficulty, change target' },
      { id: 'same_consonant', name: 'Same Level, New Consonant', description: 'Keep difficulty, consonant focus' },
      { id: 'harder', name: 'Increase Difficulty', description: 'Faster, complex phonemes' },
      { id: 'speed_up', name: 'Speed Up Prompt', description: 'Less time to respond' },
      { id: 'review', name: 'Review Weak Phonemes', description: 'Focus on trouble areas' },
      { id: 'break', name: 'Take a Break', description: 'Suggest a rest period' }
    ];
  },

  // Select action using epsilon-greedy policy
  selectAction(state) {
    const stateKey = this.getStateKey(state);
    const actions = this.getActions();

    // Explore with probability epsilon
    if (Math.random() < this.explorationRate) {
      const randomIndex = Math.floor(Math.random() * actions.length);
      return { ...actions[randomIndex], exploration: true };
    }

    // Exploit: choose best action from Q-table
    const qValues = this.qTable[stateKey] || {};
    let bestAction = actions[0];
    let bestValue = -Infinity;

    for (const action of actions) {
      const value = qValues[action.id] || 0;
      if (value > bestValue) {
        bestValue = value;
        bestAction = action;
      }
    }

    return { ...bestAction, exploration: false, qValue: bestValue };
  },

  // Calculate reward based on user performance
  calculateReward(performance) {
    let reward = 0;

    const { accuracy, completed, timeSpent, engaged } = performance;

    // Optimal zone: 70-85% accuracy with engagement
    if (accuracy >= 70 && accuracy <= 85 && completed && engaged) {
      reward = 1.0; // Strong positive reward
    }
    // Good accuracy but might be too easy
    else if (accuracy >= 90 && completed) {
      reward = 0.3; // Slight positive, but could be bored
    }
    // Too hard - user quit
    else if (accuracy < 30 && !completed) {
      reward = -1.0; // Strong negative
    }
    // Too easy - user left (bored)
    else if (accuracy >= 95 && !engaged) {
      reward = -0.5; // Negative for boredom
    }
    // Moderate performance
    else if (accuracy >= 50 && accuracy < 70 && completed) {
      reward = 0.5; // Moderate positive
    }
    // Low accuracy but still trying
    else if (accuracy < 50 && completed) {
      reward = 0.1; // Slight positive for persistence
    }

    return reward;
  },

  // Update Q-table
  updateQValue(stateKey, actionId, reward, nextStateKey) {
    if (!this.qTable[stateKey]) {
      this.qTable[stateKey] = {};
    }

    const currentQ = this.qTable[stateKey][actionId] || 0;
    
    // Get max Q value for next state
    const nextQValues = this.qTable[nextStateKey] || {};
    const maxNextQ = Math.max(...Object.values(nextQValues), 0);

    // Q-learning update rule
    const newQ = currentQ + this.learningRate * (
      reward + this.discountFactor * maxNextQ - currentQ
    );

    this.qTable[stateKey][actionId] = newQ;

    // Decay exploration rate
    this.explorationRate = Math.max(
      this.minExploration,
      this.explorationRate * this.explorationDecay
    );

    return newQ;
  },

  // Generate state key for Q-table
  getStateKey(state) {
    return `acc:${state.accuracyRange}:sess:${state.sessionCount}:fat:${state.fatigue}`;
  },

  // Estimate user fatigue from recent sessions
  estimateFatigue(recentSessions) {
    if (recentSessions.length < 2) return 'low';
    
    const recent = recentSessions.slice(-3);
    const accuracyTrend = recent.map(s => s.accuracy_score || 0);
    
    // Check if accuracy is declining
    let declining = 0;
    for (let i = 1; i < accuracyTrend.length; i++) {
      if (accuracyTrend[i] < accuracyTrend[i-1]) declining++;
    }

    if (declining >= 2) return 'high';
    if (declining >= 1) return 'medium';
    return 'low';
  },

  // Identify weak phonemes from session history
  identifyWeakPhonemes(sessionHistory) {
    const phonemeStats = {};

    for (const session of sessionHistory) {
      const targets = session.phoneme_targets || [];
      const accuracy = session.accuracy_score || 0;

      for (const phoneme of targets) {
        if (!phonemeStats[phoneme]) {
          phonemeStats[phoneme] = { attempts: 0, totalAccuracy: 0 };
        }
        phonemeStats[phoneme].attempts++;
        phonemeStats[phoneme].totalAccuracy += accuracy;
      }
    }

    // Sort by average accuracy (ascending = weakest first)
    return Object.entries(phonemeStats)
      .map(([phoneme, stats]) => ({
        phoneme,
        avgAccuracy: stats.totalAccuracy / stats.attempts,
        attempts: stats.attempts
      }))
      .filter(p => p.attempts >= 2)
      .sort((a, b) => a.avgAccuracy - b.avgAccuracy);
  },

  // Generate next exercise based on RL decision
  generateExercise(action, userProfile, sessionHistory) {
    const language = userProfile.language_preference || 'en';
    const isKid = userProfile.age < 10;
    const weakPhonemes = this.identifyWeakPhonemes(sessionHistory);

    const exercisePool = this.getExercisePool(language, isKid);
    let selectedExercise;

    switch (action.id) {
      case 'easier':
        selectedExercise = this.pickEasier(exercisePool, sessionHistory);
        break;
      case 'same_vowel':
        selectedExercise = this.pickByCategory(exercisePool, 'vowel');
        break;
      case 'same_consonant':
        selectedExercise = this.pickByCategory(exercisePool, 'consonant');
        break;
      case 'harder':
        selectedExercise = this.pickHarder(exercisePool, sessionHistory);
        break;
      case 'speed_up':
        selectedExercise = this.pickTimed(exercisePool, 'fast');
        break;
      case 'review':
        selectedExercise = this.pickWeakPhonemes(exercisePool, weakPhonemes);
        break;
      case 'break':
        return { type: 'break', message: isKid ? 'Great job! Time for a quick rest! 🌟' : 'Good work! Take a moment to rest.' };
      default:
        selectedExercise = exercisePool[Math.floor(Math.random() * exercisePool.length)];
    }

    return selectedExercise;
  },

  getExercisePool(language, isKid) {
    const pools = {
      en: {
        vowels: ['ah', 'ee', 'ih', 'eh', 'ae', 'oo', 'uh', 'oh', 'aw', 'er'],
        consonants: ['s', 'sh', 'f', 'th', 'r', 'l', 'm', 'n'],
        words: isKid 
          ? ['cat', 'dog', 'sun', 'moon', 'star', 'fish', 'bird', 'tree', 'ball', 'cup']
          : ['therapy', 'strength', 'whisper', 'breathe', 'practice', 'challenge', 'articulate', 'resonance'],
        sentences: isKid
          ? ['The cat sat on the mat', 'I see a big star', 'Hello friend!']
          : ['She sells seashells by the seashore', 'Red lorry yellow lorry', 'The rainbow shows after rain']
      },
      bn: {
        vowels: ['বা', 'ই', 'উ', 'এ', 'ও'],
        consonants: ['ক', 'ট', 'র', 'শ'],
        words: isKid
          ? ['বাড়ি', 'গাছ', 'ফুল', 'পাখি', 'জল', 'মাছ']
          : ['অভ্যাস', 'শক্তি', 'চর্চা', 'উচ্চারণ', 'বিকাশ'],
        sentences: isKid
          ? ['আমি বাংলায় কথা বলি', 'সূর্য উঠেছে', 'ফুল ফুটেছে']
          : ['শুদ্ধ উচ্চারণে কথা বলা একটি শিল্প', 'অভ্যাসই পরিপূর্ণতার মূল চাবিকাঠি']
      }
    };

    return pools[language] || pools.en;
  },

  pickEasier(pool, history) {
    return { type: 'phoneme', target: pool.vowels[0], category: 'vowel', difficulty: 'easy', speed: 'slow' };
  },

  pickByCategory(pool, category) {
    const items = pool[category === 'vowel' ? 'vowels' : 'consonants'];
    return { type: 'phoneme', target: items[Math.floor(Math.random() * items.length)], category, difficulty: 'medium', speed: 'normal' };
  },

  pickHarder(pool, history) {
    return { type: 'sentence', target: pool.sentences[Math.floor(Math.random() * pool.sentences.length)], difficulty: 'hard', speed: 'normal' };
  },

  pickTimed(pool, speed) {
    const items = [...pool.vowels, ...pool.consonants];
    return { type: 'phoneme', target: items[Math.floor(Math.random() * items.length)], difficulty: 'medium', speed: 'fast' };
  },

  pickWeakPhonemes(pool, weakPhonemes) {
    if (weakPhonemes.length > 0) {
      const weakest = weakPhonemes[0];
      return { type: 'phoneme', target: weakest.phoneme, category: 'review', difficulty: 'easy', speed: 'slow' };
    }
    return this.pickByCategory(pool, 'vowel');
  },

  // Save/Load Q-table to/from Supabase
  async saveState(userId) {
    const client = getSupabase();
    if (!client) return;

    try {
      await client.from('rl_states').upsert({
        user_id: userId,
        state_vector: {},
        q_table: this.qTable,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    } catch (e) {
      console.error('RL state save error:', e);
    }
  },

  async loadState(userId) {
    const client = getSupabase();
    if (!client) return;

    try {
      const { data } = await client
        .from('rl_states')
        .select('q_table')
        .eq('user_id', userId)
        .single();

      if (data?.q_table) {
        this.qTable = data.q_table;
      }
    } catch (e) {
      console.error('RL state load error:', e);
    }
  }
};
