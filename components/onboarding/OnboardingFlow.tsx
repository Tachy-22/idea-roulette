'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { WelcomeScreen } from './WelcomeScreen';
import { InterestSelection } from './InterestSelection';
import { CompletionScreen } from './CompletionScreen';
import { setUserInterests, setOnboardingCompleted } from '@/lib/firebase-storage';

interface OnboardingFlowProps {
  onComplete: () => void;
}

type OnboardingStep = 'welcome' | 'interests' | 'completion';

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const handleWelcomeNext = () => {
    setCurrentStep('interests');
  };

  const handleInterestsNext = async (interests: string[]) => {
    setSelectedInterests(interests);
    await setUserInterests(interests);
    setCurrentStep('completion');
  };

  const handleInterestsBack = () => {
    setCurrentStep('welcome');
  };

  const handleComplete = async () => {
    await setOnboardingCompleted(true);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <AnimatePresence mode="wait">
        {currentStep === 'welcome' && (
          <WelcomeScreen 
            key="welcome"
            onNext={handleWelcomeNext} 
          />
        )}
        
        {currentStep === 'interests' && (
          <InterestSelection 
            key="interests"
            onNext={handleInterestsNext}
            onBack={handleInterestsBack}
          />
        )}
        
        {currentStep === 'completion' && (
          <CompletionScreen 
            key="completion"
            selectedInterests={selectedInterests}
            onComplete={handleComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}