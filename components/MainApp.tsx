'use client';

import { useState, useEffect } from 'react';
import { IdeaFeed } from './IdeaFeed';
import { OnboardingFlow } from './onboarding/OnboardingFlow';
import { AuthWrapper } from './auth/AuthWrapper';
import { isOnboardingCompleted } from '@/lib/firebase-storage';
import { StartupIdea } from '@/lib/gemini';

interface MainAppProps {
  initialIdeas: StartupIdea[];
}

export function MainApp({ initialIdeas }: MainAppProps) {
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    // AuthWrapper ensures user is authenticated, so just check onboarding
    const checkOnboarding = async () => {
      try {
        const completed = await isOnboardingCompleted();
        setShowOnboarding(!completed);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // If there's an error, assume they need onboarding
        setShowOnboarding(true);
      }
    };

    checkOnboarding();
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  // Show loading or nothing while checking onboarding status
  if (showOnboarding === null) {
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