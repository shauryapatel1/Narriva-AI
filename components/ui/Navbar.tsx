'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

interface NavbarProps {
  transparent?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ transparent = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <nav className={`fixed w-full z-50 border-b border-gray-800 ${transparent ? 'bg-transparent' : 'bg-background-dark bg-opacity-90 backdrop-blur-sm'}`}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Logo size="md" />
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/stories" className="text-text-tertiary hover:text-text-primary transition-colors">
              Discover
            </Link>
            <Link href="/how-it-works" className="text-text-tertiary hover:text-text-primary transition-colors">
              How It Works
            </Link>
            <Link href="/pricing" className="text-text-tertiary hover:text-text-primary transition-colors">
              Pricing
            </Link>
            {isAuthenticated && user?.plan === 'Creator' && (
              <Link href="/create" className="text-text-tertiary hover:text-text-primary transition-colors">
                Create
              </Link>
            )}
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full border-2 border-t-accent-amber border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            ) : isAuthenticated ? (
              <>
                <Link href="/profile" className="flex items-center text-text-tertiary hover:text-text-primary transition-colors">
                  <div className="w-8 h-8 bg-ui-dark rounded-full flex items-center justify-center text-sm font-bold text-accent-amber mr-2">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span>Profile</span>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="btn-secondary py-2 px-4">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="btn-primary py-2 px-4">
                  Get Started
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMenu}
              className="text-text-tertiary hover:text-text-primary transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="md:hidden bg-background-dark border-t border-gray-800"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto px-6 py-4 flex flex-col space-y-4">
              <Link 
                href="/stories" 
                className="text-text-tertiary hover:text-text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Discover
              </Link>
              <Link 
                href="/how-it-works" 
                className="text-text-tertiary hover:text-text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link 
                href="/pricing" 
                className="text-text-tertiary hover:text-text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              {isAuthenticated && user?.plan === 'Creator' && (
                <Link 
                  href="/create" 
                  className="text-text-tertiary hover:text-text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Create
                </Link>
              )}
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-800">
                {isLoading ? (
                  <div className="w-8 h-8 mx-auto rounded-full border-2 border-t-accent-amber border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                ) : isAuthenticated ? (
                  <Link 
                    href="/profile" 
                    className="btn-secondary py-2 px-4 text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                ) : (
                  <>
                    <Link 
                      href="/auth/signin" 
                      className="btn-secondary py-2 px-4 text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link 
                      href="/auth/signup" 
                      className="btn-primary py-2 px-4 text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar; 