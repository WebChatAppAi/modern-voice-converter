'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import DropZone from './DropZone';
import VoiceModelSelector from './VoiceModelSelector';
import ConversionProgress from './ConversionProgress';
import AudioPlayer from './AudioPlayer';
import ConversionHistory, { ConversionHistoryItem } from './ConversionHistory';

const Dashboard: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedAudioUrl, setConvertedAudioUrl] = useState<string | null>(null);
  const [convertedFileName, setConvertedFileName] = useState('Converted Voice');
  const [isClient, setIsClient] = useState(false);
  const [conversionHistory, setConversionHistory] = useState<ConversionHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const conversionContainerRef = useRef<HTMLDivElement>(null);

  // Set isClient to true after hydration is complete
  useEffect(() => {
    setIsClient(true);
    
    // Load history from localStorage if available
    try {
      const savedHistory = localStorage.getItem('conversionHistory');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        // Convert string timestamps back to Date objects
        const historyWithDates = parsedHistory.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setConversionHistory(historyWithDates);
      }
    } catch (error) {
      console.error('Failed to load conversion history:', error);
    }
  }, []);

  // Save history to localStorage when it changes
  useEffect(() => {
    if (conversionHistory.length > 0 && isClient) {
      try {
        localStorage.setItem('conversionHistory', JSON.stringify(conversionHistory));
      } catch (error) {
        console.error('Failed to save conversion history:', error);
      }
    }
  }, [conversionHistory, isClient]);

  // Clean up any object URLs when the component unmounts
  useEffect(() => {
    return () => {
      if (convertedAudioUrl) {
        URL.revokeObjectURL(convertedAudioUrl);
      }
    };
  }, [convertedAudioUrl]);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setConvertedAudioUrl(null);
  }, []);

  const handleModelSelect = useCallback((modelId: number) => {
    setSelectedModel(modelId);
  }, []);

  const handleConvert = useCallback(() => {
    if (!selectedFile || !selectedModel) return;
    
    setIsConverting(true);
    
    // In a real app, you would send the file to the server, but for now we'll simulate it
    setConvertedFileName(`${selectedFile.name.split('.')[0]} (Converted)`);
    
    // Scroll to conversion container for better visibility
    if (conversionContainerRef.current) {
      conversionContainerRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, [selectedFile, selectedModel]);

  const handleConversionComplete = useCallback(() => {
    setIsConverting(false);
    
    if (!selectedFile || selectedModel === null) return;
    
    // Get the model name for the selected model
    const modelNames = ['Male Voice 1', 'Female Voice 1', 'Male Voice 2', 'Female Voice 2', 'Robotic Voice', 'Child Voice'];
    const modelName = modelNames[selectedModel - 1];
    const newConvertedFileName = `${selectedFile.name.split('.')[0]} (${modelName})`;
    
    setConvertedFileName(newConvertedFileName);
    
    // Create a fake audio URL for demonstration
    // Revoke any previous object URL to prevent memory leaks
    if (convertedAudioUrl) {
      URL.revokeObjectURL(convertedAudioUrl);
    }
    
    const fakeAudioUrl = URL.createObjectURL(selectedFile);
    setConvertedAudioUrl(fakeAudioUrl);
    
    // Add to conversion history
    const newHistoryItem: ConversionHistoryItem = {
      id: Date.now().toString(),
      originalFileName: selectedFile.name,
      convertedFileName: newConvertedFileName,
      timestamp: new Date(),
      modelName: modelName,
      audioUrl: fakeAudioUrl
    };
    
    setConversionHistory(prev => [newHistoryItem, ...prev].slice(0, 10)); // Keep only 10 most recent
  }, [selectedFile, selectedModel, convertedAudioUrl]);

  const handleSelectHistoryItem = useCallback((item: ConversionHistoryItem) => {
    // Set the relevant state to show the selected conversion
    setConvertedAudioUrl(item.audioUrl);
    setConvertedFileName(item.convertedFileName);
  }, []);

  const convertButtonVariants = {
    initial: { 
      scale: 1,
      boxShadow: "0 0 0 0 rgba(124, 58, 237, 0)"
    },
    pulse: {
      scale: [1, 1.03, 1],
      boxShadow: [
        "0 0 0 0 rgba(124, 58, 237, 0)",
        "0 0 0 8px rgba(124, 58, 237, 0.2)",
        "0 0 0 0 rgba(124, 58, 237, 0)"
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "loop" as const
      }
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 0 15px 0 rgba(124, 58, 237, 0.5)"
    },
    tap: {
      scale: 0.95
    },
    disabled: {
      opacity: 0.6,
      scale: 1,
      boxShadow: "0 0 0 0 rgba(124, 58, 237, 0)"
    }
  };

  const canConvert = selectedFile !== null && selectedModel !== null && !isConverting;

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white relative overflow-hidden">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 relative z-10">
        <div className="flex flex-col gap-6 h-full">
          {/* Dashboard Title */}
          <div className="flex justify-between items-center">
            <div>
              <motion.h1
                initial={isClient ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-bold text-white mb-2"
              >
                Voice Converter Dashboard
              </motion.h1>
              <motion.p
                initial={isClient ? { opacity: 0 } : { opacity: 1 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-gray-400"
              >
                Upload your audio, select a voice model, and convert your voice in seconds.
              </motion.p>
            </div>
            
            {/* History Toggle Button */}
            <motion.button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showHistory ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => setShowHistory(!showHistory)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              initial={isClient ? { opacity: 0, x: 20 } : { opacity: 1, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              History
              {conversionHistory.length > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs bg-white text-purple-600 rounded-full">
                  {conversionHistory.length}
                </span>
              )}
            </motion.button>
          </div>
          
          {/* Main Content: Split Screen Layout or History */}
          <AnimatePresence mode="wait">
            {showHistory ? (
              <motion.div 
                key="history"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-gray-800 flex flex-col"
                style={{ minHeight: '420px' }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white">Conversion History</h2>
                  <motion.button
                    className="text-gray-400 hover:text-purple-400 p-1.5 rounded-full hover:bg-gray-800"
                    onClick={() => setShowHistory(false)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>
                <ConversionHistory 
                  history={conversionHistory} 
                  onSelect={handleSelectHistoryItem} 
                />
              </motion.div>
            ) : (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1"
              >
                {/* Left Panel - Upload & Waveform */}
                <motion.div 
                  initial={isClient ? { opacity: 0, x: -20 } : { opacity: 1, x: 0 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-gray-800 flex flex-col"
                  style={{ minHeight: '420px' }}
                >
                  <h2 className="text-xl font-semibold text-white mb-4">Upload Audio</h2>
                  <div className="flex-1">
                    <DropZone onFileSelect={handleFileSelect} />
                  </div>
                </motion.div>
                
                {/* Right Panel - Voice Models & Output */}
                <motion.div 
                  initial={isClient ? { opacity: 0, x: 20 } : { opacity: 1, x: 0 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-gray-800 flex flex-col"
                  style={{ minHeight: '420px' }}
                >
                  <h2 className="text-xl font-semibold text-white mb-4">Voice Models</h2>
                  <div className="flex-1 mb-6">
                    <VoiceModelSelector onSelectModel={handleModelSelect} />
                  </div>
                  
                  {/* Output Section */}
                  <div className="mt-auto">
                    <h2 className="text-xl font-semibold text-white mb-4">Output</h2>
                    <AudioPlayer audioUrl={convertedAudioUrl} title={convertedFileName} />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Convert Button & Progress */}
          <div 
            className="flex flex-col items-center gap-6 relative"
            ref={conversionContainerRef}
          >
            <AnimatePresence mode="wait">
              <motion.button
                key="convert-button"
                className={`px-8 py-3 rounded-full text-white font-medium text-lg ${
                  canConvert 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600' 
                    : 'bg-gray-700 cursor-not-allowed'
                }`}
                onClick={handleConvert}
                disabled={!canConvert || !isClient}
                variants={convertButtonVariants}
                initial="initial"
                animate={canConvert && isClient ? "pulse" : "disabled"}
                whileHover={canConvert ? "hover" : undefined}
                whileTap={canConvert ? "tap" : undefined}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                {isConverting ? 'Converting...' : 'Convert Voice'}
              </motion.button>
            </AnimatePresence>
            
            <ConversionProgress 
              isConverting={isConverting} 
              onComplete={handleConversionComplete} 
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 