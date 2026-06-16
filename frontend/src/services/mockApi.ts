import { User, UserProfile, Match, Call, Message, AuthTokens, LoginRequest, RegisterRequest, Language, ThemeId } from '../types';

// Mock users
const mockUsers: User[] = [
  {
    id: 'u1',
    username: 'Алексей',
    email: 'aleksey@example.com',
    gender: 'male',
    birth_date: '1995-06-15',
    zodiac_chinese: 'pig',
    zodiac_western: 'gemini',
    hobbies: ['travel', 'music', 'photography', 'cooking'],
    bio: 'Люблю путешествовать и изучать китайскую культуру. Учу китайский язык уже 2 года.',
    preferred_language: 'ru',
    theme_id: 'tiger',
    photo_url: '',
    phone_country_code: '+7',
    phone_number: '9001234567',
    is_premium: true,
    is_online: true,
    last_seen: new Date().toISOString(),
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2026-06-14T08:00:00Z',
  },
  {
    id: 'u2',
    username: '小明',
    email: 'xiaoming@example.com',
    gender: 'male',
    birth_date: '1998-03-22',
    zodiac_chinese: 'tiger',
    zodiac_western: 'aries',
    hobbies: ['technology', 'gaming', 'sports', 'movies'],
    bio: '热爱俄罗斯文化，正在学习俄语。喜欢打篮球和编程。',
    preferred_language: 'zh',
    theme_id: 'dragon',
    photo_url: '',
    phone_country_code: '+86',
    phone_number: '13800138000',
    is_premium: false,
    is_online: false,
    last_seen: new Date(Date.now() - 3600000).toISOString(),
    created_at: '2025-03-20T10:00:00Z',
    updated_at: '2026-06-13T20:00:00Z',
  },
  {
    id: 'u3',
    username: 'Анна',
    email: 'anna@example.com',
    gender: 'female',
    birth_date: '1997-11-08',
    zodiac_chinese: 'ox',
    zodiac_western: 'scorpio',
    hobbies: ['reading', 'painting', 'yoga', 'language'],
    bio: 'Художница, изучаю китайскую каллиграфию. Мечтаю посетить Шанхай и Пекин.',
    preferred_language: 'ru',
    theme_id: 'sakura',
    photo_url: '',
    phone_country_code: '+7',
    phone_number: '9039876543',
    is_premium: true,
    is_online: true,
    last_seen: new Date().toISOString(),
    created_at: '2025-02-10T10:00:00Z',
    updated_at: '2026-06-14T09:00:00Z',
  },
  {
    id: 'u4',
    username: '小芳',
    email: 'xiaofang@example.com',
    gender: 'female',
    birth_date: '1996-07-30',
    zodiac_chinese: 'rat',
    zodiac_western: 'leo',
    hobbies: ['dancing', 'fashion', 'cooking', 'travel'],
    bio: '喜欢跳舞和时尚。正在学习俄语，希望交到俄罗斯朋友！',
    preferred_language: 'zh',
    theme_id: 'lotus',
    photo_url: '',
    phone_country_code: '+86',
    phone_number: '13900139000',
    is_premium: false,
    is_online: true,
    last_seen: new Date().toISOString(),
    created_at: '2025-04-05T10:00:00Z',
    updated_at: '2026-06-14T07:00:00Z',
  },
  {
    id: 'u5',
    username: 'Dmitry',
    email: 'dmitry@example.com',
    gender: 'male',
    birth_date: '1994-09-18',
    zodiac_chinese: 'dog',
    zodiac_western: 'virgo',
    hobbies: ['technology', 'hiking', 'photography', 'reading'],
    bio: 'Software engineer. Fascinated by Chinese tech scene. Learning Mandarin.',
    preferred_language: 'en',
    theme_id: 'phoenix',
    photo_url: '',
    phone_country_code: '+7',
    phone_number: '9165551212',
    is_premium: true,
    is_online: false,
    last_seen: new Date(Date.now() - 7200000).toISOString(),
    created_at: '2025-05-01T10:00:00Z',
    updated_at: '2026-06-12T18:00:00Z',
  },
  {
    id: 'u6',
    username: '丽华',
    email: 'lihua@example.com',
    gender: 'female',
    birth_date: '1999-01-14',
    zodiac_chinese: 'rabbit',
    zodiac_western: 'capricorn',
    hobbies: ['music', 'painting', 'yoga', 'language'],
    bio: '大学生，主修俄语专业。喜欢音乐和画画，希望能和俄罗斯朋友交流。',
    preferred_language: 'zh',
    theme_id: 'pearl',
    photo_url: '',
    phone_country_code: '+86',
    phone_number: '13700137000',
    is_premium: false,
    is_online: true,
    last_seen: new Date().toISOString(),
    created_at: '2025-06-15T10:00:00Z',
    updated_at: '2026-06-14T06:00:00Z',
  },
  {
    id: 'u7',
    username: 'Elena',
    email: 'elena@example.com',
    gender: 'female',
    birth_date: '1993-05-20',
    zodiac_chinese: 'rooster',
    zodiac_western: 'taurus',
    hobbies: ['cooking', 'travel', 'dancing', 'fashion'],
    bio: 'Шеф-повар, обожаю китайскую кухню! Хочу научиться готовить настоящие китайские блюда.',
    preferred_language: 'ru',
    theme_id: 'sakura',
    photo_url: '',
    phone_country_code: '+7',
    phone_number: '9153334444',
    is_premium: false,
    is_online: false,
    last_seen: new Date(Date.now() - 5400000).toISOString(),
    created_at: '2025-07-01T10:00:00Z',
    updated_at: '2026-06-13T15:00:00Z',
  },
  {
    id: 'u8',
    username: '伟强',
    email: 'weiqiang@example.com',
    gender: 'male',
    birth_date: '1992-12-05',
    zodiac_chinese: 'monkey',
    zodiac_western: 'sagittarius',
    hobbies: ['sports', 'technology', 'travel', 'photography'],
    bio: '摄影师，去过30多个国家。现在想深入了解俄罗斯文化。',
    preferred_language: 'zh',
    theme_id: 'dragon',
    photo_url: '',
    phone_country_code: '+86',
    phone_number: '13600136000',
    is_premium: true,
    is_online: true,
    last_seen: new Date().toISOString(),
    created_at: '2025-08-10T10:00:00Z',
    updated_at: '2026-06-14T09:30:00Z',
  },
];

