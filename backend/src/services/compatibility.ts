/**
 * Chinese Zodiac (Shengxiao) compatibility table
 * Based on traditional Chinese astrology: the 12 animals in a 12-year cycle
 * Harmony levels: Excellent, Good, Neutral, Poor, Conflict
 */
const CHINESE_ZODIAC_COMPATIBILITY: Record<string, Record<string, { score: number; description: string }>> = {
  Rat: {
    Rat: { score: 5, description: '相同的属相，互相理解' },
    Ox: { score: 10, description: '六合贵人，天生一对' },
    Tiger: { score: 3, description: '互相吸引但需磨合' },
    Rabbit: { score: 6, description: '相生相合，和谐相处' },
    Dragon: { score: 8, description: '三合贵人，最佳搭档' },
    Snake: { score: 2, description: '相互消耗，需多包容' },
    Horse: { score: 4, description: '互补型关系' },
    Goat: { score: 6, description: '相合伴侣，彼此欣赏' },
    Monkey: { score: 8, description: '三合贵人，默契十足' },
    Rooster: { score: 2, description: '观念差异较大' },
    Dog: { score: 4, description: '需要时间了解' },
    Pig: { score: 6, description: '相合伴侣，互相支持' },
  },
  Ox: {
    Rat: { score: 10, description: '六合贵人，天生一对' },
    Ox: { score: 5, description: '相同的属相，互相理解' },
    Tiger: { score: 3, description: '性格冲突需调和' },
    Rabbit: { score: 4, description: '需培养共同兴趣' },
    Dragon: { score: 3, description: '需要时间磨合' },
    Snake: { score: 8, description: '三合贵人，相敬如宾' },
    Horse: { score: 2, description: '水火难容' },
    Goat: { score: 6, description: '相合伴侣，互相扶持' },
    Monkey: { score: 3, description: '节奏不同需适应' },
    Rooster: { score: 8, description: '三合贵人，白头偕老' },
    Dog: { score: 6, description: '相合伴侣，忠诚可靠' },
    Pig: { score: 4, description: '平淡但稳定' },
  },
  Tiger: {
    Rat: { score: 3, description: '互相吸引但需磨合' },
    Ox: { score: 3, description: '性格冲突需调和' },
    Tiger: { score: 5, description: '相同的属相，互相理解' },
    Rabbit: { score: 6, description: '相合伴侣，温柔相伴' },
    Dragon: { score: 6, description: '龙凤呈祥' },
    Snake: { score: 2, description: '冲突较多' },
    Horse: { score: 8, description: '三合贵人，激情四射' },
    Goat: { score: 3, description: '需要更多包容' },
    Monkey: { score: 4, description: '互相挑战' },
    Rooster: { score: 2, description: '难以协调' },
    Dog: { score: 8, description: '三合贵人，忠诚伴侣' },
    Pig: { score: 6, description: '相合伴侣，和谐温馨' },
  },
  Rabbit: {
    Rat: { score: 6, description: '相生相合，和谐相处' },
    Ox: { score: 4, description: '需培养共同兴趣' },
    Tiger: { score: 6, description: '相合伴侣，温柔相伴' },
    Rabbit: { score: 5, description: '相同的属相，互相理解' },
    Dragon: { score: 3, description: '性格差异大' },
    Snake: { score: 8, description: '三合贵人，默契十足' },
    Horse: { score: 2, description: '需多沟通' },
    Goat: { score: 6, description: '相合伴侣，品味相投' },
    Monkey: { score: 3, description: '互不理解' },
    Rooster: { score: 2, description: '冲突较多' },
    Dog: { score: 8, description: '三合贵人，恩爱有加' },
    Pig: { score: 6, description: '相合伴侣，幸福美满' },
  },
  Dragon: {
    Rat: { score: 8, description: '三合贵人，最佳搭档' },
    Ox: { score: 3, description: '需要时间磨合' },
    Tiger: { score: 6, description: '龙凤呈祥' },
    Rabbit: { score: 3, description: '性格差异大' },
    Dragon: { score: 5, description: '相同的属相，互相理解' },
    Snake: { score: 6, description: '相合伴侣，智慧结合' },
    Horse: { score: 3, description: '需要更多理解' },
    Goat: { score: 3, description: '难以协调' },
    Monkey: { score: 8, description: '三合贵人，精彩纷呈' },
    Rooster: { score: 6, description: '相合伴侣，相得益彰' },
    Dog: { score: 2, description: '冲突较多' },
    Pig: { score: 4, description: '需要时间了解' },
  },
  Snake: {
    Rat: { score: 2, description: '相互消耗，需多包容' },
    Ox: { score: 8, description: '三合贵人，相敬如宾' },
    Tiger: { score: 2, description: '冲突较多' },
    Rabbit: { score: 8, description: '三合贵人，默契十足' },
    Dragon: { score: 6, description: '相合伴侣，智慧结合' },
    Snake: { score: 5, description: '相同的属相，互相理解' },
    Horse: { score: 6, description: '相合伴侣，互相吸引' },
    Goat: { score: 6, description: '相合伴侣，心灵相通' },
    Monkey: { score: 10, description: '六合贵人，天作之合' },
    Rooster: { score: 8, description: '三合贵人，美满姻缘' },
    Dog: { score: 2, description: '互不理解' },
    Pig: { score: 3, description: '需要时间磨合' },
  },
  Horse: {
    Rat: { score: 4, description: '互补型关系' },
    Ox: { score: 2, description: '水火难容' },
    Tiger: { score: 8, description: '三合贵人，激情四射' },
    Rabbit: { score: 2, description: '需多沟通' },
    Dragon: { score: 3, description: '需要更多理解' },
    Snake: { score: 6, description: '相合伴侣，互相吸引' },
    Horse: { score: 5, description: '相同的属相，互相理解' },
    Goat: { score: 8, description: '三合贵人，浪漫和谐' },
    Monkey: { score: 3, description: '节奏不合' },
    Rooster: { score: 4, description: '需要包容' },
    Dog: { score: 8, description: '三合贵人，相守一生' },
    Pig: { score: 6, description: '相合伴侣，和平相处' },
  },
  Goat: {
    Rat: { score: 6, description: '相合伴侣，彼此欣赏' },
    Ox: { score: 6, description: '相合伴侣，互相扶持' },
    Tiger: { score: 3, description: '需要更多包容' },
    Rabbit: { score: 6, description: '相合伴侣，品味相投' },
    Dragon: { score: 3, description: '难以协调' },
    Snake: { score: 6, description: '相合伴侣，心灵相通' },
    Horse: { score: 8, description: '三合贵人，浪漫和谐' },
    Goat: { score: 5, description: '相同的属相，互相理解' },
    Monkey: { score: 4, description: '互相陪伴' },
    Rooster: { score: 3, description: '需多包容' },
    Dog: { score: 2, description: '三观差异大' },
    Pig: { score: 8, description: '三合贵人，甜蜜恩爱' },
  },
  Monkey: {
    Rat: { score: 8, description: '三合贵人，默契十足' },
    Ox: { score: 3, description: '节奏不同需适应' },
    Tiger: { score: 4, description: '互相挑战' },
    Rabbit: { score: 3, description: '互不理解' },
    Dragon: { score: 8, description: '三合贵人，精彩纷呈' },
    Snake: { score: 10, description: '六合贵人，天作之合' },
    Horse: { score: 3, description: '节奏不合' },
    Goat: { score: 4, description: '互相陪伴' },
    Monkey: { score: 5, description: '相同的属相，互相理解' },
    Rooster: { score: 6, description: '相合伴侣，欢乐不断' },
    Dog: { score: 3, description: '互相不信任' },
    Pig: { score: 4, description: '需要更多了解' },
  },
  Rooster: {
    Rat: { score: 2, description: '观念差异较大' },
    Ox: { score: 8, description: '三合贵人，白头偕老' },
    Tiger: { score: 2, description: '难以协调' },
    Rabbit: { score: 2, description: '冲突较多' },
    Dragon: { score: 6, description: '相合伴侣，相得益彰' },
    Snake: { score: 8, description: '三合贵人，美满姻缘' },
    Horse: { score: 4, description: '需要包容' },
    Goat: { score: 3, description: '需多包容' },
    Monkey: { score: 6, description: '相合伴侣，欢乐不断' },
    Rooster: { score: 5, description: '相同的属相，互相理解' },
    Dog: { score: 2, description: '水火难容' },
    Pig: { score: 6, description: '相合伴侣，岁月静好' },
  },
  Dog: {
    Rat: { score: 4, description: '需要时间了解' },
    Ox: { score: 6, description: '相合伴侣，忠诚可靠' },
    Tiger: { score: 8, description: '三合贵人，忠诚伴侣' },
    Rabbit: { score: 8, description: '三合贵人，恩爱有加' },
    Dragon: { score: 2, description: '冲突较多' },
    Snake: { score: 2, description: '互不理解' },
    Horse: { score: 8, description: '三合贵人，相守一生' },
    Goat: { score: 2, description: '三观差异大' },
    Monkey: { score: 3, description: '互相不信任' },
    Rooster: { score: 2, description: '水火难容' },
    Dog: { score: 5, description: '相同的属相，互相理解' },
    Pig: { score: 8, description: '三合贵人，幸福长久' },
  },
  Pig: {
    Rat: { score: 6, description: '相合伴侣，互相支持' },
    Ox: { score: 4, description: '平淡但稳定' },
    Tiger: { score: 6, description: '相合伴侣，和谐温馨' },
    Rabbit: { score: 6, description: '相合伴侣，幸福美满' },
    Dragon: { score: 4, description: '需要时间了解' },
    Snake: { score: 3, description: '需要时间磨合' },
    Horse: { score: 6, description: '相合伴侣，和平相处' },
    Goat: { score: 8, description: '三合贵人，甜蜜恩爱' },
    Monkey: { score: 4, description: '需要更多了解' },
    Rooster: { score: 6, description: '相合伴侣，岁月静好' },
    Dog: { score: 8, description: '三合贵人，幸福长久' },
    Pig: { score: 5, description: '相同的属相，互相理解' },
  },
};

