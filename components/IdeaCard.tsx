'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';
import { StartupIdea } from '@/lib/gemini';
import { IdeaActions } from './IdeaActions';
import { AnimatedHearts } from './AnimatedHearts';
import { useState, useRef } from 'react';

interface IdeaCardProps {
  idea: StartupIdea;
  isActive: boolean;
  onLike: () => void;
  onRemix: () => void;
  onShare: () => void;
  onExpand: () => void;
  isLiked: boolean;
  direction?: 'next' | 'previous';
}

export function IdeaCard({
  idea,
  isActive,
  onLike,
  onRemix,
  onShare,
  onExpand,
  isLiked,
  direction = 'next'
}: IdeaCardProps) {
  const [showHearts, setShowHearts] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Get the icon component dynamically
  const IconComponent = Icons[idea.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;

  // Helper function to truncate description
  const truncateDescription = (text: string, wordLimit: number = 25) => {
    const words = text.split(' ');
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ');
  };

  const shouldShowSeeMore = idea.description.split(' ').length > 25;

  // Handle double tap for like
  const handleDoubleTap = () => {
    setTapCount(prev => prev + 1);
    
    if (tapTimeout.current) {
      clearTimeout(tapTimeout.current);
    }
    
    tapTimeout.current = setTimeout(() => {
      if (tapCount + 1 >= 2) {
        // Double tap detected - trigger like and hearts
        if (!isLiked) {
          onLike();
        }
        setShowHearts(true);
      }
      setTapCount(0);
    }, 300);
  };

  // Generate gradient based on category
  const getGradientClass = (category: string) => {
    if (category.includes('AI')) return 'from-purple-500 to-pink-500';
    if (category.includes('Social')) return 'from-blue-500 to-cyan-500';
    if (category.includes('Health')) return 'from-green-500 to-emerald-500';
    if (category.includes('Fintech')) return 'from-yellow-500 to-orange-500';
    if (category.includes('Education')) return 'from-indigo-500 to-purple-500';
    return 'from-gray-500 to-slate-500';
  };

  const cardVariants = {
    enter: {
      y: direction === 'next' ? 1000 : -1000, // Next: slide up from bottom, Previous: slide down from top
      opacity: 0,
      scale: 0.8,
    },
    center: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      y: direction === 'next' ? -1000 : 1000, // Next: slide up to top, Previous: slide down to bottom
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.3,
      },
    },
  };

  const backgroundVariants = {
    initial: {
      backgroundPosition: '0% 50%'
    },
    animate: {
      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: 'linear' as const,
      }
    },
  };

  return (
    <motion.div
      className="relative w-full h-dvh flex flex-col"
      variants={cardVariants}
      initial="enter"
      animate={isActive ? "center" : "exit"}
      exit="exit"
      layout
    >
      {/* Full Screen Animated Background */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${getGradientClass(idea.category)}`}
        variants={backgroundVariants}
        initial="initial"
        animate={isActive ? "animate" : "initial"}
        style={{
          backgroundSize: '200% 200%',
        }}
      />

      {/* Animated pattern overlay */}
      <motion.div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/svg%3E")`
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
          transition: { duration: 20, repeat: Infinity, ease: 'linear' as const }
        }}
      />

      {/* TikTok-style content overlay */}
      <div 
        className="relative z-10 h-full flex flex-col justify-between p-4 text-white cursor-pointer"
        style={{
          background: 'linear-gradient(transparent 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.8) 100%)'
        }}
        onClick={handleDoubleTap}
      >
        {/* Top section - subtle category */}
        <motion.div
          className="flex justify-start pt-safe"
          initial={{ opacity: 0, y: -20 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ delay: 0.2 }}
        >
          <Badge variant="secondary" className="bg-black/30 text-white border-none backdrop-blur-sm">
            {idea.category}
          </Badge>
        </motion.div>

        {/* Center content - large icon and title */}
        <motion.div
          className="flex-1 flex flex-col justify-center items-center px-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ delay: 0.3 }}
        >
          {IconComponent && (
            <motion.div
              className="mb-6"
              initial={{ scale: 0, rotate: -180 }}
              animate={isActive ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
              transition={{ delay: 0.4, type: 'spring' as const, stiffness: 200 }}
            >
              <div className="p-6 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                <IconComponent className="w-16 h-16 text-white drop-shadow-lg" />
              </div>
            </motion.div>
          )}

          <motion.h1
            className="text-4xl font-bold text-center mb-3 text-white drop-shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.5 }}
          >
            {idea.name}
          </motion.h1>

          <motion.p
            className="text-xl text-center text-white/90 font-medium drop-shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.6 }}
          >
            {idea.tagline}
          </motion.p>
        </motion.div>

        {/* Bottom section - description and details */}
        <motion.div
          className="pb-safe space-y-4"
          initial={{ opacity: 0, y: 40 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ delay: 0.7 }}
        >
          <div className="text-white/90 leading-relaxed text-lg">
            <div className={`${isDescriptionExpanded ? 'max-h-[calc(100dvh-20rem)] overflow-y-auto' : ''}`}>
              <p>
                {isDescriptionExpanded ? idea.description : truncateDescription(idea.description)}
                {shouldShowSeeMore && !isDescriptionExpanded && '...'}
              </p>
            </div>
            {shouldShowSeeMore && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDescriptionExpanded(!isDescriptionExpanded);
                }}
                className="text-white/70 hover:text-white text-sm mt-1 underline transition-colors block"
              >
                {isDescriptionExpanded ? 'See less' : 'See more'}
              </button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {idea.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="bg-white/10 text-white border-white/30 text-sm">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-2 text-white/80">
              <span className="text-2xl font-bold">{idea.rating}</span>
              <span className="text-sm">/10</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <IdeaActions
        onLike={onLike}
        onRemix={onRemix}
        onShare={onShare}
        onExpand={onExpand}
        isLiked={isLiked}
        isActive={isActive}
      />

      {/* Animated Hearts */}
      <AnimatedHearts 
        isVisible={showHearts && isActive} 
        onComplete={() => setShowHearts(false)}
      />
    </motion.div>
  );
}