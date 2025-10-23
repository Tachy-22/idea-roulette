'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { StartupIdea } from '@/lib/gemini';
import { IdeaCard } from './IdeaCard';
import {
  addLikedIdea,
  removeLikedIdea,
  isIdeaLiked,
  incrementSwipeCount,
  isPersonalityUnlocked,
  addSeenIdea
} from '@/lib/firebase-storage';
import { trackIdeaInteraction } from '@/lib/analytics';
import {
  shouldLoadMoreIdeas,
  loadMoreIdeas,
  initializeUserIdeas
} from '@/lib/idea-manager';
import { PersonalityModal } from './PersonalityModal';
import { UserProfile } from './UserProfile';
import { ExpandIdeaModal } from './ExpandIdeaModal';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User } from 'lucide-react';

interface IdeaFeedProps {
  initialIdeas: StartupIdea[];
}

export function IdeaFeed({ initialIdeas }: IdeaFeedProps) {
  const [ideas, setIdeas] = useState<StartupIdea[]>(initialIdeas);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [showPersonality, setShowPersonality] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showExpandModal, setShowExpandModal] = useState(false);
  const [expandedIdea, setExpandedIdea] = useState<StartupIdea | null>(null);
  const [direction, setDirection] = useState<'next' | 'previous'>('next');
  const { toast } = useToast();

  // Load more ideas when running low
  const handleLoadMoreIdeas = useCallback(async () => {
    if (loading) return;

    // Check if we need more ideas (when 15 or fewer remaining)
    if (!shouldLoadMoreIdeas(currentIndex, ideas.length, 15)) return;

    setLoading(true);
    try {
      console.log(`Loading more ideas... Current: ${currentIndex}/${ideas.length}`);
      
      // Generate and store 15 new ideas
      const newIdeas = await loadMoreIdeas(15);
      
      if (newIdeas.length > 0) {
        setIdeas(prev => [...prev, ...newIdeas]);
        console.log(`Added ${newIdeas.length} new ideas. Total: ${ideas.length + newIdeas.length}`);
      }
    } catch (error) {
      console.error('Failed to load more ideas:', error);
      toast({
        title: "Failed to load more ideas",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentIndex, ideas.length, loading, toast]);

  // Handle swipe gestures
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = 50;
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    if (offset < -threshold || velocity < -500) {
      // Swipe up - next idea (like TikTok)
      handleNextIdea();
    } else if (offset > threshold || velocity > 500) {
      // Swipe down - previous idea (like TikTok)
      handlePreviousIdea();
    }
  };

  const handleNextIdea = async () => {
    if (currentIndex < ideas.length - 1) {
      // Mark current idea as seen with full analytics data
      const currentIdea = ideas[currentIndex];
      if (currentIdea) {
        await addSeenIdea(currentIdea.name, currentIdea.category, currentIdea.rating);
      }

      setDirection('next');
      setCurrentIndex(prev => prev + 1);
      const swipeCount = await incrementSwipeCount();

      // Check if personality should be unlocked
      const personalityUnlocked = await isPersonalityUnlocked();
      if (swipeCount === 10 && !personalityUnlocked) {
        setTimeout(() => setShowPersonality(true), 1000);
      }

      // Check if we need to load more ideas after advancing
      handleLoadMoreIdeas();
    }
  };

  const handlePreviousIdea = () => {
    if (currentIndex > 0) {
      setDirection('previous');
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleLike = async () => {
    const currentIdea = ideas[currentIndex];
    if (!currentIdea) return;

    const liked = await isIdeaLiked(currentIdea.name);

    if (liked) {
      await removeLikedIdea(currentIdea.name);
      toast({
        title: "Removed from favorites",
        description: `${currentIdea.name} has been removed from your liked ideas.`,
      });
    } else {
      await addLikedIdea(currentIdea);
      toast({
        title: "Added to favorites! ❤️",
        description: `${currentIdea.name} has been added to your liked ideas.`,
      });
    }
  };

  const handleRemix = async () => {
    const currentIdea = ideas[currentIndex];
    if (!currentIdea) return;

    // Track analytics for remix action
    try {
      await trackIdeaInteraction(
        currentIdea.name,
        currentIdea.category,
        currentIdea.rating,
        'remix'
      );
      console.log('Successfully tracked remix for:', currentIdea.name);
    } catch (error) {
      console.error('Failed to track remix analytics:', error);
    }

    // Show loading state
    toast({
      title: "🎨 Generating Remixes...",
      description: "Creating new variations of this idea",
    });

    try {
      const response = await fetch('/api/remix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: currentIdea }),
      });

      if (response.ok) {
        const remixData = await response.json();

        // remixData could be just remixes array or full ideas
        if (Array.isArray(remixData) && typeof remixData[0] === 'string') {
          // Just remix titles - update current idea
          const remixes: string[] = remixData;
          toast({
            title: "🎨 Remixed!",
            description: `Generated ${remixes.length} new variations of ${currentIdea.name}`,
          });

          setIdeas(prev => prev.map((idea, index) =>
            index === currentIndex
              ? { ...idea, remixes }
              : idea
          ));
        } else {
          // Full remix ideas - insert after current idea
          const remixIdeas: StartupIdea[] = remixData;
          toast({
            title: "🎨 Remix Ideas Generated!",
            description: `Created ${remixIdeas.length} full remix ideas. Swipe to see them!`,
          });

          setIdeas(prev => {
            const newIdeas = [...prev];
            newIdeas.splice(currentIndex + 1, 0, ...remixIdeas);
            return newIdeas;
          });
        }
      } else {
        throw new Error('Failed to generate remixes');
      }
    } catch (error) {
      console.error('Failed to generate remixes:', error);
      toast({
        title: "Remix failed",
        description: "Couldn't generate remixes. Try again later.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    const currentIdea = ideas[currentIndex];
    if (!currentIdea) return;

    // Track analytics for share action
    try {
      await trackIdeaInteraction(
        currentIdea.name,
        currentIdea.category,
        currentIdea.rating,
        'share'
      );
      console.log('Successfully tracked share for:', currentIdea.name);
    } catch (error) {
      console.error('Failed to track share analytics:', error);
    }

    try {
      const shareText = `🚀 Check out this startup idea: ${currentIdea.name} - ${currentIdea.tagline} \n\nSwipe startup ideas like TikToks on IdeaRoulette!`;

      if (navigator.share) {
        await navigator.share({
          title: `${currentIdea.name} - Startup Idea`,
          text: shareText,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied to clipboard! 📋",
          description: "Share this idea on your favorite platform.",
        });
      }
    } catch (error) {
      console.error('Failed to share:', error);
      toast({
        title: "Share failed",
        description: "Couldn't share the idea. Try again later.",
        variant: "destructive",
      });
    }
  };

  const handleExpand = () => {
    const currentIdea = ideas[currentIndex];
    if (!currentIdea) return;

    setExpandedIdea(currentIdea);
    setShowExpandModal(true);
  };

  const handleProfileIdeaSelect = (idea: StartupIdea) => {
    // Find the idea in the current ideas list or add it
    const existingIndex = ideas.findIndex(i => i.name === idea.name);
    if (existingIndex !== -1) {
      setCurrentIndex(existingIndex);
    } else {
      // Add the idea to the current position and navigate to it
      setIdeas(prev => {
        const newIdeas = [...prev];
        newIdeas.splice(currentIndex + 1, 0, idea);
        return newIdeas;
      });
      setCurrentIndex(currentIndex + 1);
    }
    setShowProfile(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown' || event.key === ' ') {
        event.preventDefault();
        handleNextIdea();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        handlePreviousIdea();
      } else if (event.key === 'l' || event.key === 'L') {
        handleLike();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextIdea, handlePreviousIdea, handleLike]);

  // Initialize ideas when component mounts
  useEffect(() => {
    const initializeIdeas = async () => {
      if (ideas.length === 0) {
        setInitializing(true);
        try {
          console.log('Initializing ideas for new session...');
          const newIdeas = await initializeUserIdeas(30);
          setIdeas(newIdeas);
          console.log(`Initialized with ${newIdeas.length} ideas`);
        } catch (error) {
          console.error('Failed to initialize ideas:', error);
          toast({
            title: "Failed to load ideas",
            description: "Please refresh the page to try again.",
            variant: "destructive",
          });
        } finally {
          setInitializing(false);
        }
      } else {
        setInitializing(false);
      }
    };

    initializeIdeas();
  }, []); // Only run once on mount

  // Check for more ideas when advancing through them
  useEffect(() => {
    if (!initializing && ideas.length > 0) {
      handleLoadMoreIdeas();
    }
  }, [currentIndex, initializing, handleLoadMoreIdeas]);

  if (initializing || ideas.length === 0) {
    return (
      <div className="flex items-center justify-center h-dvh bg-black">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white/70">
            {initializing ? 'Generating your personalized ideas...' : 'Loading ideas...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-dvh overflow-hidden bg-black">
      {/* Profile Button */}
      <div className="fixed top-6 right-6 z-30">
        <motion.button
          onClick={() => setShowProfile(true)}
          className="w-12 h-12 rounded-full bg-black/20 border-2 border-white/40 text-white backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:bg-black/40"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5 }}
        >
          <User className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Main content area for gestures */}
      <motion.div
        className="w-full h-full"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.3}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
      >
        <AnimatePresence mode="wait">
          <IdeaCard
            key={`${ideas[currentIndex]?.name}-${currentIndex}`}
            idea={ideas[currentIndex]}
            isActive={true}
            onLike={handleLike}
            onRemix={handleRemix}
            onShare={handleShare}
            onExpand={handleExpand}
            isLiked={false} // Will be handled internally by the component
            direction={direction}
          />
        </AnimatePresence>
      </motion.div>

      {/* Loading indicator */}
      {/* {loading && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30">
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 text-white">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading more ideas...</span>
          </div>
        </div>
      )} */}

      {/* Swipe hint - TikTok style */}
      {/* <div className="fixed bottom-6 left-4 z-20 text-white/60 text-sm">
        <p className="text-xs">Swipe up for next</p>
      </div> */}

      {/* Modals */}
      <PersonalityModal
        open={showPersonality}
        onOpenChange={setShowPersonality}
      />

      <UserProfile
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        onIdeaSelect={handleProfileIdeaSelect}
      />

      <ExpandIdeaModal
        idea={expandedIdea}
        isOpen={showExpandModal}
        onClose={() => {
          setShowExpandModal(false);
          setExpandedIdea(null);
        }}
        onLike={handleLike}
        onRemix={handleRemix}
        onShare={handleShare}
      />
    </div>
  );
}