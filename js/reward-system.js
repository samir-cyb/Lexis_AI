// LexisAI — Reward System v1
// Gamification & reward engine for speech therapy platform
// Self-contained, no external dependencies. Uses localStorage for persistence.

const RewardSystem = {
  // ─── State ───────────────────────────────────────────────────────────
  streak: 0,
  lastPracticeDate: null,
  totalWords: 0,
  totalSessions: 0,
  totalCorrect: 0,
  totalAttempts: 0,
  earnedBadges: [],
  dailyMission: null,
  weeklyGoal: null,
  xp: 0,
  level: 1,

  // Runtime tracking for conditional badges (not persisted directly)
  _currentStreakCorrect: 0,
  _bestStreakCorrect: 0,
  _lastSessionScore: 0,
  _lastSessionDuration: 0,
  _wordsPerMinute: 0,
  _phonemeScores: {},

  // ─── Badge Definitions ───────────────────────────────────────────────
  badges: [
    {
      id: 'first_word',
      name: 'প্রথম শব্দ',
      nameEn: 'First Word',
      icon: '🎯',
      description: 'প্রথম শব্দ বলো',
      descriptionEn: 'Say your first word',
      condition: function (stats) { return stats.totalWords >= 1; }
    },
    {
      id: 'ten_words',
      name: 'দশ শব্দ',
      nameEn: 'Ten Words',
      icon: '🔥',
      description: '১০টি শব্দ বলো',
      descriptionEn: 'Say 10 words',
      condition: function (stats) { return stats.totalWords >= 10; }
    },
    {
      id: 'fifty_words',
      name: 'পঞ্চাশ',
      nameEn: 'Fifty Words',
      icon: '⭐',
      description: '৫০টি শব্দ বলো',
      descriptionEn: 'Say 50 words',
      condition: function (stats) { return stats.totalWords >= 50; }
    },
    {
      id: 'hundred_words',
      name: 'শতক',
      nameEn: 'Century',
      icon: '💯',
      description: '১০০টি শব্দ বলো',
      descriptionEn: 'Say 100 words',
      condition: function (stats) { return stats.totalWords >= 100; }
    },
    {
      id: 'bronze',
      name: 'ব্রোঞ্জ টকার',
      nameEn: 'Bronze Talker',
      icon: '🥉',
      description: '২০০টি শব্দ',
      descriptionEn: 'Say 200 words',
      condition: function (stats) { return stats.totalWords >= 200; }
    },
    {
      id: 'silver',
      name: 'সিলভার টকার',
      nameEn: 'Silver Talker',
      icon: '🥈',
      description: '৫০০টি শব্দ',
      descriptionEn: 'Say 500 words',
      condition: function (stats) { return stats.totalWords >= 500; }
    },
    {
      id: 'gold',
      name: 'গোল্ড টকার',
      nameEn: 'Gold Talker',
      icon: '🥇',
      description: '১০০০টি শব্দ',
      descriptionEn: 'Say 1000 words',
      condition: function (stats) { return stats.totalWords >= 1000; }
    },
    {
      id: 'diamond',
      name: 'ডায়মন্ড',
      nameEn: 'Diamond',
      icon: '💎',
      description: '২৫০০টি শব্দ',
      descriptionEn: 'Say 2500 words',
      condition: function (stats) { return stats.totalWords >= 2500; }
    },
    {
      id: 'perfect_score',
      name: 'নিখুঁত',
      nameEn: 'Perfect',
      icon: '🌟',
      description: 'একটা সেশনে ১০০% একুরেসি',
      descriptionEn: 'Get 100% accuracy in a session',
      condition: function (stats) { return stats.lastSessionScore === 100; }
    },
    {
      id: 'streak_3',
      name: '৩ দিন স্ট্রিক',
      nameEn: '3-Day Streak',
      icon: '🔥',
      description: 'টানা ৩ দিন প্র্যাকটিস',
      descriptionEn: 'Practice 3 days in a row',
      condition: function (stats) { return stats.streak >= 3; }
    },
    {
      id: 'streak_7',
      name: 'সপ্তাহ স্ট্রিক',
      nameEn: 'Week Streak',
      icon: '🔥🔥',
      description: 'টানা ৭ দিন প্র্যাকটিস',
      descriptionEn: 'Practice 7 days in a row',
      condition: function (stats) { return stats.streak >= 7; }
    },
    {
      id: 'streak_30',
      name: 'মাস স্ট্রিক',
      nameEn: 'Month Streak',
      icon: '🔥🔥🔥',
      description: 'টানা ৩০ দিন প্র্যাকটিস',
      descriptionEn: 'Practice 30 days in a row',
      condition: function (stats) { return stats.streak >= 30; }
    },
    {
      id: 'phoneme_master',
      name: 'ধ্বনি মাস্টার',
      nameEn: 'Phoneme Master',
      icon: '👑',
      description: 'যেকোনো ধ্বনিতে ৯০%+',
      descriptionEn: 'Score 90%+ on any phoneme',
      condition: function (stats) {
        if (!stats.phonemeScores) return false;
        var keys = Object.keys(stats.phonemeScores);
        for (var i = 0; i < keys.length; i++) {
          if (stats.phonemeScores[keys[i]] >= 90) return true;
        }
        return false;
      }
    },
    {
      id: 'minimal_pair_pro',
      name: 'জোড়া প্রো',
      nameEn: 'Pair Pro',
      icon: '🎯',
      description: 'মিনিমাল পেয়ারে ৫ টানা সঠিক',
      descriptionEn: '5 correct in a row on minimal pairs',
      condition: function (stats) { return stats.bestStreakCorrect >= 5; }
    },
    {
      id: 'speed_talker',
      name: 'দ্রুত বক্তা',
      nameEn: 'Speed Talker',
      icon: '⚡',
      description: '১ মিনিটে ২০+ শব্দ',
      descriptionEn: 'Say 20+ words per minute',
      condition: function (stats) { return stats.wordsPerMinute >= 20; }
    },
    {
      id: 'accuracy_80',
      name: 'নিপুণ',
      nameEn: 'Proficient',
      icon: '🎪',
      description: 'সামগ্রিক ৮০%+ একুরেসি',
      descriptionEn: 'Overall 80%+ accuracy',
      condition: function (stats) {
        return stats.totalAttempts > 0 && (stats.totalCorrect / stats.totalAttempts) >= 0.8;
      }
    },
    {
      id: 'session_10',
      name: 'দশ সেশন',
      nameEn: 'Ten Sessions',
      icon: '📊',
      description: '১০টি সেশন সম্পন্ন',
      descriptionEn: 'Complete 10 sessions',
      condition: function (stats) { return stats.totalSessions >= 10; }
    },
    {
      id: 'session_50',
      name: 'পঞ্চাশ সেশন',
      nameEn: 'Fifty Sessions',
      icon: '📈',
      description: '৫০টি সেশন সম্পন্ন',
      descriptionEn: 'Complete 50 sessions',
      condition: function (stats) { return stats.totalSessions >= 50; }
    },
    {
      id: 'marathon',
      name: 'ম্যারাথন',
      nameEn: 'Marathon',
      icon: '🏃',
      description: 'এক সেশনে ১৫ মিনিট+',
      descriptionEn: 'Practice 15+ minutes in one session',
      condition: function (stats) { return stats.lastSessionDuration >= 15; }
    }
  ],

  // ─── Mission Templates ───────────────────────────────────────────────
  missions: [
    {
      type: 'word_count',
      target: 10,
      xp: 50,
      description: '১০টি শব্দ বলো',
      descriptionEn: 'Say 10 words'
    },
    {
      type: 'accuracy',
      target: 70,
      xp: 75,
      description: '৭০%+ একুরেসি পাও',
      descriptionEn: 'Get 70%+ accuracy'
    },
    {
      type: 'phoneme_score',
      target: 80,
      xp: 60,
      description: 'যেকোনো ধ্বনিতে ৮০%+ পাও',
      descriptionEn: 'Score 80%+ on any phoneme'
    },
    {
      type: 'session_time',
      target: 5,
      xp: 40,
      description: '৫ মিনিট প্র্যাকটিস করো',
      descriptionEn: 'Practice for 5 minutes'
    },
    {
      type: 'streak_continue',
      target: 1,
      xp: 30,
      description: 'আজও প্র্যাকটিস করো',
      descriptionEn: 'Practice today too'
    },
    {
      type: 'no_miss',
      target: 5,
      xp: 80,
      description: 'টানা ৫টি সঠিক উচ্চারণ',
      descriptionEn: '5 correct in a row'
    }
  ],

  // ─── Weekly Goal Templates ───────────────────────────────────────────
  weeklyGoals: [
    {
      type: 'weekly_words',
      target: 50,
      xp: 200,
      description: 'সপ্তাহে ৫০টি শব্দ',
      descriptionEn: 'Say 50 words this week'
    },
    {
      type: 'weekly_sessions',
      target: 5,
      xp: 150,
      description: 'সপ্তাহে ৫টি সেশন',
      descriptionEn: 'Complete 5 sessions this week'
    },
    {
      type: 'weekly_streak',
      target: 5,
      xp: 180,
      description: 'সপ্তাহে ৫ দিন স্ট্রিক',
      descriptionEn: 'Maintain a 5-day streak this week'
    },
    {
      type: 'weekly_accuracy',
      target: 75,
      xp: 170,
      description: 'সপ্তাহে গড় ৭৫%+ একুরেসি',
      descriptionEn: 'Average 75%+ accuracy this week'
    }
  ],

  // ─── Core: recordSession ─────────────────────────────────────────────
  // stats = { words, correct, attempts, score, duration, phonemeScores, streakCorrect }
  recordSession: function (stats) {
    var self = RewardSystem;
    stats = stats || {};

    // Update aggregates
    self.totalWords += (stats.words || 0);
    self.totalSessions += 1;
    self.totalCorrect += (stats.correct || 0);
    self.totalAttempts += (stats.attempts || 0);

    // Runtime trackers
    self._lastSessionScore = stats.score || 0;
    self._lastSessionDuration = stats.duration || 0;
    self._bestStreakCorrect = Math.max(self._bestStreakCorrect, stats.streakCorrect || 0);
    self._currentStreakCorrect = stats.streakCorrect || 0;

    // Words per minute
    if (stats.duration && stats.duration > 0) {
      self._wordsPerMinute = Math.round((stats.words || 0) / stats.duration);
    }

    // Merge phoneme scores
    if (stats.phonemeScores && typeof stats.phonemeScores === 'object') {
      var phonemes = Object.keys(stats.phonemeScores);
      for (var i = 0; i < phonemes.length; i++) {
        var p = phonemes[i];
        if (!self._phonemeScores[p] || stats.phonemeScores[p] > self._phonemeScores[p]) {
          self._phonemeScores[p] = stats.phonemeScores[p];
        }
      }
    }

    // Check streak
    var streakResult = self.checkStreak();
    self.lastPracticeDate = self._todayString();

    // Calculate XP
    var xpGained = 0;
    xpGained += (stats.correct || 0) * 10;    // +10 XP per correct word
    xpGained += 25;                             // +25 XP per session completed

    // Daily mission bonus
    var dailyMissionCompleted = false;
    if (self.dailyMission) {
      var missionProgress = self._getMissionProgress(self.dailyMission, stats);
      self.dailyMission.progress = Math.max(
        self.dailyMission.progress || 0,
        missionProgress
      );
      if (self.dailyMission.progress >= self.dailyMission.target && !self.dailyMission.completed) {
        self.dailyMission.completed = true;
        xpGained += self.dailyMission.xp;
        dailyMissionCompleted = true;
      }
    }

    // Add XP and check level
    var oldLevel = self.level;
    self.addXP(xpGained);
    var newLevel = self.getLevel();
    self.level = newLevel;
    var leveledUp = newLevel > oldLevel;

    // Check badges
    var newBadges = self.checkBadges();

    // Update weekly goal progress
    if (self.weeklyGoal) {
      var weekProgress = self._getWeeklyGoalProgress(self.weeklyGoal, stats);
      self.weeklyGoal.progress = Math.max(
        self.weeklyGoal.progress || 0,
        weekProgress
      );
      if (self.weeklyGoal.progress >= self.weeklyGoal.target && !self.weeklyGoal.completed) {
        self.weeklyGoal.completed = true;
        self.addXP(self.weeklyGoal.xp);
        xpGained += self.weeklyGoal.xp;
      }
    }

    // Persist
    self.save();

    return {
      newBadges: newBadges,
      xpGained: xpGained,
      levelUp: leveledUp,
      newLevel: newLevel,
      streakUpdated: streakResult.isUpdated,
      streakBroken: streakResult.isBroken,
      streak: self.streak,
      dailyMissionCompleted: dailyMissionCompleted
    };
  },

  // ─── checkBadges ─────────────────────────────────────────────────────
  checkBadges: function () {
    var self = RewardSystem;
    var newBadges = [];

    var statsForCheck = {
      totalWords: self.totalWords,
      totalSessions: self.totalSessions,
      totalCorrect: self.totalCorrect,
      totalAttempts: self.totalAttempts,
      streak: self.streak,
      lastSessionScore: self._lastSessionScore,
      lastSessionDuration: self._lastSessionDuration,
      bestStreakCorrect: self._bestStreakCorrect,
      wordsPerMinute: self._wordsPerMinute,
      phonemeScores: self._phonemeScores
    };

    for (var i = 0; i < self.badges.length; i++) {
      var badge = self.badges[i];
      if (self.earnedBadges.indexOf(badge.id) === -1) {
        try {
          if (badge.condition(statsForCheck)) {
            self.earnedBadges.push(badge.id);
            newBadges.push(badge);
          }
        } catch (e) {
          // Badge condition failed safely — skip
        }
      }
    }

    return newBadges;
  },

  // ─── checkStreak ─────────────────────────────────────────────────────
  checkStreak: function () {
    var self = RewardSystem;
    var today = self._todayString();
    var yesterday = self._yesterdayString();

    var isUpdated = false;
    var isBroken = false;

    if (!self.lastPracticeDate) {
      // First ever practice
      self.streak = 1;
      isUpdated = true;
    } else if (self.lastPracticeDate === today) {
      // Already practiced today — streak continues, no change
    } else if (self.lastPracticeDate === yesterday) {
      // Last practice was yesterday — increment streak
      self.streak += 1;
      isUpdated = true;
    } else {
      // Streak broken — reset to 1
      self.streak = 1;
      isBroken = true;
      isUpdated = true;
    }

    return {
      streak: self.streak,
      isUpdated: isUpdated,
      isBroken: isBroken
    };
  },

  // ─── generateDailyMission ────────────────────────────────────────────
  generateDailyMission: function () {
    var self = RewardSystem;
    var dayIndex = new Date().getDay(); // 0–6, deterministic rotation
    var missionTemplate = self.missions[dayIndex % self.missions.length];

    var mission = {
      type: missionTemplate.type,
      target: missionTemplate.target,
      xp: missionTemplate.xp,
      description: missionTemplate.description,
      descriptionEn: missionTemplate.descriptionEn,
      progress: 0,
      completed: false,
      date: self._todayString()
    };

    self.dailyMission = mission;
    return mission;
  },

  // ─── generateWeeklyGoal ──────────────────────────────────────────────
  generateWeeklyGoal: function () {
    var self = RewardSystem;
    var weekNumber = self._getWeekNumber();
    var goalTemplate = self.weeklyGoals[weekNumber % self.weeklyGoals.length];

    var goal = {
      type: goalTemplate.type,
      target: goalTemplate.target,
      xp: goalTemplate.xp,
      description: goalTemplate.description,
      descriptionEn: goalTemplate.descriptionEn,
      progress: 0,
      completed: false,
      week: weekNumber
    };

    self.weeklyGoal = goal;
    return goal;
  },

  // ─── XP & Level ──────────────────────────────────────────────────────
  addXP: function (amount) {
    var self = RewardSystem;
    self.xp += amount;
    self.level = self.getLevel();
  },

  getLevel: function () {
    var self = RewardSystem;
    // Level N requires N*100 cumulative XP
    // Level 1 = 0 XP, Level 2 = 100 XP, Level 3 = 200 XP, ...
    if (self.xp <= 0) return 1;
    return Math.floor(self.xp / 100) + 1;
  },

  getXPForNextLevel: function () {
    var self = RewardSystem;
    var currentLevel = self.getLevel();
    var nextLevelXP = currentLevel * 100;
    return nextLevelXP - self.xp;
  },

  // ─── getStats ────────────────────────────────────────────────────────
  getStats: function () {
    var self = RewardSystem;
    var accuracy = self.totalAttempts > 0
      ? Math.round((self.totalCorrect / self.totalAttempts) * 100)
      : 0;

    return {
      streak: self.streak,
      lastPracticeDate: self.lastPracticeDate,
      totalWords: self.totalWords,
      totalSessions: self.totalSessions,
      totalCorrect: self.totalCorrect,
      totalAttempts: self.totalAttempts,
      accuracy: accuracy,
      earnedBadges: self.earnedBadges.slice(),
      badgeCount: self.earnedBadges.length,
      totalBadgeCount: self.badges.length,
      xp: self.xp,
      level: self.level,
      xpForNextLevel: self.getXPForNextLevel(),
      dailyMission: self.dailyMission,
      weeklyGoal: self.weeklyGoal,
      phonemeScores: JSON.parse(JSON.stringify(self._phonemeScores)),
      bestStreakCorrect: self._bestStreakCorrect,
      wordsPerMinute: self._wordsPerMinute
    };
  },

  // ─── Persistence ─────────────────────────────────────────────────────
  save: function () {
    var self = RewardSystem;
    var data = {
      streak: self.streak,
      lastPracticeDate: self.lastPracticeDate,
      totalWords: self.totalWords,
      totalSessions: self.totalSessions,
      totalCorrect: self.totalCorrect,
      totalAttempts: self.totalAttempts,
      earnedBadges: self.earnedBadges,
      xp: self.xp,
      level: self.level,
      dailyMission: self.dailyMission,
      weeklyGoal: self.weeklyGoal,
      bestStreakCorrect: self._bestStreakCorrect,
      phonemeScores: self._phonemeScores
    };

    try {
      localStorage.setItem('lexisai_rewards', JSON.stringify(data));
    } catch (e) {
      // localStorage unavailable — fail silently
    }
  },

  load: function () {
    var self = RewardSystem;
    try {
      var raw = localStorage.getItem('lexisai_rewards');
      if (!raw) return false;

      var data = JSON.parse(raw);

      self.streak = data.streak || 0;
      self.lastPracticeDate = data.lastPracticeDate || null;
      self.totalWords = data.totalWords || 0;
      self.totalSessions = data.totalSessions || 0;
      self.totalCorrect = data.totalCorrect || 0;
      self.totalAttempts = data.totalAttempts || 0;
      self.earnedBadges = data.earnedBadges || [];
      self.xp = data.xp || 0;
      self.level = data.level || 1;
      self.dailyMission = data.dailyMission || null;
      self.weeklyGoal = data.weeklyGoal || null;
      self._bestStreakCorrect = data.bestStreakCorrect || 0;
      self._phonemeScores = data.phonemeScores || {};

      // Ensure daily mission is for today; regenerate if stale
      if (self.dailyMission && self.dailyMission.date !== self._todayString()) {
        self.generateDailyMission();
      }
      if (!self.dailyMission) {
        self.generateDailyMission();
      }

      // Ensure weekly goal is for this week; regenerate if stale
      if (self.weeklyGoal && self.weeklyGoal.week !== self._getWeekNumber()) {
        self.generateWeeklyGoal();
      }
      if (!self.weeklyGoal) {
        self.generateWeeklyGoal();
      }

      return true;
    } catch (e) {
      return false;
    }
  },

  reset: function () {
    var self = RewardSystem;

    self.streak = 0;
    self.lastPracticeDate = null;
    self.totalWords = 0;
    self.totalSessions = 0;
    self.totalCorrect = 0;
    self.totalAttempts = 0;
    self.earnedBadges = [];
    self.dailyMission = null;
    self.weeklyGoal = null;
    self.xp = 0;
    self.level = 1;
    self._currentStreakCorrect = 0;
    self._bestStreakCorrect = 0;
    self._lastSessionScore = 0;
    self._lastSessionDuration = 0;
    self._wordsPerMinute = 0;
    self._phonemeScores = {};

    try {
      localStorage.removeItem('lexisai_rewards');
    } catch (e) {
      // fail silently
    }

    // Generate fresh missions
    self.generateDailyMission();
    self.generateWeeklyGoal();
  },

  // ─── Internal Helpers ────────────────────────────────────────────────

  _todayString: function () {
    var d = new Date();
    var y = d.getFullYear();
    var m = ('0' + (d.getMonth() + 1)).slice(-2);
    var day = ('0' + d.getDate()).slice(-2);
    return y + '-' + m + '-' + day;
  },

  _yesterdayString: function () {
    var d = new Date();
    d.setDate(d.getDate() - 1);
    var y = d.getFullYear();
    var m = ('0' + (d.getMonth() + 1)).slice(-2);
    var day = ('0' + d.getDate()).slice(-2);
    return y + '-' + m + '-' + day;
  },

  _getWeekNumber: function () {
    var d = new Date();
    var start = new Date(d.getFullYear(), 0, 1);
    var diff = d - start;
    var oneDay = 86400000;
    var dayOfYear = Math.floor(diff / oneDay) + 1;
    return Math.ceil(dayOfYear / 7);
  },

  _getMissionProgress: function (mission, sessionStats) {
    var self = RewardSystem;
    sessionStats = sessionStats || {};

    switch (mission.type) {
      case 'word_count':
        return (mission.progress || 0) + (sessionStats.words || 0);
      case 'accuracy':
        if (sessionStats.attempts > 0) {
          var acc = Math.round((sessionStats.correct / sessionStats.attempts) * 100);
          return Math.max(mission.progress || 0, acc);
        }
        return mission.progress || 0;
      case 'phoneme_score':
        if (sessionStats.phonemeScores) {
          var maxScore = 0;
          var keys = Object.keys(sessionStats.phonemeScores);
          for (var i = 0; i < keys.length; i++) {
            if (sessionStats.phonemeScores[keys[i]] > maxScore) {
              maxScore = sessionStats.phonemeScores[keys[i]];
            }
          }
          return Math.max(mission.progress || 0, maxScore);
        }
        return mission.progress || 0;
      case 'session_time':
        return (mission.progress || 0) + (sessionStats.duration || 0);
      case 'streak_continue':
        return self.streak >= 1 ? 1 : 0;
      case 'no_miss':
        return Math.max(mission.progress || 0, sessionStats.streakCorrect || 0);
      default:
        return mission.progress || 0;
    }
  },

  _getWeeklyGoalProgress: function (goal, sessionStats) {
    var self = RewardSystem;
    sessionStats = sessionStats || {};

    switch (goal.type) {
      case 'weekly_words':
        return (goal.progress || 0) + (sessionStats.words || 0);
      case 'weekly_sessions':
        return (goal.progress || 0) + 1;
      case 'weekly_streak':
        return self.streak;
      case 'weekly_accuracy':
        if (self.totalAttempts > 0) {
          var acc = Math.round((self.totalCorrect / self.totalAttempts) * 100);
          return Math.max(goal.progress || 0, acc);
        }
        return goal.progress || 0;
      default:
        return goal.progress || 0;
    }
  }
};

// Auto-load saved state on script inclusion
(function () {
  try {
    RewardSystem.load();
  } catch (e) {
    // First run or corrupted data — state stays at defaults
  }

  // Ensure missions exist even on fresh load
  if (!RewardSystem.dailyMission) {
    RewardSystem.generateDailyMission();
  }
  if (!RewardSystem.weeklyGoal) {
    RewardSystem.generateWeeklyGoal();
  }
})();
