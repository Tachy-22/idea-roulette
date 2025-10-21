'use client';

import { useState, useEffect } from 'react';
import { IdeaFeed } from './IdeaFeed';
import { OnboardingFlow } from './onboarding/OnboardingFlow';
import { isOnboardingCompleted } from '@/lib/storage';
import { StartupIdea } from '@/lib/gemini';

interface MainAppProps {
  initialIdeas: StartupIdea[];
}

export function MainApp({ initialIdeas }: MainAppProps) {
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if onboarding is completed
    const completed = isOnboardingCompleted();
    setShowOnboarding(!completed);
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

  // Show onboarding if not completed
  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  // Show main app if onboarding is completed
  return <IdeaFeed initialIdeas={initialIdeas} />;
}