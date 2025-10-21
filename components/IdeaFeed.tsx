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
  getUserPreferences,
  isPersonalityUnlocked,
  addSeenIdea
} from '@/lib/storage';
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
  const [showPersonality, setShowPersonality] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showExpandModal, setShowExpandModal] = useState(false);
  const [expandedIdea, setExpandedIdea] = useState<StartupIdea | null>(null);
  const [direction, setDirection] = useState<'next' | 'previous'>('next');
  const { toast } = useToast();

  // Preload more ideas when nearing the end
  const loadMoreIdeas = useCallback(async () => {
    if (loading || currentIndex < ideas.length - 3) return;

    setLoading(true);
    try {
      const preferences = getUserPreferences();
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences, count: 30 }),
      });

      if (response.ok) {
        const newIdeas: StartupIdea[] = await response.json();
        setIdeas(prev => [...prev, ...newIdeas]);
      }
    } catch (error) {
      console.error('Failed to load more ideas:', error);
    } finally {
      setLoading(false);
    }
  }, [currentIndex, ideas.length, loading]);

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

  const handleNextIdea = () => {
    if (currentIndex < ideas.length - 1) {
      // Mark current idea as seen
      const currentIdea = ideas[currentIndex];
      if (currentIdea) {
        addSeenIdea(currentIdea.name);
      }

      setDirection('next');
      setCurrentIndex(prev => prev + 1);
      const swipeCount = incrementSwipeCount();

      // Check if personality should be unlocked
      if (swipeCount === 10 && !isPersonalityUnlocked()) {
        setTimeout(() => setShowPersonality(true), 1000);
      }

      loadMoreIdeas();
    }
  };

  const handlePreviousIdea = () => {
    if (currentIndex > 0) {
      setDirection('previous');
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleLike = () => {
    const currentIdea = ideas[currentIndex];
    if (!currentIdea) return;

    const liked = isIdeaLiked(currentIdea.name);

    if (liked) {
      removeLikedIdea(currentIdea.name);
      toast({
        title: "Removed from favorites",
        description: `${currentIdea.name} has been removed from your liked ideas.`,
      });
    } else {
      addLikedIdea(currentIdea);
      toast({
        title: "Added to favorites! ❤️",
        description: `${currentIdea.name} has been added to your liked ideas.`,
      });
    }
  };

  const handleRemix = async () => {
    const currentIdea = ideas[currentIndex];
    if (!currentIdea) return;

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

  // Load initial data with user preferences
  useEffect(() => {
    // Only load more if we have less than 10 ideas, since we start with 30
    if (ideas.length < 10) {
      loadMoreIdeas();
    }
  }, [ideas.length, loadMoreIdeas]);

  if (ideas.length === 0) {
    return (
      <div className="flex items-center justify-center h-dvh">
        <Loader2 className="w-8 h-8 animate-spin" />
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
            isLiked={isIdeaLiked(ideas[currentIndex]?.name || '')}
            direction={direction}
          />
        </AnimatePresence>
      </motion.div>

      {/* Loading indicator */}
      {loading && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30">
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 text-white">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading more ideas...</span>
          </div>
        </div>
      )}

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