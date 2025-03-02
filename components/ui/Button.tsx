"use client";

import React from 'react';
import { motion, HTMLMotionProps, useAnimation } from 'framer-motion';
import Spinner from './Spinner';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: 'primary' | 'secondary' | 'cyber' | 'ghost' | 'outline' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  float?: boolean;
  glitch?: boolean;
  glow?: boolean;
  rippleEffect?: boolean;
  animationDelay?: number;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  float = variant === 'primary',
  glitch = false,
  glow = true,
  rippleEffect = true,
  animationDelay = 0,
  ...props
}) => {
  const controls = useAnimation();
  const [rippleArray, setRippleArray] = React.useState<{ x: number, y: number, size: number }[]>([]);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  
  const baseClasses = 'font-ui font-semibold rounded-lg transition-all duration-200 flex items-center justify-center relative overflow-hidden';
  
  const variantClasses = {
    primary: 'bg-accent-primary text-white hover:shadow-glow active:scale-98',
    secondary: 'bg-ui-dark text-text-secondary hover:text-text-primary hover:shadow-glow-soft active:scale-98 border border-accent-primary/20',
    cyber: 'bg-ui-dark text-accent-secondary border border-accent-secondary/50 hover:border-accent-secondary hover:shadow-glow-blue active:scale-98',
    ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-ui-dark/50 active:scale-98',
    outline: 'bg-transparent text-text-primary border border-text-secondary hover:border-accent-primary hover:text-accent-primary active:scale-98',
    gradient: 'bg-gradient-to-r from-accent-start to-accent-end text-white hover:shadow-glow active:scale-98'
  };
  
  const sizeClasses = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6 text-base',
    lg: 'py-4 px-8 text-lg'
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  // Map button size to spinner size
  const spinnerSize = size === 'sm' ? 'sm' : size === 'md' ? 'sm' : 'md';
  
  // Floating animation
  React.useEffect(() => {
    if (float) {
      controls.start({
        y: [0, -4, 0],
        transition: {
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: animationDelay
        }
      });
    }
  }, [float, controls, animationDelay]);
  
  // Glitch animation
  React.useEffect(() => {
    if (glitch) {
      const glitchInterval = setInterval(() => {
        controls.start({
          x: [0, -2, 2, -1, 0],
          transition: {
            duration: 0.3,
            ease: "easeInOut"
          }
        });
      }, 5000); // Trigger glitch every 5 seconds
      
      return () => clearInterval(glitchInterval);
    }
  }, [glitch, controls]);
  
  // Ripple effect handler
  const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!rippleEffect || !buttonRef.current) return;
    
    const button = buttonRef.current;
    const rect = button.getBoundingClientRect();
    const size = Math.max(button.offsetWidth, button.offsetHeight);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const newRipple = {
      x,
      y,
      size
    };
    
    setRippleArray([...rippleArray, newRipple]);
    
    // Remove ripple after animation completes
    setTimeout(() => {
      setRippleArray(prevState => prevState.slice(1));
    }, 1000);
  };
  
  // Determine if we should add glow effect
  const glowClass = glow ? 
    variant === 'primary' ? 'hover:shadow-glow' : 
    variant === 'cyber' ? 'hover:shadow-glow-blue' : 
    variant === 'gradient' ? 'hover:shadow-glow' :
    'hover:shadow-glow-soft' : '';
  
  return (
    <motion.button
      ref={buttonRef}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${glowClass} ${className}`}
      whileHover={{ 
        scale: 1.05, 
        transition: { duration: 0.2 } 
      }}
      whileTap={{ scale: 0.98 }}
      animate={controls}
      disabled={isLoading || props.disabled}
      onClick={(e) => {
        handleRipple(e);
        if (props.onClick) props.onClick(e);
      }}
      {...props}
    >
      {/* Ripple effect */}
      {rippleArray.map((ripple, index) => (
        <span
          key={`ripple-${index}`}
          className={`absolute rounded-full ${
            variant === 'cyber' ? 'bg-accent-secondary/30' : 
            variant === 'primary' ? 'bg-white/30' : 
            variant === 'gradient' ? 'bg-white/30' :
            'bg-accent-primary/20'
          }`}
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            transform: 'scale(0)',
            animation: 'ripple 1s linear'
          }}
        />
      ))}
      
      {/* Button content */}
      <div className="relative z-10 flex items-center justify-center">
        {isLoading ? (
          <span className="mr-2">
            <Spinner size={spinnerSize} color="white" />
          </span>
        ) : leftIcon ? (
          <span className="mr-2">{leftIcon}</span>
        ) : null}
        
        {children}
        
        {rightIcon && !isLoading && (
          <span className="ml-2">{rightIcon}</span>
        )}
      </div>
      
      {/* Cyber variant special effects */}
      {variant === 'cyber' && (
        <>
          <span className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
            <span className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent-secondary to-transparent transform -translate-y-1"></span>
            <span className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent-secondary to-transparent transform translate-y-1"></span>
            <span className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-accent-secondary to-transparent transform -translate-x-1"></span>
            <span className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-accent-secondary to-transparent transform translate-x-1"></span>
          </span>
        </>
      )}
      
      {/* Gradient variant special effects */}
      {variant === 'gradient' && (
        <span className="absolute inset-0 bg-gradient-to-r from-accent-start to-accent-end opacity-0 hover:opacity-100 transition-opacity duration-300 mix-blend-overlay"></span>
      )}
    </motion.button>
  );
};

export default Button; 