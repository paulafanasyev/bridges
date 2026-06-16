import { ZodiacChinese, ZodiacWestern } from '../types';

// Chinese zodiac calculation from birth year
export function getChineseZodiac(year: number): ZodiacChinese {
  const zodiacs: ZodiacChinese[] = [
    'monkey', 'rooster', 'dog', 'pig',
    'rat', 'ox', 'tiger', 'rabbit',
    'dragon', 'snake', 'horse', 'goat',
  ];
  return zodiacs[year % 12];
}

// Western zodiac calculation from birth date
export function getWesternZodiac(month: number, day: number): ZodiacWestern {
  const zodiacSigns: { sign: ZodiacWestern; start: [number, number]; end: [number, number] }[] = [
    { sign: 'capricorn', start: [12, 22], end: [1, 19] },
    { sign: 'aquarius', start: [1, 20], end: [2, 18] },
    { sign: 'pisces', start: [2, 19], end: [3, 20] },
    { sign: 'aries', start: [3, 21], end: [4, 19] },
    { sign: 'taurus', start: [4, 20], end: [5, 20] },
    { sign: 'gemini', start: [5, 21], end: [6, 20] },
    { sign: 'cancer', start: [6, 21], end: [7, 22] },
    { sign: 'leo', start: [7, 23], end: [8, 22] },
    { sign: 'virgo', start: [8, 23], end: [9, 22] },
    { sign: 'libra', start: [9, 23], end: [10, 22] },
    { sign: 'scorpio', start: [10, 23], end: [11, 21] },
    { sign: 'sagittarius', start: [11, 22], end: [12, 21] },
  ];

  for (const z of zodiacSigns) {
    const [sMonth, sDay] = z.start;
    const [eMonth, eDay] = z.end;
    
    if (sMonth <= eMonth) {
      if ((month === sMonth && day >= sDay) || (month === eMonth && day <= eDay)) return z.sign;
      if (month > sMonth && month < eMonth) return z.sign;
    } else {
      if (month === sMonth && day >= sDay) return z.sign;
      if (month === eMonth && day <= eDay) return z.sign;
      if (month > sMonth || month < eMonth) return z.sign;
    }
  }

  return 'capricorn';
}

// Parse date string to get components
export function parseBirthDate(dateStr: string): { year: number; month: number; day: number } {
  const d = new Date(dateStr);
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
  };
}

// Get zodiacs from birth date
export function getZodiacsFromDate(dateStr: string): { chinese: ZodiacChinese; western: ZodiacWestern } {
  const { year, month, day } = parseBirthDate(dateStr);
  return {
    chinese: getChineseZodiac(year),
    western: getWesternZodiac(month, day),
  };
}

// Chinese zodiac compatibility matrix (which animals get along)
const chineseZodiacCompat: Record<string, Record<string, number>> = {
  rat: { rat: 5, ox: 8, tiger: 3, rabbit: 6, dragon: 9, snake: 2, horse: 4, goat: 7, monkey: 10, rooster: 3, dog: 6, pig: 7 },
  ox: { rat: 8, ox: 5, tiger: 6, rabbit: 3, dragon: 4, snake: 9, horse: 2, goat: 10, monkey: 7, rooster: 8, dog: 3, pig: 6 },
  tiger: { rat: 3, ox: 6, tiger: 5, rabbit: 8, dragon: 7, snake: 4, horse: 9, goat: 2, monkey: 6, rooster: 7, dog: 10, pig: 3 },
  rabbit: { rat: 6, ox: 3, tiger: 8, rabbit: 5, dragon: 6, snake: 7, horse: 4, goat: 9, monkey: 2, rooster: 10, dog: 7, pig: 8 },
  dragon: { rat: 9, ox: 4, tiger: 7, rabbit: 6, dragon: 5, snake: 8, horse: 3, goat: 6, monkey: 10, rooster: 9, dog: 2, pig: 4 },
  snake: { rat: 2, ox: 9, tiger: 4, rabbit: 7, dragon: 8, snake: 5, horse: 6, goat: 3, monkey: 8, rooster: 10, dog: 4, pig: 7 },
  horse: { rat: 4, ox: 2, tiger: 9, rabbit: 4, dragon: 3, snake: 6, horse: 5, goat: 8, monkey: 7, rooster: 3, dog: 10, pig: 6 },
  goat: { rat: 7, ox: 10, tiger: 2, rabbit: 9, dragon: 6, snake: 3, horse: 8, goat: 5, monkey: 4, rooster: 6, dog: 7, pig: 10 },
  monkey: { rat: 10, ox: 7, tiger: 6, rabbit: 2, dragon: 10, snake: 8, horse: 7, goat: 4, monkey: 5, rooster: 9, dog: 3, pig: 6 },
  rooster: { rat: 3, ox: 8, tiger: 7, rabbit: 10, dragon: 9, snake: 10, horse: 3, goat: 6, monkey: 9, rooster: 5, dog: 4, pig: 2 },
  dog: { rat: 6, ox: 3, tiger: 10, rabbit: 7, dragon: 2, snake: 4, horse: 10, goat: 7, monkey: 3, rooster: 4, dog: 5, pig: 8 },
  pig: { rat: 7, ox: 6, tiger: 3, rabbit: 8, dragon: 4, snake: 7, horse: 6, goat: 10, monkey: 6, rooster: 2, dog: 8, pig: 5 },
};

