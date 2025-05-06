'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const Logo: React.FC = () => {
  const pathVariants = {
    hidden: { 
      opacity: 0,
      pathLength: 0
    },
    visible: { 
      opacity: 1,
      pathLength: 1,
      transition: { 
        duration: 2,
        ease: "easeInOut",
      }
    }
  };

  const circleVariants = {
    hidden: { 
      scale: 0,
      opacity: 0
    },
    visible: { 
      scale: 1,
      opacity: 1,
      transition: { 
        delay: 0.5,
        duration: 1.5,
        ease: [0, 0.71, 0.2, 1.01]
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="absolute top-5 left-5 z-30"
    >
      <svg width="40" height="40" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Animated background circle */}
        <motion.circle 
          cx="25" 
          cy="25" 
          r="24" 
          initial="hidden"
          animate="visible"
          variants={circleVariants}
          fill="rgba(80, 70, 230, 0.2)" 
        />
        
        {/* Animated waveform paths */}
        <motion.path 
          d="M10 25C10 25 15 15 25 15C35 15 40 25 40 25" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round"
          initial="hidden"
          animate="visible"
          variants={pathVariants}
        />
        <motion.path 
          d="M10 25C10 25 15 35 25 35C35 35 40 25 40 25" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round"
          initial="hidden"
          animate="visible"
          variants={pathVariants}
          transition={{ delay: 0.5 }}
        />
        <motion.path 
          d="M22 25H28" 
          stroke="white" 
          strokeWidth="2.5" 
          strokeLinecap="round"
          initial="hidden"
          animate="visible"
          variants={pathVariants}
          transition={{ delay: 1 }}
        />
      </svg>
      <motion.span 
        className="ml-2 font-bold text-white"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        AlvanPVT
      </motion.span>
    </motion.div>
  );
};

export default Logo; 