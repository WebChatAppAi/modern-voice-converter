'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.8,
      ease: [0.215, 0.61, 0.355, 1]
    }
  })
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      delay: 0.7, 
      duration: 0.5, 
      ease: [0, 0.71, 0.2, 1.01]
    }
  },
  hover: { 
    scale: 1.05,
    boxShadow: "0 0 20px 0 rgba(80, 70, 230, 0.6)",
    transition: { 
      duration: 0.3, 
      ease: "easeOut" 
    }
  },
  tap: { scale: 0.95 }
};

export const Hero: React.FC = () => {
  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center text-center">
      <div className="max-w-5xl px-6 md:px-10">
        {/* Animated Title */}
        <motion.h1 
          className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl"
          initial="hidden"
          animate="visible"
          custom={0}
          variants={textVariants}
        >
          AlvanPVT Voice Converter
        </motion.h1>
        
        {/* Animated Subtitle */}
        <motion.p 
          className="mb-12 max-w-2xl text-lg text-gray-300 sm:text-xl md:mx-auto"
          initial="hidden"
          animate="visible"
          custom={1}
          variants={textVariants}
        >
          Transform your voice with our state-of-the-art AI technology. Create realistic voice clones with just a few clicks.
        </motion.p>
        
        {/* Animated Button */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={buttonVariants}
        >
          <Link href="/dashboard">
            <motion.button
              className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 font-semibold text-white transition-all"
              whileHover="hover"
              whileTap="tap"
              variants={buttonVariants}
            >
              Start Now
            </motion.button>
          </Link>
        </motion.div>
      </div>
      
      {/* Floating elements */}
      <div className="absolute -left-10 top-1/3 h-24 w-24 rounded-full bg-purple-700/20 blur-xl" />
      <div className="absolute -right-10 bottom-1/3 h-32 w-32 rounded-full bg-blue-700/20 blur-xl" />
    </div>
  );
};

export default Hero; 