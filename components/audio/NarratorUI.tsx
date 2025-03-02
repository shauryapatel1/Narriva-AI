'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaVolumeUp, FaVolumeMute, FaPause, FaPlay } from 'react-icons/fa';

interface NarratorUIProps {
  isPlaying: boolean;
  isPaused: boolean;
  isMuted: boolean;
  progress: number;
  onPlayPause: () => void;
  onMute: () => void;
}

const NarratorUI: React.FC<NarratorUIProps> = ({
  isPlaying,
  isPaused,
  isMuted,
  progress,
  onPlayPause,
  onMute
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  
  // Animation parameters
  const waveColors = ['rgba(255, 174, 0, 0.5)', 'rgba(255, 122, 0, 0.3)', 'rgba(200, 80, 0, 0.2)'];
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Make canvas responsive
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Wave animation parameters
    let frequency = 0.005;
    let amplitude = isPlaying ? 20 : isPaused ? 8 : 1;
    let time = 0;
    
    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update time
      time += 0.05;
      
      // If not playing or paused, show minimal animation
      if (!isPlaying && !isPaused) {
        amplitude = Math.max(1, amplitude * 0.95); // Gradually decrease amplitude
      } else if (isPaused) {
        amplitude = 8 + Math.sin(time * 0.2) * 3; // Gentle pulsing when paused
      } else {
        // Active speaking - energetic waves
        amplitude = 15 + Math.sin(time * 0.1) * 5;
        frequency = 0.005 + Math.sin(time * 0.1) * 0.002;
      }
      
      // Draw waves
      waveColors.forEach((color, index) => {
        const waveFrequency = frequency * (1 + index * 0.2);
        const waveAmplitude = amplitude * (1 - index * 0.2);
        const yOffset = canvas.height / 2 + index * 5;
        
        ctx.beginPath();
        ctx.moveTo(0, yOffset);
        
        for (let x = 0; x < canvas.width; x++) {
          const y = Math.sin(x * waveFrequency + time + index) * waveAmplitude + yOffset;
          ctx.lineTo(x, y);
        }
        
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        
        ctx.fillStyle = color;
        ctx.fill();
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, isPaused]);
  
  return (
    <AnimatePresence>
      <div className="relative w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="bg-background-dark rounded-2xl p-4 shadow-glow border border-gray-800 overflow-hidden"
        >
          <div className="absolute inset-0 opacity-30">
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center">
              <motion.div 
                className="w-12 h-12 rounded-full bg-gradient-to-r from-accent-red to-accent-amber flex items-center justify-center shadow-glow"
                animate={{
                  scale: isPlaying ? [1, 1.05, 1] : 1,
                  boxShadow: isPlaying 
                    ? '0 0 15px 5px rgba(255, 165, 0, 0.3)' 
                    : '0 0 5px 2px rgba(255, 165, 0, 0.1)'
                }}
                transition={{ 
                  scale: { repeat: Infinity, duration: 2 },
                  boxShadow: { repeat: Infinity, duration: 2 }
                }}
              >
                {isMuted ? (
                  <FaVolumeMute className="text-white text-xl" />
                ) : isPlaying ? (
                  <FaVolumeUp className="text-white text-xl" />
                ) : (
                  <FaPlay className="text-white text-xl" />
                )}
              </motion.div>
              
              <div className="ml-4">
                <h3 className="text-lg font-bold text-gradient">
                  {isPlaying 
                    ? "Narrating..." 
                    : isPaused 
                      ? "Paused" 
                      : "Ready to narrate"}
                </h3>
                <p className="text-sm text-text-secondary">
                  {isPlaying 
                    ? "Listen as the story unfolds" 
                    : isPaused 
                      ? "Tap to continue" 
                      : "Tap play to begin"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={onMute}
                className="p-2 rounded-full bg-ui-dark hover:bg-ui-dark-hover transition-colors"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
              </button>
              
              <button 
                onClick={onPlayPause}
                className="p-2 rounded-full bg-ui-dark hover:bg-ui-dark-hover transition-colors"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <FaPause /> : <FaPlay />}
              </button>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4 h-1 bg-background-dark-secondary rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-accent-red to-accent-amber"
              initial={{ width: `${progress * 100}%` }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NarratorUI; 