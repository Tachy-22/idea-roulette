'use client';

import { useState, useEffect } from 'react';
import { IdeaFeed } from './IdeaFeed';
import { OnboardingFlow } from './onboarding/OnboardingFlow';
import { AuthWrapper } from './auth/AuthWrapper';
import { isOnboardingCompleted } from '@/lib/firebase-storage';
import { StartupIdea } from '@/lib/gemini';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface MainAppProps {
  initialIdeas: StartupIdea[];
}

export function MainApp({ initialIdeas }: MainAppProps) {
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    // Wait for user authentication before checking onboarding status
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('MainApp: Auth state changed, user:', user?.email || 'none');
      if (user) {
        // User is authenticated, check onboarding status
        try {
          console.log('MainApp: Checking onboarding status...');
          const completed = await isOnboardingCompleted();
          console.log('MainApp: Onboarding completed:', completed);
          setShowOnboarding(!completed);
        } catch (error) {
          console.error('Error checking onboarding status:', error);
          // If there's an error, assume they need onboarding
          setShowOnboarding(true);
        }
      } else {
        // User not authenticated, this shouldn't happen since AuthWrapper handles this
        console.log('MainApp: No user found, but this should be handled by AuthWrapper');
        setShowOnboarding(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('MainApp: Loading timeout reached');
      setLoadingTimeout(true);
    }, 10000); // 10 seconds

    return () => clearTimeout(timeout);
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  // Show loading or error if timeout reached
  if (showOnboarding === null) {
    if (loadingTimeout) {
      return (
        <div className="w-full h-dvh bg-black flex flex-col items-center justify-center px-8">
          <div className="text-white text-lg mb-4">Connection Error</div>
          <div className="text-gray-400 text-sm text-center mb-6">
            Unable to load the app. Please check your internet connection and try refreshing the page.
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    
    return (
      <div className="w-full h-dvh bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  // Show onboarding wrapped in auth - only for authenticated users who haven't completed onboarding
  if (showOnboarding) {
    return (
      <AuthWrapper>
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      </AuthWrapper>
    );
  }

  // Show main app if onboarding is completed
  return (
    <AuthWrapper>
      <IdeaFeed initialIdeas={initialIdeas} />
    </AuthWrapper>
  );
}