'use client';

import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, Zap } from 'lucide-react';
import Image from 'next/image';

interface WelcomeScreenProps {
  onNext: () => void;
}

export function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      }
    },
  };

  const itemVariants = {
    initial: {
      opacity: 0,
      y: 50,
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
    <div className="relative w-full h-screen bg-white overflow-hidden">
      {/* Minimal background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white" />

      {/* Main content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-8 text-center text-black max-w-md mx-auto">
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="flex flex-col gap-6"
        >
          {/* Logo */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center mb-8"
          >
            <div className="w-[4rem] h-[4rem] rounded-2xl overflow-hidden shadow-sm">
              <Image
                src="/logo.png"
                alt="IdeaRoulette Logo"
                width={1024}
                height={1024}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Title */}
          <motion.div variants={itemVariants} className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight">
              Idea<span className="text-red-500">Roulette</span>
            </h1>
            <p className="text-lg text-gray-600">
              Swipe startup ideas like TikToks
            </p>
          </motion.div>

          {/* Features */}
          <motion.div variants={itemVariants} className="space-y-4 my-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-left">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-3 h-3 text-gray-600" />
                </div>
                <span className="text-gray-700">AI-powered endless ideas</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-3 h-3 text-gray-600" />
                </div>
                <span className="text-gray-700">Personalized recommendations</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Zap className="w-3 h-3 text-gray-600" />
                </div>
                <span className="text-gray-700">Discover your founder persona</span>
              </div>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            variants={itemVariants}
            className="pt-6 flex flex-col gap-4"
          >
            <button
              onClick={onNext}
              className="w-full bg-black text-white py-4 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors duration-200"
            >
              Get Started
            </button>
            <p className="text-gray-500 text-sm pt-6">
              Takes less than 30 seconds
            </p>
          </motion.div>
        </motion.div>
      </div>

    </div>
  );
}