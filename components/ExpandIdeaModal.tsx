'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { X, Heart, RotateCcw, Share, Lightbulb, Target, Users, DollarSign, Rocket, TrendingUp } from 'lucide-react';
import * as Icons from 'lucide-react';
import { StartupIdea } from '@/lib/gemini';
import { isIdeaLiked } from '@/lib/storage';

interface ExpandIdeaModalProps {
  idea: StartupIdea | null;
  isOpen: boolean;
  onClose: () => void;
  onLike: () => void;
  onRemix: () => void;
  onShare: () => void;
}

export function ExpandIdeaModal({ 
  idea, 
  isOpen, 
  onClose, 
  onLike, 
  onRemix, 
  onShare 
}: ExpandIdeaModalProps) {
  if (!idea) return null;

  const IconComponent = Icons[idea.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
  const liked = isIdeaLiked(idea.name);

  const getGradientClass = (category: string) => {
    if (category.includes('AI')) return 'from-purple-500 to-pink-500';
    if (category.includes('Social')) return 'from-blue-500 to-cyan-500';
    if (category.includes('Health')) return 'from-green-500 to-emerald-500';
    if (category.includes('Fintech')) return 'from-yellow-500 to-orange-500';
    if (category.includes('Education')) return 'from-indigo-500 to-purple-500';
    return 'from-gray-500 to-slate-500';
  };

  const containerVariants = {
    initial: { 
      opacity: 0,
      scale: 0.8,
      y: 100 
    },
    animate: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.8,
      y: 100,
      transition: {
        duration: 0.3,
      }
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 200,
        damping: 20,
      }
    },
  };

  // Mock detailed sections for the expanded view
  const mockSections = {
    problem: "Current solutions are fragmented and don't address the core user pain points. There's a significant gap in the market for an integrated approach.",
    solution: `${idea.description} This revolutionary approach combines cutting-edge technology with user-centered design to create a seamless experience.`,
    market: "Target market size: $12.5B globally. Growing at 23% annually with increasing demand for innovative solutions in this space.",
    business: "Freemium model with premium features. Revenue streams: subscriptions ($29/month), enterprise sales ($299/month), and API partnerships.",
    competition: "Current competitors include legacy solutions that lack modern features. Our unique approach provides a significant competitive advantage.",
    team: "Looking for co-founder with technical background. Ideal team includes product, engineering, and marketing expertise."
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full max-w-2xl h-[90vh] bg-black rounded-3xl overflow-hidden border border-white/10 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with background */}
              <div className={`relative p-6 bg-gradient-to-br ${getGradientClass(idea.category)} flex-shrink-0`}>
                {/* Close button */}
                <motion.button
                  variants={itemVariants}
                  onClick={onClose}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 text-white hover:bg-white/30 transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </motion.button>

                {/* Header content */}
                <motion.div variants={itemVariants} className="text-white pr-12">
                  <div className="flex items-center gap-4 mb-4">
                    {IconComponent && (
                      <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                    )}
                    <div>
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-2">
                        {idea.category}
                      </Badge>
                      <h1 className="text-3xl font-bold">{idea.name}</h1>
                    </div>
                  </div>
                  
                  <p className="text-xl text-white/90 font-medium mb-4">
                    {idea.tagline}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{idea.rating}</span>
                      <span className="text-white/80">/10 AI Rating</span>
                    </div>
                    <Progress value={idea.rating * 10} className="w-32 h-2" />
                  </div>
                </motion.div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-8">
                  {/* Tags */}
                  <motion.div variants={itemVariants}>
                    <div className="flex flex-wrap gap-2">
                      {idea.tags.map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="outline" 
                          className="bg-white/5 text-white border-white/20"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </motion.div>

                  {/* Detailed Sections */}
                  <div className="space-y-6">
                    <motion.div variants={itemVariants} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-400" />
                        <h3 className="text-white font-bold text-lg">The Problem</h3>
                      </div>
                      <p className="text-white/80 leading-relaxed">{mockSections.problem}</p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Rocket className="w-5 h-5 text-blue-400" />
                        <h3 className="text-white font-bold text-lg">Our Solution</h3>
                      </div>
                      <p className="text-white/80 leading-relaxed">{mockSections.solution}</p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-green-400" />
                        <h3 className="text-white font-bold text-lg">Market Opportunity</h3>
                      </div>
                      <p className="text-white/80 leading-relaxed">{mockSections.market}</p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-yellow-400" />
                        <h3 className="text-white font-bold text-lg">Business Model</h3>
                      </div>
                      <p className="text-white/80 leading-relaxed">{mockSections.business}</p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-purple-400" />
                        <h3 className="text-white font-bold text-lg">Competitive Advantage</h3>
                      </div>
                      <p className="text-white/80 leading-relaxed">{mockSections.competition}</p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-pink-400" />
                        <h3 className="text-white font-bold text-lg">Team & Next Steps</h3>
                      </div>
                      <p className="text-white/80 leading-relaxed">{mockSections.team}</p>
                    </motion.div>
                  </div>

                  {/* Remixes */}
                  {idea.remixes.length > 0 && (
                    <motion.div variants={itemVariants} className="space-y-4">
                      <h3 className="text-white font-bold text-lg">Remix Ideas</h3>
                      <div className="grid gap-3">
                        {idea.remixes.map((remix, index) => (
                          <div 
                            key={index}
                            className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
                          >
                            <p className="text-white/80">{remix}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <motion.div 
                variants={itemVariants}
                className="p-6 border-t border-white/10 bg-black/20 flex-shrink-0"
              >
                <div className="flex justify-center gap-6">
                  <button
                    onClick={onLike}
                    className={`w-12 h-12 rounded-full transition-all duration-200 flex items-center justify-center ${
                      liked
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                  </button>
                  
                  <button
                    onClick={onRemix}
                    className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center justify-center transition-all duration-200"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={onShare}
                    className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center justify-center transition-all duration-200"
                  >
                    <Share className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}