'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();

  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  const user = session?.user;

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        showToast('Invalid email or password', 'error');
        return false;
      }

      showToast('Successfully logged in', 'success');
      router.push('/profile');
      return true;
    } catch (error) {
      showToast('An error occurred during login', 'error');
      return false;
    }
  };

  const loginWithGoogle = async () => {
    try {
      await signIn('google', { callbackUrl: '/profile' });
      return true;
    } catch (error) {
      showToast('An error occurred during login', 'error');
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut({ redirect: false });
      showToast('Successfully logged out', 'success');
      router.push('/');
      return true;
    } catch (error) {
      showToast('An error occurred during logout', 'error');
      return false;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      // Call the registration API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || 'Registration failed', 'error');
        return false;
      }

      // After successful registration, log the user in
      showToast('Account created successfully', 'success');
      return login(email, password);
    } catch (error) {
      showToast('An error occurred during registration', 'error');
      return false;
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    loginWithGoogle,
    logout,
    register,
  };
} 