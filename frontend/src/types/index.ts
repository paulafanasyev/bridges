// Types aligned with backend database schema

export type Gender = 'male' | 'female' | 'other';
export type Language = 'zh' | 'ru' | 'en';
export type ThemeId = 'tiger' | 'dragon' | 'phoenix' | 'sakura' | 'lotus' | 'pearl';
export type MatchStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';
export type CallStatus = 'requested' | 'accepted' | 'rejected' | 'ended' | 'missed';
export type ZodiacChinese = 'rat' | 'ox' | 'tiger' | 'rabbit' | 'dragon' | 'snake' | 'horse' | 'goat' | 'monkey' | 'rooster' | 'dog' | 'pig';
export type ZodiacWestern = 'aries' | 'taurus' | 'gemini' | 'cancer' | 'leo' | 'virgo' | 'libra' | 'scorpio' | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

export interface User {
  id: string;
  username: string;
  email: string;
  gender: Gender;
  birth_date: string;
  zodiac_chinese: ZodiacChinese;
  zodiac_western: ZodiacWestern;
  hobbies: string[];
  bio: string;
  preferred_language: Language;
  theme_id: ThemeId;
  photo_url: string;
  phone_country_code: string;
  phone_number: string;
  is_premium: boolean;
  is_online: boolean;
  last_seen: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile extends User {
  compatibility_score?: number;
}

export interface Match {
  id: string;
  user_id_1: string;
  user_id_2: string;
  compatibility_score: number;
  status: MatchStatus;
  matched_by: 'discover' | 'mutual_like';
  created_at: string;
  updated_at: string;
  matched_user?: UserProfile;
}

export interface Call {
  id: string;
  caller_id: string;
  callee_id: string;
  status: CallStatus;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number;
  translation_enabled: boolean;
  created_at: string;
  caller?: UserProfile;
  callee?: UserProfile;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  original_language: Language;
  translated_content: string;
  is_read: boolean;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  gender: Gender;
  birth_date: string;
  preferred_language: Language;
}

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  nameZh: string;
  nameRu: string;
  gender: 'male' | 'female';
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    gradient: string;
    cardBg: string;
    buttonText: string;
    navBg: string;
    navText: string;
  };
  emoji: string;
}

export interface CompatScore {
  total: number;
  chineseZodiac: number;
  westernZodiac: number;
  age: number;
  hobbies: number;
  details: {
    chineseZodiac: string;
    westernZodiac: string;
    age: string;
    hobbies: string;
  };
}

export const CHINESE_ZODIAC_NAMES: Record<ZodiacChinese, { zh: string; ru: string; en: string }> = {
  rat: { zh: '鼠', ru: 'Крыса', en: 'Rat' },
  ox: { zh: '牛', ru: 'Бык', en: 'Ox' },
  tiger: { zh: '虎', ru: 'Тигр', en: 'Tiger' },
  rabbit: { zh: '兔', ru: 'Кролик', en: 'Rabbit' },
  dragon: { zh: '龙', ru: 'Дракон', en: 'Dragon' },
  snake: { zh: '蛇', ru: 'Змея', en: 'Snake' },
  horse: { zh: '马', ru: 'Лошадь', en: 'Horse' },
  goat: { zh: '羊', ru: 'Коза', en: 'Goat' },
  monkey: { zh: '猴', ru: 'Обезьяна', en: 'Monkey' },
  rooster: { zh: '鸡', ru: 'Петух', en: 'Rooster' },
  dog: { zh: '狗', ru: 'Собака', en: 'Dog' },
  pig: { zh: '猪', ru: 'Свинья', en: 'Pig' },
};

export const WESTERN_ZODIAC_NAMES: Record<ZodiacWestern, { zh: string; ru: string; en: string }> = {
  aries: { zh: '白羊座', ru: 'Овен', en: 'Aries' },
  taurus: { zh: '金牛座', ru: 'Телец', en: 'Taurus' },
  gemini: { zh: '双子座', ru: 'Близнецы', en: 'Gemini' },
  cancer: { zh: '巨蟹座', ru: 'Рак', en: 'Cancer' },
  leo: { zh: '狮子座', ru: 'Лев', en: 'Leo' },
  virgo: { zh: '处女座', ru: 'Дева', en: 'Virgo' },
  libra: { zh: '天秤座', ru: 'Весы', en: 'Libra' },
  scorpio: { zh: '天蝎座', ru: 'Скорпион', en: 'Scorpio' },
  sagittarius: { zh: '射手座', ru: 'Стрелец', en: 'Sagittarius' },
  capricorn: { zh: '摩羯座', ru: 'Козерог', en: 'Capricorn' },
  aquarius: { zh: '水瓶座', ru: 'Водолей', en: 'Aquarius' },
  pisces: { zh: '双鱼座', ru: 'Рыбы', en: 'Pisces' },
};

export const HOBBY_OPTIONS = [
  { id: 'music', zh: '音乐', ru: 'Музыка', en: 'Music' },
  { id: 'travel', zh: '旅行', ru: 'Путешествия', en: 'Travel' },
  { id: 'cooking', zh: '烹饪', ru: 'Кулинария', en: 'Cooking' },
  { id: 'sports', zh: '运动', ru: 'Спорт', en: 'Sports' },
  { id: 'reading', zh: '阅读', ru: 'Чтение', en: 'Reading' },
  { id: 'movies', zh: '电影', ru: 'Кино', en: 'Movies' },
  { id: 'photography', zh: '摄影', ru: 'Фотография', en: 'Photography' },
  { id: 'dancing', zh: '舞蹈', ru: 'Танцы', en: 'Dancing' },
  { id: 'painting', zh: '绘画', ru: 'Рисование', en: 'Painting' },
  { id: 'gaming', zh: '游戏', ru: 'Игры', en: 'Gaming' },
  { id: 'language', zh: '语言学习', ru: 'Изучение языков', en: 'Language Learning' },
  { id: 'yoga', zh: '瑜伽', ru: 'Йога', en: 'Yoga' },
  { id: 'hiking', zh: '徒步', ru: 'Походы', en: 'Hiking' },
  { id: 'technology', zh: '科技', ru: 'Технологии', en: 'Technology' },
  { id: 'fashion', zh: '时尚', ru: 'Мода', en: 'Fashion' },
];