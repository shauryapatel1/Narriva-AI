"use client";

import React from 'react';
import { motion, Variants } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
  hoverEffect?: 'glow' | 'lift' | 'pulse' | 'border' | 'cyber' | 'none';
  variant?: 'default' | 'bordered' | 'gradient' | 'cyber' | 'glass' | 'terminal' | 'morphing';
  animationDelay?: number;
  animateIn?: boolean;
  glitch?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  interactive = false,
  onClick,
  hoverEffect = 'none',
  variant = 'default',
  animationDelay = 0,
  animateIn = false,
  glitch = false
}) => {
  const baseClasses = 'bg-ui-dark rounded-lg p-6 backdrop-blur-sm';
  
  const variantClasses = {
    default: '',
    bordered: 'border border-accent-primary/20',
    gradient: 'bg-gradient-to-br from-ui-dark via-ui-dark to-background-dark-secondary border border-accent-primary/10',
    cyber: 'border border-accent-secondary/30 bg-background-dark',
    glass: 'bg-ui-dark/70 backdrop-blur-md border border-white/10',
    terminal: 'border-2 border-accent-secondary/50 bg-background-dark font-mono',
    morphing: 'bg-gradient-to-br from-accent-primary/10 to-accent-secondary/5 backdrop-blur-md'
  };
  
  const hoverClasses = {
    glow: 'transition-shadow duration-300',
    lift: 'transition-transform duration-300',
    pulse: 'transition-all duration-300',
    border: 'transition-all duration-300',
    cyber: 'transition-all duration-300',
    none: ''
  };
  
  const interactiveClasses = interactive ? 'cursor-pointer' : '';
  
  // Animation variants
  const cardVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.5,
        delay: animationDelay,
        ease: "easeOut"
      }
    }
  };
  
  // Glitch animation
  const glitchVariants: Variants = {
    initial: { x: 0 },
    glitch: {
      x: [0, -2, 2, -1, 0],
      transition: {
        duration: 0.3,
        repeat: Infinity,
        repeatDelay: 5,
        ease: "easeInOut"
      }
    }
  };
  
  // Cyber border animation
  const cyberBorderAnimation: Variants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { type: "spring", duration: 1.5, bounce: 0 },
        opacity: { duration: 0.3 }
      }
    }
  };
  
  // Morphing animation
  const morphingAnimation: Variants = {
    initial: { borderRadius: '16px' },
    animate: {
      borderRadius: ['16px', '20px 16px 24px 12px', '24px 12px 16px 20px', '16px'],
      transition: {
        duration: 8,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    }
  };
  
  // Terminal effect for terminal variant
  const terminalEffect = variant === 'terminal' ? (
    <div className="absolute top-0 left-0 w-full p-2 bg-accent-secondary/10 border-b border-accent-secondary/50 flex items-center">
      <div className="flex space-x-1.5">
        <div className="w-3 h-3 rounded-full bg-accent-tertiary"></div>
        <div className="w-3 h-3 rounded-full bg-accent-amber"></div>
        <div className="w-3 h-3 rounded-full bg-accent-secondary"></div>
      </div>
      <div className="text-xs text-accent-secondary/80 ml-2">terminal@narriva:~</div>
    </div>
  ) : null;
  
  // Helper function to determine shadow color based on variant
  const getShadowColor = () => {
    if (variant === 'cyber') {
      return '0 0 20px rgba(58, 191, 248, 0.6)';
    }
    return '0 0 20px rgba(124, 58, 237, 0.6)';
  };
  
  // Morphing variant
  if (variant === 'morphing') {
    return (
      <motion.div
        className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses[hoverEffect]} ${interactiveClasses} ${className} relative overflow-hidden`}
        variants={morphingAnimation}
        initial="initial"
        animate="animate"
        whileHover={interactive ? { scale: 1.02 } : {}}
        whileTap={interactive ? { scale: 0.98 } : {}}
        onClick={interactive ? onClick : undefined}
      >
        {/* Animated background */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-accent-primary/10 via-accent-secondary/5 to-accent-tertiary/10 opacity-50"
          animate={{ 
            background: [
              'linear-gradient(to bottom right, rgba(124, 58, 237, 0.1), rgba(58, 191, 248, 0.05), rgba(244, 113, 181, 0.1))',
              'linear-gradient(to bottom right, rgba(58, 191, 248, 0.1), rgba(244, 113, 181, 0.05), rgba(124, 58, 237, 0.1))',
              'linear-gradient(to bottom right, rgba(244, 113, 181, 0.1), rgba(124, 58, 237, 0.05), rgba(58, 191, 248, 0.1))'
            ]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    );
  }
  
  // Add a subtle animated border effect for interactive cards
  if (interactive && hoverEffect === 'lift') {
    return (
      <motion.div
        className={`${baseClasses} ${variantClasses[variant]} ${interactiveClasses} ${className} relative overflow-hidden`}
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        {...(animateIn ? { 
          variants: cardVariants,
          initial: "hidden",
          animate: glitch ? "glitch" : "visible"
        } : glitch ? { 
          variants: glitchVariants,
          initial: "initial",
          animate: "glitch"
        } : {})}
      >
        {/* Animated corner accents */}
        <motion.div 
          className="absolute top-0 left-0 w-4 h-4 border-t border-l border-accent-primary/40"
          initial={{ opacity: 0.3 }}
          whileHover={{ opacity: 1 }}
        />
        <motion.div 
          className="absolute top-0 right-0 w-4 h-4 border-t border-r border-accent-primary/40"
          initial={{ opacity: 0.3 }}
          whileHover={{ opacity: 1 }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-accent-primary/40"
          initial={{ opacity: 0.3 }}
          whileHover={{ opacity: 1 }}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-accent-primary/40"
          initial={{ opacity: 0.3 }}
          whileHover={{ opacity: 1 }}
        />
        
        {/* Animated glow effect */}
        <motion.div
          className="absolute inset-0 bg-accent-primary/5 rounded-lg"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
        
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    );
  }
  
  // Cyber effect
  if (hoverEffect === 'cyber' || variant === 'cyber') {
    return (
      <motion.div
        className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses[hoverEffect]} ${interactiveClasses} ${className} relative`}
        whileHover={interactive ? { scale: 1.02 } : {}}
        whileTap={interactive ? { scale: 0.98 } : {}}
        onClick={interactive ? onClick : undefined}
        {...(animateIn ? { 
          variants: cardVariants,
          initial: "hidden",
          animate: "visible"
        } : {})}
      >
        {/* SVG Border Animation */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <motion.rect 
              width="100%" 
              height="100%" 
              rx="8" 
              ry="8" 
              fill="none" 
              stroke="rgba(58, 191, 248, 0.5)" 
              strokeWidth="1"
              initial="initial"
              animate="animate"
              variants={cyberBorderAnimation}
              strokeDasharray="10 5"
            />
          </svg>
        </div>
        
        {/* Cyber corner accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-accent-secondary/70"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-accent-secondary/70"></div>
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-accent-secondary/70"></div>
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-accent-secondary/70"></div>
        
        {/* Cyber scan line effect */}
        <motion.div 
          className="absolute inset-0 overflow-hidden pointer-events-none opacity-20"
          initial={{ opacity: 0.1 }}
          whileHover={{ opacity: 0.2 }}
        >
          <motion.div 
            className="w-full h-px bg-accent-secondary"
            animate={{ 
              y: ["0%", "100%", "0%"],
              opacity: [0.2, 0.8, 0.2]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </motion.div>
        
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    );
  }
  
  // Terminal variant
  if (variant === 'terminal') {
    return (
      <motion.div
        className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses[hoverEffect]} ${interactiveClasses} ${className} relative pt-12`}
        whileHover={interactive && hoverEffect !== 'none' ? { scale: 1.02 } : {}}
        whileTap={interactive ? { scale: 0.98 } : {}}
        onClick={interactive ? onClick : undefined}
        {...(animateIn ? { 
          variants: cardVariants,
          initial: "hidden",
          animate: "visible"
        } : {})}
      >
        {terminalEffect}
        
        {/* Blinking cursor effect */}
        <div className="relative z-10">
          {children}
          <motion.span 
            className="inline-block w-2 h-4 bg-accent-secondary ml-1"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>
      </motion.div>
    );
  }
  
  // Border animation effect
  if (hoverEffect === 'border') {
    return (
      <motion.div
        className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses[hoverEffect]} ${interactiveClasses} ${className} relative overflow-hidden`}
        whileHover={interactive ? { scale: 1.02 } : {}}
        whileTap={interactive ? { scale: 0.98 } : {}}
        onClick={interactive ? onClick : undefined}
        {...(animateIn ? { 
          variants: cardVariants,
          initial: "hidden",
          animate: "visible"
        } : {})}
      >
        {/* Animated border */}
        <motion.div 
          className="absolute inset-0 rounded-lg pointer-events-none"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        >
          <div className="absolute inset-0 rounded-lg border-2 border-transparent bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-primary bg-[length:200%_100%] animate-border-flow" style={{ backgroundClip: 'text', WebkitBackgroundClip: 'text' }}></div>
        </motion.div>
        
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    );
  }
  
  // Pulse animation effect
  if (hoverEffect === 'pulse') {
    return (
      <motion.div
        className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses[hoverEffect]} ${interactiveClasses} ${className} relative`}
        whileHover={{ 
          boxShadow: getShadowColor(),
          scale: interactive ? 1.02 : 1
        }}
        whileTap={interactive ? { scale: 0.98 } : {}}
        onClick={interactive ? onClick : undefined}
        {...(animateIn ? { 
          variants: cardVariants,
          initial: "hidden",
          animate: "visible"
        } : {})}
      >
        {/* Pulse overlay */}
        <motion.div 
          className="absolute inset-0 rounded-lg pointer-events-none"
          animate={{ 
            boxShadow: [
              'inset 0 0 0px rgba(124, 58, 237, 0)', 
              'inset 0 0 10px rgba(124, 58, 237, 0.3)', 
              'inset 0 0 0px rgba(124, 58, 237, 0)'
            ],
            scale: [1, 1.01, 1]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            repeatType: "loop"
          }}
        />
        
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    );
  }
  
  // Default card with optional glow effect
  return (
    <motion.div
      className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses[hoverEffect]} ${interactiveClasses} ${className}`}
      whileHover={interactive && hoverEffect === 'glow' ? 
        { boxShadow: getShadowColor() } : 
        interactive ? { scale: 1.02 } : {}
      }
      whileTap={interactive ? { scale: 0.98 } : {}}
      onClick={interactive ? onClick : undefined}
      {...(animateIn ? { 
        variants: cardVariants,
        initial: "hidden",
        animate: "visible"
      } : {})}
    >
      {children}
    </motion.div>
  );
};

export default Card; 