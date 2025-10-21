'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
}

interface AnimatedHeartsProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export function AnimatedHearts({ isVisible, onComplete }: AnimatedHeartsProps) {
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);

  useEffect(() => {
    if (isVisible) {
      // Generate 5-8 hearts at random positions
      const newHearts: FloatingHeart[] = [];
      const heartCount = Math.floor(Math.random() * 4) + 5; // 5-8 hearts
      
      for (let i = 0; i < heartCount; i++) {
        newHearts.push({
          id: Date.now() + i,
          x: Math.random() * 100, // Random X position (0-100%)
          y: Math.random() * 100, // Random Y position (0-100%)
        });
      }
      
      setHearts(newHearts);
      
      // Clear hearts after animation
      const timer = setTimeout(() => {
        setHearts([]);
        onComplete?.();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {hearts.map((heart) => (
          <motion.div
            key={heart.id}
            className="absolute"
            style={{
              left: `${heart.x}%`,
              top: `${heart.y}%`,
            }}
            initial={{
              opacity: 0,
              scale: 0,
              rotate: -20,
            }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0, 1.2, 1, 0.8],
              rotate: [0, 10, -10, 0],
              y: [-50, -150, -250],
              x: [0, Math.random() * 40 - 20, Math.random() * 60 - 30],
            }}
            exit={{
              opacity: 0,
              scale: 0,
            }}
            transition={{
              duration: 2,
              ease: [0.25, 0.46, 0.45, 0.94],
              times: [0, 0.2, 0.8, 1],
            }}
          >
            <Heart 
              className="w-8 h-8 text-red-500 fill-current drop-shadow-lg" 
              style={{
                filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))',
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}