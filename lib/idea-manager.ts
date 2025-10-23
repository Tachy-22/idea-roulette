import { 
  collection, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { generateIdeas } from './gemini';
import { StartupIdea, UserPreferences } from './gemini';
import { getUserPreferences, getSeenIdeas } from './firebase-storage';

// Get current user or throw error
const getCurrentUser = () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated');
  }
  return user;
};

// Generate fresh ideas and store them in DB
export const generateAndStoreIdeas = async (
  preferences?: UserPreferences, 
  count: number = 15
): Promise<StartupIdea[]> => {
  try {
    const user = getCurrentUser();
    
    // Get seen ideas to avoid duplicates
    const seenIdeas = await getSeenIdeas();
    
    // Generate fresh ideas using Gemini
    const newIdeas = await generateIdeas(preferences, count, seenIdeas);
    
    // Store each idea in Firestore in parallel
    const storePromises = newIdeas.map(async (idea) => {
      try {
        await addDoc(collection(db, 'ideas'), {
          ...idea,
          userId: user.uid,
          createdAt: serverTimestamp(),
          isGenerated: true
        });
      } catch (error) {
        console.error('Error storing individual idea:', error);
        // Continue with other ideas even if one fails
      }
    });
    
    // Wait for all storage operations to complete
    await Promise.all(storePromises);
    
    console.log(`Generated and stored ${newIdeas.length} fresh ideas`);
    return newIdeas;
    
  } catch (error) {
    console.error('Error generating and storing ideas:', error);
    throw error;
  }
};

// Check if we need to load more ideas
export const shouldLoadMoreIdeas = (
  currentIndex: number, 
  totalIdeas: number, 
  threshold: number = 15
): boolean => {
  const remaining = totalIdeas - currentIndex - 1; // -1 because currentIndex is 0-based
  return remaining <= threshold;
};

// Load more ideas when running low
export const loadMoreIdeas = async (
  batchSize: number = 15
): Promise<StartupIdea[]> => {
  try {
    console.log(`Loading ${batchSize} more ideas...`);
    
    // Get user preferences for personalized generation
    const preferences = await getUserPreferences();
    
    // Generate fresh ideas
    const newIdeas = await generateAndStoreIdeas(preferences, batchSize);
    
    console.log(`Successfully loaded ${newIdeas.length} new ideas`);
    return newIdeas;
    
  } catch (error) {
    console.error('Error loading more ideas:', error);
    // Return empty array instead of throwing to prevent app crash
    return [];
  }
};

// Initialize with initial batch of ideas
export const initializeUserIdeas = async (initialCount: number = 30): Promise<StartupIdea[]> => {
  try {
    console.log(`Initializing with ${initialCount} ideas...`);
    
    // Get user preferences
    const preferences = await getUserPreferences();
    
    // Generate initial batch
    const initialIdeas = await generateAndStoreIdeas(preferences, initialCount);
    
    console.log(`Initialized with ${initialIdeas.length} ideas`);
    return initialIdeas;
    
  } catch (error) {
    console.error('Error initializing user ideas:', error);
    // Return empty array to let the app handle loading
    return [];
  }
};