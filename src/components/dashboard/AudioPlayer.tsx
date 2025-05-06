'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AudioPlayerProps {
  audioUrl: string | null;
  title: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, title }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [wasPlaying, setWasPlaying] = useState(false);

  useEffect(() => {
    if (audioUrl) {
      setIsLoaded(false);
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
    }
  }, [audioUrl]);

  // Reset audio state when URL changes
  useEffect(() => {
    return () => {
      // Clear state on unmount
      setIsPlaying(false);
      setIsLoaded(false);
    };
  }, []);

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoaded(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Store a promise resolving from the play method to handle autoplay restrictions
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Playback started successfully
            })
            .catch(error => {
              // Auto-play was prevented, handle this gracefully
              setIsPlaying(false);
              console.log('Playback was prevented:', error);
            });
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };

  // Handle window visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden, store playing state and pause if needed
        setWasPlaying(isPlaying);
        if (isPlaying && audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      } else {
        // Tab is visible again, resume if it was playing
        if (wasPlaying && audioRef.current) {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setIsPlaying(true);
              })
              .catch(() => {
                // Playback prevented
              });
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying, wasPlaying]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Audio wave animation
  const barCount = 28;
  const barVariants = {
    playing: (i: number) => ({
      height: [4, 12, 8, 18, 4][i % 5],
      transition: {
        duration: 0.5 + Math.random() * 0.3,
        repeat: Infinity,
        repeatType: 'reverse' as const,
        ease: 'easeInOut',
      },
    }),
    paused: {
      height: 4,
    },
  };

  return (
    <div className="w-full bg-gray-800/50 rounded-xl p-5 backdrop-blur-sm border border-gray-700" style={{ minHeight: '200px' }}>
      {audioUrl ? (
        <>
          <audio 
            ref={audioRef}
            src={audioUrl}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            preload="metadata"
          />
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-white truncate">{title}</h3>
              <p className="text-sm text-gray-400">Converted Audio</p>
            </div>
            <motion.button
              whileHover={isLoaded ? { scale: 1.1 } : {}}
              whileTap={isLoaded ? { scale: 0.95 } : {}}
              onClick={handlePlayPause}
              disabled={!isLoaded}
              className={`flex items-center justify-center w-12 h-12 rounded-full ${
                isLoaded ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-700 cursor-not-allowed'
              } text-white shadow-lg`}
              initial={false}
            >
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                </svg>
              )}
            </motion.button>
          </div>
          
          {/* Audio visualization */}
          <div className="flex items-center justify-center h-12 mb-3 gap-1">
            {Array.from({ length: barCount }).map((_, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={barVariants}
                animate={isPlaying && isLoaded ? 'playing' : 'paused'}
                className="w-1 bg-gradient-to-t from-purple-500 to-blue-500 rounded-full"
                style={{ 
                  opacity: isLoaded ? 0.3 + ((i % 3) * 0.2) : 0.2,
                  minHeight: 4,
                }}
                initial={false}
              />
            ))}
          </div>
          
          {/* Playback controls */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-10">{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                disabled={!isLoaded}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: isLoaded 
                    ? `linear-gradient(to right, #8b5cf6 ${(currentTime / duration) * 100}%, #374151 ${(currentTime / duration) * 100}%)`
                    : undefined
                }}
              />
              <span className="text-xs text-gray-400 w-10 text-right">{formatTime(duration)}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
              </svg>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={handleVolumeChange}
                disabled={!isLoaded}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: isLoaded 
                    ? `linear-gradient(to right, #8b5cf6 ${volume * 100}%, #374151 ${volume * 100}%)`
                    : undefined
                }}
              />
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
              </svg>
            </div>
          </div>
          
          {/* Download button */}
          <div className="mt-6 flex justify-end">
            <motion.a
              href={audioUrl}
              download={`${title.toLowerCase().replace(/\s+/g, '-')}.mp3`}
              whileHover={isLoaded ? { scale: 1.05 } : {}}
              whileTap={isLoaded ? { scale: 0.95 } : {}}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                isLoaded ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
              onClick={(e) => !isLoaded && e.preventDefault()}
              initial={false}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download
            </motion.a>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 mb-4 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No Audio Yet</h3>
          <p className="text-gray-400 text-sm max-w-xs">
            Upload an audio file and select a voice model to create your converted audio
          </p>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer; 