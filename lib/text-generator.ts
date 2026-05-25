// Progressive Arabic Text Generation Engine
// Generates practice text based on level, stage, and skill progression
// Letters ordered by Arabic keyboard layout (not alphabetical)

export const ARABIC_LETTERS: string[] = [
  // Middle row (home row): ش س ي ب ل ا ت ن م ك ط
  'ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط',
  // Bottom row: ئ ء ؤ ر ى ة و ز ظ
  'ئ', 'ء', 'ؤ', 'ر', 'ى', 'ة', 'و', 'ز', 'ظ',
  // Top row: ض ص ث ق ف غ ع ه خ ح ج د
  'ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د'
];

// Total letter count for stage calculations
export const TOTAL_LETTER_STAGES = ARABIC_LETTERS.length; // 32
export const EXIT_TEST_STAGE = TOTAL_LETTER_STAGES + 1;   // 33

export const EASY_WORDS: string[] = [
  'باب', 'أب', 'أم', 'أخ', 'يد', 'فم', 'دم', 'عم', 'جد', 'نار', 'ماء', 'نور',
  'حب', 'حر', 'بر', 'بحر', 'تمر', 'عسل', 'لبن', 'ورد', 'شمس', 'قمر', 'ولد', 'بنت',
  'رجل', 'عين', 'قلب', 'رأس', 'قدم', 'أذن', 'سن', 'وجه', 'شعر', 'طين', 'ريح', 'ثلج',
  'مطر', 'عشب', 'نجم', 'سيف', 'قلم', 'درس', 'فصل', 'علم', 'عمل', 'أكل', 'شرب', 'سفر'
];

export const MED_WORDS: string[] = [
  'كتاب', 'قلم', 'علم', 'بيت', 'سماء', 'أرض', 'بحر', 'جبل', 'نهر', 'طعام', 'ضوء', 'يوم',
  'طريق', 'سفر', 'زهرة', 'حديقة', 'مفتاح', 'بابون', 'حقيبة', 'كرسي', 'مكتب', 'دفتر',
  'ورقة', 'شباك', 'غرفة', 'منزل', 'مسجد', 'سوق', 'خبز', 'فواكه', 'خضار', 'قهوة',
  'شاي', 'حليب', 'طائرة', 'سيارة', 'قطار', 'سفينة', 'دراجة', 'هاتف', 'صديق', 'أستاذ',
  'طبيب', 'مهندس', 'كاتب', 'سعيد', 'جميل', 'كبير', 'صغير', 'جديد', 'قديم', 'سريع'
];

export const HARD_WORDS: string[] = [
  'مدرسة', 'طالب', 'معلم', 'نافذة', 'شجرة', 'حديقة', 'شارع', 'مدينة', 'سلام', 'كلام', 'صباح', 'مساء',
  'مستشفى', 'جامعة', 'مكتبة', 'كمبيوتر', 'تلفزيون', 'تكنولوجيا', 'جمهورية', 'ديمقراطية', 'حكومة',
  'اقتصاد', 'سياسة', 'ثقافة', 'اجتماع', 'اتصالات', 'معلومات', 'مستقبل', 'تاريخ', 'جغرافيا',
  'رياضيات', 'فيزياء', 'كيمياء', 'هندسة', 'محاضرة', 'امتحان', 'سياحة', 'تجارة', 'صناعة',
  'زراعة', 'طبيعة', 'بيئة', 'مناخ', 'حرية', 'عدالة', 'مساواة', 'مسؤولية', 'شخصية', 'مناسبة'
];

// Short phrases (Level 3, Stage 1)
const SHORT_PHRASES: string[] = [
  'كتاب مفيد', 'بيت جميل', 'قلم جديد', 'طالب ذكي', 'بحر عميق', 
  'سماء صافية', 'جبل مرتفع', 'طعام شهي', 'صباح سعيد', 'مدينة كبيرة'
];

// Full sentences (Level 3, Stage 2)
const FULL_SENTENCES: string[] = [
  'العلم نور والجهل ظلام في كل مكان وزمان',
  'الكتاب هو صديق مخلص ومفيد جدا للإنسان',
  'المعلم يشرح الدرس للطلاب بوضوح في المدرسة',
  'المدينة تكون نشيطة وجميلة جدا في الصباح الباكر',
  'شجرة التفاح تنمو وتكبر في الحديقة الواسعة'
];

// Paragraphs (Level 3, Stage 3)
const PARAGRAPHS: string[] = [
  'العلم يرفع بيوتا لا عماد لها والجهل يهدم بيت العز والشرف. الطالب المجتهد يدرس بجد كل يوم ليحقق أحلامه الكبيرة ويخدم وطنه في المستقبل.',
  'العمل الصادق هو أساس النجاح والتقدم في الحياة. عندما نعمل بحب وإخلاص، فإننا نبني مجتمعا قويا ومزدهرا يسوده السلام والتسامح بين الناس جميعا.'
];

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Pick N random items from an array (with possible repeats if N > array length)
 */
function pickRandom<T>(arr: T[], count: number): T[] {
  const result: T[] = [];
  const shuffled = shuffleArray(arr);
  for (let i = 0; i < count; i++) {
    result.push(shuffled[i % shuffled.length]);
  }
  return result;
}

/**
 * Generate practice text based on level, skill, and stage
 * 
 * @param level - Difficulty level (1 = letters, 2 = words, 3 = phrases)
 * @param skillLevel - Current skill level (1-10), affects text length slightly
 * @param stage - The sub-level/stage index
 * @returns Generated Arabic text string
 */
