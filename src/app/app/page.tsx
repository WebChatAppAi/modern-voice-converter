'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AppPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black p-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl rounded-xl bg-gray-800/50 p-8 backdrop-blur-sm"
      >
        <h1 className="mb-6 text-3xl font-bold text-white">Voice Converter App</h1>
        <p className="mb-8 text-gray-300">
          Welcome to the Voice Converter App. You can go to the dashboard to start converting your voice.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard">
            <motion.button
              className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 font-medium text-white transition-all"
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px 0 rgba(80, 70, 230, 0.5)" }}
              whileTap={{ scale: 0.95 }}
            >
              Go to Dashboard
            </motion.button>
          </Link>
          <Link href="/">
            <motion.button
              className="rounded-full bg-gray-700 px-6 py-3 font-medium text-white transition-all hover:bg-gray-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Back to Home
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
} 