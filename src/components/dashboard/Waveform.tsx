'use client';

import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { motion } from 'framer-motion';

interface WaveformProps {
  audioFile: File | null;
  isPlaying: boolean;
  onPlayPause: () => void;
}

const Waveform: React.FC<WaveformProps> = ({ audioFile, isPlaying, onPlayPause }) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Initialize WaveSurfer
  useEffect(() => {
    if (waveformRef.current && !wavesurfer.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#8b5cf6',
        progressColor: '#6d28d9',
        cursorColor: '#fff',
        barWidth: 2,
        barRadius: 3,
        cursorWidth: 1,
        height: 80,
        barGap: 2,
      });

      wavesurfer.current.on('ready', () => {
        setLoading(false);
        if (wavesurfer.current) {
          setDuration(wavesurfer.current.getDuration());
        }
      });

      wavesurfer.current.on('audioprocess', () => {
        if (wavesurfer.current) {
          setCurrentTime(wavesurfer.current.getCurrentTime());
        }
      });
    }

    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
        wavesurfer.current = null;
      }
    };
  }, []);

  // Load audio file when it changes
  useEffect(() => {
    if (audioFile && wavesurfer.current) {
      setLoading(true);
      const objectUrl = URL.createObjectURL(audioFile);
      wavesurfer.current.load(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [audioFile]);

  // Handle play/pause state
  useEffect(() => {
    if (wavesurfer.current) {
      if (isPlaying) {
        wavesurfer.current.play();
      } else {
        wavesurfer.current.pause();
      }
    }
  }, [isPlaying]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-12 h-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
        </div>
      )}
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: audioFile ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm"
      >
        <div ref={waveformRef} className="w-full" />
        
        {audioFile && (
          <div className="flex items-center justify-between mt-2 text-sm text-gray-300">
            <span>{formatTime(currentTime)}</span>
            <motion.button 
              onClick={onPlayPause}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full bg-purple-600 text-white"
            >
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                </svg>
              )}
            </motion.button>
            <span>{formatTime(duration)}</span>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Waveform; 