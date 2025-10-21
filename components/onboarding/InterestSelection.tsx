'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Brain, Users, Heart, DollarSign, GraduationCap, Smartphone, Zap, Globe, Gamepad2, Music, Camera, Utensils } from 'lucide-react';

interface InterestSelectionProps {
  onNext: (interests: string[]) => void;
  onBack: () => void;
}

const INTEREST_OPTIONS = [
  { id: 'AI / Technology', label: 'AI & Tech', icon: Brain, color: 'from-purple-500 to-blue-500' },
  { id: 'Social / Community', label: 'Social', icon: Users, color: 'from-blue-500 to-cyan-500' },
  { id: 'Health / Wellness', label: 'Health', icon: Heart, color: 'from-green-500 to-emerald-500' },
  { id: 'Fintech / Crypto', label: 'Fintech', icon: DollarSign, color: 'from-yellow-500 to-orange-500' },
  { id: 'Education / Learning', label: 'Education', icon: GraduationCap, color: 'from-indigo-500 to-purple-500' },
  { id: 'Mobile / Apps', label: 'Mobile', icon: Smartphone, color: 'from-pink-500 to-rose-500' },
  { id: 'Energy / Climate', label: 'Climate', icon: Zap, color: 'from-green-400 to-blue-500' },
  { id: 'Travel / Lifestyle', label: 'Travel', icon: Globe, color: 'from-cyan-500 to-blue-500' },
  { id: 'Gaming / Entertainment', label: 'Gaming', icon: Gamepad2, color: 'from-purple-600 to-pink-600' },
  { id: 'Music / Audio', label: 'Music', icon: Music, color: 'from-red-500 to-pink-500' },
  { id: 'Media / Content', label: 'Media', icon: Camera, color: 'from-orange-500 to-red-500' },
  { id: 'Food / Agriculture', label: 'Food', icon: Utensils, color: 'from-green-600 to-yellow-500' },
];

export function InterestSelection({ onNext, onBack }: InterestSelectionProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev =>
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleNext = () => {
    if (selectedInterests.length >= 3) {
      onNext(selectedInterests);
    }
  };

  const containerVariants = {
    initial: { opacity: 0, x: 50 },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    },
    exit: { opacity: 0, x: -50 }
  };

  const itemVariants = {
    initial: {
      opacity: 0,
      scale: 0.8,
      y: 20
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 200,
        damping: 20,
      }
    },
  };

  return (
    <div className="relative w-full h-screen bg-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white" />

      <div className="relative z-10 h-full flex flex-col px-6 py-8 text-black max-w-md mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center mb-8"
        >
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mr-4"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="text-left flex-1">
            <h2 className="text-2xl font-bold text-black">What interests you?</h2>
            <p className="text-gray-600 text-sm mt-1">
              Pick at least 3 to personalize your feed
            </p>
          </div>
        </motion.div>

        {/* Progress indicator */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-600">Progress</span>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
              {selectedInterests.length}/3+
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <motion.div
              className="bg-black h-1.5 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min((selectedInterests.length / 3) * 100, 100)}%`
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>

        {/* Interest Grid */}
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="flex-1 overflow-y-auto"
        >
          <div className="grid grid-cols-2 gap-4 pb-8">
            {INTEREST_OPTIONS.map((interest) => {
              const IconComponent = interest.icon;
              const isSelected = selectedInterests.includes(interest.id);

              return (
                <motion.button
                  key={interest.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleInterest(interest.id)}
                  className={`relative p-4 rounded-xl border transition-all duration-200 ${isSelected
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`w-10 h-10 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-gray-100'} flex items-center justify-center`}>
                      <IconComponent className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <span className={`text-sm font-medium text-center ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                      {interest.label}
                    </span>
                  </div>

                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pt-4"
        >
          <button
            onClick={handleNext}
            disabled={selectedInterests.length < 3}
            className={`w-full py-4 px-6 rounded-xl font-medium transition-all duration-200 ${selectedInterests.length >= 3
              ? 'bg-black text-white hover:bg-gray-800'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
          >
            {selectedInterests.length < 3
              ? `Select ${3 - selectedInterests.length} more`
              : 'Continue'
            }
          </button>
        </motion.div>
      </div>
    </div>
  );
}