/**
 * Western Zodiac compatibility table
 * Based on traditional Western astrology: fire, earth, air, water elements
 */
const WESTERN_ZODIAC_ELEMENTS: Record<string, string> = {
  Aries: 'fire',
  Leo: 'fire',
  Sagittarius: 'fire',
  Taurus: 'earth',
  Virgo: 'earth',
  Capricorn: 'earth',
  Gemini: 'air',
  Libra: 'air',
  Aquarius: 'air',
  Cancer: 'water',
  Scorpio: 'water',
  Pisces: 'water',
};

const ELEMENT_COMPATIBILITY: Record<string, Record<string, number>> = {
  fire: { fire: 6, earth: 3, air: 9, water: 5 },
  earth: { fire: 3, earth: 6, air: 5, water: 9 },
  air: { fire: 9, earth: 5, air: 6, water: 3 },
  water: { fire: 5, earth: 9, air: 3, water: 6 },
};

const ZODIAC_OPPOSITES: Record<string, string> = {
  Aries: 'Libra',
  Taurus: 'Scorpio',
  Gemini: 'Sagittarius',
  Cancer: 'Capricorn',
  Leo: 'Aquarius',
  Virgo: 'Pisces',
  Libra: 'Aries',
  Scorpio: 'Taurus',
  Sagittarius: 'Gemini',
  Capricorn: 'Cancer',
  Aquarius: 'Leo',
  Pisces: 'Virgo',
};

