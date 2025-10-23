'use client';

import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getFounderPersonality, getUserPreferences, getLikedIdeas } from '@/lib/firebase-storage';
import { Star, TrendingUp, Heart, Brain } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PersonalityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PersonalityModal({ open, onOpenChange }: PersonalityModalProps) {
  const [personality, setPersonality] = useState('🌟 Emerging Founder');
  const [preferences, setPreferences] = useState<{ likedCategories: string[] }>({ likedCategories: [] });
  const [likedIdeas, setLikedIdeas] = useState<unknown[]>([]);

  useEffect(() => {
    if (open) {
      const loadData = async () => {
        const [personalityData, preferencesData, likedData] = await Promise.all([
          getFounderPersonality(),
          getUserPreferences(),
          getLikedIdeas()
        ]);
        
        setPersonality(personalityData);
        setPreferences(preferencesData);
        setLikedIdeas(likedData);
      };
      
      loadData();
    }
  }, [open]);

  const personalityConfig = {
    '🚀 Tech Visionary': {
      icon: Brain,
      color: 'from-purple-500 to-blue-500',
      description: 'You have a keen eye for cutting-edge technology and high-quality innovations.',
      traits: ['Tech-savvy', 'High standards', 'Future-focused']
    },
    '👥 Community Builder': {
      icon: Heart,
      color: 'from-pink-500 to-rose-500',
      description: 'You are drawn to ideas that bring people together and create social impact.',
      traits: ['Social-minded', 'Collaborative', 'People-focused']
    },
    '🤖 AI Pioneer': {
      icon: Brain,
      color: 'from-indigo-500 to-purple-500',
      description: 'You see the potential in artificial intelligence to transform industries.',
      traits: ['AI enthusiast', 'Innovation-driven', 'Tech-forward']
    },
    '💡 Idea Collector': {
      icon: Star,
      color: 'from-yellow-500 to-orange-500',
      description: 'You love exploring diverse concepts and building a rich collection of possibilities.',
      traits: ['Curious', 'Open-minded', 'Eclectic taste']
    },
    '🎡 Roulette Master': {
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      description: 'You are a true idea explorer who has mastered the art of startup discovery.',
      traits: ['Persistent', 'Adventurous', 'Experienced']
    },
    '🌟 Emerging Founder': {
      icon: Star,
      color: 'from-cyan-500 to-blue-500',
      description: 'You are just beginning your journey into the world of startup ideas.',
      traits: ['Curious', 'Learning', 'Growing']
    }
  };

  const config = personalityConfig[personality as keyof typeof personalityConfig] || personalityConfig['🌟 Emerging Founder'];
  const IconComponent = config.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            🎉 Founder Personality Unlocked!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Personality Icon and Title */}
          <motion.div
            className="text-center"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          >
            <div className={`mx-auto w-20 h-20 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center mb-4`}>
              <IconComponent className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{personality}</h3>
          </motion.div>

          {/* Description */}
          <motion.p
            className="text-center text-gray-600 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {config.description}
          </motion.p>

          {/* Traits */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h4 className="font-semibold text-gray-900">Your Founder Traits:</h4>
            <div className="flex flex-wrap gap-2">
              {config.traits.map((trait, index) => (
                <motion.div
                  key={trait}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <Badge variant="secondary" className="text-sm">
                    {trait}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 gap-4 pt-4 border-t"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{likedIdeas.length}</div>
              <div className="text-sm text-gray-600">Ideas Liked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{preferences.likedCategories.length}</div>
              <div className="text-sm text-gray-600">Categories Explored</div>
            </div>
          </motion.div>

          {/* Favorite Categories */}
          {preferences.likedCategories.length > 0 && (
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <h4 className="font-semibold text-gray-900">Favorite Categories:</h4>
              <div className="flex flex-wrap gap-1">
                {preferences.likedCategories.slice(0, 3).map((category, index) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.4 + index * 0.1 }}
                  >
                    <Badge variant="outline" className="text-xs">
                      {category}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Continue Button */}
          <motion.div
            className="pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
          >
            <Button 
              onClick={() => onOpenChange(false)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Continue Exploring Ideas
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}