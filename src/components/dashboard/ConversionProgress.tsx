'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

interface ConversionProgressProps {
  isConverting: boolean;
  onComplete: () => void;
}

const ConversionProgress: React.FC<ConversionProgressProps> = ({ isConverting, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const confettiTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use a ref for windowSize to prevent unnecessary re-renders
  const windowSizeRef = useRef({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  // Update window size on resize
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      windowSizeRef.current = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    };

    handleResize(); // Initialize with correct values
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle conversion progress
  useEffect(() => {
    // Clear any existing timers when converting state changes
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    if (completionTimeoutRef.current) {
      clearTimeout(completionTimeoutRef.current);
      completionTimeoutRef.current = null;
    }
    
    if (confettiTimeoutRef.current) {
      clearTimeout(confettiTimeoutRef.current);
      confettiTimeoutRef.current = null;
    }
    
    // Reset states when conversion starts
    if (isConverting) {
      setProgress(0);
      setShowCompletionMessage(false);
      setShowConfetti(false);
      
      // Use a deterministic progress increment based on timeouts
      // This creates a more controlled and predictable animation
      progressIntervalRef.current = setInterval(() => {
        setProgress(prev => {
          // Accelerate progress as it gets closer to completion
          const increment = prev < 30 ? 1 : prev < 60 ? 1.5 : prev < 90 ? 2 : 1;
          const newProgress = Math.min(prev + increment, 100);
          
          if (newProgress >= 100) {
            // Clean up interval when we reach 100%
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
            }
            
            // Show completion message briefly
            setShowCompletionMessage(true);
            
            // Show confetti effect
            setShowConfetti(true);
            
            // Set a timeout to clean up and call onComplete
            completionTimeoutRef.current = setTimeout(() => {
              onComplete();
              
              // After a brief delay, hide the completion message
              setTimeout(() => {
                setShowCompletionMessage(false);
              }, 1000);
              
              // Set timeout to remove confetti after animation
              confettiTimeoutRef.current = setTimeout(() => {
                setShowConfetti(false);
              }, 4000);
              
            }, 1000);
            
            return 100;
          }
          
          return newProgress;
        });
      }, 150);
      
      return () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      };
    }
  }, [isConverting, onComplete]);
  
  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (completionTimeoutRef.current) clearTimeout(completionTimeoutRef.current);
      if (confettiTimeoutRef.current) clearTimeout(confettiTimeoutRef.current);
    };
  }, []);
  
  const statusLabels = [
    { threshold: 10, label: 'Analyzing audio file...' },
    { threshold: 30, label: 'Processing voice patterns...' },
    { threshold: 60, label: 'Applying voice model...' },
    { threshold: 85, label: 'Finalizing conversion...' },
    { threshold: 100, label: 'Conversion complete!' },
  ];
  
  const currentStatus = statusLabels.findLast(item => progress >= item.threshold)?.label || 'Preparing...';

  // Calculate confetti dimensions based on the container
  const getConfettiConfig = () => {
    if (!containerRef.current) {
      return {
        width: windowSizeRef.current.width,
        height: windowSizeRef.current.height,
        recycle: false,
        numberOfPieces: 200,
        gravity: 0.15,
      };
    }

    const rect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    return {
      width: rect.width,
      height: viewportHeight - rect.top,
      recycle: false,
      numberOfPieces: 200,
      gravity: 0.15,
      confettiSource: {
        x: rect.width / 2,
        y: 0,
        w: 0,
        h: 0
      },
      initialVelocityY: { min: 0, max: 10 },
      initialVelocityX: { min: -5, max: 5 },
    };
  };

  return (
    <div className="w-full relative" ref={containerRef}>
      <AnimatePresence mode="wait">
        {(isConverting || showCompletionMessage) && (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-800/60 backdrop-blur-sm p-5 rounded-xl border border-gray-700"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-white font-medium">
                {progress < 100 ? 'Converting Voice' : 'Conversion Complete'}
              </h3>
              <span className={`font-medium text-sm ${
                progress === 100 ? 'text-green-400' : 'text-purple-400'
              }`}>
                {Math.round(progress)}%
              </span>
            </div>
            
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-3">
              <motion.div 
                className={`h-full ${
                  progress < 100 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500'
                }`}
                style={{ width: `${progress}%` }}
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            
            <motion.div 
              className="text-sm text-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={currentStatus}
            >
              {currentStatus}
            </motion.div>
            
            {/* Processing indicators */}
            <div className="mt-4 grid grid-cols-5 gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className={`h-1 rounded-full ${
                    progress >= (i + 1) * 20 
                      ? progress === 100 ? 'bg-green-500' : 'bg-purple-500' 
                      : progress >= i * 20 
                        ? 'bg-blue-500' 
                        : 'bg-gray-700'
                  }`}
                  initial={{ scaleX: 0 }}
                  animate={{ 
                    scaleX: progress >= i * 20 ? 1 : 0,
                    backgroundColor: 
                      progress >= (i + 1) * 20 
                        ? progress === 100 ? '#10b981' : '#8b5cf6' 
                        : '#3b82f6'
                  }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Fixed position confetti container for better positioning */}
      <div 
        className="fixed inset-0 pointer-events-none z-50" 
        style={{ 
          display: showConfetti ? 'block' : 'none',
        }}
      >
        {showConfetti && (
          <Confetti
            {...getConfettiConfig()}
          />
        )}
      </div>
    </div>
  );
};

export default ConversionProgress; 