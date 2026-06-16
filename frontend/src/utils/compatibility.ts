import { CompatScore, ZodiacChinese, ZodiacWestern } from '../types';
import {
  getChineseZodiacCompatScore,
  getWesternZodiacCompatScore,
  getAgeCompatScore,
  getHobbiesCompatScore,
} from './zodiac';

export function calculateCompatibility(
  user1: {
    zodiac_chinese: ZodiacChinese;
    zodiac_western: ZodiacWestern;
    birth_date: string;
    hobbies: string[];
  },
  user2: {
    zodiac_chinese: ZodiacChinese;
    zodiac_western: ZodiacWestern;
    birth_date: string;
    hobbies: string[];
  }
): CompatScore {
  const age1 = calculateAge(user1.birth_date);
  const age2 = calculateAge(user2.birth_date);

  const chineseZodiac = getChineseZodiacCompatScore(user1.zodiac_chinese, user2.zodiac_chinese);
  const westernZodiac = getWesternZodiacCompatScore(user1.zodiac_western, user2.zodiac_western);
  const age = getAgeCompatScore(age1, age2);
  const hobbies = getHobbiesCompatScore(user1.hobbies, user2.hobbies);

  // Weights: chinese zodiac 30%, western zodiac 25%, age 20%, hobbies 25%
  const total = Math.round(
    chineseZodiac * 0.30 +
    westernZodiac * 0.25 +
    age * 0.20 +
    hobbies * 0.25
  );

  return {
    total,
    chineseZodiac,
    westernZodiac,
    age,
    hobbies,
    details: {
      chineseZodiac: getCompatLabel(chineseZodiac),
      westernZodiac: getCompatLabel(westernZodiac),
      age: getCompatLabel(age),
      hobbies: getCompatLabel(hobbies),
    },
  };
}

function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function getCompatLabel(score: number): string {
  if (score >= 9) return 'perfect';
  if (score >= 7) return 'great';
  if (score >= 5) return 'good';
  return 'fair';
}

export function getCompatColor(score: number): string {
  if (score >= 8) return '#27ae60';
  if (score >= 6) return '#2ecc71';
  if (score >= 4) return '#f39c12';
  return '#e74c3c';
}

export function getCompatEmoji(score: number): string {
  if (score >= 9) return '💖';
  if (score >= 7) return '💕';
  if (score >= 5) return '💗';
  if (score >= 3) return '🤝';
  return '💔';
}