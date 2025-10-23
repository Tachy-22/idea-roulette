'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Info, RotateCcw } from 'lucide-react';

export interface ToastData {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
}

interface InlineToastProps {
  toast: ToastData | null;
  onDismiss: () => void;
}

export function InlineToast({ toast, onDismiss }: InlineToastProps) {
  if (!toast) return null;

  const getIcon = () => {
    switch (toast.variant) {
      case 'destructive':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-[80vw] md:max-w-sm w-full mx-4"
      >
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-black shadow-lg">
          <div className="flex items-start gap-3">
            {getIcon()}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm leading-tight">
                {toast.title}
              </div>
              {toast.description && (
                <div className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {toast.description}
                </div>
              )}
            </div>
            <button
              onClick={onDismiss}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}