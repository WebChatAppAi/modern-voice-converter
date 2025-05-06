'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Voice model data for demonstration purposes
const voiceModels = [
  { id: 1, name: 'Male Voice 1', description: 'Deep male voice with American accent', color: 'blue' },
  { id: 2, name: 'Female Voice 1', description: 'Soft female voice with British accent', color: 'purple' },
  { id: 3, name: 'Male Voice 2', description: 'Young male voice with Australian accent', color: 'indigo' },
  { id: 4, name: 'Female Voice 2', description: 'Professional female voice with neutral accent', color: 'violet' },
  { id: 5, name: 'Robotic Voice', description: 'AI-generated robotic voice effect', color: 'slate' },
  { id: 6, name: 'Child Voice', description: 'Young child voice with clear pronunciation', color: 'blue' },
];

interface VoiceModelSelectorProps {
  onSelectModel: (modelId: number) => void;
}

const VoiceModelSelector: React.FC<VoiceModelSelectorProps> = ({ onSelectModel }) => {
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredModel, setHoveredModel] = useState<number | null>(null);

  const handleSelectModel = (modelId: number) => {
    setSelectedModel(modelId);
    onSelectModel(modelId);
  };

  const filteredModels = voiceModels.filter(model => 
    model.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    model.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getColorClass = (color: string, isSelected: boolean) => {
    if (isSelected) {
      switch (color) {
        case 'blue': return 'bg-blue-900/30 border-blue-700/50 text-blue-200';
        case 'purple': return 'bg-purple-900/30 border-purple-700/50 text-purple-200';
        case 'indigo': return 'bg-indigo-900/30 border-indigo-700/50 text-indigo-200';
        case 'violet': return 'bg-violet-900/30 border-violet-700/50 text-violet-200';
        case 'slate': return 'bg-slate-800/30 border-slate-700/50 text-slate-200';
        default: return 'bg-gray-800/30 border-gray-700/50 text-gray-200';
      }
    } else {
      return 'border-gray-700 bg-gray-800/30 text-gray-200';
    }
  };

  const getDotColor = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-500';
      case 'purple': return 'bg-purple-500';
      case 'indigo': return 'bg-indigo-500';
      case 'violet': return 'bg-violet-500';
      case 'slate': return 'bg-slate-400';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search voice models..."
            className="w-full bg-gray-800/50 text-white border border-gray-700 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {filteredModels.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            No voice models found matching your search
          </div>
        ) : (
          filteredModels.map(model => (
            <motion.div
              key={model.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                getColorClass(model.color, selectedModel === model.id)
              } ${hoveredModel === model.id ? 'shadow-lg' : ''}`}
              onClick={() => handleSelectModel(model.id)}
              onMouseEnter={() => setHoveredModel(model.id)}
              onMouseLeave={() => setHoveredModel(null)}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2, ease: 'easeOut' }
              }}
              whileTap={{ scale: 0.98 }}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                boxShadow: hoveredModel === model.id 
                  ? '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)' 
                  : '0 0 0 0 rgba(0, 0, 0, 0)'
              }}
              transition={{ 
                duration: 0.2,
                layout: { duration: 0.2 }
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-white">{model.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">{model.description}</p>
                </div>
                {selectedModel === model.id && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="bg-gray-900 ring-2 ring-purple-500 rounded-full p-1 text-purple-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </motion.div>
                )}
              </div>
              <div className="mt-3 flex items-center text-xs text-gray-500">
                <div className={`w-2 h-2 rounded-full mr-2 ${getDotColor(model.color)}`}></div>
                <span>ID: VM-{model.id.toString().padStart(4, '0')}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default VoiceModelSelector; 