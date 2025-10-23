import { db, auth } from './firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  increment,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { User } from 'firebase/auth';

// User session tracking
export interface UserSession {
  userId: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  actionsCount: number;
  ideasViewed: number;
  ideasLiked: number;
  ideasRemixed: number;
  ideasShared: number;
  swipeCount: number;
  country?: string;
  region?: string;
  city?: string;
  device: string;
  browser: string;
  os: string;
  screenResolution: string;
  referrer?: string;
}

// Idea interaction tracking
export interface IdeaInteraction {
  userId: string;
  sessionId: string;
  ideaName: string;
  ideaCategory: string;
  ideaRating: number;
  action: 'view' | 'like' | 'unlike' | 'remix' | 'share' | 'expand';
  timestamp: Date;
  timeSpentOnIdea?: number; // in seconds
  swipeDirection?: 'up' | 'down';
}

// User behavior patterns
export interface UserBehavior {
  userId: string;
  totalSessions: number;
  totalTimeSpent: number; // in minutes
  averageSessionLength: number;
  totalIdeasViewed: number;
  totalIdeasLiked: number;
  totalIdeasRemixed: number;
  totalIdeasShared: number;
  totalSwipes: number;
  favoriteCategories: string[];
  averageRatingOfLikedIdeas: number;
  timeOfDayUsage: Record<string, number>; // hour of day -> usage count
  dayOfWeekUsage: Record<string, number>; // day -> usage count
  retentionDays: number[];
  lastActiveDate: Date;
  firstSessionDate: Date;
  mostRecentLocation?: {
    country: string;
    region: string;
    city: string;
  };
}

// App-wide metrics
export interface AppMetrics {
  date: string;
  dailyActiveUsers: number;
  newUsers: number;
  totalSessions: number;
  averageSessionLength: number;
  totalIdeasGenerated: number;
  totalIdeasLiked: number;
  totalIdeasShared: number;
  topCategories: Array<{ category: string; count: number }>;
  userRetention: {
    day1: number;
    day7: number;
    day30: number;
  };
  geographicDistribution: Record<string, number>;
  deviceDistribution: Record<string, number>;
  browserDistribution: Record<string, number>;
}

// Get device and browser info
const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  const screenRes = `${screen.width}x${screen.height}`;
  
  let device = 'Desktop';
  if (/Mobile|Android|iPhone|iPad/.test(ua)) {
    device = /iPad/.test(ua) ? 'Tablet' : 'Mobile';
  }

  let browser = 'Unknown';
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';

  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS')) os = 'iOS';

  return { device, browser, os, screenResolution: screenRes };
};

// Get location info (using a free IP geolocation service)
const getLocationInfo = async (): Promise<{ country?: string; region?: string; city?: string }> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return {
      country: data.country_name || null,
      region: data.region || null,
      city: data.city || null
    };
  } catch (error) {
    console.error('Failed to get location:', error);
    return {};
  }
};

// Generate session ID
const generateSessionId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
};

// Clean object by removing undefined values (Firestore doesn't accept undefined)
const cleanFirestoreData = (obj: Record<string, unknown>): Record<string, unknown> => {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
};

let currentSession: UserSession | null = null;
let sessionStartTime: Date | null = null;
let ideaViewStartTime: Date | null = null;
let currentIdeaName: string | null = null;

// Start user session
export const startUserSession = async (user: User): Promise<void> => {
  const sessionId = generateSessionId();
  const deviceInfo = getDeviceInfo();
  const locationInfo = await getLocationInfo();
  
  sessionStartTime = new Date();
  
  currentSession = {
    userId: user.uid,
    sessionId,
    startTime: sessionStartTime,
    actionsCount: 0,
    ideasViewed: 0,
    ideasLiked: 0,
    ideasRemixed: 0,
    ideasShared: 0,
    swipeCount: 0,
    ...deviceInfo,
    ...locationInfo,
    referrer: document.referrer || undefined
  };

  // Save session to Firestore (clean undefined values)
  await addDoc(collection(db, 'userSessions'), cleanFirestoreData({
    ...currentSession,
    startTime: serverTimestamp()
  }));

  // Update user behavior stats
  await updateUserBehaviorStats(user.uid, 'sessionStart');
};

// End user session
export const endUserSession = async (): Promise<void> => {
  if (!currentSession || !sessionStartTime) return;

  const endTime = new Date();
  const duration = endTime.getTime() - sessionStartTime.getTime();

  // Update session with end time and duration
  const sessionDoc = doc(db, 'userSessions', currentSession.sessionId);
  await updateDoc(sessionDoc, {
    endTime: serverTimestamp(),
    duration: Math.round(duration / 1000), // in seconds
    actionsCount: currentSession.actionsCount,
    ideasViewed: currentSession.ideasViewed,
    ideasLiked: currentSession.ideasLiked,
    ideasRemixed: currentSession.ideasRemixed,
    ideasShared: currentSession.ideasShared,
    swipeCount: currentSession.swipeCount
  });

  currentSession = null;
  sessionStartTime = null;
};

