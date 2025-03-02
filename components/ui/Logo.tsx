import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', withText = true }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };
  
  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };
  
  return (
    <Link href="/" className="flex items-center space-x-2">
      <div className={sizeClasses[size]}>
        <Image 
          src="/images/narriva-logo.svg" 
          alt="Narriva Logo" 
          width={size === 'sm' ? 32 : size === 'md' ? 40 : 48} 
          height={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
          priority
        />
      </div>
      
      {withText && (
        <span className={`font-bold text-gradient ${textSizeClasses[size]}`}>
          Narriva
        </span>
      )}
    </Link>
  );
};

export default Logo; 