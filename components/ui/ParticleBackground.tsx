"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ParticleBackgroundProps {
  className?: string;
  variant?: 'default' | 'grid' | 'data' | 'matrix' | 'nebula';
  density?: 'low' | 'medium' | 'high';
  speed?: 'slow' | 'medium' | 'fast';
  interactive?: boolean;
  glitchEffect?: boolean;
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ 
  className = '',
  variant = 'default',
  density = 'medium',
  speed = 'medium',
  interactive = false,
  glitchEffect = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMouseInCanvas, setIsMouseInCanvas] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Determine particle count based on density
  const getParticleCount = () => {
    if (!isClient) return 0;
    
    const baseDensity = variant === 'data' ? 100 : 
                        variant === 'matrix' ? 150 :
                        variant === 'nebula' ? 80 : 50;
    
    const densityMultiplier = density === 'low' ? 0.5 :
                              density === 'high' ? 2 : 1;
    
    return Math.min(Math.floor(baseDensity * densityMultiplier), window.innerWidth / 10);
  };
  
  // Determine particle speed based on speed prop
  const getParticleSpeed = () => {
    const baseSpeed = speed === 'slow' ? 0.5 :
                      speed === 'fast' ? 2 : 1;
    
    return baseSpeed;
  };
  
  useEffect(() => {
    if (!isClient) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const updateDimensions = () => {
      if (canvas && containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
        setDimensions({ width, height });
      }
    };
    
    updateDimensions();
    
    const handleResize = () => {
      updateDimensions();
    };
    
    window.addEventListener('resize', handleResize);
    
    const particlesArray: Particle[] = [];
    const numberOfParticles = getParticleCount();
    const particleSpeed = getParticleSpeed();
    
    // Mouse interaction handlers
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !interactive) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };
    
    const handleMouseEnter = () => {
      setIsMouseInCanvas(true);
    };
    
    const handleMouseLeave = () => {
      setIsMouseInCanvas(false);
    };
    
    if (interactive) {
      containerRef.current?.addEventListener('mousemove', handleMouseMove);
      containerRef.current?.addEventListener('mouseenter', handleMouseEnter);
      containerRef.current?.addEventListener('mouseleave', handleMouseLeave);
    }
    
    // Matrix effect variables
    let matrixColumns: number[] = [];
    let matrixDrops: number[] = [];
    
    if (variant === 'matrix') {
      const fontSize = 14;
      const columns = Math.floor(canvas.width / fontSize);
      
      matrixColumns = Array.from({ length: columns }, () => 0);
      matrixDrops = Array.from({ length: columns }, () => 1);
    }
    
    // Nebula effect variables
    let nebulaTime = 0;
    let nebulaHue = 0;
    
    // Create a seedable random number generator for deterministic particle positions
    const seededRandom = (function() {
      let seed = 42; // Fixed seed for deterministic results
      return function() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };
    })();
    
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      originalColor: string;
      blinkRate?: number;
      blinkState?: number;
      isDataPoint?: boolean;
      dataValue?: number;
      opacity: number;
      life: number;
      maxLife: number;
      angle: number;
      rotationSpeed: number;
      
      constructor() {
        // Use safe width/height values (window dimensions as fallback)
        const width = canvas ? canvas.width : window.innerWidth;
        const height = canvas ? canvas.height : window.innerHeight;
        
        // Use seededRandom for initial positions to ensure consistency between server and client
        this.x = seededRandom() * width;
        this.y = seededRandom() * height;
        this.size = seededRandom() * 3 + 1;
        this.opacity = seededRandom() * 0.5 + 0.3;
        this.life = 0;
        this.maxLife = seededRandom() * 100 + 50;
        this.angle = seededRandom() * Math.PI * 2;
        this.rotationSpeed = (seededRandom() - 0.5) * 0.02;
        
        if (variant === 'grid') {
          // Grid particles move very slowly or not at all
          this.speedX = seededRandom() * 0.2 - 0.1;
          this.speedY = seededRandom() * 0.2 - 0.1;
          this.size = seededRandom() * 1.5 + 0.5;
        } else if (variant === 'data') {
          // Data particles have varied speeds
          this.speedX = (seededRandom() * 2 - 1) * particleSpeed;
          this.speedY = (seededRandom() * 2 - 1) * particleSpeed;
          this.isDataPoint = seededRandom() > 0.7;
          this.dataValue = seededRandom();
          this.blinkRate = seededRandom() * 0.1;
          this.blinkState = seededRandom();
        } else if (variant === 'matrix') {
          // Matrix particles fall downward
          this.speedX = 0;
          this.speedY = (seededRandom() * 1 + 0.5) * particleSpeed;
          this.size = 1;
          this.opacity = seededRandom() * 0.8 + 0.2;
        } else if (variant === 'nebula') {
          // Nebula particles move in a circular pattern
          this.speedX = (seededRandom() * 1 - 0.5) * particleSpeed;
          this.speedY = (seededRandom() * 1 - 0.5) * particleSpeed;
          this.size = seededRandom() * 4 + 1;
          this.opacity = seededRandom() * 0.7 + 0.3;
        } else {
          // Default particles
          this.speedX = (seededRandom() * 1 - 0.5) * particleSpeed;
          this.speedY = (seededRandom() * 1 - 0.5) * particleSpeed;
        }
        
        // Color palette based on variant
        let colors;
        if (variant === 'grid') {
          // Cyan/blue grid
          colors = [
            'rgba(0, 255, 255, 0.3)', // Cyan
            'rgba(0, 191, 255, 0.3)', // Deep sky blue
            'rgba(30, 144, 255, 0.2)', // Dodger blue
            'rgba(65, 105, 225, 0.2)', // Royal blue
          ];
        } else if (variant === 'data') {
          // Data visualization colors
          colors = [
            'rgba(0, 255, 255, 0.5)', // Cyan
            'rgba(255, 0, 255, 0.4)', // Magenta
            'rgba(255, 255, 0, 0.3)', // Yellow
            'rgba(0, 255, 0, 0.4)',   // Green
            'rgba(255, 165, 0, 0.4)',  // Orange
          ];
        } else if (variant === 'matrix') {
          // Matrix green
          colors = [
            'rgba(0, 255, 70, 0.8)', // Bright green
            'rgba(0, 200, 70, 0.7)', // Medium green
            'rgba(0, 180, 70, 0.6)', // Darker green
          ];
        } else if (variant === 'nebula') {
          // Nebula colors - cosmic palette
          colors = [
            'rgba(138, 43, 226, 0.6)', // BlueViolet
            'rgba(75, 0, 130, 0.6)',   // Indigo
            'rgba(123, 104, 238, 0.6)', // MediumSlateBlue
            'rgba(148, 0, 211, 0.6)',  // DarkViolet
            'rgba(186, 85, 211, 0.6)',  // MediumOrchid
          ];
        } else {
          // Default purple-red gradient
          colors = [
            'rgba(217, 70, 239, 0.5)', // Purple
            'rgba(236, 72, 153, 0.5)', // Pink
            'rgba(248, 113, 113, 0.5)', // Red
            'rgba(239, 68, 68, 0.5)',  // Red
            'rgba(217, 70, 239, 0.3)', // Light purple
          ];
        }
        
        this.color = colors[Math.floor(seededRandom() * colors.length)];
        this.originalColor = this.color;
      }
      
      update() {
        if (!canvas) return;
        
        this.x += this.speedX;
        this.y += this.speedY;
        this.angle += this.rotationSpeed;
        this.life++;
        
        // Interactive behavior - particles react to mouse
        if (interactive && isMouseInCanvas) {
          const dx = this.x - mousePosition.x;
          const dy = this.y - mousePosition.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = 150;
          
          if (distance < maxDistance) {
            const force = (maxDistance - distance) / maxDistance;
            
            if (variant === 'nebula') {
              // Swirl around mouse
              const angle = Math.atan2(dy, dx);
              this.speedX += Math.cos(angle + Math.PI/2) * force * 0.2;
              this.speedY += Math.sin(angle + Math.PI/2) * force * 0.2;
            } else {
              // Push away from mouse
              this.speedX += dx * force * 0.01;
              this.speedY += dy * force * 0.01;
            }
          }
        }
        
        // Data particles can blink
        if (variant === 'data' && this.isDataPoint && this.blinkRate) {
          this.blinkState = (this.blinkState || 0) + this.blinkRate;
          const blinkValue = Math.sin(this.blinkState);
          this.opacity = 0.3 + blinkValue * 0.5;
        }
        
        // Boundary checks
        if (this.x < 0) {
          this.x = canvas.width;
        } else if (this.x > canvas.width) {
          this.x = 0;
        }
        
        if (this.y < 0) {
          this.y = canvas.height;
        } else if (this.y > canvas.height) {
          this.y = 0;
        }
        
        // Draw the particle
        if (ctx) {
          // Special drawing for different variants
          if (variant === 'grid') {
            // Grid particles are simple dots
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
          } else if (variant === 'data') {
            // Data particles can be dots or squares
            if (this.isDataPoint) {
              // Data points are squares
              ctx.save();
              ctx.translate(this.x, this.y);
              ctx.rotate(this.angle);
              ctx.fillStyle = this.color;
              ctx.globalAlpha = this.opacity;
              ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);
              ctx.restore();
              
              // Add a data value indicator
              if (this.dataValue !== undefined) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2 * this.dataValue);
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 0.5;
                ctx.stroke();
              }
            } else {
              // Regular particles are circles
              ctx.beginPath();
              ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
              ctx.fillStyle = this.color;
              ctx.globalAlpha = this.opacity;
              ctx.fill();
              ctx.globalAlpha = 1;
            }
          } else if (variant === 'matrix') {
            // Matrix particles are small rectangles
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.fillRect(this.x, this.y, this.size, this.size * 4);
            ctx.globalAlpha = 1;
          } else if (variant === 'nebula') {
            // Nebula particles are glowing circles
            const gradient = ctx.createRadialGradient(
              this.x, this.y, 0,
              this.x, this.y, this.size * 2
            );
            
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.globalAlpha = this.opacity;
            ctx.fill();
            ctx.globalAlpha = 1;
          } else {
            // Default particles are simple circles
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        }
      }
      
      draw() {
        if (!ctx) return;
        
        if (variant === 'grid') {
          // Draw grid points as small squares
          ctx.fillStyle = this.color;
          ctx.fillRect(this.x, this.y, this.size, this.size);
        } else if (variant === 'data' && this.isDataPoint) {
          // Draw data points with blinking effect
          const alpha = this.blinkState !== undefined ? 0.3 + Math.sin(this.blinkState * Math.PI * 2) * 0.7 : 1;
          ctx.fillStyle = this.color.replace(/[\d\.]+\)$/g, `${alpha})`);
          
          // Draw a small diamond shape
          ctx.beginPath();
          ctx.moveTo(this.x, this.y - this.size);
          ctx.lineTo(this.x + this.size, this.y);
          ctx.lineTo(this.x, this.y + this.size);
          ctx.lineTo(this.x - this.size, this.y);
          ctx.closePath();
          ctx.fill();
          
          // Add a small data value indicator
          if (this.dataValue !== undefined && this.dataValue > 0.7) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(this.x + this.size + 2, this.y - 1, 3 * this.dataValue, 2);
          }
        } else if (variant === 'matrix') {
          // Draw matrix characters
          ctx.fillStyle = this.color;
          ctx.fillText(
            String.fromCharCode(0x30A0 + Math.random() * 96),
            this.x,
            this.y
          );
        } else if (variant === 'nebula') {
          // Draw nebula particles as glowing orbs
          const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * 2
          );
          gradient.addColorStop(0, this.color);
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        } else {
          // Draw regular particles as circles
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.fill();
        }
      }
    }
    
    // Initialize particles
    for (let i = 0; i < numberOfParticles; i++) {
      particlesArray.push(new Particle());
    }
    
    // Animation function
    const animate = () => {
      if (!canvas || !ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Special background effects based on variant
      if (variant === 'grid') {
        // Draw grid lines
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
        ctx.lineWidth = 0.5;
        
        // Vertical lines
        for (let x = 0; x < canvas.width; x += 30) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y < canvas.height; y += 30) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      } else if (variant === 'matrix') {
        // Matrix rain effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = '14px monospace';
        
        for (let i = 0; i < matrixDrops.length; i++) {
          // Random character
          const text = String.fromCharCode(0x30A0 + Math.random() * 96);
          const x = i * 14;
          const y = matrixDrops[i] * 14;
          
          // Random brightness
          const brightness = Math.random() * 255;
          ctx.fillStyle = `rgba(0, ${brightness}, 70, 0.8)`;
          
          ctx.fillText(text, x, y);
          
          // Reset when off screen
          if (y > canvas.height && Math.random() > 0.975) {
            matrixDrops[i] = 0;
          }
          
          matrixDrops[i]++;
        }
      } else if (variant === 'nebula') {
        // Nebula background effect
        nebulaTime += 0.005;
        nebulaHue = (nebulaHue + 0.1) % 360;
        
        // Create gradient background
        const gradient = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, 0,
          canvas.width / 2, canvas.height / 2, canvas.width / 2
        );
        
        gradient.addColorStop(0, `hsla(${nebulaHue}, 100%, 20%, 0.1)`);
        gradient.addColorStop(0.5, `hsla(${nebulaHue + 30}, 100%, 10%, 0.05)`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // Update and draw particles
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        
        // Draw connections between particles
        if (variant !== 'matrix') {
          for (let j = i; j < particlesArray.length; j++) {
            const dx = particlesArray[i].x - particlesArray[j].x;
            const dy = particlesArray[i].y - particlesArray[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            const maxDistance = variant === 'data' ? 100 : 
                               variant === 'grid' ? 50 : 
                               variant === 'nebula' ? 150 : 70;
            
            if (distance < maxDistance) {
              ctx.beginPath();
              ctx.strokeStyle = variant === 'data' ? `rgba(0, 255, 255, ${0.1 * (1 - distance / maxDistance)})` :
                               variant === 'grid' ? `rgba(30, 144, 255, ${0.1 * (1 - distance / maxDistance)})` :
                               variant === 'nebula' ? `rgba(138, 43, 226, ${0.1 * (1 - distance / maxDistance)})` :
                               `rgba(217, 70, 239, ${0.1 * (1 - distance / maxDistance)})`;
              
              ctx.lineWidth = variant === 'data' ? 0.6 : 0.5;
              ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
              ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
              ctx.stroke();
            }
          }
        }
      }
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (interactive && containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
        containerRef.current.removeEventListener('mouseenter', handleMouseEnter);
        containerRef.current.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [isClient, variant, density, speed, interactive, isMouseInCanvas, mousePosition]);
  
  return (
    <motion.div 
      ref={containerRef}
      className={`absolute inset-0 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {isClient && (
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full"
        />
      )}
    </motion.div>
  );
};

export default ParticleBackground; 