'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Heart, RotateCcw, Share } from 'lucide-react';
import * as Icons from 'lucide-react';
import { 
  getLikedIdeas, 
  getFounderPersonality, 
  getUserPreferences, 
  getSwipeCount,
  getUserInterests,
  clearAllData 
} from '@/lib/storage';
import { StartupIdea } from '@/lib/gemini';
import { useState, useEffect, SetStateAction } from 'react';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  onIdeaSelect?: (idea: StartupIdea) => void;
}

export function UserProfile({ isOpen, onClose, onIdeaSelect }: UserProfileProps) {
  const [likedIdeas, setLikedIdeas] = useState<StartupIdea[]>([]);
  const [personality, setPersonality] = useState<string>('');
  const [, setPreferences] = useState<Record<string, unknown> | null>(null);
  const [swipeCount, setSwipeCount] = useState(0);
  const [interests, setInterests] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setLikedIdeas(getLikedIdeas());
      setPersonality(getFounderPersonality());
      setPreferences(getUserPreferences() as  unknown as SetStateAction<Record<string, unknown> | null>);
      setSwipeCount(getSwipeCount());
      setInterests(getUserInterests());
    }
  }, [isOpen]);

  const getPersonalityConfig = () => {
    const configs: Record<string, { 
      icon: string; 
      color: string; 
      bgColor: string;
    }> = {
      '🚀 Tech Visionary': {
        icon: 'brain',
        color: 'bg-red-500',
        bgColor: 'bg-red-500/20'
      },
      '👥 Community Builder': {
        icon: 'users',
        color: 'bg-red-500',
        bgColor: 'bg-red-500/20'
      },
      '🤖 AI Pioneer': {
        icon: 'brain',
        color: 'bg-red-500',
        bgColor: 'bg-red-500/20'
      },
      '💡 Idea Collector': {
        icon: 'lightbulb',
        color: 'bg-red-500',
        bgColor: 'bg-red-500/20'
      },
      '🎡 Roulette Master': {
        icon: 'trending-up',
        color: 'bg-red-500',
        bgColor: 'bg-red-500/20'
      },
      '🌟 Emerging Founder': {
        icon: 'star',
        color: 'bg-red-500',
        bgColor: 'bg-red-500/20'
      }
    };
    return configs[personality] || configs['🌟 Emerging Founder'];
  };

  const config = getPersonalityConfig();
  const IconComponent = Icons[config.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;

  const containerVariants = {
    initial: { x: '100%' },
    animate: { 
      x: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30,
      }
    },
    exit: { 
      x: '100%',
      transition: {
        duration: 0.3,
      }
    },
  };

  const itemVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 200,
        damping: 20,
      }
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Profile Panel */}
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed right-0 top-0 h-full w-full max-w-md bg-black z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="absolute top-0 right-0 p-6 border-b border-white/10 z-[999]">
              <motion.button
                variants={itemVariants}
                initial="initial"
                animate="animate"
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
{/* 
              <motion.div
                variants={itemVariants}
                initial="initial"
                animate="animate"
                className="text-white"
              >
                <h2 className="text-2xl font-bold mb-2">Your Profile</h2>
                <p className="text-white/70">Track your startup journey</p>
              </motion.div> */}
            </div>

            <ScrollArea className="h-[calc(100%)] ">
              <div className="p-6 space-y-8">
                {/* Personality Section */}
                <motion.div
                  variants={itemVariants}
                  initial="initial"
                  animate="animate"
                  className={`p-6 rounded-2xl ${config.bgColor} border border-white/10`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl ${config.color} flex items-center justify-center`}>
                      {IconComponent && <IconComponent className="w-6 h-6 text-white" />}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{personality}</h3>
                      <p className="text-white/70 text-sm">Your founder type</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{likedIdeas.length}</div>
                      <div className="text-xs text-white/70">Ideas Liked</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{swipeCount}</div>
                      <div className="text-xs text-white/70">Ideas Swiped</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{interests.length}</div>
                      <div className="text-xs text-white/70">Interests</div>
                    </div>
                  </div>
                </motion.div>

                {/* Interests */}
                {interests.length > 0 && (
                  <motion.div
                    variants={itemVariants}
                    initial="initial"
                    animate="animate"
                    className="space-y-4"
                  >
                    <h3 className="text-white font-bold text-lg">Your Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {interests.map((interest) => (
                        <Badge 
                          key={interest}
                          variant="secondary" 
                          className="bg-white/10 text-white border-white/30 backdrop-blur-sm"
                        >
                          {interest.split(' / ')[0]}
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Liked Ideas */}
                <motion.div
                  variants={itemVariants}
                  initial="initial"
                  animate="animate"
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-bold text-lg">Liked Ideas</h3>
                    <Badge variant="outline" className="bg-white/10 text-white border-white/30">
                      {likedIdeas.length}
                    </Badge>
                  </div>

                  {likedIdeas.length === 0 ? (
                    <div className="text-center py-8">
                      <Heart className="w-12 h-12 text-white/30 mx-auto mb-4" />
                      <p className="text-white/70">No liked ideas yet</p>
                      <p className="text-white/50 text-sm mt-2">Start swiping to build your collection!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {likedIdeas.map((idea) => {
                        const IdeaIcon = Icons[idea.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
                        
                        return (
                          <motion.button
                            key={idea.name}
                            onClick={() => onIdeaSelect?.(idea)}
                            className="w-full p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-colors text-left group"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center flex-shrink-0">
                                {IdeaIcon && <IdeaIcon className="w-5 h-5 text-white" />}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-white font-semibold truncate">{idea.name}</h4>
                                  <Badge variant="outline" className="bg-white/10 text-white border-white/30 text-xs">
                                    {idea.rating}
                                  </Badge>
                                </div>
                                
                                <p className="text-white/70 text-sm line-clamp-2 mb-2">
                                  {idea.tagline}
                                </p>
                                
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="bg-white/10 text-white border-white/30 text-xs">
                                    {idea.category}
                                  </Badge>
                                </div>
                              </div>

                              <div className="flex flex-col gap-1">
                                <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                                  <Share className="w-4 h-4 text-white" />
                                </button>
                                <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                                  <RotateCcw className="w-4 h-4 text-white" />
                                </button>
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                </motion.div>

                {/* Clear Data Button */}
                <motion.div
                  variants={itemVariants}
                  initial="initial"
                  animate="animate"
                  className="pt-4 border-t border-white/10"
                >
                  <Button
                    onClick={() => {
                      if (confirm('Are you sure you want to clear all your data? This cannot be undone.')) {
                        clearAllData();
                        onClose();
                        window.location.reload();
                      }
                    }}
                    variant="destructive"
                    className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                  >
                    Clear All Data
                  </Button>
                </motion.div>
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}