export function generateText(level: 1 | 2 | 3, skillLevel: number, stage: number = 1): string {
  const clampedSkill = Math.max(1, Math.min(10, skillLevel));

  switch (level) {
    case 1:
      if (stage === EXIT_TEST_STAGE) {
        return generateExitTest();
      }
      return generateCumulativeLetters(stage);
    case 2:
      return generateStageWords(stage, clampedSkill);
    case 3:
      return generateStageTexts(stage);
    default:
      return generateCumulativeLetters(1);
  }
}

/**
 * Level 1: Cumulative Letter drills (Stages 1-32)
 * Introduces ARABIC_LETTERS[stage-1]
 * Mixing it heavily with previously learned letters for cumulative repetition
 */
function generateCumulativeLetters(stage: number): string {
  const clampedStage = Math.max(1, Math.min(TOTAL_LETTER_STAGES, stage));
  const newLetterIdx = clampedStage - 1;
  const newLetter = ARABIC_LETTERS[newLetterIdx];
  const previousLetters = ARABIC_LETTERS.slice(0, newLetterIdx);

  if (previousLetters.length === 0) {
    // Stage 1: faqat birinchi harf o'zi
    const groups = [];
    for (let i = 0; i < 10; i++) {
      const len = Math.floor(Math.random() * 2) + 2; // 2 yoki 3 ta takrorlash
      groups.push(Array(len).fill(newLetter).join(''));
    }
    return groups.join(' ');
  }

  // Stage > 1: Yangi harf va oldingi harflarning osonroq va qulayroq aralashmasi
  const groups: string[] = [];
  
  // Guruhlar sonini optimallashtirib 8-12 atrofida qilamiz
  const groupCount = 8 + Math.min(clampedStage, 4);

  // Murakkablikni kamaytirish uchun: hamma oldingi harflarni birdaniga aralashtirmaymiz.
  // Buning o'rniga, eng oxirgi o'rganilgan 3 ta harfni + tasodifiy 2 ta harfni faol ro'yxatga olamiz.
  const recentLetters = previousLetters.slice(-3); // oxirgi 3 ta harf
  const otherLetters = previousLetters.slice(0, -3);
  
  const activePool: string[] = [...recentLetters];
  if (otherLetters.length > 0) {
    const randomCount = Math.min(otherLetters.length, 2);
    const shuffledOthers = [...otherLetters].sort(() => Math.random() - 0.5);
    activePool.push(...shuffledOthers.slice(0, randomCount));
  }

  for (let i = 0; i < groupCount; i++) {
    // Guruh uzunligi oson bo'lishi uchun asosan 2 yoki 3 harf (juda kam hollarda 4)
    const randVal = Math.random();
    const groupLen = randVal > 0.85 ? 4 : randVal > 0.3 ? 3 : 2; 
    
    const groupChars: string[] = [];

    // Yangi harfning o'zini ko'proq mashq qilish uchun
    groupChars.push(newLetter);
    if (Math.random() > 0.4) {
      groupChars.push(newLetter);
    }

    // Qolgan joylarni tanlangan faol eski harflar (activePool) bilan to'ldiramiz
    while (groupChars.length < groupLen) {
      const idx = Math.floor(Math.random() * activePool.length);
      groupChars.push(activePool[idx]);
    }

    // Harflarni aralashtiramiz
    const shuffled = groupChars.sort(() => Math.random() - 0.5);
    groups.push(shuffled.join(''));
  }

  // Yangi harfga visual va mushak ko'nikishi uchun boshiga va o'rtasiga oson takrorlarni qo'shamiz
  groups.unshift(Array(3).fill(newLetter).join(''));
  groups.splice(Math.floor(groups.length / 2), 0, Array(2).fill(newLetter).join(''));

  return groups.join(' ');
}

/**
 * Level 1, Stage EXIT_TEST_STAGE: Exit Test
 * A comprehensive mixed drill of all Arabic letters
 */
function generateExitTest(): string {
  const shuffledLetters = shuffleArray(ARABIC_LETTERS);
  const groups = shuffledLetters.map(letter => {
    const repeats = Math.floor(Math.random() * 2) + 2; // 2 or 3 repeats
    return Array(repeats).fill(letter).join('');
  });
  return groups.join(' ');
}

/**
 * Level 2: Stage-based word practice
 * Stage 1: Easy, Stage 2: Medium, Stage 3: Hard words
 */
function generateStageWords(stage: number, skillLevel: number): string {
  const clampedStage = Math.max(1, Math.min(3, stage));
  const wordCount = 6 + Math.floor(skillLevel * 0.8);

  let pool = EASY_WORDS;
  if (clampedStage === 2) pool = MED_WORDS;
  if (clampedStage === 3) pool = HARD_WORDS;

  return pickRandom(pool, wordCount).join(' ');
}

/**
 * Level 3: Stage-based texts
 * Stage 1: Short phrases, Stage 2: Full sentences, Stage 3: Large paragraphs
 */
function generateStageTexts(stage: number): string {
  const clampedStage = Math.max(1, Math.min(3, stage));

  if (clampedStage === 1) {
    return pickRandom(SHORT_PHRASES, 4).join(' ');
  }
  if (clampedStage === 2) {
    return FULL_SENTENCES[Math.floor(Math.random() * FULL_SENTENCES.length)];
  }
  
  return PARAGRAPHS[Math.floor(Math.random() * PARAGRAPHS.length)];
}
