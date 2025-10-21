'use client';

import { motion } from 'framer-motion';
import { Sparkles, Rocket, TrendingUp } from 'lucide-react';
import Image from 'next/image';

interface CompletionScreenProps {
  selectedInterests: string[];
  onComplete: () => void;
}

export function CompletionScreen({ selectedInterests, onComplete }: CompletionScreenProps) {
  const containerVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      }
    },
  };

  const itemVariants = {
    initial: {
      opacity: 0,
      y: 30,
      scale: 0.8
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 200,
        damping: 20,
      }
    },
  };


  return (
    <div className="relative w-full h-dvh bg-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white" />

      {/* Main content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-8 text-center text-black max-w-md mx-auto">
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="space-y-8 max-w-md"
        >
          {/* Logo */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center mb-6"
          >
            <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-sm">
              <Image 
                src="/logo.png" 
                alt="IdeaRoulette Logo" 
                width={80} 
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Title */}
          <motion.div variants={itemVariants} className="space-y-3">
            <h1 className="text-3xl font-bold">
              You&apos;re all set!
            </h1>
            <p className="text-lg text-gray-600">
              Your personalized idea feed is ready
            </p>
          </motion.div>

          {/* Selected Interests */}
          <motion.div variants={itemVariants} className="space-y-3">
            <p className="text-gray-600 text-sm">
              You&apos;ll see ideas from:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {selectedInterests.slice(0, 4).map((interest, index) => (
                <motion.div
                  key={interest}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {interest.split(' / ')[0]}
                  </span>
                </motion.div>
              ))}
              {selectedInterests.length > 4 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    +{selectedInterests.length - 4} more
                  </span>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Features preview */}
          <motion.div variants={itemVariants} className="space-y-3 my-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-left">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-3 h-3 text-gray-600" />
                </div>
                <span className="text-sm text-gray-700">Smart recommendations based on your likes</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3 h-3 text-gray-600" />
                </div>
                <span className="text-sm text-gray-700">Discover your founder personality</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Rocket className="w-3 h-3 text-gray-600" />
                </div>
                <span className="text-sm text-gray-700">Unlimited AI-generated ideas</span>
              </div>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            variants={itemVariants}
            className="pt-4"
          >
            <button
              onClick={onComplete}
              className="w-full bg-black text-white py-4 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors duration-200"
            >
              Start Exploring Ideas
            </button>
          </motion.div>
        </motion.div>
      </div>

    </div>
  );
}