// Track idea interaction
export const trackIdeaInteraction = async (
  ideaName: string,
  ideaCategory: string,
  ideaRating: number,
  action: IdeaInteraction['action'],
  swipeDirection?: 'up' | 'down'
): Promise<void> => {
  const user = auth.currentUser;
  if (!user || !currentSession) return;

  // Calculate time spent on idea if this is a view end
  let timeSpentOnIdea: number | undefined;
  if (action === 'view' && currentIdeaName === ideaName) {
    // Starting to view this idea
    ideaViewStartTime = new Date();
    currentIdeaName = ideaName;
  } else if (ideaViewStartTime && currentIdeaName) {
    // Ending view of previous idea
    timeSpentOnIdea = Math.round((new Date().getTime() - ideaViewStartTime.getTime()) / 1000);
    ideaViewStartTime = new Date();
    currentIdeaName = ideaName;
  }

  const interaction: Omit<IdeaInteraction, 'timestamp'> = {
    userId: user.uid,
    sessionId: currentSession.sessionId,
    ideaName,
    ideaCategory,
    ideaRating,
    action,
    timeSpentOnIdea,
    swipeDirection
  };

  // Save interaction to Firestore (clean undefined values)
  await addDoc(collection(db, 'ideaInteractions'), cleanFirestoreData({
    ...interaction,
    timestamp: serverTimestamp()
  }));

  // Update current session stats
  currentSession.actionsCount++;
  
  switch (action) {
    case 'view':
      currentSession.ideasViewed++;
      break;
    case 'like':
      currentSession.ideasLiked++;
      break;
    case 'remix':
      currentSession.ideasRemixed++;
      break;
    case 'share':
      currentSession.ideasShared++;
      break;
  }

  if (swipeDirection) {
    currentSession.swipeCount++;
  }

  // Update user behavior stats
  await updateUserBehaviorStats(user.uid, action, ideaCategory, ideaRating);
};

// Update user behavior statistics
const updateUserBehaviorStats = async (
  userId: string, 
  action: string, 
  category?: string, 
  rating?: number
): Promise<void> => {
  const userBehaviorRef = doc(db, 'userBehavior', userId);
  const userBehaviorDoc = await getDoc(userBehaviorRef);
  
  const now = new Date();
  const hour = now.getHours().toString();
  const day = now.toLocaleDateString('en-US', { weekday: 'long' });

  const updateData: Record<string, unknown> = {
    lastActiveDate: serverTimestamp()
  };

  // Avoid unused variable warning
  if (category && rating) {
    // Future use for category and rating analytics
  }

  if (action === 'sessionStart') {
    updateData.totalSessions = increment(1);
    updateData[`timeOfDayUsage.${hour}`] = increment(1);
    updateData[`dayOfWeekUsage.${day}`] = increment(1);
    
    if (!userBehaviorDoc.exists()) {
      updateData.firstSessionDate = serverTimestamp();
      updateData.totalTimeSpent = 0;
      updateData.averageSessionLength = 0;
      updateData.totalIdeasViewed = 0;
      updateData.totalIdeasLiked = 0;
      updateData.totalIdeasRemixed = 0;
      updateData.totalIdeasShared = 0;
      updateData.totalSwipes = 0;
      updateData.favoriteCategories = [];
      updateData.averageRatingOfLikedIdeas = 0;
      updateData.retentionDays = [];
    }
  } else {
    switch (action) {
      case 'view':
        updateData.totalIdeasViewed = increment(1);
        updateData.totalSwipes = increment(1);
        break;
      case 'like':
        updateData.totalIdeasLiked = increment(1);
        if (rating) {
          // Update average rating calculation would need more complex logic
          // For now, we'll track this in the admin dashboard calculations
        }
        break;
      case 'remix':
        updateData.totalIdeasRemixed = increment(1);
        break;
      case 'share':
        updateData.totalIdeasShared = increment(1);
        break;
    }
  }

  await setDoc(userBehaviorRef, updateData, { merge: true });
};

// Track app metrics (called daily by a scheduled function)
export const updateDailyMetrics = async (): Promise<void> => {
  const today = new Date().toISOString().split('T')[0];
  
  // This would typically be implemented as a Firebase Cloud Function
  // that runs daily to aggregate user data into daily metrics
  // For now, we'll create the structure for the admin dashboard to use
  
  const metricsRef = doc(db, 'appMetrics', today);
  await setDoc(metricsRef, {
    date: today,
    lastUpdated: serverTimestamp(),
    // Actual calculations would be done in Cloud Functions
    // aggregating from userSessions and ideaInteractions collections
  }, { merge: true });
};

// Initialize analytics when user signs in
export const initializeAnalytics = async (user: User): Promise<void> => {
  await startUserSession(user);
  
  // Set up beforeunload handler to end session
  window.addEventListener('beforeunload', () => {
    if (currentSession) {
      // Use sendBeacon for reliable session end tracking
      navigator.sendBeacon('/api/analytics/end-session', JSON.stringify({
        sessionId: currentSession.sessionId,
        userId: user.uid
      }));
    }
  });
  
  // Set up visibility change handler for more accurate session tracking
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Page hidden - pause tracking
      if (ideaViewStartTime && currentIdeaName) {
        // Could track "pause" events here in the future
      }
    } else {
      // Page visible again - resume tracking
      ideaViewStartTime = new Date();
    }
  });
};

// Export current session for other components to use
export const getCurrentSession = (): UserSession | null => currentSession;