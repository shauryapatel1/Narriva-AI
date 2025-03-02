import { useEffect, useRef, useState } from 'react';
import { FaPlay, FaPause, FaVolumeMute, FaVolumeUp, FaCog } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface NarratorUIProps {
  isPlaying: boolean;
  isPaused: boolean;
  isMuted: boolean;
  progress: number;
  speechRate: number;
  onPlayPause: () => void;
  onMute: () => void;
  onChangeSpeechRate: (rate: number) => void;
}

const NarratorUI = ({ 
  isPlaying,
  isPaused,
  isMuted,
  progress,
  speechRate,
  onPlayPause,
  onMute,
  onChangeSpeechRate
}: NarratorUIProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animationId, setAnimationId] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [hoverState, setHoverState] = useState<string | null>(null);
  
  // Canvas animation effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match its display size
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    // Wave animation parameters
    const waveCount = 3;
    const waves = Array.from({ length: waveCount }, (_, i) => ({
      frequency: 0.05 + (i * 0.01),
      amplitude: 10 + (i * 5),
      speed: 0.05 + (i * 0.01),
      offset: Math.random() * 100,
      color: i === 0 ? '#ff9124' : i === 1 ? '#ffb156' : '#ffd180',
      opacity: 0.5 - (i * 0.12)
    }));
    
    // Animation function
    let lastTime = 0;
    const animate = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Always draw waves but with different intensities
      const height = canvas.height;
      const width = canvas.width;
      
      waves.forEach((wave) => {
        ctx.beginPath();
        
        // Update wave offset for animation
        wave.offset += wave.speed * deltaTime * 0.1;
        
        // Calculate wave amplitude based on audio playing state
        const adjustedAmplitude = isPlaying && !isPaused 
          ? wave.amplitude + Math.sin(time * 0.001) * 5 // Add pulsing effect when playing
          : isPaused
            ? wave.amplitude * 0.5 + Math.sin(time * 0.0005) * 3 // Gentle pulsing when paused
            : wave.amplitude * 0.3; // Minimal movement when stopped
        
        // Draw wave path
        for (let x = 0; x <= width; x += 5) {
          const y = Math.sin((x * wave.frequency) + wave.offset) * adjustedAmplitude;
          const centerY = height / 2;
          
          if (x === 0) {
            ctx.moveTo(x, centerY + y);
          } else {
            ctx.lineTo(x, centerY + y);
          }
        }
        
        // Complete the wave by closing the path at the bottom
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        
        // Fill wave with gradient
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, wave.color + '10'); // very transparent
        gradient.addColorStop(0.5, wave.color + '60'); // semi-transparent
        gradient.addColorStop(1, wave.color + '10'); // very transparent
        
        ctx.fillStyle = gradient;
        ctx.globalAlpha = wave.opacity * (isPlaying && !isPaused ? 1 : 0.7);
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      
      const id = requestAnimationFrame(animate);
      setAnimationId(prev => {
        if (prev !== null) {
          cancelAnimationFrame(prev);
        }
        return id;
      });
    };
    
    const id = requestAnimationFrame(animate);
    setAnimationId(id);
    
    return () => {
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
      }
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [isPlaying, isPaused, animationId]);
  
  // Close settings when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSettings && !(event.target as Element).closest('.settings-panel')) {
        setShowSettings(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettings]);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative rounded-xl overflow-hidden bg-glass p-4 shadow-glow-soft border border-amber-100 transition-all duration-300"
      style={{
        backgroundImage: 'radial-gradient(circle at 10% 90%, rgba(255, 145, 36, 0.08), transparent 40%), radial-gradient(circle at 90% 10%, rgba(255, 201, 71, 0.08), transparent 40%)'
      }}
    >
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full opacity-70"
      />
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-20 pointer-events-none">
        <div className="absolute top-0 right-0 w-full h-full bg-amber-500 opacity-10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 flex items-center justify-between">
        <motion.div 
          className="flex-1"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <motion.h3 
            className="text-gradient text-lg font-medium"
            animate={{ 
              textShadow: isPlaying && !isPaused 
                ? ['0 0 0px rgba(255, 170, 0, 0)', '0 0 8px rgba(255, 170, 0, 0.4)', '0 0 0px rgba(255, 170, 0, 0)'] 
                : '0 0 0px rgba(255, 170, 0, 0)'
            }}
            transition={{ 
              duration: 2, 
              repeat: isPlaying && !isPaused ? Infinity : 0,
              ease: "easeInOut" 
            }}
          >
            Story Narration
          </motion.h3>
          <motion.p 
            className="text-slate-600 text-sm"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          >
            {isPlaying && !isPaused 
              ? "Now narrating your story..." 
              : isPaused 
                ? "Narration paused" 
                : progress >= 1 
                  ? "Narration complete" 
                  : "Ready to narrate"}
          </motion.p>
        </motion.div>
        
        <div className="flex items-center space-x-3">
          <motion.button 
            onClick={onMute}
            className={`p-2 rounded-full transition-all duration-300 ${isMuted ? 'bg-slate-100' : 'bg-white hover:bg-amber-50'}`}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setHoverState('mute')}
            onHoverEnd={() => setHoverState(null)}
          >
            {isMuted ? (
              <FaVolumeMute className="text-slate-400" />
            ) : (
              <FaVolumeUp className="text-amber-500" />
            )}
            
            {/* Button tooltip */}
            <AnimatePresence>
              {hoverState === 'mute' && (
                <motion.div 
                  className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md text-xs text-slate-700 whitespace-nowrap"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMuted ? 'Unmute' : 'Mute'}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
          
          <div className="relative settings-panel">
            <motion.button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-full ${showSettings ? 'bg-amber-100' : 'bg-white hover:bg-amber-50'} transition-colors relative`}
              aria-label="Speech rate"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setHoverState('settings')}
              onHoverEnd={() => setHoverState(null)}
            >
              <div className="flex items-center">
                <span className="text-xs mr-1 text-slate-700">{speechRate}x</span>
                <FaCog 
                  className={showSettings ? 'text-amber-500' : 'text-slate-600'} 
                  style={{ 
                    animation: showSettings ? 'spin 4s linear infinite' : 'none' 
                  }} 
                />
              </div>
              
              {/* Button tooltip */}
              <AnimatePresence>
                {hoverState === 'settings' && !showSettings && (
                  <motion.div 
                    className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md text-xs text-slate-700 whitespace-nowrap"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    Narration Speed
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
            
            <AnimatePresence>
              {showSettings && (
                <motion.div 
                  className="absolute right-0 top-full mt-2 bg-white rounded-lg p-3 min-w-[200px] z-20 shadow-lg border border-amber-100 backdrop-blur-sm"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(255, 248, 235, 0.95))'
                  }}
                >
                  <div className="mb-2">
                    <label className="block text-xs text-slate-500 mb-1">Narration Speed</label>
                    <div className="flex items-center justify-between">
                      {[0.75, 1, 1.25, 1.5, 2].map(rate => (
                        <motion.button 
                          key={rate}
                          onClick={() => onChangeSpeechRate(rate)} 
                          className={`px-2 py-1 text-xs rounded ${speechRate === rate ? 'bg-amber-500 text-white' : 'bg-amber-50 text-slate-700'}`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: 0.05 * ([0.75, 1, 1.25, 1.5, 2].indexOf(rate)) }}
                        >
                          {rate}x
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <motion.button 
            onClick={onPlayPause}
            className={`p-3 rounded-full ${
              isPlaying && !isPaused 
                ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/20' 
                : 'bg-white hover:bg-amber-50 border border-amber-100'
            } transition-all duration-300 relative`}
            aria-label={isPlaying && !isPaused ? 'Pause' : 'Play'}
            disabled={progress >= 1 && !isPlaying}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={
              isPlaying && !isPaused 
                ? { boxShadow: ['0 4px 6px -1px rgba(255, 170, 0, 0.1)', '0 4px 12px -1px rgba(255, 170, 0, 0.3)', '0 4px 6px -1px rgba(255, 170, 0, 0.1)'] } 
                : {}
            }
            transition={
              isPlaying && !isPaused 
                ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                : {}
            }
            onHoverStart={() => setHoverState('play')}
            onHoverEnd={() => setHoverState(null)}
          >
            {isPlaying && !isPaused 
              ? <FaPause className="text-white" /> 
              : <FaPlay className={progress >= 1 && !isPlaying ? 'text-slate-300' : 'text-amber-500'} />}
            
            {/* Button tooltip */}
            <AnimatePresence>
              {hoverState === 'play' && (
                <motion.div 
                  className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md text-xs text-slate-700 whitespace-nowrap"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  {isPlaying && !isPaused ? 'Pause' : 'Play'}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Ripple effect when playing */}
            {isPlaying && !isPaused && (
              <motion.div 
                className="absolute inset-0 rounded-full pointer-events-none"
                initial={{ scale: 1, opacity: 0.3 }}
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0, 0.3]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  background: 'radial-gradient(circle, rgba(255, 170, 0, 0.3) 0%, rgba(255, 170, 0, 0) 70%)'
                }}
              />
            )}
          </motion.button>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 relative"
          style={{ width: `${progress * 100}%` }}
          animate={{ 
            width: `${progress * 100}%`,
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{ 
            width: { duration: 0.3 },
            backgroundPosition: { duration: 5, repeat: Infinity, ease: "linear" }
          }}
        >
          {/* Animated sparkle on leading edge of progress bar */}
          {isPlaying && !isPaused && progress < 1 && (
            <motion.div
              className="absolute right-0 top-1/2 w-2 h-2 rounded-full bg-white"
              animate={{
                boxShadow: [
                  '0 0 3px 1px rgba(255, 255, 255, 0.5)',
                  '0 0 5px 2px rgba(255, 255, 255, 0.7)',
                  '0 0 3px 1px rgba(255, 255, 255, 0.5)'
                ],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

// Add keyframe animation for spin
const spinKeyframes = `
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
`;

// Add style element to document head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.innerHTML = spinKeyframes;
  document.head.appendChild(styleElement);
}

export default NarratorUI; 