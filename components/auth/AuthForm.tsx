import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import { useToast } from '@/contexts/ToastContext';
import { FcGoogle } from 'react-icons/fc';

interface AuthFormProps {
  type: 'signin' | 'signup';
  onSubmit: (data: any) => void;
  onGoogleSignIn?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ type, onSubmit, onGoogleSignIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password || (type === 'signup' && !name)) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    
    // Password validation
    if (password.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, this would call an API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      const data = type === 'signup' 
        ? { email, password, name } 
        : { email, password };
      
      onSubmit(data);
      
      showToast(
        type === 'signin' 
          ? 'Successfully signed in!' 
          : 'Account created successfully!', 
        'success'
      );
    } catch (error) {
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!onGoogleSignIn) return;
    
    setIsGoogleLoading(true);
    try {
      await onGoogleSignIn();
    } catch (error) {
      showToast('An error occurred with Google sign in. Please try again.', 'error');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-ui-dark rounded-lg p-8 shadow-glow-soft">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {type === 'signin' ? 'Sign In to Your Account' : 'Create Your Account'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {type === 'signup' && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-background-dark-secondary text-text-primary border border-gray-800 focus:border-accent-amber focus:outline-none transition-colors"
                placeholder="John Doe"
              />
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-background-dark-secondary text-text-primary border border-gray-800 focus:border-accent-amber focus:outline-none transition-colors"
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-background-dark-secondary text-text-primary border border-gray-800 focus:border-accent-amber focus:outline-none transition-colors"
              placeholder={type === 'signup' ? 'Create a password' : 'Enter your password'}
            />
          </div>
          
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
          >
            {type === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
        
        {onGoogleSignIn && (
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-ui-dark text-text-tertiary">Or continue with</span>
              </div>
            </div>
            
            <div className="mt-6">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                isLoading={isGoogleLoading}
                onClick={handleGoogleSignIn}
                className="flex items-center justify-center"
              >
                <FcGoogle className="w-5 h-5 mr-2" />
                Google
              </Button>
            </div>
          </div>
        )}
        
        <div className="mt-6 text-center">
          <p className="text-text-tertiary text-sm">
            {type === 'signin' ? (
              <>
                Don't have an account?{' '}
                <a href="/auth/signup" className="text-accent-amber hover:underline">
                  Sign up
                </a>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <a href="/auth/signin" className="text-accent-amber hover:underline">
                  Sign in
                </a>
              </>
            )}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default AuthForm; 