/**
 * Calculate Chinese zodiac compatibility score (0-10)
 */
function chineseZodiacScore(zodiac1: string, zodiac2: string): { score: number; description: string } {
  const normalized1 = zodiac1.charAt(0).toUpperCase() + zodiac1.slice(1).toLowerCase();
  const normalized2 = zodiac2.charAt(0).toUpperCase() + zodiac2.slice(1).toLowerCase();

  const compatibility = CHINESE_ZODIAC_COMPATIBILITY[normalized1]?.[normalized2];
  if (compatibility) {
    return compatibility;
  }
  // Fallback: neutral score
  return { score: 5, description: '中性匹配' };
}

/**
 * Calculate Western zodiac compatibility score (0-10)
 */
function westernZodiacScore(zodiac1: string, zodiac2: string): { score: number; description: string } {
  const normalized1 = zodiac1.charAt(0).toUpperCase() + zodiac1.slice(1).toLowerCase();
  const normalized2 = zodiac2.charAt(0).toUpperCase() + zodiac2.slice(1).toLowerCase();

  // Same sign = medium compatibility
  if (normalized1 === normalized2) {
    return { score: 5, description: 'Same zodiac sign: neutral compatibility' };
  }

  // Opposite signs often attract
  if (ZODIAC_OPPOSITES[normalized1] === normalized2) {
    return { score: 8, description: 'Opposite signs: strong attraction' };
  }

  // Element compatibility
  const element1 = WESTERN_ZODIAC_ELEMENTS[normalized1];
  const element2 = WESTERN_ZODIAC_ELEMENTS[normalized2];

  if (element1 && element2) {
    const elementScore = ELEMENT_COMPATIBILITY[element1][element2];
    let desc = '';
    if (elementScore >= 8) {
      desc = 'Harmonious elements: natural connection';
    } else if (elementScore >= 5) {
      desc = 'Compatible elements: good chemistry';
    } else {
      desc = 'Challenging elements: requires effort';
    }
    return { score: elementScore, description: desc };
  }

  return { score: 5, description: 'Neutral western zodiac compatibility' };
}

