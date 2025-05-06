'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import Waveform from './Waveform';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
}

interface AudioSettings {
  pitch: number;
  tempo: number;
  clarity: number;
  noiseReduction: number;
}

const defaultSettings: AudioSettings = {
  pitch: 0,
  tempo: 1,
  clarity: 0.5,
  noiseReduction: 0.3
};

const DropZone: React.FC<DropZoneProps> = ({ onFileSelect }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [settings, setSettings] = useState<AudioSettings>({...defaultSettings});

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a']
    },
    maxFiles: 1,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false)
  });

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const resetSettings = () => {
    setSettings({...defaultSettings});
  };

  const handleSettingChange = (setting: keyof AudioSettings, value: number) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <div className="w-full h-full flex flex-col">
      <motion.div 
        className={`relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 mb-3 transition-all ${
          isDragActive 
            ? 'border-purple-500 bg-purple-500/10' 
            : selectedFile 
              ? 'border-green-500 bg-green-500/5' 
              : 'border-gray-600 hover:border-gray-400 bg-gray-800/20'
        }`}
        {...getRootProps()}
        whileHover={{ scale: 1.01 }}
        animate={{ 
          boxShadow: isDragActive 
            ? '0 0 20px 0 rgba(168, 85, 247, 0.3)' 
            : '0 0 0 0 rgba(0, 0, 0, 0)' 
        }}
        style={{ minHeight: selectedFile ? '100px' : '180px' }}
      >
        <input {...getInputProps()} />
        
        {!selectedFile ? (
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="w-14 h-14 mx-auto mb-3 text-purple-500"
              animate={{ 
                y: isDragActive ? [0, -10, 0] : 0 
              }}
              transition={{ 
                repeat: isDragActive ? Infinity : 0, 
                duration: 1.5 
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15" />
              </svg>
            </motion.div>
            <h3 className="mb-1 text-lg font-medium text-white">Upload Audio File</h3>
            <p className="text-gray-400 text-sm">
              Drag & drop an audio file here, or click to select
            </p>
            <p className="mt-1 text-gray-500 text-xs">
              Supports MP3, WAV, OGG, M4A
            </p>
          </motion.div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-xl z-10">
            <div className="text-center p-4">
              <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center bg-green-500/20 text-green-400 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-white mb-1">{selectedFile.name}</h4>
              <p className="text-gray-400 text-sm mb-3">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
              >
                Change File
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
      
      <div className="mb-3">
        <Waveform 
          audioFile={selectedFile} 
          isPlaying={isPlaying} 
          onPlayPause={handlePlayPause} 
        />
      </div>

      {/* Advanced Settings Section */}
      <motion.div 
        className="w-full mt-1"
        initial={{ height: 'auto' }}
        animate={{ height: 'auto' }}
      >
        <motion.button
          className="w-full flex items-center justify-between px-4 py-2 bg-gray-800/70 hover:bg-gray-800 rounded-lg text-white text-sm font-medium transition-colors"
          onClick={() => setShowAdvanced(!showAdvanced)}
          whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.9)' }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
            </svg>
            ADVANCED
          </span>
          <motion.div
            animate={{ rotate: showAdvanced ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div 
              className="bg-gray-900/70 rounded-b-lg mt-1 p-4 border border-gray-800 space-y-4"
              initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
              animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-white">Audio Processing Settings</h4>
                <motion.button 
                  onClick={resetSettings}
                  className="text-gray-400 hover:text-purple-400 p-1 rounded-full"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                </motion.button>
              </div>

              {/* Pitch Adjustment */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <label className="text-gray-400">Pitch</label>
                  <span className="text-purple-400">{settings.pitch > 0 ? `+${settings.pitch}` : settings.pitch}</span>
                </div>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="1"
                  value={settings.pitch}
                  onChange={(e) => handleSettingChange('pitch', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #8b5cf6 ${((settings.pitch + 12) / 24) * 100}%, #374151 ${((settings.pitch + 12) / 24) * 100}%)`
                  }}
                />
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>Lower</span>
                  <span>Normal</span>
                  <span>Higher</span>
                </div>
              </div>

              {/* Tempo Adjustment */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <label className="text-gray-400">Tempo</label>
                  <span className="text-purple-400">{settings.tempo.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={settings.tempo}
                  onChange={(e) => handleSettingChange('tempo', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #8b5cf6 ${((settings.tempo - 0.5) / 1) * 100}%, #374151 ${((settings.tempo - 0.5) / 1) * 100}%)`
                  }}
                />
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>Slower</span>
                  <span>Normal</span>
                  <span>Faster</span>
                </div>
              </div>

              {/* Clarity */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <label className="text-gray-400">Clarity</label>
                  <span className="text-purple-400">{Math.round(settings.clarity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.clarity}
                  onChange={(e) => handleSettingChange('clarity', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #8b5cf6 ${settings.clarity * 100}%, #374151 ${settings.clarity * 100}%)`
                  }}
                />
              </div>

              {/* Noise Reduction */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <label className="text-gray-400">Noise Reduction</label>
                  <span className="text-purple-400">{Math.round(settings.noiseReduction * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.noiseReduction}
                  onChange={(e) => handleSettingChange('noiseReduction', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #8b5cf6 ${settings.noiseReduction * 100}%, #374151 ${settings.noiseReduction * 100}%)`
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default DropZone; 