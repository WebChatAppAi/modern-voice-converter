'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ConversionHistoryItem {
  id: string;
  originalFileName: string;
  convertedFileName: string;
  timestamp: Date;
  modelName: string;
  audioUrl: string;
}

interface ConversionHistoryProps {
  history: ConversionHistoryItem[];
  onSelect: (item: ConversionHistoryItem) => void;
}

const ConversionHistory: React.FC<ConversionHistoryProps> = ({ history, onSelect }) => {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <h3 className="text-gray-300 font-medium">No Conversion History</h3>
        <p className="text-gray-500 text-sm mt-1">Your converted voices will appear here.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <AnimatePresence>
        <div className="space-y-2">
          {history.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-800/60 hover:bg-gray-800/90 rounded-lg p-3 cursor-pointer transition-colors"
              onClick={() => onSelect(item)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-purple-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm text-white truncate">{item.convertedFileName}</h4>
                    <span className="text-xs text-gray-400">
                      {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-500 truncate">
                      Original: {item.originalFileName}
                    </p>
                    <span className="text-xs font-medium text-purple-400 bg-purple-400/10 px-2 rounded-full">
                      {item.modelName}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
};

export default ConversionHistory; 