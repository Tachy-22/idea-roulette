import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment, 
  arrayUnion, 
  arrayRemove,
  collection,
  getDocs 
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db, auth } from './firebase';
import { StartupIdea, UserPreferences } from './gemini';
import { 
  trackIdeaInteraction, 
  UserBehavior 
} from './analytics';

export interface StoredUserData {
  likedIdeas: StartupIdea[];
  preferences: UserPreferences;
  swipeCount: number;
  personalityUnlocked: boolean;
}

// Get current user or throw error
const getCurrentUser = (): User => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated');
  }
  return user;
};

// User document structure in Firestore
interface FirestoreUser {
  likedIdeas: StartupIdea[];
  preferences: UserPreferences;
  swipeCount: number;
  personalityUnlocked: boolean;
  onboardingCompleted: boolean;
  interests: string[];
  name: string;
  seenIdeas: string[];
  createdAt: Date;
  lastActiveAt: Date;
}

// Get user document reference
const getUserDocRef = (userId: string) => doc(db, 'users', userId);

// Initialize user document if it doesn't exist
const initializeUserDoc = async (user: User): Promise<void> => {
  const userDocRef = getUserDocRef(user.uid);
  const userDoc = await getDoc(userDocRef);
  
  if (!userDoc.exists()) {
    const initialData: Partial<FirestoreUser> = {
      likedIdeas: [],
      preferences: getDefaultPreferences(),
      swipeCount: 0,
      personalityUnlocked: false,
      onboardingCompleted: false,
      interests: [],
      name: user.displayName || '',
      seenIdeas: [],
      createdAt: new Date(),
      lastActiveAt: new Date()
    };
    
    await setDoc(userDocRef, initialData);
  }
};

// Get user data with fallback
const getUserData = async (userId: string): Promise<Partial<FirestoreUser>> => {
  const userDocRef = getUserDocRef(userId);
  const userDoc = await getDoc(userDocRef);
  
  if (userDoc.exists()) {
    return userDoc.data() as Partial<FirestoreUser>;
  }
  
  return {
    likedIdeas: [],
    preferences: getDefaultPreferences(),
    swipeCount: 0,
    personalityUnlocked: false,
    onboardingCompleted: false,
    interests: [],
    name: '',
    seenIdeas: []
  };
};

// Liked Ideas Management
export async function getLikedIdeas(): Promise<StartupIdea[]> {
  try {
    const user = getCurrentUser();
    const userData = await getUserData(user.uid);
    return userData.likedIdeas || [];
  } catch (error) {
    console.error('Error getting liked ideas:', error);
    return [];
  }
}

export async function addLikedIdea(idea: StartupIdea): Promise<void> {
  try {
    const user = getCurrentUser();
    await initializeUserDoc(user);
    
    const userDocRef = getUserDocRef(user.uid);
    const userData = await getUserData(user.uid);
    const likedIdeas = userData.likedIdeas || [];
    
    // Check if already liked
    const isAlreadyLiked = likedIdeas.some(likedIdea => likedIdea.name === idea.name);
    
    if (!isAlreadyLiked) {
      console.log('Adding liked idea:', idea.name, 'Category:', idea.category);
      
      await updateDoc(userDocRef, {
        likedIdeas: arrayUnion(idea),
        lastActiveAt: new Date()
      });
      
      await updateUserPreferences(idea);
      
      // Track analytics
      await trackIdeaInteraction(
        idea.name,
        idea.category,
        idea.rating,
        'like'
      );
      
      console.log('Successfully tracked like for:', idea.name);
    }
  } catch (error) {
    console.error('Error adding liked idea:', error);
    throw error;
  }
}

export async function removeLikedIdea(ideaName: string): Promise<void> {
  try {
    const user = getCurrentUser();
    const userData = await getUserData(user.uid);
    const likedIdeas = userData.likedIdeas || [];
    
    const ideaToRemove = likedIdeas.find(idea => idea.name === ideaName);
    if (ideaToRemove) {
      console.log('Removing liked idea:', ideaName, 'Category:', ideaToRemove.category);
      
      const userDocRef = getUserDocRef(user.uid);
      await updateDoc(userDocRef, {
        likedIdeas: arrayRemove(ideaToRemove),
        lastActiveAt: new Date()
      });
      
      // Track analytics
      await trackIdeaInteraction(
        ideaToRemove.name,
        ideaToRemove.category,
        ideaToRemove.rating,
        'unlike'
      );
      
      console.log('Successfully tracked unlike for:', ideaName);
    }
  } catch (error) {
    console.error('Error removing liked idea:', error);
    throw error;
  }
}

export async function isIdeaLiked(ideaName: string): Promise<boolean> {
  try {
    const likedIdeas = await getLikedIdeas();
    return likedIdeas.some(idea => idea.name === ideaName);
  } catch (error) {
    console.error('Error checking if idea is liked:', error);
    return false;
  }
}

