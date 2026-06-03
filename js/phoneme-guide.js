// LexisAI — Bengali Phoneme Guide Database v1
// Comprehensive Bengali phoneme guide for speech therapy
// Includes vowels, consonants, minimal pairs, practice words, and helper functions

const PhonemeGuide = {

  // =========================================================================
  // COMPLETE BENGALI PHONEME DATABASE
  // =========================================================================
  phonemes: {

    // -------------------------------------------------------------------------
    // VOWELS (স্বরবর্ণ)
    // -------------------------------------------------------------------------

    'আ': {
      type: 'vowel',
      name: 'আ',
      nameEn: 'a',
      formants: [700, 1100, 2500],
      example: 'আম',
      mouthPosition: {
        tongue: 'নিচে পিছনে',
        tongueEn: 'low back',
        lips: 'মুখ বড় করে খোলা',
        lipsEn: 'open wide',
        airflow: 'স্বরবর্ণ - স্বাভাবিক শ্বাস',
        airflowEn: 'voiced - normal breath'
      },
      tip: 'মুখ বড় করে খুলে "আআআ" করো',
      tipEn: 'Open mouth wide and say "aaah"',
      commonMistake: null,
      difficulty: 'easy',
      group: 'স্বরবর্ণ'
    },

    'ই': {
      type: 'vowel',
      name: 'ই',
      nameEn: 'i',
      formants: [300, 2300, 3000],
      example: 'ইঁদুর',
      mouthPosition: {
        tongue: 'উপরে সামনে',
        tongueEn: 'high front',
        lips: 'হাসির মতো চিকন',
        lipsEn: 'smile-like narrow',
        airflow: 'স্বরবর্ণ - স্বাভাবিক শ্বাস',
        airflowEn: 'voiced - normal breath'
      },
      tip: 'হাসির মতো মুখ করে "ইইই" বলো',
      tipEn: 'Smile narrowly and say "eeeee"',
      commonMistake: null,
      difficulty: 'easy',
      group: 'স্বরবর্ণ'
    },

    'উ': {
      type: 'vowel',
      name: 'উ',
      nameEn: 'u',
      formants: [300, 800, 2300],
      example: 'উট',
      mouthPosition: {
        tongue: 'উপরে পিছনে',
        tongueEn: 'high back',
        lips: 'গোল করে ছোট',
        lipsEn: 'rounded small',
        airflow: 'স্বরবর্ণ - স্বাভাবিক শ্বাস',
        airflowEn: 'voiced - normal breath'
      },
      tip: 'মুখ গোল করে ছোট করে "উউউ" বলো',
      tipEn: 'Round lips small and say "oooo"',
      commonMistake: null,
      difficulty: 'easy',
      group: 'স্বরবর্ণ'
    },

    'এ': {
      type: 'vowel',
      name: 'এ',
      nameEn: 'e',
      formants: [500, 1800, 2600],
      example: 'এক',
      mouthPosition: {
        tongue: 'মাঝে সামনে',
        tongueEn: 'mid front',
        lips: 'সামান্য খোলা',
        lipsEn: 'slightly open',
        airflow: 'স্বরবর্ণ - স্বাভাবিক শ্বাস',
        airflowEn: 'voiced - normal breath'
      },
      tip: 'মুখ সামান্য খুলে "এএএ" বলো',
      tipEn: 'Open mouth slightly and say "ehhhh"',
      commonMistake: null,
      difficulty: 'easy',
      group: 'স্বরবর্ণ'
    },

    'ও': {
      type: 'vowel',
      name: 'ও',
      nameEn: 'o',
      formants: [500, 900, 2500],
      example: 'ওষুধ',
      mouthPosition: {
        tongue: 'মাঝে পিছনে',
        tongueEn: 'mid back',
        lips: 'গোল করে খোলা',
        lipsEn: 'rounded open',
        airflow: 'স্বরবর্ণ - স্বাভাবিক শ্বাস',
        airflowEn: 'voiced - normal breath'
      },
      tip: 'মুখ গোল করে "ওওও" বলো',
      tipEn: 'Round lips and say "ohhhh"',
      commonMistake: null,
      difficulty: 'easy',
      group: 'স্বরবর্ণ'
    },

    'অ্যা': {
      type: 'vowel',
      name: 'অ্যা',
      nameEn: 'æ',
      formants: [600, 1700, 2500],
      example: 'অ্যাপ',
      mouthPosition: {
        tongue: 'নিচে সামনে',
        tongueEn: 'low front',
        lips: 'মুখ সামান্য খোলা',
        lipsEn: 'mouth slightly open',
        airflow: 'স্বরবর্ণ - স্বাভাবিক শ্বাস',
        airflowEn: 'voiced - normal breath'
      },
      tip: '"আ" এবং "এ" এর মাঝামাঝি শব্দ করো',
      tipEn: 'Make a sound between "a" and "e"',
      commonMistake: 'আ',
      difficulty: 'medium',
      group: 'স্বরবর্ণ'
    },

    'ঐ': {
      type: 'vowel',
      name: 'ঐ',
      nameEn: 'oi',
      formants: [500, 1500, 2600],
      example: 'ঐরাবত',
      mouthPosition: {
        tongue: 'মাঝে থেকে সামনে',
        tongueEn: 'mid to front gliding',
        lips: 'সামান্য থেকে চিকন',
        lipsEn: 'slightly open to narrow',
        airflow: 'স্বরবর্ণ - স্বাভাবিক শ্বাস (যুক্তস্বর)',
        airflowEn: 'voiced - normal breath (diphthong)'
      },
      tip: 'প্রথমে "অ" তারপর দ্রুত "ই" তে যাও',
      tipEn: 'Start with "o" then quickly glide to "i"',
      commonMistake: 'এ',
      difficulty: 'medium',
      group: 'স্বরবর্ণ'
    },

    'ঔ': {
      type: 'vowel',
      name: 'ঔ',
      nameEn: 'ou',
      formants: [500, 1000, 2500],
      example: 'ঔষধ',
      mouthPosition: {
        tongue: 'মাঝে থেকে পিছনে',
        tongueEn: 'mid to back gliding',
        lips: 'সামান্য থেকে গোল',
        lipsEn: 'slightly open to rounded',
        airflow: 'স্বরবর্ণ - স্বাভাবিক শ্বাস (যুক্তস্বর)',
        airflowEn: 'voiced - normal breath (diphthong)'
      },
      tip: 'প্রথমে "অ" তারপর দ্রুত "উ" তে যাও',
      tipEn: 'Start with "o" then quickly glide to "u"',
      commonMistake: 'ও',
      difficulty: 'medium',
      group: 'স্বরবর্ণ'
    },

    // -------------------------------------------------------------------------
    // CONSONANTS (ব্যঞ্জনবর্ণ) — ক বর্গ (Velars)
    // -------------------------------------------------------------------------

    'ক': {
      type: 'consonant',
      name: 'ক',
      nameEn: 'k',
      formants: [1500, 3000, 0],
      example: 'কলম',
      mouthPosition: {
        tongue: 'পিছনে তালুর কাছে',
        tongueEn: 'back near palate',
        lips: 'স্বাভাবিক',
        lipsEn: 'normal',
        airflow: 'অঘোষ অল্পপ্রাণ - হালকা বাতাস',
        airflowEn: 'voiceless unaspirated - light breath'
      },
      tip: 'জিহ্বার পিছন তালুতে লাগিয়ে হালকা ছেড়ে দাও',
      tipEn: 'Press back of tongue to palate and release lightly',
      commonMistake: null,
      difficulty: 'easy',
      group: 'ক বর্গ'
    },

    'খ': {
      type: 'consonant',
      name: 'খ',
      nameEn: 'kh',
      formants: [1500, 3000, 80],
      example: 'খবর',
      mouthPosition: {
        tongue: 'পিছনে তালুর কাছে',
        tongueEn: 'back near palate',
        lips: 'স্বাভাবিক',
        lipsEn: 'normal',
        airflow: 'অঘোষ মহাপ্রাণ - জোরে বাতাস বের হয়',
        airflowEn: 'voiceless aspirated - strong air release'
      },
      tip: '"ক" এর মতো কিন্তু জোরে বাতাস ছেড়ে দাও',
      tipEn: 'Like "k" but release with a strong puff of air',
      commonMistake: 'ক',
      difficulty: 'easy',
      group: 'ক বর্গ'
    },

    'গ': {
      type: 'consonant',
      name: 'গ',
      nameEn: 'g',
      formants: [1500, 3000, 0],
      example: 'গাছ',
      mouthPosition: {
        tongue: 'পিছনে তালুর কাছে',
        tongueEn: 'back near palate',
        lips: 'স্বাভাবিক',
        lipsEn: 'normal',
        airflow: 'ঘোষ অল্পপ্রাণ - গলায় কম্পন সহ',
        airflowEn: 'voiced unaspirated - with throat vibration'
      },
      tip: 'জিহ্বার পিছন তালুতে লাগিয়ে গলায় কম্পন করে ছেড়ে দাও',
      tipEn: 'Press back of tongue to palate, vibrate throat and release',
      commonMistake: null,
      difficulty: 'easy',
      group: 'ক বর্গ'
    },

    'ঘ': {
      type: 'consonant',
      name: 'ঘ',
      nameEn: 'gh',
      formants: [1500, 3000, 80],
      example: 'ঘর',
      mouthPosition: {
        tongue: 'পিছনে তালুর কাছে',
        tongueEn: 'back near palate',
        lips: 'স্বাভাবিক',
        lipsEn: 'normal',
        airflow: 'ঘোষ মহাপ্রাণ - গলায় কম্পন ও জোরে বাতাস',
        airflowEn: 'voiced aspirated - throat vibration with strong air'
      },
      tip: '"গ" এর মতো কিন্তু জোরে বাতাস ছেড়ে দাও',
      tipEn: 'Like "g" but release with a strong puff of air',
      commonMistake: 'গ',
      difficulty: 'medium',
      group: 'ক বর্গ'
    },

    'ঙ': {
      type: 'consonant',
      name: 'ঙ',
      nameEn: 'ng',
      formants: [250, 1000, 0],
      example: 'অঙ্ক',
      mouthPosition: {
        tongue: 'পিছনে তালুর কাছে',
        tongueEn: 'back near palate',
        lips: 'স্বাভাবিক',
        lipsEn: 'normal',
        airflow: 'নাসিক্য - নাক দিয়ে শ্বাস বের হয়',
        airflowEn: 'nasal - air exits through nose'
      },
      tip: '"ং" এর মতো নাক দিয়ে শব্দ করো, জিহ্বা পিছনে রেখে',
      tipEn: 'Make nasal sound like "ng", keep tongue at back',
      commonMistake: 'ন',
      difficulty: 'hard',
      group: 'ক বর্গ'
    },

    // -------------------------------------------------------------------------
    // চ বর্গ (Palatals / Alveolo-palatals)
    // -------------------------------------------------------------------------

    'চ': {
      type: 'consonant',
      name: 'চ',
      nameEn: 'c',
      formants: [2000, 2800, 0],
      example: 'চা',
      mouthPosition: {
        tongue: 'মাঝে তালুর কাছে',
        tongueEn: 'mid near palate',
        lips: 'সামান্য এগিয়ে',
        lipsEn: 'slightly forward',
        airflow: 'অঘোষ অল্পপ্রাণ - হালকা বাতাস',
        airflowEn: 'voiceless unaspirated - light breath'
      },
      tip: 'জিহ্বার মাঝখানে তালুতে লাগিয়ে হালকা ছেড়ে দাও',
      tipEn: 'Press middle of tongue to palate and release lightly',
      commonMistake: null,
      difficulty: 'easy',
      group: 'চ বর্গ'
    },

    'ছ': {
      type: 'consonant',
      name: 'ছ',
      nameEn: 'ch',
      formants: [2000, 2800, 80],
      example: 'ছাতা',
      mouthPosition: {
        tongue: 'মাঝে তালুর কাছে',
        tongueEn: 'mid near palate',
        lips: 'সামান্য এগিয়ে',
        lipsEn: 'slightly forward',
        airflow: 'অঘোষ মহাপ্রাণ - জোরে বাতাস বের হয়',
        airflowEn: 'voiceless aspirated - strong air release'
      },
      tip: '"চ" এর মতো কিন্তু জোরে বাতাস ছেড়ে দাও',
      tipEn: 'Like "ch" but release with a strong puff of air',
      commonMistake: 'চ',
      difficulty: 'easy',
      group: 'চ বর্গ'
    },

    'জ': {
      type: 'consonant',
      name: 'জ',
      nameEn: 'j',
      formants: [2000, 2800, 0],
      example: 'জল',
      mouthPosition: {
        tongue: 'মাঝে তালুর কাছে',
        tongueEn: 'mid near palate',
        lips: 'সামান্য এগিয়ে',
        lipsEn: 'slightly forward',
        airflow: 'ঘোষ অল্পপ্রাণ - গলায় কম্পন সহ',
        airflowEn: 'voiced unaspirated - with throat vibration'
      },
      tip: 'জিহ্বার মাঝখানে তালুতে লাগিয়ে গলায় কম্পন করে ছেড়ে দাও',
      tipEn: 'Press middle of tongue to palate, vibrate throat and release',
      commonMistake: null,
      difficulty: 'easy',
      group: 'চ বর্গ'
    },

    'ঝ': {
      type: 'consonant',
      name: 'ঝ',
      nameEn: 'jh',
      formants: [2000, 2800, 80],
      example: 'ঝড়',
      mouthPosition: {
        tongue: 'মাঝে তালুর কাছে',
        tongueEn: 'mid near palate',
        lips: 'সামান্য এগিয়ে',
        lipsEn: 'slightly forward',
        airflow: 'ঘোষ মহাপ্রাণ - গলায় কম্পন ও জোরে বাতাস',
        airflowEn: 'voiced aspirated - throat vibration with strong air'
      },
      tip: '"জ" এর মতো কিন্তু জোরে বাতাস ছেড়ে দাও',
      tipEn: 'Like "j" but release with a strong puff of air',
      commonMistake: 'জ',
      difficulty: 'medium',
      group: 'চ বর্গ'
    },

    'ঞ': {
      type: 'consonant',
      name: 'ঞ',
      nameEn: 'ñ',
      formants: [250, 1200, 0],
      example: 'পঞ্চ',
      mouthPosition: {
        tongue: 'মাঝে তালুর কাছে',
        tongueEn: 'mid near palate',
        lips: 'স্বাভাবিক',
        lipsEn: 'normal',
        airflow: 'নাসিক্য - নাক দিয়ে শ্বাস বের হয়',
        airflowEn: 'nasal - air exits through nose'
      },
      tip: '"ন" এর মতো কিন্তু জিহ্বা মাঝখানে তালুতে রেখে নাক দিয়ে শব্দ করো',
      tipEn: 'Like "n" but with tongue at middle of palate, nasal sound',
      commonMistake: 'ন',
      difficulty: 'hard',
      group: 'চ বর্গ'
    },

    // -------------------------------------------------------------------------
    // ট বর্গ (Retroflexes)
    // -------------------------------------------------------------------------

    'ট': {
      type: 'consonant',
      name: 'ট',
      nameEn: 'ṭ',
      formants: [1600, 2600, 0],
      example: 'টাকা',
      mouthPosition: {
        tongue: 'মুড়ে পিছনে তালুতে',
        tongueEn: 'curled back to palate',
        lips: 'স্বাভাবিক',
        lipsEn: 'normal',
        airflow: 'অঘোষ অল্পপ্রাণ - হালকা বাতাস',
        airflowEn: 'voiceless unaspirated - light breath'
      },
      tip: 'জিহ্বার ডগা উপরে মুড়ে তালুতে আঘাত করো',
      tipEn: 'Curl tongue tip up and strike the palate',
      commonMistake: 'ত',
      difficulty: 'medium',
      group: 'ট বর্গ'
    },

    'ঠ': {
      type: 'consonant',
      name: 'ঠ',
      nameEn: 'ṭh',
      formants: [1600, 2600, 80],
      example: 'ঠিক',
      mouthPosition: {
        tongue: 'মুড়ে পিছনে তালুতে',
        tongueEn: 'curled back to palate',
        lips: 'স্বাভাবিক',
        lipsEn: 'normal',
        airflow: 'অঘোষ মহাপ্রাণ - জোরে বাতাস বের হয়',
        airflowEn: 'voiceless aspirated - strong air release'
      },
      tip: '"ট" এর মতো কিন্তু জোরে বাতাস ছেড়ে দাও',
      tipEn: 'Like "ṭ" but release with a strong puff of air',
      commonMistake: 'ট',
      difficulty: 'medium',
      group: 'ট বর্গ'
    },

    'ড': {
      type: 'consonant',
      name: 'ড',
      nameEn: 'ḍ',
      formants: [1600, 2600, 0],
      example: 'ডাক',
      mouthPosition: {
        tongue: 'মুড়ে পিছনে তালুতে',
        tongueEn: 'curled back to palate',
        lips: 'স্বাভাবিক',
        lipsEn: 'normal',
        airflow: 'ঘোষ অল্পপ্রাণ - গলায় কম্পন সহ',
        airflowEn: 'voiced unaspirated - with throat vibration'
      },
      tip: 'জিহ্বা মুড়ে তালুতে আঘাত করে গলায় কম্পন করো',
      tipEn: 'Curl tongue to strike palate with throat vibration',
      commonMistake: 'দ',
      difficulty: 'medium',
      group: 'ট বর্গ'
    },

    'ঢ': {
      type: 'consonant',
      name: 'ঢ',
      nameEn: 'ḍh',
      formants: [1600, 2600, 80],
      example: 'ঢোল',
      mouthPosition: {
        tongue: 'মুড়ে পিছনে তালুতে',
        tongueEn: 'curled back to palate',
        lips: 'স্বাভাবিক',
        lipsEn: 'normal',
        airflow: 'ঘোষ মহাপ্রাণ - গলায় কম্পন ও জোরে বাতাস',
        airflowEn: 'voiced aspirated - throat vibration with strong air'
      },
      tip: '"ড" এর মতো কিন্তু জোরে বাতাস ছেড়ে দাও',
      tipEn: 'Like "ḍ" but release with a strong puff of air',
      commonMistake: 'ড',
      difficulty: 'hard',
      group: 'ট বর্গ'
    },

    'ণ': {
      type: 'consonant',
      name: 'ণ',
      nameEn: 'ṇ',
      formants: [250, 1200, 0],
      example: 'হরিণ',
      mouthPosition: {
        tongue: 'মুড়ে পিছনে তালুতে',
        tongueEn: 'curled back to palate',
        lips: 'স্বাভাবিক',
        lipsEn: 'normal',
        airflow: 'নাসিক্য - নাক দিয়ে শ্বাস বের হয়',
        airflowEn: 'nasal - air exits through nose'
      },
      tip: 'জিহ্বা মুড়ে তালুতে রেখে নাক দিয়ে "ণ" শব্দ করো',
      tipEn: 'Curl tongue to palate and make nasal "ṇ" sound',
      commonMistake: 'ন',
      difficulty: 'hard',
      group: 'ট বর্গ'
    },

    // -------------------------------------------------------------------------
    // ত বর্গ (Dentals)
    // -------------------------------------------------------------------------

    'ত': {
      type: 'consonant',
      name: 'ত',
      nameEn: 't',
      formants: [1800, 2500, 0],
      example: 'তালা',
      mouthPosition: {
        tongue: 'দাঁতের পিছনে',
        tongueEn: 'behind upper teeth',
        lips: 'স্বাভাবিক',
        lipsEn: 'normal',
        airflow: 'অঘোষ অল্পপ্রাণ - হালকা বাতাস',
        airflowEn: 'voiceless unaspirated - light breath'
      },
      tip: 'জিহ্বার ডগা দাঁতের পিছনে লাগিয়ে ছেড়ে দাও',
      tipEn: 'Place tongue tip behind upper teeth and release',
      commonMistake: 'ট',
      difficulty: 'medium',
      group: 'ত বর্গ'
    },

    'থ': {
      type: 'consonant',
      name: 'থ',
      nameEn: 'th',
      formants: [1800, 2500, 80],
      example: 'থালা',
      mouthPosition: {
        tongue: 'দাঁতের পিছনে',
        tongueEn: 'behind upper teeth',
        lips: 'স্বাভাবিক',
        lipsEn: 'normal',
        airflow: 'অঘোষ মহাপ্রাণ - জোরে বাতাস বের হয়',
        airflowEn: 'voiceless aspirated - strong air release'
      },
      tip: '"ত" এর মতো কিন্তু জোরে বাতাস ছেড়ে দাও',
      tipEn: 'Like "t" but release with a strong puff of air',
      commonMistake: 'ত',
      difficulty: 'medium',
      group: 'ত বর্গ'
    },

    'দ': {
      type: 'consonant',
      name: 'দ',
      nameEn: 'd',
      formants: [1800, 2500, 0],
      example: 'দিন',
      mouthPosition: {
        tongue: 'দাঁতের পিছনে',
        tongueEn: 'behind upper teeth',
        lips: 'স্বাভাবিক',
        lipsEn: 'normal',
        airflow: 'ঘোষ অল্পপ্রাণ - গলায় কম্পন সহ',
        airflowEn: 'voiced unaspirated - with throat vibration'
      },
      tip: 'জিহ্বার ডগা দাঁতের পিছনে লাগিয়ে গলায় কম্পন করে ছেড়ে দাও',
      tipEn: 'Place tongue tip behind teeth, vibrate throat and release',
      commonMistake: 'ড',
      difficulty: 'easy',
      group: 'ত বর্গ'
    },

    'ধ': {
      type: 'consonant',
      name: 'ধ',
      nameEn: 'dh',
      formants: [1800, 2500, 80],
      example: 'ধান',
      mouthPosition: {
        tongue: 'দাঁতের পিছনে',
        tongueEn: 'behind upper teeth',
        lips: 'স্বাভাবিক',
        lipsEn: 'normal',
        airflow: 'ঘোষ মহাপ্রাণ - গলায় কম্পন ও জোরে বাতাস',
        airflowEn: 'voiced aspirated - throat vibration with strong air'
      },
      tip: '"দ" এর মতো কিন্তু জোরে বাতাস ছেড়ে দাও',
      tipEn: 'Like "d" but release with a strong puff of air',
      commonMistake: 'দ',
      difficulty: 'medium',
      group: 'ত বর্গ'
    },

    'ন': {
      type: 'consonant',
      name: 'ন',
      nameEn: 'n',
      formants: [250, 1000, 0],
      example: 'নদী',
      mouthPosition: {
        tongue: 'দাঁতের পিছনে',
        tongueEn: 'behind upper teeth',
        lips: 'স্বাভাবিক',
        lipsEn: 'normal',
        airflow: 'নাসিক্য - নাক দিয়ে শ্বাস বের হয়',
        airflowEn: 'nasal - air exits through nose'
      },
      tip: 'জিহ্বা দাঁতের পিছনে রেখে নাক দিয়ে "ন" শব্দ করো',
      tipEn: 'Place tongue behind teeth and make nasal "n" sound',
      commonMistake: 'ণ',
      difficulty: 'easy',
      group: 'ত বর্গ'
    },

    // -------------------------------------------------------------------------
    // প বর্গ (Labials)
    // -------------------------------------------------------------------------

    'প': {
      type: 'consonant',
      name: 'প',
      nameEn: 'p',
      formants: [1000, 1800, 0],
      example: 'পাখি',
      mouthPosition: {
        tongue: 'স্বাভাবিক',
        tongueEn: 'normal',
        lips: 'দুই ঠোঁট মিলিয়ে',
        lipsEn: 'both lips together',
        airflow: 'অঘোষ অল্পপ্রাণ - হালকা বাতাস',
        airflowEn: 'voiceless unaspirated - light breath'
      },
      tip: 'দুই ঠোঁট মিলিয়ে হালকা ছেড়ে দাও',
      tipEn: 'Press both lips together and release lightly',
      commonMistake: null,
      difficulty: 'easy',
      group: 'প বর্গ'
    },

    'ফ': {
      type: 'consonant',
      name: 'ফ',
      nameEn: 'ph',
      formants: [1000, 1800, 80],
      example: 'ফুল',
      mouthPosition: {
        tongue: 'স্বাভাবিক',
        tongueEn: 'normal',
        lips: 'দুই ঠোঁট মিলিয়ে',
        lipsEn: 'both lips together',
        airflow: 'অঘোষ মহাপ্রাণ - জোরে বাতাস বের হয়',
        airflowEn: 'voiceless aspirated - strong air release'
      },
      tip: '"প" এর মতো কিন্তু জোরে বাতাস ছেড়ে দাও, শিসের মতো',
      tipEn: 'Like "p" but release with a strong puff of air, like a whistle',
      commonMistake: 'প',
      difficulty: 'easy',
      group: 'প বর্গ'
    },

    'ব': {
      type: 'consonant',
      name: 'ব',
      nameEn: 'b',
      formants: [1000, 1800, 0],
      example: 'বাড়ি',
      mouthPosition: {
        tongue: 'স্বাভাবিক',
        tongueEn: 'normal',
        lips: 'দুই ঠোঁট মিলিয়ে',
        lipsEn: 'both lips together',
        airflow: 'ঘোষ অল্পপ্রাণ - গলায় কম্পন সহ',
        airflowEn: 'voiced unaspirated - with throat vibration'
      },
      tip: 'দুই ঠোঁট মিলিয়ে গলায় কম্পন করে ছেড়ে দাও',
      tipEn: 'Press both lips together, vibrate throat and release',
      commonMistake: null,
      difficulty: 'easy',
      group: 'প বর্গ'
    },

    'ভ': {
      type: 'consonant',
      name: 'ভ',
      nameEn: 'bh',
      formants: [1000, 1800, 80],
      example: 'ভাত',
      mouthPosition: {
        tongue: 'স্বাভাবিক',
        tongueEn: 'normal',
        lips: 'দুই ঠোঁট মিলিয়ে',
        lipsEn: 'both lips together',
        airflow: 'ঘোষ মহাপ্রাণ - গলায় কম্পন ও জোরে বাতাস',
        airflowEn: 'voiced aspirated - throat vibration with strong air'
      },
      tip: '"ব" এর মতো কিন্তু জোরে বাতাস ছেড়ে দাও',
      tipEn: 'Like "b" but release with a strong puff of air',
      commonMistake: 'ব',
      difficulty: 'medium',
      group: 'প বর্গ'
    },

    'ম': {
      type: 'consonant',
      name: 'ম',
      nameEn: 'm',
      formants: [250, 1000, 0],
      example: 'মাছ',
      mouthPosition: {
        tongue: 'স্বাভাবিক',
        tongueEn: 'normal',
        lips: 'দুই ঠোঁট মিলিয়ে',
        lipsEn: 'both lips together',
        airflow: 'নাসিক্য - নাক দিয়ে শ্বাস বের হয়',
        airflowEn: 'nasal - air exits through nose'
      },
      tip: 'দুই ঠোঁট বন্ধ করে নাক দিয়ে "মমম" শব্দ করো',
      tipEn: 'Close both lips and make nasal "mmm" sound',
      commonMistake: null,
      difficulty: 'easy',
      group: 'প বর্গ'
    },

    // -------------------------------------------------------------------------
    // অন্তঃস্থ (Approximants / Semivowels)
    // -------------------------------------------------------------------------

    'য': {
      type: 'consonant',
      name: 'য',
      nameEn: 'y',
      formants: [2000, 2600, 0],
      example: 'যাত্রা',
      mouthPosition: {
        tongue: 'সামনে তালুর কাছে',
        tongueEn: 'front near palate',
        lips: 'সামান্য খোলা',
        lipsEn: 'slightly open',
        airflow: 'ঘোষ অন্তঃস্থ - মসৃণ বায়ুপ্রবাহ',
        airflowEn: 'voiced approximant - smooth airflow'
      },
      tip: '"ই" এর শব্দ থেকে দ্রুত পরবর্তী স্বরবর্ণে যাও',
      tipEn: 'Start from "i" position and glide quickly to the next vowel',
      commonMistake: 'জ',
      difficulty: 'easy',
      group: 'অন্তঃস্থ'
    },

    'র': {
      type: 'consonant',
      name: 'র',
      nameEn: 'r',
      formants: [1800, 2500, 0],
      example: 'রাস্তা',
      mouthPosition: {
        tongue: 'সামনে উপরে একবার আঘাত',
        tongueEn: 'front upper single tap',
        lips: 'স্বাভাবিক',
        lipsEn: 'normal',
        airflow: 'ঘোষ অন্তঃস্থ - একবার স্পর্শ',
        airflowEn: 'voiced tap - single contact'
      },
      tip: 'জিহ্বার ডগা একবার তালুতে স্পর্শ করে তাড়াতাড়ি ছেড়ে দাও',
      tipEn: 'Tap tongue tip once quickly against the palate',
      commonMistake: 'ড়',
      difficulty: 'medium',
      group: 'অন্তঃস্থ'
    },

    'ল': {
      type: 'consonant',
      name: 'ল',
      nameEn: 'l',
      formants: [1800, 2500, 0],
      example: 'লাল',
      mouthPosition: {
        tongue: 'সামনে তালুতে পাশের দিকে',
        tongueEn: 'front sides of palate',
        lips: 'স্বাভাবিক',
        lipsEn: 'normal',
        airflow: 'ঘোষ পার্শ্বিক - জিহ্বার পাশ দিয়ে বাতাস',
        airflowEn: 'voiced lateral - air flows around tongue sides'
      },
      tip: 'জিহ্বার ডগা তালুতে লাগিয়ে পাশ দিয়ে বাতাস ছেড়ে দাও',
      tipEn: 'Press tongue tip to palate and let air flow around the sides',
      commonMistake: null,
      difficulty: 'easy',
      group: 'অন্তঃস্থ'
    },

    // -------------------------------------------------------------------------
    // উষ্ম (Fricatives)
    // -------------------------------------------------------------------------

    'শ': {
      type: 'consonant',
      name: 'শ',
      nameEn: 'ś',
      formants: [2500, 3500, 0],
      example: 'শহর',
      mouthPosition: {
        tongue: 'সামনে তালুর কাছে বাঁকানো',
        tongueEn: 'front near palate, raised',
        lips: 'সামান্য এগিয়ে গোল',
        lipsEn: 'slightly forward and rounded',
        airflow: 'অঘোষ উষ্ম - বাতাস ঘর্ষণ করে বের হয়',
        airflowEn: 'voiceless fricative - air rubs through narrow gap'
      },
      tip: 'জিহ্বা তালুর কাছে উঁচু করে বাতাস ছেড়ে দাও, "শশশ" শব্দ করো',
      tipEn: 'Raise tongue near palate and push air through, make "shshsh" sound',
      commonMistake: 'স',
      difficulty: 'medium',
      group: 'উষ্ম'
    },

    'ষ': {
      type: 'consonant',
      name: 'ষ',
      nameEn: 'ṣ',
      formants: [2500, 3500, 0],
      example: 'কষ্ট',
      mouthPosition: {
        tongue: 'পিছনে মুড়ে তালুর কাছে',
        tongueEn: 'back curled near palate',
        lips: 'সামান্য এগিয়ে গোল',
        lipsEn: 'slightly forward and rounded',
        airflow: 'অঘোষ উষ্ম - বাতাস ঘর্ষণ করে বের হয়',
        airflowEn: 'voiceless fricative - air rubs through narrow gap'
      },
      tip: '"শ" এর মতোই উচ্চারণ, তবে লেখায় ভিন্ন - বানানের নিয়ম মনে রাখো',
      tipEn: 'Pronounced like "ś" but spelled differently - remember spelling rules',
      commonMistake: 'শ',
      difficulty: 'hard',
      group: 'উষ্ম'
    },

    'স': {
      type: 'consonant',
      name: 'স',
      nameEn: 's',
      formants: [2500, 3500, 0],
      example: 'সূর্য',
      mouthPosition: {
        tongue: 'সামনে তালুর কাছে চ্যাপ্টা',
        tongueEn: 'front near palate, flat',
        lips: 'সামান্য এগিয়ে',
        lipsEn: 'slightly forward',
        airflow: 'অঘোষ উষ্ম - বাতাস ঘর্ষণ করে বের হয়',
        airflowEn: 'voiceless fricative - air rubs through narrow gap'
      },
      tip: '"শ" এর মতোই উচ্চারণ, তবে লেখায় ভিন্ন - বানানের নিয়ম মনে রাখো',
      tipEn: 'Pronounced like "ś" but spelled differently - remember spelling rules',
      commonMistake: 'শ',
      difficulty: 'medium',
      group: 'উষ্ম'
    },

    'হ': {
      type: 'consonant',
      name: 'হ',
      nameEn: 'h',
      formants: [1500, 2000, 0],
      example: 'হাত',
      mouthPosition: {
        tongue: 'স্বাভাবিক অবস্থান',
        tongueEn: 'normal position',
        lips: 'খোলা',
        lipsEn: 'open',
        airflow: 'অঘোষ উষ্ম - গলা থেকে বাতাস বের হয়',
        airflowEn: 'voiceless fricative - air flows from throat'
      },
      tip: 'শ্বাস ছেড়ে দিয়ে "হহহ" শব্দ করো, গলায় কম্পন নেই',
      tipEn: 'Breathe out and make "hhh" sound, no throat vibration',
      commonMistake: null,
      difficulty: 'easy',
      group: 'উষ্ম'
    },

    // -------------------------------------------------------------------------
    // অন্য (Others)
    // -------------------------------------------------------------------------

    'ড়': {
      type: 'consonant',
      name: 'ড়',
      nameEn: 'ṛ',
      formants: [1600, 2600, 0],
      example: 'গাড়ি',
      mouthPosition: {
        tongue: 'মুড়ে পিছনে একবার আঘাত',
        tongueEn: 'curled back single tap',
        lips: 'স্বাভাবিক',
        lipsEn: 'normal',
        airflow: 'ঘোষ মুর্ধন্য কম্পিত - একবার স্পর্শ',
        airflowEn: 'voiced retroflex flap - single contact'
      },
      tip: '"র" এর চেয়ে জিহ্বা বেশি মুড়ে পিছনে একবার আঘাত করো',
      tipEn: 'Curl tongue more than "r" and tap once at the back',
      commonMistake: 'র',
      difficulty: 'hard',
      group: 'অন্য'
    },

    'ঢ়': {
      type: 'consonant',
      name: 'ঢ়',
      nameEn: 'ṛh',
      formants: [1600, 2600, 80],
      example: 'গাঢ়',
      mouthPosition: {
        tongue: 'মুড়ে পিছনে একবার আঘাত',
        tongueEn: 'curled back single tap',
        lips: 'স্বাভাবিক',
        lipsEn: 'normal',
        airflow: 'ঘোষ মুর্ধন্য মহাপ্রাণ - একবার স্পর্শ ও বাতাস',
        airflowEn: 'voiced retroflex aspirated flap - single contact with air'
      },
      tip: '"ড়" এর মতো কিন্তু জোরে বাতাস সহ আঘাত করো',
      tipEn: 'Like "ṛ" but with stronger air release on the tap',
      commonMistake: 'ড়',
      difficulty: 'hard',
      group: 'অন্য'
    },

    'য়': {
      type: 'consonant',
      name: 'য়',
      nameEn: 'ẏ',
      formants: [2000, 2600, 0],
      example: 'বায়ু',
      mouthPosition: {
        tongue: 'সামনে তালুর কাছে',
        tongueEn: 'front near palate',
        lips: 'সামান্য খোলা',
        lipsEn: 'slightly open',
        airflow: 'ঘোষ অন্তঃস্থ - মসৃণ বায়ুপ্রবাহ',
        airflowEn: 'voiced approximant - smooth airflow'
      },
      tip: '"য" এর মতো শব্দ, শব্দের শেষে বা মাঝে ব্যবহৃত',
      tipEn: 'Sound like "y", used in middle or end of words',
      commonMistake: 'য',
      difficulty: 'medium',
      group: 'অন্য'
    }
  },

  // =========================================================================
  // MINIMAL PAIRS FOR CONFUSING SOUNDS
  // =========================================================================
  minimalPairs: [

    // শ vs স (most common confusion)
    {
      pair: ['শ', 'স'],
      description: 'শ এবং স একই শব্দ কিন্তু ভিন্ন বানান',
      descriptionEn: 'শ and স sound the same but are spelled differently',
      words: [
        ['শব্দ', 'সব্দ'],
        ['শান্ত', 'সান্ত্বনা'],
        ['শুধু', 'সুধা'],
        ['শীত', 'সীমা']
      ]
    },

    // ষ vs শ
    {
      pair: ['ষ', 'শ'],
      description: 'ষ এবং শ একই শব্দ কিন্তু ভিন্ন বানান',
      descriptionEn: 'ষ and শ sound the same but are spelled differently',
      words: [
        ['কষ্ট', 'কশ্মীর'],
        ['মুষ্টি', 'মুশকিল'],
        ['ওষুধ', 'অশুভ'],
        ['ষড়ঋতু', 'শরৎকাল']
      ]
    },

    // ণ vs ন
    {
      pair: ['ণ', 'ন'],
      description: 'ণ এবং ন একই শব্দ কিন্তু ভিন্ন বানান',
      descriptionEn: 'ণ and ন sound the same but are spelled differently',
      words: [
        ['কণ্ঠ', 'কন্ঠক'],
        ['রাণী', 'রানা'],
        ['হরিণ', 'হরিনমালা'],
        ['গণ', 'গন্ধ']
      ]
    },

    // র vs ড়
    {
      pair: ['র', 'ড়'],
      description: 'র এবং ড় ভিন্ন উচ্চারণ — র একবার স্পর্শ, ড় মুড়ে আঘাত',
      descriptionEn: 'র and ড় differ — র is a tap, ড় is a curled-back flap',
      words: [
        ['বাড়ি', 'বাড়ি'],
        ['পাড়া', 'পারা'],
        ['গাড়ি', 'গারি'],
        ['শাড়ি', 'শারী']
      ]
    },

    // ব vs ভ
    {
      pair: ['ব', 'ভ'],
      description: 'ব অল্পপ্রাণ, ভ মহাপ্রাণ — বাতাসের পার্থক্য',
      descriptionEn: 'ব is unaspirated, ভ is aspirated — difference in air release',
      words: [
        ['বাত', 'ভাত'],
        ['বল', 'ভল'],
        ['বাজে', 'ভাজে'],
        ['বুক', 'ভুক']
      ]
    },

    // চ vs ছ
    {
      pair: ['চ', 'ছ'],
      description: 'চ অল্পপ্রাণ, ছ মহাপ্রাণ — বাতাসের পার্থক্য',
      descriptionEn: 'চ is unaspirated, ছ is aspirated — difference in air release',
      words: [
        ['চাল', 'ছাল'],
        ['চিল', 'ছিল'],
        ['চাপ', 'ছাপ'],
        ['চুল', 'ছুল']
      ]
    },

    // ট vs ত
    {
      pair: ['ট', 'ত'],
      description: 'ট মুর্ধন্য (জিহ্বা মুড়ে), ত দন্ত্য (জিহ্বা দাঁতের পিছনে)',
      descriptionEn: 'ট is retroflex (curled tongue), ত is dental (tongue behind teeth)',
      words: [
        ['টাকা', 'তাকা'],
        ['টল', 'তল'],
        ['টিন', 'তিন'],
        ['টান', 'তান']
      ]
    },

    // ড vs দ
    {
      pair: ['ড', 'দ'],
      description: 'ড মুর্ধন্য (জিহ্বা মুড়ে), দ দন্ত্য (জিহ্বা দাঁতের পিছনে)',
      descriptionEn: 'ড is retroflex (curled tongue), দ is dental (tongue behind teeth)',
      words: [
        ['ডাক', 'দাক'],
        ['ডাল', 'দাল'],
        ['ডোর', 'দোর'],
        ['ডিম', 'দিম']
      ]
    },

    // গ vs ঘ
    {
      pair: ['গ', 'ঘ'],
      description: 'গ অল্পপ্রাণ, ঘ মহাপ্রাণ — বাতাসের পার্থক্য',
      descriptionEn: 'গ is unaspirated, ঘ is aspirated — difference in air release',
      words: [
        ['গাল', 'ঘাল'],
        ['গল', 'ঘল'],
        ['গোল', 'ঘোল'],
        ['গম', 'ঘম']
      ]
    },

    // ক vs খ
    {
      pair: ['ক', 'খ'],
      description: 'ক অল্পপ্রাণ, খ মহাপ্রাণ — বাতাসের পার্থক্য',
      descriptionEn: 'ক is unaspirated, খ is aspirated — difference in air release',
      words: [
        ['কাল', 'খাল'],
        ['কল', 'খল'],
        ['কড়', 'খড়'],
        ['কোদ', 'খোদ']
      ]
    }
  ],

  // =========================================================================
  // PRACTICE WORDS ORGANIZED BY PHONEME AND DIFFICULTY
  // =========================================================================
  practiceWords: {

    // ----- VOWELS -----

    'আ': {
      level1: ['আ', 'আ আ', 'আ আ আ', 'আঃ', 'আঁ'],
      level2: ['আক', 'আম', 'আন', 'আল', 'আশ'],
      level3: ['আম', 'আকাশ', 'আলু', 'আগুন', 'আনারস'],
      level4: ['আয়না', 'আঁচল', 'আড়াল', 'আস্তাবল', 'আবহাওয়া'],
      level5: ['আত্মীয়', 'আকাঙ্ক্ষা', 'আলোচনা', 'আবিষ্কার', 'আনুষ্ঠানিক']
    },

    'ই': {
      level1: ['ই', 'ই ই', 'ই ই ই', 'ইঃ', 'ইঁ'],
      level2: ['ইক', 'ইম', 'ইন', 'ইল', 'ইশ'],
      level3: ['ইঁদুর', 'ইচ্ছা', 'ইস্পাত', 'ইতিহাস', 'ইংরেজি'],
      level4: ['ইন্দ্রিয়', 'ইন্ধন', 'ইমানদার', 'ইঙ্গিত', 'ইন্সপেক্টর'],
      level5: ['ইতিহাসবিদ', 'ইন্দ্রজালিক', 'ইঙ্গিতপূর্ণ', 'ইন্সটিটিউট', 'ইন্টারনেট']
    },

    'উ': {
      level1: ['উ', 'উ উ', 'উ উ উ', 'উঃ', 'উঁ'],
      level2: ['উক', 'উম', 'উন', 'উল', 'উশ'],
      level3: ['উট', 'উপায়', 'উড়ান', 'উৎসব', 'উপকার'],
      level4: ['উপস্থিত', 'উদ্যোগ', 'উৎপাদন', 'উদ্বেগ', 'উৎসাহ'],
      level5: ['উদ্ভিদবিদ্যা', 'উপসংহার', 'উৎকর্ষ', 'উদ্ঘোষণা', 'উপলব্ধি']
    },

    'এ': {
      level1: ['এ', 'এ এ', 'এ এ এ', 'এঃ', 'এঁ'],
      level2: ['এক', 'এম', 'এন', 'এল', 'এশ'],
      level3: ['এক', 'একা', 'একটি', 'এদেশ', 'এখানে'],
      level4: ['একান্ত', 'একত্র', 'একাঙ্ক', 'একাধিক', 'একাবেলা'],
      level5: ['এককেন্দ্রিক', 'একাগ্রতা', 'একমুখী', 'একান্তকরণ', 'একত্রীকরণ']
    },

    'ও': {
      level1: ['ও', 'ও ও', 'ও ও ও', 'ওঃ', 'ওঁ'],
      level2: ['ওক', 'ওম', 'ওন', 'ওল', 'ওশ'],
      level3: ['ওষুধ', 'ওঠা', 'ওজন', 'ওলো', 'ওকে'],
      level4: ['ওঠানামা', 'ওলটপালট', 'ওয়াকিফ', 'ওয়াদা', 'ওয়ারিশ'],
      level5: ['ওষুধবিজ্ঞান', 'ওঠাপড়া', 'ওয়ারিশি', 'ওয়াজমণ্ডলী', 'ওয়াকফসম্পত্তি']
    },

    'অ্যা': {
      level1: ['অ্যা', 'অ্যা অ্যা', 'অ্যা অ্যা অ্যা', 'অ্যাঃ', 'অ্যাঁ'],
      level2: ['অ্যাক', 'অ্যাম', 'অ্যান', 'অ্যাল', 'অ্যাশ'],
      level3: ['অ্যাপ', 'অ্যামি', 'অ্যাপল', 'অ্যাড', 'অ্যাংরি'],
      level4: ['অ্যাকাউন্ট', 'অ্যাটাচি', 'অ্যালার্জি', 'অ্যাসিড', 'অ্যানাটমি'],
      level5: ['অ্যাপ্রিকট', 'অ্যাকাউন্ট্যান্ট', 'অ্যাস্ট্রোনমি', 'অ্যানালিটিক্স', 'অ্যান্টিবায়োটিক']
    },

    'ঐ': {
      level1: ['ঐ', 'ঐ ঐ', 'ঐ ঐ ঐ', 'ঐঃ', 'ঐঁ'],
      level2: ['ঐক', 'ঐম', 'ঐন', 'ঐল', 'ঐশ'],
      level3: ['ঐরাবত', 'ঐক্য', 'ঐশ্বর্য', 'ঐতিহাসিক', 'ঐকতান'],
      level4: ['ঐতিহ্য', 'ঐকতান', 'ঐহিক', 'ঐন্দ্রজালিক', 'ঐশ্বর্য্য'],
      level5: ['ঐতিহাসিকতা', 'ঐকতানবাদী', 'ঐশ্বরিকতা', 'ঐতিহ্যবাহী', 'ঐক্যবদ্ধতা']
    },

    'ঔ': {
      level1: ['ঔ', 'ঔ ঔ', 'ঔ ঔ ঔ', 'ঔঃ', 'ঔঁ'],
      level2: ['ঔক', 'ঔম', 'ঔন', 'ঔল', 'ঔশ'],
      level3: ['ঔষধ', 'ঔদার্য', 'ঔজ্জ্বল', 'ঔত্সুক্য', 'ঔপনিবেশিক'],
      level4: ['ঔষধি', 'ঔদ্যোগিক', 'ঔপনামিক', 'ঔর্ধ্ব', 'ঔৎসহ'],
      level5: ['ঔষধবিজ্ঞান', 'ঔপনিবেশিকতা', 'ঔদ্যোগিকীকরণ', 'ঔর্ধ্বশ্বাস', 'ঔৎসর্গ']
    },

    // ----- ক বর্গ -----

    'ক': {
      level1: ['ক', 'ক ক', 'ক ক ক', 'কঃ', 'কঁ'],
      level2: ['কা', 'কি', 'কু', 'কে', 'কো'],
      level3: ['কলম', 'কাপড়', 'কাজ', 'কাছ', 'কলা'],
      level4: ['কারণ', 'কবিতা', 'কান্না', 'কৃষক', 'কাঠামো'],
      level5: ['কারখানা', 'কৃতজ্ঞতা', 'কার্যক্রম', 'কৌতুকবিদ', 'কলকাতা']
    },

    'খ': {
      level1: ['খ', 'খ খ', 'খ খ খ', 'খঃ', 'খঁ'],
      level2: ['খা', 'খি', 'খু', 'খে', 'খো'],
      level3: ['খবর', 'খালি', 'খেলা', 'খুব', 'খাওয়া'],
      level4: ['খাতা', 'খণ্ড', 'খনিজ', 'খাদ্য', 'খুঁজে'],
      level5: ['খাদ্যশস্য', 'খরগোশ', 'খণ্ডিত', 'খাদ্যাভাস', 'খন্দকার']
    },

    'গ': {
      level1: ['গ', 'গ গ', 'গ গ গ', 'গঃ', 'গঁ'],
      level2: ['গা', 'গি', 'গু', 'গে', 'গো'],
      level3: ['গাছ', 'গান', 'গরম', 'গাড়ি', 'গোলাপ'],
      level4: ['গ্রাম', 'গায়ক', 'গবেষণা', 'গুদাম', 'গির্জা'],
      level5: ['গবেষণাগার', 'গ্রহণযোগ্য', 'গায়কবৃন্দ', 'গোলার্ধ', 'গুণমুক্ত']
    },

    'ঘ': {
      level1: ['ঘ', 'ঘ ঘ', 'ঘ ঘ ঘ', 'ঘঃ', 'ঘঁ'],
      level2: ['ঘা', 'ঘি', 'ঘু', 'ঘে', 'ঘো'],
      level3: ['ঘর', 'ঘুম', 'ঘাস', 'ঘুঘু', 'ঘোড়া'],
      level4: ['ঘটনা', 'ঘুমানো', 'ঘর্ষণ', 'ঘন্টা', 'ঘোষণা'],
      level5: ['ঘর্ষণযন্ত্র', 'ঘোষণাবলী', 'ঘটনাবহুল', 'ঘরানাগত', 'ঘুমপাড়ানি']
    },

    'ঙ': {
      level1: ['ঙ', 'ঙ ঙ', 'ঙ ঙ ঙ', 'ঙঃ', 'ঙঁ'],
      level2: ['ঙ্ক', 'ঙ্গ', 'অঙ', 'শিঙ', 'বাঙ'],
      level3: ['অঙ্ক', 'বাঙালি', 'শঙ্খ', 'লবঙ্গ', 'অঙ্গুলি'],
      level4: ['শঙ্কর', 'অঙ্গীকার', 'প্রাঙ্গণ', 'বিঙ', 'ত্রিঙ'],
      level5: ['শঙ্খচিল', 'অঙ্কগণিত', 'বাঙালিদের', 'অঙ্গীকৃত', 'শঙ্কামুক্ত']
    },

    // ----- চ বর্গ -----

    'চ': {
      level1: ['চ', 'চ চ', 'চ চ চ', 'চঃ', 'চঁ'],
      level2: ['চা', 'চি', 'চু', 'চে', 'চো'],
      level3: ['চা', 'চাকর', 'চাল', 'চোখ', 'চাদর'],
      level4: ['চাকরি', 'চালাক', 'চেষ্টা', 'চিন্তা', 'চুক্তি'],
      level5: ['চাকরিজীবী', 'চিন্তাবিদ', 'চুক্তিবদ্ধ', 'চলচ্চিত্র', 'চেষ্টাকৃত']
    },

    'ছ': {
      level1: ['ছ', 'ছ ছ', 'ছ ছ ছ', 'ছঃ', 'ছঁ'],
      level2: ['ছা', 'ছি', 'ছু', 'ছে', 'ছো'],
      level3: ['ছাতা', 'ছেলে', 'ছোট', 'ছুটি', 'ছাগল'],
      level4: ['ছাত্র', 'ছুটে', 'ছাঁচ', 'ছায়া', 'ছিঁড়ে'],
      level5: ['ছাত্রছাত্রী', 'ছায়াছবি', 'ছিঁড়েফুঁড়ে', 'ছাত্রবসতি', 'ছোটখাটো']
    },

    'জ': {
      level1: ['জ', 'জ জ', 'জ জ জ', 'জঃ', 'জঁ'],
      level2: ['জা', 'জি', 'জু', 'জে', 'জো'],
      level3: ['জল', 'জামা', 'জমি', 'জোড়া', 'জেলে'],
      level4: ['জায়গা', 'জনতা', 'জুতো', 'জেলখানা', 'জামিন'],
      level5: ['জনসংখ্যা', 'জলবায়ু', 'জাতীয়তা', 'জ্বালানি', 'জলযান']
    },

    'ঝ': {
      level1: ['ঝ', 'ঝ ঝ', 'ঝ ঝ ঝ', 'ঝঃ', 'ঝঁ'],
      level2: ['ঝা', 'ঝি', 'ঝু', 'ঝে', 'ঝো'],
      level3: ['ঝড়', 'ঝিঁঝিঁ', 'ঝাল', 'ঝিল্লি', 'ঝুলি'],
      level4: ['ঝরে', 'ঝাঁপ', 'ঝগড়া', 'ঝলক', 'ঝিলমিল'],
      level5: ['ঝগড়াঝাঁটি', 'ঝলসে যাওয়া', 'ঝরঝরে', 'ঝাঁকিয়ে ওঠা', 'ঝিলমিলে']
    },

    'ঞ': {
      level1: ['ঞ', 'ঞ ঞ', 'ঞ ঞ ঞ', 'ঞঃ', 'ঞঁ'],
      level2: ['ঞ্চ', 'ঞ্জ', 'অঞ', 'পঞ', 'কঞ'],
      level3: ['পঞ্চ', 'অঞ্চল', 'বাঞ্ছা', 'কঞ্চন', 'সঞ্চয়'],
      level4: ['সঞ্চার', 'পঞ্চম', 'লাঞ্ছিত', 'সঞ্জ্ঞা', 'অঞ্জলি'],
      level5: ['পঞ্চায়েত', 'সঞ্চারণ', 'অঞ্চলবিশেষ', 'পঞ্চতন্ত্র', 'সঞ্জ্ঞানাত']
    },

    // ----- ট বর্গ -----

    'ট': {
      level1: ['ট', 'ট ট', 'ট ট ট', 'টঃ', 'টঁ'],
      level2: ['টা', 'টি', 'টু', 'টে', 'টো'],
      level3: ['টাকা', 'টিকা', 'টুকরো', 'টেবিল', 'ট্রেন'],
      level4: ['টাকাই', 'টিকিটি', 'টেলিফোন', 'ট্রাক', 'টিকেট'],
      level5: ['টেলিভিশন', 'ট্রানজিস্টর', 'ট্রাকচালক', 'টিকাদান', 'টঙ্কশাল']
    },

    'ঠ': {
      level1: ['ঠ', 'ঠ ঠ', 'ঠ ঠ ঠ', 'ঠঃ', 'ঠঁ'],
      level2: ['ঠা', 'ঠি', 'ঠু', 'ঠে', 'ঠো'],
      level3: ['ঠিক', 'ঠান্ডা', 'ঠাট্টা', 'ঠোঁট', 'ঠ্যাং'],
      level4: ['ঠিকানা', 'ঠাণ্ডা', 'ঠায়', 'ঠুনকো', 'ঠাসঠাস'],
      level5: ['ঠিকানাবিহীন', 'ঠাট্টাবাজি', 'ঠাণ্ডালাগা', 'ঠোঁটকাটা', 'ঠুনকোমালা']
    },

    'ড': {
      level1: ['ড', 'ড ড', 'ড ড ড', 'ডঃ', 'ডঁ'],
      level2: ['ডা', 'ডি', 'ডু', 'ডে', 'ডো'],
      level3: ['ডাক', 'ডাল', 'ডেকে', 'ডাক্তার', 'ডর'],
      level4: ['ডাকঘর', 'ডাকাবুকা', 'ডালিম', 'ডোবা', 'ডেমরা'],
      level5: ['ডাক্তারখানা', 'ডাকপিয়ন', 'ডালভর্তা', 'ডিম্বাকৃতি', 'ডোবাখালি']
    },

    'ঢ': {
      level1: ['ঢ', 'ঢ ঢ', 'ঢ ঢ ঢ', 'ঢঃ', 'ঢঁ'],
      level2: ['ঢা', 'ঢি', 'ঢু', 'ঢে', 'ঢো'],
      level3: ['ঢোল', 'ঢাকা', 'ঢেউ', 'ঢকা', 'ঢঙ'],
      level4: ['ঢাকাই', 'ঢোলক', 'ঢঙ্গ', 'ঢেউখেলা', 'ঢকঢক'],
      level5: ['ঢাকাশহর', 'ঢোলতাজ', 'ঢঙ্গতার', 'ঢোলেশ্বরী', 'ঢেউলুঠি']
    },

    'ণ': {
      level1: ['ণ', 'ণ ণ', 'ণ ণ ণ', 'ণঃ', 'ণঁ'],
      level2: ['ণা', 'ণি', 'ণু', 'ণে', 'ণো'],
      level3: ['হরিণ', 'কণ্ঠ', 'রাণী', 'লবণ', 'গণ'],
      level4: ['প্রবণ', 'অরণ্য', 'বিষণ্ণ', 'শ্রাবণ', 'লঘুণ'],
      level5: ['বিষণ্ণতা', 'অরণ্যবাসী', 'প্রবণতা', 'শ্রাবণী', 'গণতন্ত্র']
    },

    // ----- ত বর্গ -----

    'ত': {
      level1: ['ত', 'ত ত', 'ত ত ত', 'তঃ', 'তঁ'],
      level2: ['তা', 'তি', 'তু', 'তে', 'তো'],
      level3: ['তালা', 'তারা', 'তরমুজ', 'তেল', 'তুলসী'],
      level4: ['তালিকা', 'তরুণ', 'তীব্র', 'তত্ত্ব', 'তীর্থ'],
      level5: ['তত্ত্বাবধান', 'তীর্থযাত্রা', 'তালিকাবদ্ধ', 'তরুণতর', 'তুলনামূলক']
    },

    'থ': {
      level1: ['থ', 'থ থ', 'থ থ থ', 'থঃ', 'থঁ'],
      level2: ['থা', 'থি', 'থু', 'থে', 'থো'],
      level3: ['থালা', 'থাকা', 'থান', 'থলে', 'থমকে'],
      level4: ['থাকতে', 'থামাও', 'থিতু', 'থমথমে', 'থেকে'],
      level5: ['থানকুনি', 'থলথলে', 'থমথমে', 'থিতুকরণ', 'থৈলিবন্দি']
    },

    'দ': {
      level1: ['দ', 'দ দ', 'দ দ দ', 'দঃ', 'দঁ'],
      level2: ['দা', 'দি', 'দু', 'দে', 'দো'],
      level3: ['দিন', 'দুধ', 'দেশ', 'দরজা', 'দাওয়াত'],
      level4: ['দায়িত্ব', 'দুর্গা', 'দরকার', 'দৃষ্টি', 'দক্ষিণ'],
      level5: ['দায়িত্বশীল', 'দুর্বলতা', 'দৃষ্টিকোণ', 'দুর্গমপ্রদেশ', 'দক্ষিণামূলী']
    },

    'ধ': {
      level1: ['ধ', 'ধ ধ', 'ধ ধ ধ', 'ধঃ', 'ধঁ'],
      level2: ['ধা', 'ধি', 'ধু', 'ধে', 'ধো'],
      level3: ['ধান', 'ধুলো', 'ধোয়া', 'ধাড়ি', 'ধাপ'],
      level4: ['ধারণা', 'ধনী', 'ধান্য', 'ধর্ম', 'ধৃতি'],
      level5: ['ধারণাগত', 'ধর্মনিরপেক্ষ', 'ধনসম্পদ', 'ধারাবাহিক', 'ধূসরতা']
    },

    'ন': {
      level1: ['ন', 'ন ন', 'ন ন ন', 'নঃ', 'নঁ'],
      level2: ['না', 'নি', 'নু', 'নে', 'নো'],
      level3: ['নদী', 'নাক', 'নাম', 'নেপাল', 'নোট'],
      level4: ['নির্বাচন', 'নির্দেশ', 'নান্দনিক', 'নবীন', 'নিয়ম'],
      level5: ['নির্বাচিত', 'নির্দেশক', 'নান্দনিকতা', 'নিয়ন্ত্রণ', 'নবায়ন']
    },

    // ----- প বর্গ -----

    'প': {
      level1: ['প', 'প প', 'প প প', 'পঃ', 'পঁ'],
      level2: ['পা', 'পি', 'পু', 'পে', 'পো'],
      level3: ['পাখি', 'পানি', 'পেড়ে', 'পোশাক', 'পুকুর'],
      level4: ['পরীক্ষা', 'প্রণালী', 'পাড়া', 'প্রস্তুত', 'পাহাড়'],
      level5: ['প্রতিবেদন', 'পরিবেশন', 'পাঠ্যপুস্তক', 'প্রতিযোগিতা', 'প্রশাসন']
    },

    'ফ': {
      level1: ['ফ', 'ফ ফ', 'ফ ফ ফ', 'ফঃ', 'ফঁ'],
      level2: ['ফা', 'ফি', 'ফু', 'ফে', 'ফো'],
      level3: ['ফুল', 'ফল', 'ফকির', 'ফেরি', 'ফোন'],
      level4: ['ফসল', 'ফাঁদ', 'ফাটল', 'ফুলঝুরি', 'ফেরিওয়ালা'],
      level5: ['ফসলকাটাই', 'ফুলশয্যা', 'ফটোগ্রাফি', 'ফায়ারব্রিগেড', 'ফার্মাসিস্ট']
    },

    'ব': {
      level1: ['ব', 'ব ব', 'ব ব ব', 'বঃ', 'বঁ'],
      level2: ['বা', 'বি', 'বু', 'বে', 'বো'],
      level3: ['বাড়ি', 'বই', 'বেলা', 'বাস', 'বোতল'],
      level4: ['বিদ্যা', 'বাজার', 'বিশ্বাস', 'বসন্ত', 'বৃষ্টি'],
      level5: ['বিদ্যালয়', 'বিশ্ববিদ্যালয়', 'বাংলাদেশ', 'বৈষম্য', 'বিপর্যয়']
    },

    'ভ': {
      level1: ['ভ', 'ভ ভ', 'ভ ভ ভ', 'ভঃ', 'ভঁ'],
      level2: ['ভা', 'ভি', 'ভু', 'ভে', 'ভো'],
      level3: ['ভাত', 'ভাই', 'ভুল', 'ভেড়া', 'ভোজ'],
      level4: ['ভাবনা', 'ভাঙন', 'ভয়ংকর', 'ভিড়', 'ভোগ'],
      level5: ['ভাববাদী', 'ভয়ংকরতা', 'ভিক্ষুকী', 'ভূমিকম্প', 'ভোজবাজি']
    },

    'ম': {
      level1: ['ম', 'ম ম', 'ম ম ম', 'মঃ', 'মঁ'],
      level2: ['মা', 'মি', 'মু', 'মে', 'মো'],
      level3: ['মাছ', 'মাটি', 'মধু', 'মেয়ে', 'মোড়'],
      level4: ['মানুষ', 'মাসি', 'মিষ্টি', 'মূল্য', 'মোক্ষম'],
      level5: ['মানবিকতা', 'মিষ্টান্ন', 'মূল্যবান', 'মৌলিকতা', 'মানসিকতা']
    },

    // ----- অন্তঃস্থ -----

    'য': {
      level1: ['য', 'য য', 'য য য', 'যঃ', 'যঁ'],
      level2: ['যা', 'যি', 'যু', 'যে', 'যো'],
      level3: ['যাত্রা', 'যুদ্ধ', 'যম', 'যশ', 'যোগ'],
      level4: ['যন্ত্র', 'যুক্তি', 'যাতায়াত', 'যাজক', 'যমজ'],
      level5: ['যন্ত্রণাদায়ক', 'যুক্তিবাদী', 'যৌগিকতা', 'যান্ত্রিকীকরণ', 'যাতায়াতব্যবস্থা']
    },

    'র': {
      level1: ['র', 'র র', 'র র র', 'রঃ', 'রঁ'],
      level2: ['রা', 'রি', 'রু', 'রে', 'রো'],
      level3: ['রাস্তা', 'রাজা', 'রং', 'রেল', 'রোদ'],
      level4: ['রান্না', 'রূপক', 'রেশম', 'রক্ত', 'রাত্রি'],
      level5: ['রাষ্ট্রপতি', 'রূপকার', 'রক্তদান', 'রাজধানী', 'রোগনির্ণয়']
    },

    'ল': {
      level1: ['ল', 'ল ল', 'ল ল ল', 'লঃ', 'লঁ'],
      level2: ['লা', 'লি', 'লু', 'লে', 'লো'],
      level3: ['লাল', 'লাউ', 'লেবু', 'লোক', 'লজ্জা'],
      level4: ['লড়াই', 'লাভ', 'লবণ', 'লেখা', 'লক্ষ্মী'],
      level5: ['লক্ষণীয়', 'লাবণ্য', 'লেখকীয়', 'লব্ধপ্রতিষ্ঠ', 'লোকসংস্কৃতি']
    },

    // ----- উষ্ম -----

    'শ': {
      level1: ['শ', 'শ শ', 'শ শ শ', 'শঃ', 'শঁ'],
      level2: ['শা', 'শি', 'শু', 'শে', 'শো'],
      level3: ['শহর', 'শিক্ষা', 'শুধু', 'শরৎ', 'শান্ত'],
      level4: ['শিক্ষক', 'শান্তি', 'শীত', 'শব্দ', 'শস্য'],
      level5: ['বিশ্ববিদ্যালয়', 'শিক্ষাব্যবস্থা', 'শিরশ্ছেদ', 'শাস্ত্রীয়', 'শিল্পকলা']
    },

    'ষ': {
      level1: ['ষ', 'ষ ষ', 'ষ ষ ষ', 'ষঃ', 'ষঁ'],
      level2: ['ষা', 'ষি', 'ষু', 'ষে', 'ষো'],
      level3: ['ষড়ঋতু', 'কষ্ট', 'মুষ্টি', 'ওষুধ', 'বিষ'],
      level4: ['কষ্টকর', 'মুষ্টিযুদ্ধ', 'পুষ্টি', 'অনুষ্ঠান', 'ষণ্মুখী'],
      level5: ['ষড়রিপু', 'কষ্টসাধ্য', 'পুষ্টিকর', 'অনুষ্ঠানবিধি', 'মুষ্টিমুষ্টি']
    },

    'স': {
      level1: ['স', 'স স', 'স স স', 'সঃ', 'সঁ'],
      level2: ['সা', 'সি', 'সু', 'সে', 'সো'],
      level3: ['সূর্য', 'সাপ', 'সুখ', 'সেবা', 'সোনা'],
      level4: ['সংসার', 'সাহস', 'সংগীত', 'স্বপ্ন', 'সাহিত্য'],
      level5: ['স্বাধীনতা', 'সংস্কৃতি', 'সাহিত্যিক', 'স্বাস্থ্যবিধি', 'সমাজবিজ্ঞান']
    },

    'হ': {
      level1: ['হ', 'হ হ', 'হ হ হ', 'হঃ', 'হঁ'],
      level2: ['হা', 'হি', 'হু', 'হে', 'হো'],
      level3: ['হাত', 'হাঁস', 'হরিণ', 'হেলি', 'হোটেল'],
      level4: ['হাসি', 'হিসাব', 'হাঁড়ি', 'হঠাৎ', 'হেরম্ব'],
      level5: ['হাসপাতাল', 'হস্তশিল্প', 'হাড়ভাঙা', 'হিসাবনিকাশ', 'হেরম্বকরণ']
    },

    // ----- অন্য -----

    'ড়': {
      level1: ['ড়', 'ড় ড়', 'ড় ড় ড়', 'ড়ঃ', 'ড়ঁ'],
      level2: ['গাড়', 'পাড়', 'বাড়', 'ভাড়', 'শাড়'],
      level3: ['গাড়ি', 'বাড়ি', 'পাড়া', 'ভাড়া', 'শাড়ি'],
      level4: ['পাড়াপড়শি', 'বাড়িঘর', 'ভাড়াটে', 'মাড়াই', 'গাড়িওয়ালা'],
      level5: ['বাড়িভিটা', 'গাড়িচালক', 'ভাড়াটিয়া', 'পাড়াপ্রতিবেশী', 'মাড়োয়ারি']
    },

    'ঢ়': {
      level1: ['ঢ়', 'ঢ় ঢ়', 'ঢ় ঢ় ঢ়', 'ঢ়ঃ', 'ঢ়ঁ'],
      level2: ['গাঢ়', 'পাঢ়', 'কাঢ়', 'লাঢ়', 'মাঢ়'],
      level3: ['গাঢ়', 'পাঢ়া', 'কাঢ়া', 'বাঢ়', 'সাঢ়ে'],
      level4: ['গাঢ়ী', 'গাঢ়তা', 'কাঢ়াকাঢ়ি', 'পাঢ়ানো', 'গাঢ়বর্ণ'],
      level5: ['গাঢ়তর', 'কাঢ়াকাঢ়িবাজি', 'গাঢ়বর্ণের', 'পাঢ়াশিখা', 'গাঢ়ত্ব']
    },

    'য়': {
      level1: ['য়', 'য় য়', 'য় য় য়', 'য়ঃ', 'য়ঁ'],
      level2: ['বায়', 'প্রায়', 'ছায়', 'যায়', 'থায়'],
      level3: ['বায়ু', 'প্রায়', 'যায়', 'হায়', 'থায়'],
      level4: ['বায়ুবহুল', 'প্রায়ই', 'ছায়া', 'পায়ে', 'বায়বীয়'],
      level5: ['বায়ুদূষণ', 'ছায়াছবি', 'পায়রা', 'বায়ুমণ্ডল', 'বায়ুবাহিত']
    }
  },

  // =========================================================================
  // PRACTICE SENTENCES ORGANIZED BY DIFFICULTY
  // =========================================================================
  practiceSentences: {

    easy: [
      'আমি ভাত খাই',
      'সূর্য ওঠে',
      'ফুল ফুটেছে',
      'পাখি ডাকে',
      'বাড়ি যাই',
      'জল খাও',
      'মাছ ধরি',
      'গাছে ফল আছে',
      'কুকুর ঘেউ ঘেউ করে',
      'আকাশে তারা',
      'নদীতে জল',
      'মাটিতে ঘাস',
      'হাত ধোয়া',
      'দুধ খাও',
      'লাল ফুল'
    ],

    medium: [
      'আমার বাড়ি ঢাকায়',
      'পাখি গাছে বসেছে',
      'ছেলেটা স্কুলে যায়',
      'বইটা টেবিলে আছে',
      'আজ বৃষ্টি হচ্ছে',
      'মা রান্না করছেন',
      'আমরা মাঠে খেলি',
      'গরমে পানি খাও',
      'শীতে সোয়েটার পরো',
      'রাতে তারা দেখি',
      'পুকুরে মাছ আছে',
      'ট্রেনে করে যাই',
      'ফলের বাগানে গেলাম',
      'বাজারে সবজি কিনি',
      'সকালে ভাত খাই'
    ],

    hard: [
      'শিক্ষক ছাত্রদের পড়াচ্ছেন',
      'বিশ্ববিদ্যালয়ে ভর্তি পরীক্ষা হবে',
      'শ্রমিকেরা কারখানায় কাজ করে',
      'বিজ্ঞানীরা গবেষণাগারে কাজ করেন',
      'ছাত্রছাত্রীরা পরীক্ষার প্রস্তুতি নিচ্ছে',
      'সংসদে বিল পাস হয়েছে',
      'প্রকৌশলীরা ব্রিজ তৈরি করছেন',
      'কৃষকেরা খাদ্যশস্য উৎপাদন করেন',
      'ঔষধবিজ্ঞানীরা নতুন ওষুধ আবিষ্কার করেন',
      'শিল্পীরা শিল্পকলায় অংশ নিচ্ছেন',
      'দায়িত্বশীল নাগরিকরা ভোট দেবেন',
      'প্রশাসন জনসংখ্যা নিয়ন্ত্রণে কাজ করছে',
      'সাহিত্যিকরা সাহিত্য সম্মানে ভূষিত হলেন',
      'জলবায়ু পরিবর্তনে কৃষি ক্ষতিগ্রস্ত',
      'বাংলাদেশের সংস্কৃতি বৈচিত্র্যময়'
    ]
  },

  // =========================================================================
  // TONGUE TWISTERS
  // =========================================================================
  tongueTwisters: [
    {
      text: 'কাঠাল গাছে কাঁঠাল ফলে, কাঁঠাল গাছে কাঠাল ফলে',
      focusPhoneme: 'ক',
      difficulty: 'medium',
      translation: 'Jackfruit grows on the jackfruit tree, wooden grows on the wooden tree'
    },
    {
      text: 'চাঁদের হাটে চাঁদ উঠেছে, চাঁদের হাটে চাঁদ বসেছে',
      focusPhoneme: 'চ',
      difficulty: 'medium',
      translation: 'Moon has risen in the moon market, moon has sat in the moon market'
    },
    {
      text: 'পিঁপড়া পিঁপড়া পা পা করে চলে, পিঁপড়া পিঁপড়া পিঁপড়ের পিলে',
      focusPhoneme: 'প',
      difficulty: 'hard',
      translation: 'Ants walk step by step, ants on ant eggs'
    },
    {
      text: 'ছোট ছেলে ছাতা নিয়ে ছুটে চলে, ছুটে চলে ছোট ছেলে',
      focusPhoneme: 'ছ',
      difficulty: 'hard',
      translation: 'Small boy runs with umbrella, running small boy'
    },
    {
      text: 'শশী শশ শশীর শশ শশ দেখে, শশীর শশ শশী শশ দেখে',
      focusPhoneme: 'শ',
      difficulty: 'hard',
      translation: 'Shashi sees Shashis sand, Shashis sand Shashi sees'
    },
    {
      text: 'সাত সাগরের সাতটি মাছ সাতার কাটে, সাত সাগরের সাতটি সাপ সাঁতার কাটে',
      focusPhoneme: 'স',
      difficulty: 'medium',
      translation: 'Seven fish from seven seas swim, seven snakes from seven seas swim'
    },
    {
      text: 'টাকার টানে ট্রাক টানে টাইগার, টাইগার ট্রাক টানে টাকার টানে',
      focusPhoneme: 'ট',
      difficulty: 'hard',
      translation: 'For money tiger pulls truck, tiger pulls truck for money'
    },
    {
      text: 'বক বলে বকের বাসায় বসে বসে বকবক করে, বকের বাসায় বসে বসে বক বকবক করে',
      focusPhoneme: 'ব',
      difficulty: 'hard',
      translation: 'Heron says sitting in herons nest chattering, sitting in herons nest heron chatters'
    },
    {
      text: 'মুচমুচে মুচমুচে মুচড়ে মুচড়ে মুচমুচ করে, মুচড়ে মুচড়ে মুচমুচে মুচমুচ করে',
      focusPhoneme: 'ম',
      difficulty: 'hard',
      translation: 'Crunchy twist and crunch, twist and crunchy crunch'
    },
    {
      text: 'ঢাক ঢোল ঢাকায় ঢোলাই হয়, ঢাকায় ঢাক ঢোল ঢোলাই হয়',
      focusPhoneme: 'ঢ',
      difficulty: 'hard',
      translation: 'Drums are played in Dhaka, in Dhaka drums are played'
    }
  ],

  // =========================================================================
  // HELPER FUNCTIONS
  // =========================================================================

  /**
   * Returns the full phoneme guide object for a given phoneme character.
   * @param {string} phoneme - The Bengali phoneme character
   * @returns {object|null} The phoneme guide object or null if not found
   */
  getGuide(phoneme) {
    return this.phonemes[phoneme] || null;
  },

  /**
   * Returns all minimal pairs involving the given phoneme.
   * @param {string} phoneme - The Bengali phoneme character
   * @returns {Array} Array of minimal pair objects that include this phoneme
   */
  getMinimalPairs(phoneme) {
    return this.minimalPairs.filter(function(mp) {
      return mp.pair.indexOf(phoneme) !== -1;
    });
  },

  /**
   * Returns practice words for the given phoneme at a specified level (1-5).
   * @param {string} phoneme - The Bengali phoneme character
   * @param {number} level - Difficulty level from 1 to 5
   * @returns {Array} Array of practice word strings, or empty array if not found
   */
  getPracticeWords(phoneme, level) {
    var pw = this.practiceWords[phoneme];
    if (!pw) return [];
    var key = 'level' + level;
    return pw[key] || [];
  },

  /**
   * Returns a random practice sentence at the given difficulty level.
   * @param {string} level - 'easy', 'medium', or 'hard'
   * @returns {string|null} A random sentence, or null if level not found
   */
  getPracticeSentence(level) {
    var sentences = this.practiceSentences[level];
    if (!sentences || sentences.length === 0) return null;
    return sentences[Math.floor(Math.random() * sentences.length)];
  },

  /**
   * Returns the most commonly confused phoneme for the given phoneme.
   * @param {string} phoneme - The Bengali phoneme character
   * @returns {string|null} The commonly confused phoneme, or null if none
   */
  getCommonMistake(phoneme) {
    var guide = this.phonemes[phoneme];
    if (!guide) return null;
    return guide.commonMistake;
  },

  /**
   * Splits a Bengali word into individual phoneme characters.
   * Handles conjuncts (যুক্তাক্ষর), vowel signs (কার), hasanta (বিসর্গ),
   * nukta (নুক্তা), and other combining characters properly.
   *
   * @param {string} word - A Bengali word or phrase
   * @returns {Array} Array of phoneme character strings
   */
  splitBengaliPhonemes(word) {
    if (!word || typeof word !== 'string') return [];

    var result = [];
    var VIRAMA = '\u09CD';   // ্ (hasanta / virama)
    var NUKTA  = '\u09BC';   // ় (nukta dot)
    var A_KAR  = '\u09BE';   // া
    var E_KAR  = '\u09C7';   // ে

    // Nukta combinations: base consonant + nukta → combined phoneme
    var nuktaMap = {};
    nuktaMap['\u09A1' + NUKTA] = 'ড়';   // ড + ় → ড়
    nuktaMap['\u09A2' + NUKTA] = 'ঢ়';   // ঢ + ় → ঢ়
    nuktaMap['\u09AF' + NUKTA] = 'য়';   // য + ় → য়

    // Vowel sign (কার) → full vowel phoneme mapping
    var vowelSignMap = {};
    vowelSignMap['\u09BE'] = 'আ';  // া  → আ (আ-কার)
    vowelSignMap['\u09BF'] = 'ই';  // ি  → ই (ই-কার)
    vowelSignMap['\u09C0'] = 'ই';  // ী  → ই (ঈ-কার, same as ই in modern Bengali)
    vowelSignMap['\u09C1'] = 'উ';  // ু  → উ (উ-কার)
    vowelSignMap['\u09C2'] = 'উ';  // ূ  → উ (ঊ-কার, same as উ in modern Bengali)
    vowelSignMap['\u09C3'] = 'র';  // ৃ  → র (ঋ-কার, pronounced as রি in Bengali)
    vowelSignMap['\u09C7'] = 'এ';  // ে  → এ (এ-কার)
    vowelSignMap['\u09C8'] = 'ঐ';  // ৈ  → ঐ (ঐ-কার)
    vowelSignMap['\u09CB'] = 'ও';  // ো  → ও (ও-কার)
    vowelSignMap['\u09CC'] = 'ঔ';  // ৌ  → ঔ (ঔ-কার)

    // অ্যা marker: য়-ফলা (consonant + ্ + য + া) produces অ্যা sound
    // We detect the sequence: ্ + য + া and replace with অ্যা

    var i = 0;
    while (i < word.length) {
      var char = word[i];

      // Skip virama (hasanta) — it only joins consonants
      if (char === VIRAMA) {
        i++;
        continue;
      }

      // Check for nukta combination (base + nukta)
      if (i + 1 < word.length && word[i + 1] === NUKTA) {
        var combo = char + NUKTA;
        if (nuktaMap[combo]) {
          result.push(nuktaMap[combo]);
          i += 2;
          continue;
        }
        // If not a known nukta combo, skip the nukta and keep the base
        result.push(char);
        i += 2;
        continue;
      }

      // Check for অ্যা pattern: য followed by া after a virama
      // This is: ... ্ য া ...
      // Already handled: virama is skipped, য is kept, া → আ
      // But for the অ্যা vowel, we want to detect: অ + ্ + য + া
      // Since virama is already skipped, we just process য and া normally
      // The caller can reconstruct অ্যা from the context if needed.

      // Check for o-kar (ো) which may be encoded as ে + া
      if (char === E_KAR && i + 1 < word.length && word[i + 1] === A_KAR) {
        result.push('ও');
        i += 2;
        continue;
      }

      // Check for ou-kar (ৌ) which may be encoded as ে + ূ
      if (char === E_KAR && i + 1 < word.length && word[i + 1] === '\u09C2') {
        result.push('ঔ');
        i += 2;
        continue;
      }

      // Map vowel signs to full vowel phonemes
      if (vowelSignMap[char]) {
        result.push(vowelSignMap[char]);
        i++;
        continue;
      }

      // Chandrabindu (ঁ), Anusvara (ং), Visarga (ঃ) — keep as separate markers
      if (char === '\u0981' || char === '\u0982' || char === '\u0983') {
        result.push(char);
        i++;
        continue;
      }

      // Skip Nukta if it appears alone (shouldn't happen normally)
      if (char === NUKTA) {
        i++;
        continue;
      }

      // Regular Bengali character (consonant or independent vowel)
      result.push(char);
      i++;
    }

    return result;
  }

};