// Mock current user (for development use)
export const mockCurrentUser: User = {
  id: 'current-user',
  username: 'You (Demo)',
  email: 'demo@dualhearts.com',
  gender: 'male',
  birth_date: '1995-04-15',
  zodiac_chinese: 'pig',
  zodiac_western: 'aries',
  hobbies: ['travel', 'language', 'music', 'cooking'],
  bio: 'Demo user for development. Let\'s explore!',
  preferred_language: 'en',
  theme_id: 'tiger',
  photo_url: '',
  phone_country_code: '',
  phone_number: '',
  is_premium: true,
  is_online: true,
  last_seen: new Date().toISOString(),
  created_at: '2025-01-01T00:00:00Z',
  updated_at: new Date().toISOString(),
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage for demo
let currentUser = { ...mockCurrentUser };
let storedTokens: AuthTokens | null = null;

export const mockApi = {
  // Auth
  async login(data: LoginRequest): Promise<{ user: User; tokens: AuthTokens }> {
    await delay(500);
    const user = mockUsers.find(u => u.email === data.email) || mockCurrentUser;
    storedTokens = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
    };
    currentUser = { ...user };
    return { user, tokens: storedTokens };
  },

  async register(data: RegisterRequest): Promise<{ user: User; tokens: AuthTokens }> {
    await delay(800);
    const newUser: User = {
      ...mockCurrentUser,
      id: `user-${Date.now()}`,
      username: data.username,
      email: data.email,
      gender: data.gender,
      birth_date: data.birth_date,
      preferred_language: data.preferred_language,
      zodiac_chinese: 'pig', // calculated from birth date in real app
      zodiac_western: 'aries',
      hobbies: [],
      bio: '',
      photo_url: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    storedTokens = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
    };
    currentUser = newUser;
    return { user: newUser, tokens: storedTokens };
  },

  async getProfile(userId?: string): Promise<User> {
    await delay(300);
    if (!userId || userId === 'me' || userId === currentUser.id) return currentUser;
    return mockUsers.find(u => u.id === userId) || currentUser;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    await delay(500);
    currentUser = { ...currentUser, ...data, updated_at: new Date().toISOString() };
    return currentUser;
  },

  async getDiscoverProfiles(filters?: { gender?: string; minAge?: number; maxAge?: number }): Promise<UserProfile[]> {
    await delay(600);
    let filtered = [...mockUsers, currentUser].filter(u => u.id !== currentUser.id);
    
    if (filters?.gender && filters.gender !== 'all') {
      filtered = filtered.filter(u => u.gender === filters.gender);
    }
    
    return filtered.map(u => ({
      ...u,
      compatibility_score: Math.floor(Math.random() * 40) + 60, // 60-100
    }));
  },

  async getMatches(): Promise<Match[]> {
    await delay(400);
    const matchedUserIds = ['u3', 'u4'];
    return matchedUserIds.map(id => ({
      id: `match-${id}`,
      user_id_1: currentUser.id,
      user_id_2: id,
      compatibility_score: Math.floor(Math.random() * 25) + 70,
      status: 'accepted' as const,
      matched_by: 'discover' as const,
      created_at: '2026-06-01T10:00:00Z',
      updated_at: '2026-06-10T10:00:00Z',
      matched_user: mockUsers.find(u => u.id === id),
    }));
  },

  async sendLike(userId: string): Promise<boolean> {
    await delay(300);
    return true;
  },

  async getMessages(matchId: string): Promise<Message[]> {
    await delay(300);
    return [
      {
        id: 'm1',
        match_id: matchId,
        sender_id: 'u3',
        content: 'Привет! Как дела?',
        original_language: 'ru',
        translated_content: '你好！你好吗？',
        is_read: true,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'm2',
        match_id: matchId,
        sender_id: currentUser.id,
        content: '你好！我很好，谢谢！',
        original_language: 'zh',
        translated_content: 'Привет! У меня всё хорошо, спасибо!',
        is_read: true,
        created_at: new Date(Date.now() - 43200000).toISOString(),
      },
      {
        id: 'm3',
        match_id: matchId,
        sender_id: 'u3',
        content: 'Отлично! Ты изучаешь русский?',
        original_language: 'ru',
        translated_content: '太好了！你在学俄语吗？',
        is_read: false,
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ];
  },

  async initiateCall(calleeId: string): Promise<Call> {
    await delay(500);
    return {
      id: `call-${Date.now()}`,
      caller_id: currentUser.id,
      callee_id: calleeId,
      status: 'requested',
      started_at: null,
      ended_at: null,
      duration_seconds: 0,
      translation_enabled: true,
      created_at: new Date().toISOString(),
    };
  },

  async getCalls(): Promise<Call[]> {
    await delay(300);
    return [
      {
        id: 'call-1',
        caller_id: 'u3',
        callee_id: currentUser.id,
        status: 'ended',
        started_at: new Date(Date.now() - 86400000).toISOString(),
        ended_at: new Date(Date.now() - 86300000).toISOString(),
        duration_seconds: 600,
        translation_enabled: true,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        caller: mockUsers.find(u => u.id === 'u3'),
      },
    ];
  },

  // Translation mock
  async translateText(text: string, from: Language, to: Language): Promise<string> {
    await delay(200);
    const mockTranslations: Record<string, string> = {
      '你好': 'Здравствуйте',
      '谢谢': 'Спасибо',
      'Привет': '你好',
      'Как дела': '你好吗',
      'Спасибо': '谢谢',
    };
    return mockTranslations[text] || `[${from}→${to}] ${text}`;
  },

  getTokens(): AuthTokens | null {
    return storedTokens;
  },

  getCurrentUser(): User {
    return currentUser;
  },
};

export default mockApi;