/**
 * Calculate age gap score (0-10)
 * Optimal: 0-5 years gap = high, 5-10 = medium, 10+ = low
 */
function ageGapScore(birthDate1: string, birthDate2: string): number {
  const date1 = new Date(birthDate1);
  const date2 = new Date(birthDate2);

  const age1 = new Date().getFullYear() - date1.getFullYear();
  const age2 = new Date().getFullYear() - date2.getFullYear();
  const gap = Math.abs(age1 - age2);

  if (gap <= 2) return 10;
  if (gap <= 5) return 8;
  if (gap <= 8) return 6;
  if (gap <= 12) return 4;
  return 2;
}

/**
 * Calculate hobby overlap score (0-10)
 */
function hobbyScore(hobbies1: string[] | string, hobbies2: string[] | string): number {
  let h1: string[];
  let h2: string[];

  try {
    h1 = typeof hobbies1 === 'string' ? JSON.parse(hobbies1) : hobbies1;
    h2 = typeof hobbies2 === 'string' ? JSON.parse(hobbies2) : hobbies2;
  } catch {
    return 3; // Default middle score if parsing fails
  }

  if (!Array.isArray(h1) || !Array.isArray(h2) || h1.length === 0 || h2.length === 0) {
    return 3;
  }

  const set1 = new Set(h1.map(h => h.toLowerCase().trim()));
  const set2 = new Set(h2.map(h => h.toLowerCase().trim()));

  let overlap = 0;
  for (const hobby of set1) {
    if (set2.has(hobby)) overlap++;
  }

  const total = Math.max(set1.size, set2.size);
  const ratio = total > 0 ? overlap / total : 0;

  if (ratio >= 0.5) return 10;
  if (ratio >= 0.3) return 8;
  if (ratio >= 0.15) return 6;
  if (ratio >= 0.05) return 4;
  return 2;
}

export interface CompatibilityResult {
  overall: number;
  details: {
    chineseZodiac: { score: number; description: string; weight: number };
    westernZodiac: { score: number; description: string; weight: number };
    ageGap: { score: number; weight: number };
    hobbies: { score: number; weight: number };
  };
}

/**
 * Calculate overall compatibility between two users
 * Returns a score from 0-100
 */
export function calculateCompatibility(
  zodiacChinese1: string,
  zodiacChinese2: string,
  zodiacWestern1: string,
  zodiacWestern2: string,
  birthDate1: string,
  birthDate2: string,
  hobbies1: string[] | string,
  hobbies2: string[] | string
): CompatibilityResult {
  // Weights for each factor
  const weights = {
    chineseZodiac: 0.30,
    westernZodiac: 0.20,
    ageGap: 0.20,
    hobbies: 0.30,
  };

  const cz = chineseZodiacScore(zodiacChinese1, zodiacChinese2);
  const wz = westernZodiacScore(zodiacWestern1, zodiacWestern2);
  const age = ageGapScore(birthDate1, birthDate2);
  const hob = hobbyScore(hobbies1, hobbies2);

  // Weighted calculation (each factor max 10 → normalize to 0-100)
  const weightedScore =
    (cz.score / 10) * weights.chineseZodiac +
    (wz.score / 10) * weights.westernZodiac +
    (age / 10) * weights.ageGap +
    (hob / 10) * weights.hobbies;

  const overall = Math.round(weightedScore * 100);

  return {
    overall: Math.min(100, Math.max(0, overall)),
    details: {
      chineseZodiac: { score: cz.score, description: cz.description, weight: weights.chineseZodiac },
      westernZodiac: { score: wz.score, description: wz.description, weight: weights.westernZodiac },
      ageGap: { score: age, weight: weights.ageGap },
      hobbies: { score: hob, weight: weights.hobbies },
    },
  };
}

/**
 * Get Chinese zodiac sign from birth year
 */
export function getChineseZodiac(birthDate: string): string {
  const year = new Date(birthDate).getFullYear();
  const animals = [
    'Monkey', 'Rooster', 'Dog', 'Pig',
    'Rat', 'Ox', 'Tiger', 'Rabbit',
    'Dragon', 'Snake', 'Horse', 'Goat',
  ];
  return animals[year % 12];
}

/**
 * Get Western zodiac sign from birth date
 */
export function getWesternZodiac(birthDate: string): string {
  const date = new Date(birthDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  return 'Pisces';
}

export { chineseZodiacScore, westernZodiacScore, ageGapScore, hobbyScore };