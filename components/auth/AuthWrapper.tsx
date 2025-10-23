'use client';

import { useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { initializeFirebaseUser } from '@/lib/firebase-storage';
import { Loader2, LogIn } from 'lucide-react';
import Image from 'next/image';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          await initializeFirebaseUser(user);
        } catch (error) {
          console.error('Error initializing user:', error);
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in:', error);
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-dvh bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full h-dvh bg-black flex flex-col items-center justify-center px-8">
        <div className="max-w-sm mx-auto text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg">
              <Image 
                src="/logo.png" 
                alt="IdeaRoulette Logo" 
                width={96} 
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white">
              IdeaRoulette
            </h1>
            <p className="text-xl text-gray-300">
              Swipe startup ideas like TikToks
            </p>
            <p className="text-gray-400 text-sm">
              Discover, like, and remix AI-generated startup ideas tailored to your interests
            </p>
          </div>

          {/* Sign In Button */}
          <button
            onClick={handleSignIn}
            disabled={signingIn}
            className="w-full bg-white text-black py-4 px-6 rounded-xl font-medium hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {signingIn ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            {signingIn ? 'Signing in...' : 'Continue with Google'}
          </button>

          {/* Footer */}
          <p className="text-xs text-gray-500">
            By continuing, you agree to our terms and privacy policy
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}