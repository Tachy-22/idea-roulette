import { StartupIdea, UserPreferences } from './gemini';

const STORAGE_KEYS = {
  LIKED_IDEAS: 'idearoulette_liked_ideas',
  USER_PREFERENCES: 'idearoulette_user_preferences',
  SWIPE_COUNT: 'idearoulette_swipe_count',
  PERSONALITY_UNLOCKED: 'idearoulette_personality_unlocked',
  ONBOARDING_COMPLETED: 'idearoulette_onboarding_completed',
  USER_INTERESTS: 'idearoulette_user_interests',
  USER_NAME: 'idearoulette_user_name',
  SEEN_IDEAS: 'idearoulette_seen_ideas',
} as const;

export interface StoredUserData {
  likedIdeas: StartupIdea[];
  preferences: UserPreferences;
  swipeCount: number;
  personalityUnlocked: boolean;
}

export function getLikedIdeas(): StartupIdea[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LIKED_IDEAS);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addLikedIdea(idea: StartupIdea): void {
  if (typeof window === 'undefined') return;
  
  const liked = getLikedIdeas();
  const isAlreadyLiked = liked.some(likedIdea => likedIdea.name === idea.name);
  
  if (!isAlreadyLiked) {
    liked.push(idea);
    localStorage.setItem(STORAGE_KEYS.LIKED_IDEAS, JSON.stringify(liked));
    updateUserPreferences(idea);
  }
}

export function removeLikedIdea(ideaName: string): void {
  if (typeof window === 'undefined') return;
  
  const liked = getLikedIdeas();
  const filtered = liked.filter(idea => idea.name !== ideaName);
  localStorage.setItem(STORAGE_KEYS.LIKED_IDEAS, JSON.stringify(filtered));
}

export function isIdeaLiked(ideaName: string): boolean {
  const liked = getLikedIdeas();
  return liked.some(idea => idea.name === ideaName);
}

export function getUserPreferences(): UserPreferences {
  if (typeof window === 'undefined') {
    return getDefaultPreferences();
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    return stored ? JSON.parse(stored) : getDefaultPreferences();
  } catch {
    return getDefaultPreferences();
  }
}

export function updateUserPreferences(likedIdea: StartupIdea): void {
  if (typeof window === 'undefined') return;
  
  const preferences = getUserPreferences();
  
  // Update liked categories
  if (!preferences.likedCategories.includes(likedIdea.category)) {
    preferences.likedCategories.push(likedIdea.category);
  }
  
  // Update liked tags
  likedIdea.tags.forEach(tag => {
    if (!preferences.likedTags.includes(tag)) {
      preferences.likedTags.push(tag);
    }
  });
  
  // Update engagement pattern based on rating preference
  if (likedIdea.rating >= 9.0) {
    if (!preferences.personalityTraits.includes('high-standards')) {
      preferences.personalityTraits.push('high-standards');
    }
  }
  
  if (likedIdea.tags.includes('AI')) {
    if (!preferences.personalityTraits.includes('tech-savvy')) {
      preferences.personalityTraits.push('tech-savvy');
    }
  }
  
  localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
}

export function getSwipeCount(): number {
  if (typeof window === 'undefined') return 0;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SWIPE_COUNT);
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
}

export function incrementSwipeCount(): number {
  if (typeof window === 'undefined') return 0;
  
  const count = getSwipeCount() + 1;
  localStorage.setItem(STORAGE_KEYS.SWIPE_COUNT, count.toString());
  
  // Unlock personality after 10 swipes
  if (count >= 10 && !isPersonalityUnlocked()) {
    setPersonalityUnlocked(true);
  }
  
  return count;
}

export function isPersonalityUnlocked(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PERSONALITY_UNLOCKED);
    return stored === 'true';
  } catch {
    return false;
  }
}

export function setPersonalityUnlocked(unlocked: boolean): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(STORAGE_KEYS.PERSONALITY_UNLOCKED, unlocked.toString());
}

export function getFounderPersonality(): string {
  const preferences = getUserPreferences();
  const swipeCount = getSwipeCount();
  const likedIdeas = getLikedIdeas();
  
  if (preferences.personalityTraits.includes('tech-savvy') && preferences.personalityTraits.includes('high-standards')) {
    return '🚀 Tech Visionary';
  }
  
  if (preferences.likedCategories.some(cat => cat.includes('Social'))) {
    return '👥 Community Builder';
  }
  
  if (preferences.likedCategories.some(cat => cat.includes('AI'))) {
    return '🤖 AI Pioneer';
  }
  
  if (likedIdeas.length > 20) {
    return '💡 Idea Collector';
  }
  
  if (swipeCount > 100) {
    return '🎡 Roulette Master';
  }
  
  return '🌟 Emerging Founder';
}

export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

function getDefaultPreferences(): UserPreferences {
  return {
    likedCategories: [],
    likedTags: [],
    personalityTraits: [],
    engagementPattern: 'thoughtful',
  };
}

// Onboarding Functions
export function isOnboardingCompleted(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const completed = localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    return completed === 'true';
  } catch {
    return false;
  }
}

export function setOnboardingCompleted(completed: boolean): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, completed.toString());
}

export function getUserInterests(): string[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const interests = localStorage.getItem(STORAGE_KEYS.USER_INTERESTS);
    return interests ? JSON.parse(interests) : [];
  } catch {
    return [];
  }
}

export function setUserInterests(interests: string[]): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(STORAGE_KEYS.USER_INTERESTS, JSON.stringify(interests));
  
  // Update user preferences based on selected interests
  const preferences = getUserPreferences();
  preferences.likedCategories = interests;
  localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
}

export function getUserName(): string {
  if (typeof window === 'undefined') return '';
  
  try {
    const name = localStorage.getItem(STORAGE_KEYS.USER_NAME);
    return name || '';
  } catch {
    return '';
  }
}

export function setUserName(name: string): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(STORAGE_KEYS.USER_NAME, name);
}

// Seen ideas tracking to avoid duplicates
export function getSeenIdeas(): string[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const seen = localStorage.getItem(STORAGE_KEYS.SEEN_IDEAS);
    return seen ? JSON.parse(seen) : [];
  } catch {
    return [];
  }
}

export function addSeenIdea(ideaName: string): void {
  if (typeof window === 'undefined') return;
  
  const seen = getSeenIdeas();
  if (!seen.includes(ideaName)) {
    seen.push(ideaName);
    // Keep only last 200 seen ideas to prevent storage bloat
    const trimmed = seen.slice(-200);
    localStorage.setItem(STORAGE_KEYS.SEEN_IDEAS, JSON.stringify(trimmed));
  }
}

export function hasSeenIdea(ideaName: string): boolean {
  const seen = getSeenIdeas();
  return seen.includes(ideaName);
}