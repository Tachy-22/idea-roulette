'use client';

import { motion } from 'framer-motion';
import { Heart, RotateCcw, Share, Expand, Loader2 } from 'lucide-react';

interface IdeaActionsProps {
  onLike: () => void;
  onRemix: () => void;
  onShare: () => void;
  onExpand: () => void;
  isLiked: boolean;
  isActive: boolean;
  isRemixing?: boolean;
}

export function IdeaActions({
  onLike,
  onRemix,
  onShare,
  onExpand,
  isLiked,
  isActive,
  isRemixing = false,
}: IdeaActionsProps) {
  const buttonVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0,
      x: 100,
    },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        delay: 0.9 + (i * 0.1),
        type: 'spring' as const,
        stiffness: 200,
        damping: 20,
      },
    }),
    hover: { 
      scale: 1.1,
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    },
  };


  return (
    <>
      {/* Right Column Actions (True TikTok style) */}
      <div className="fixed right-4 bottom-32 z-20 flex flex-col gap-6">
        {/* Like Button */}
        <motion.div
          custom={0}
          variants={buttonVariants}
          initial="hidden"
          animate={isActive ? "visible" : "hidden"}
          whileHover="hover"
          whileTap="tap"
          className="flex flex-col items-center"
        >
          <button
            className={`w-12 h-12 rounded-full border-2 ${
              isLiked 
                ? 'bg-red-500 border-red-500 text-white' 
                : 'bg-black/20 border-white/40 text-white backdrop-blur-sm'
            } flex items-center justify-center transition-all duration-200`}
            onClick={onLike}
          >
            <Heart 
              className={`w-6 h-6 ${isLiked ? 'fill-current ' : ''}`}
            />
          </button>
          <span className="sr-only">
            {isLiked ? 'Liked' : 'Like'}
          </span>
        </motion.div>

        {/* Remix Button */}
        <motion.div
          custom={1}
          variants={buttonVariants}
          initial="hidden"
          animate={isActive ? "visible" : "hidden"}
          whileHover="hover"
          whileTap="tap"
          className="flex flex-col items-center "
        >
          <button
            className={`w-12 h-12 rounded-full border-2 text-white backdrop-blur-sm flex items-center justify-center transition-all duration-200 ${
              isRemixing 
                ? 'bg-orange-500/50 border-orange-500/60 cursor-wait' 
                : 'bg-black/20 border-white/40 hover:bg-white/10'
            }`}
            onClick={onRemix}
            disabled={isRemixing}
          >
            {isRemixing ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <RotateCcw className="w-6 h-6" />
            )}
          </button>
          <span className="sr-only">
            {isRemixing ? 'Generating remixes...' : 'Remix'}
          </span>
        </motion.div>

        {/* Share Button */}
        <motion.div
          custom={2}
          variants={buttonVariants}
          initial="hidden"
          animate={isActive ? "visible" : "hidden"}
          whileHover="hover"
          whileTap="tap"
          className="flex flex-col items-center"
        >
          <button
            className="w-12 h-12 rounded-full bg-black/20 border-2 border-white/40 text-white backdrop-blur-sm flex items-center justify-center transition-all duration-200"
            onClick={onShare}
          >
            <Share className="w-5 h-5" />
          </button>
          <span className="sr-only">
            Share
          </span>
        </motion.div>

        {/* Expand Button */}
        <motion.div
          custom={3}
          variants={buttonVariants}
          initial="hidden"
          animate={isActive ? "visible" : "hidden"}
          whileHover="hover"
          whileTap="tap"
          className="flex flex-col items-center"
        >
          <button
            className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/60 text-white backdrop-blur-sm flex items-center justify-center transition-all duration-200"
            onClick={onExpand}
          >
            <Expand className="w-5 h-5" />
          </button>
          <span className="sr-only">
            Expand
          </span>
        </motion.div>
      </div>
    </>
  );
}