// User Preferences Management
export async function getUserPreferences(): Promise<UserPreferences> {
  try {
    const user = getCurrentUser();
    const userData = await getUserData(user.uid);
    return userData.preferences || getDefaultPreferences();
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return getDefaultPreferences();
  }
}

export async function updateUserPreferences(likedIdea: StartupIdea): Promise<void> {
  try {
    const user = getCurrentUser();
    const userDocRef = getUserDocRef(user.uid);
    const userData = await getUserData(user.uid);
    const preferences = userData.preferences || getDefaultPreferences();
    
    // Update liked categories
    const updatedCategories = [...preferences.likedCategories];
    if (!updatedCategories.includes(likedIdea.category)) {
      updatedCategories.push(likedIdea.category);
    }
    
    // Update liked tags
    const updatedTags = [...preferences.likedTags];
    likedIdea.tags.forEach(tag => {
      if (!updatedTags.includes(tag)) {
        updatedTags.push(tag);
      }
    });
    
    // Update personality traits
    const updatedTraits = [...preferences.personalityTraits];
    if (likedIdea.rating >= 9.0 && !updatedTraits.includes('high-standards')) {
      updatedTraits.push('high-standards');
    }
    if (likedIdea.tags.includes('AI') && !updatedTraits.includes('tech-savvy')) {
      updatedTraits.push('tech-savvy');
    }
    
    const updatedPreferences: UserPreferences = {
      ...preferences,
      likedCategories: updatedCategories,
      likedTags: updatedTags,
      personalityTraits: updatedTraits
    };
    
    await updateDoc(userDocRef, {
      preferences: updatedPreferences,
      lastActiveAt: new Date()
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
}

// Swipe Count Management
export async function getSwipeCount(): Promise<number> {
  try {
    const user = getCurrentUser();
    const userData = await getUserData(user.uid);
    return userData.swipeCount || 0;
  } catch (error) {
    console.error('Error getting swipe count:', error);
    return 0;
  }
}

export async function incrementSwipeCount(): Promise<number> {
  try {
    const user = getCurrentUser();
    await initializeUserDoc(user);
    
    const userDocRef = getUserDocRef(user.uid);
    
    await updateDoc(userDocRef, {
      swipeCount: increment(1),
      lastActiveAt: new Date()
    });
    
    const userData = await getUserData(user.uid);
    const newCount = (userData.swipeCount || 0) + 1;
    
    // Unlock personality after 10 swipes
    if (newCount >= 10 && !(userData.personalityUnlocked)) {
      await setPersonalityUnlocked(true);
    }
    
    return newCount;
  } catch (error) {
    console.error('Error incrementing swipe count:', error);
    throw error;
  }
}

// Personality Management
export async function isPersonalityUnlocked(): Promise<boolean> {
  try {
    const user = getCurrentUser();
    const userData = await getUserData(user.uid);
    return userData.personalityUnlocked || false;
  } catch (error) {
    console.error('Error checking personality unlock:', error);
    return false;
  }
}

export async function setPersonalityUnlocked(unlocked: boolean): Promise<void> {
  try {
    const user = getCurrentUser();
    const userDocRef = getUserDocRef(user.uid);
    
    await updateDoc(userDocRef, {
      personalityUnlocked: unlocked,
      lastActiveAt: new Date()
    });
  } catch (error) {
    console.error('Error setting personality unlocked:', error);
    throw error;
  }
}

export async function getFounderPersonality(): Promise<string> {
  try {
    const preferences = await getUserPreferences();
    const swipeCount = await getSwipeCount();
    const likedIdeas = await getLikedIdeas();
    
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
  } catch (error) {
    console.error('Error getting founder personality:', error);
    return '🌟 Emerging Founder';
  }
}

// Onboarding Management
export async function isOnboardingCompleted(): Promise<boolean> {
  try {
    const user = getCurrentUser();
    const userData = await getUserData(user.uid);
    return userData.onboardingCompleted || false;
  } catch (error) {
    console.error('Error checking onboarding completion:', error);
    return false;
  }
}

export async function setOnboardingCompleted(completed: boolean): Promise<void> {
  try {
    const user = getCurrentUser();
    await initializeUserDoc(user);
    
    const userDocRef = getUserDocRef(user.uid);
    await updateDoc(userDocRef, {
      onboardingCompleted: completed,
      lastActiveAt: new Date()
    });
  } catch (error) {
    console.error('Error setting onboarding completed:', error);
    throw error;
  }
}

// User Interests Management
export async function getUserInterests(): Promise<string[]> {
  try {
    const user = getCurrentUser();
    const userData = await getUserData(user.uid);
    return userData.interests || [];
  } catch (error) {
    console.error('Error getting user interests:', error);
    return [];
  }
}

export async function setUserInterests(interests: string[]): Promise<void> {
  try {
    const user = getCurrentUser();
    await initializeUserDoc(user);
    
    const userDocRef = getUserDocRef(user.uid);
    const userData = await getUserData(user.uid);
    const preferences = userData.preferences || getDefaultPreferences();
    
    // Update preferences with selected interests
    const updatedPreferences: UserPreferences = {
      ...preferences,
      likedCategories: interests
    };
    
    await updateDoc(userDocRef, {
      interests,
      preferences: updatedPreferences,
      lastActiveAt: new Date()
    });
  } catch (error) {
    console.error('Error setting user interests:', error);
    throw error;
  }
}

// User Name Management
export async function getUserName(): Promise<string> {
  try {
    const user = getCurrentUser();
    const userData = await getUserData(user.uid);
    return userData.name || user.displayName || '';
  } catch (error) {
    console.error('Error getting user name:', error);
    return '';
  }
}

export async function setUserName(name: string): Promise<void> {
  try {
    const user = getCurrentUser();
    await initializeUserDoc(user);
    
    const userDocRef = getUserDocRef(user.uid);
    await updateDoc(userDocRef, {
      name,
      lastActiveAt: new Date()
    });
  } catch (error) {
    console.error('Error setting user name:', error);
    throw error;
  }
}

// Seen Ideas Management
export async function getSeenIdeas(): Promise<string[]> {
  try {
    const user = getCurrentUser();
    const userData = await getUserData(user.uid);
    return userData.seenIdeas || [];
  } catch (error) {
    console.error('Error getting seen ideas:', error);
    return [];
  }
}

export async function addSeenIdea(ideaName: string, ideaCategory?: string, ideaRating?: number): Promise<void> {
  try {
    const user = getCurrentUser();
    await initializeUserDoc(user);
    
    const userData = await getUserData(user.uid);
    const seenIdeas = userData.seenIdeas || [];
    
    if (!seenIdeas.includes(ideaName)) {
      console.log('Adding seen idea:', ideaName, 'Category:', ideaCategory, 'Rating:', ideaRating);
      
      // Add new idea and keep only last 200 to prevent storage bloat
      const updatedSeen = [...seenIdeas, ideaName].slice(-200);
      
      const userDocRef = getUserDocRef(user.uid);
      await updateDoc(userDocRef, {
        seenIdeas: updatedSeen,
        lastActiveAt: new Date()
      });
      
      // Track analytics with proper data
      await trackIdeaInteraction(
        ideaName,
        ideaCategory || 'Unknown',
        ideaRating || 0,
        'view'
      );
      
      console.log('Successfully tracked view for:', ideaName);
    }
  } catch (error) {
    console.error('Error adding seen idea:', error);
    throw error;
  }
}

export async function hasSeenIdea(ideaName: string): Promise<boolean> {
  try {
    const seenIdeas = await getSeenIdeas();
    return seenIdeas.includes(ideaName);
  } catch (error) {
    console.error('Error checking if idea is seen:', error);
    return false;
  }
}

// Clear all user data (for account deletion)
export async function clearAllUserData(): Promise<void> {
  try {
    const user = getCurrentUser();
    const userDocRef = getUserDocRef(user.uid);
    
    // Reset to initial state
    const initialData: Partial<FirestoreUser> = {
      likedIdeas: [],
      preferences: getDefaultPreferences(),
      swipeCount: 0,
      personalityUnlocked: false,
      onboardingCompleted: false,
      interests: [],
      name: user.displayName || '',
      seenIdeas: [],
      lastActiveAt: new Date()
    };
    
    await updateDoc(userDocRef, initialData);
  } catch (error) {
    console.error('Error clearing user data:', error);
    throw error;
  }
}

// Helper function for default preferences
function getDefaultPreferences(): UserPreferences {
  return {
    likedCategories: [],
    likedTags: [],
    personalityTraits: [],
    engagementPattern: 'thoughtful',
  };
}

// Initialize Firebase user session (call this when user signs in)
export async function initializeFirebaseUser(user: User): Promise<void> {
  try {
    await initializeUserDoc(user);
    
    // Import analytics initialization
    const { initializeAnalytics } = await import('./analytics');
    await initializeAnalytics(user);
  } catch (error) {
    console.error('Error initializing Firebase user:', error);
    throw error;
  }
}

// Get user behavior data for admin dashboard
export async function getUserBehaviorData(userId: string): Promise<UserBehavior | null> {
  try {
    const userBehaviorRef = doc(db, 'userBehavior', userId);
    const userBehaviorDoc = await getDoc(userBehaviorRef);
    
    if (userBehaviorDoc.exists()) {
      return userBehaviorDoc.data() as UserBehavior;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user behavior data:', error);
    return null;
  }
}

// Get all users (for admin dashboard)
export async function getAllUsers(): Promise<Array<{ id: string; data: Partial<FirestoreUser> }>> {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      data: doc.data() as Partial<FirestoreUser>
    }));
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
}