// Western zodiac compatibility matrix
const westernZodiacCompat: Record<string, Record<string, number>> = {
  aries: { aries: 5, taurus: 4, gemini: 8, cancer: 3, leo: 10, virgo: 4, libra: 7, scorpio: 6, sagittarius: 9, capricorn: 3, aquarius: 7, pisces: 5 },
  taurus: { aries: 4, taurus: 5, gemini: 3, cancer: 9, leo: 4, virgo: 8, libra: 6, scorpio: 10, sagittarius: 3, capricorn: 8, aquarius: 4, pisces: 7 },
  gemini: { aries: 8, taurus: 3, gemini: 5, cancer: 4, leo: 9, virgo: 6, libra: 10, scorpio: 4, sagittarius: 7, capricorn: 3, aquarius: 8, pisces: 4 },
  cancer: { aries: 3, taurus: 9, gemini: 4, cancer: 5, leo: 3, virgo: 7, libra: 4, scorpio: 8, sagittarius: 3, capricorn: 10, aquarius: 4, pisces: 9 },
  leo: { aries: 10, taurus: 4, gemini: 9, cancer: 3, leo: 5, virgo: 4, libra: 8, scorpio: 6, sagittarius: 10, capricorn: 3, aquarius: 7, pisces: 3 },
  virgo: { aries: 4, taurus: 8, gemini: 6, cancer: 7, leo: 4, virgo: 5, libra: 3, scorpio: 9, sagittarius: 4, capricorn: 8, aquarius: 3, pisces: 10 },
  libra: { aries: 7, taurus: 6, gemini: 10, cancer: 4, leo: 8, virgo: 3, libra: 5, scorpio: 4, sagittarius: 9, capricorn: 4, aquarius: 8, pisces: 6 },
  scorpio: { aries: 6, taurus: 10, gemini: 4, cancer: 8, leo: 6, virgo: 9, libra: 4, scorpio: 5, sagittarius: 3, capricorn: 8, aquarius: 4, pisces: 8 },
  sagittarius: { aries: 9, taurus: 3, gemini: 7, cancer: 3, leo: 10, virgo: 4, libra: 9, scorpio: 3, sagittarius: 5, capricorn: 4, aquarius: 8, pisces: 4 },
  capricorn: { aries: 3, taurus: 8, gemini: 3, cancer: 10, leo: 3, virgo: 8, libra: 4, scorpio: 8, sagittarius: 4, capricorn: 5, aquarius: 3, pisces: 9 },
  aquarius: { aries: 7, taurus: 4, gemini: 8, cancer: 4, leo: 7, virgo: 3, libra: 8, scorpio: 4, sagittarius: 8, capricorn: 3, aquarius: 5, pisces: 6 },
  pisces: { aries: 5, taurus: 7, gemini: 4, cancer: 9, leo: 3, virgo: 10, libra: 6, scorpio: 8, sagittarius: 4, capricorn: 9, aquarius: 6, pisces: 5 },
};

export function getChineseZodiacCompatScore(z1: ZodiacChinese, z2: ZodiacChinese): number {
  return chineseZodiacCompat[z1]?.[z2] || 5;
}

export function getWesternZodiacCompatScore(z1: ZodiacWestern, z2: ZodiacWestern): number {
  return westernZodiacCompat[z1]?.[z2] || 5;
}

export function getAgeCompatScore(age1: number, age2: number): number {
  const diff = Math.abs(age1 - age2);
  if (diff <= 2) return 10;
  if (diff <= 5) return 8;
  if (diff <= 8) return 6;
  if (diff <= 12) return 4;
  return 2;
}

export function getHobbiesCompatScore(hobbies1: string[], hobbies2: string[]): number {
  if (hobbies1.length === 0 || hobbies2.length === 0) return 5;
  const common = hobbies1.filter(h => hobbies2.includes(h)).length;
  const total = Math.max(hobbies1.length, hobbies2.length);
  return Math.round((common / total) * 10);
}