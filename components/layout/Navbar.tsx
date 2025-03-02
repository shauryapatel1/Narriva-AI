'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import { FaBars, FaTimes, FaUser, FaSignOutAlt, FaBook, FaPlus } from 'react-icons/fa';

const Navbar: React.FC = () => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Check if user is logged in
  const isLoggedIn = status === 'authenticated';
  
  // Handle scroll event to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsUserMenuOpen(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);
  
  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  // Toggle user menu
  const toggleUserMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUserMenuOpen(!isUserMenuOpen);
  };
  
  // Handle sign out
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };
  
  // Navigation links
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Stories', path: '/stories' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Contact', path: '/contact' },
  ];
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background-dark bg-opacity-95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-accent-red to-accent-amber bg-clip-text text-transparent">
              Narriva
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`text-sm font-medium transition-colors duration-300 ${
                  pathname === link.path
                    ? 'text-accent-amber'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          
          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-ui-dark transition-colors"
                >
                  {session?.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-ui-dark flex items-center justify-center">
                      <FaUser className="text-text-secondary" />
                    </div>
                  )}
                </button>
                
                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 py-2 bg-ui-dark rounded-lg shadow-xl border border-gray-800 z-50"
                    >
                      <div className="px-4 py-2 border-b border-gray-800">
                        <p className="text-sm font-medium text-text-primary">
                          {session?.user?.name}
                        </p>
                        <p className="text-xs text-text-tertiary truncate">
                          {session?.user?.email}
                        </p>
                      </div>
                      
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-ui-dark-hover transition-colors"
                      >
                        <FaUser className="mr-2 text-xs" />
                        Profile
                      </Link>
                      
                      <Link
                        href="/stories/my"
                        className="flex items-center px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-ui-dark-hover transition-colors"
                      >
                        <FaBook className="mr-2 text-xs" />
                        My Stories
                      </Link>
                      
                      {session?.user?.role === 'CREATOR' && (
                        <Link
                          href="/create"
                          className="flex items-center px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-ui-dark-hover transition-colors"
                        >
                          <FaPlus className="mr-2 text-xs" />
                          Create Story
                        </Link>
                      )}
                      
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-ui-dark-hover transition-colors"
                      >
                        <FaSignOutAlt className="mr-2 text-xs" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="secondary" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg hover:bg-ui-dark transition-colors"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? (
              <FaTimes className="text-text-primary" />
            ) : (
              <FaBars className="text-text-primary" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-background-dark border-t border-gray-800"
          >
            <div className="container mx-auto px-6 py-4">
              <nav className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`text-sm font-medium py-2 transition-colors duration-300 ${
                      pathname === link.path
                        ? 'text-accent-amber'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                
                {isLoggedIn ? (
                  <>
                    <div className="border-t border-gray-800 pt-4 mt-2">
                      <div className="flex items-center space-x-3 mb-4">
                        {session?.user?.image ? (
                          <img
                            src={session.user.image}
                            alt={session.user.name || 'User'}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-ui-dark flex items-center justify-center">
                            <FaUser className="text-text-secondary" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            {session?.user?.name}
                          </p>
                          <p className="text-xs text-text-tertiary truncate max-w-[200px]">
                            {session?.user?.email}
                          </p>
                        </div>
                      </div>
                      
                      <Link
                        href="/profile"
                        className="flex items-center py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FaUser className="mr-2 text-xs" />
                        Profile
                      </Link>
                      
                      <Link
                        href="/stories/my"
                        className="flex items-center py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FaBook className="mr-2 text-xs" />
                        My Stories
                      </Link>
                      
                      {session?.user?.role === 'CREATOR' && (
                        <Link
                          href="/create"
                          className="flex items-center py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <FaPlus className="mr-2 text-xs" />
                          Create Story
                        </Link>
                      )}
                      
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                      >
                        <FaSignOutAlt className="mr-2 text-xs" />
                        Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col space-y-3 pt-4 mt-2 border-t border-gray-800">
                    <Link href="/auth/signin" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="secondary" fullWidth>
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="primary" fullWidth>
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar; 