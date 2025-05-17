import { useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/apiService';

export interface User {
  id: string;
  name?: string;
  email: string;
  role: 'admin' | 'organisation' | 'user' | 'hospital';
  phone?: string;
  profile?: {
    bio?: string;
    skills?: string[];
    profilePhoto?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
        const userData = await authService.getCurrentUser();
        setAuthState({
          user: userData,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        // Only set error if it's not a 401 (unauthorized)
        // 401 is expected if user is not logged in
        if (error.response && error.response.status !== 401) {
          setAuthState({
            user: null,
            isLoading: false,
            error: 'Failed to load user data',
          });
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            error: null,
          });
        }
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const userData = await authService.login(email, password);
      setAuthState({
        user: userData,
        isLoading: false,
        error: null,
      });
      return userData;
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  // Register function
  const register = useCallback(async (userData: FormData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const newUser = await authService.register(userData);
      setAuthState({
        user: newUser,
        isLoading: false,
        error: null,
      });
      return newUser;
    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      await authService.logout();
      setAuthState({
        user: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to logout. Please try again.',
      }));
    }
  }, []);

  // Update user function
  const updateUser = useCallback(async (userData: FormData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const updatedUser = await authService.updateProfile(userData);
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
        isLoading: false,
      }));
      return updatedUser;
    } catch (error) {
      let errorMessage = 'Failed to update profile. Please try again.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  // Clear authentication errors
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    user: authState.user,
    isLoading: authState.isLoading,
    isLoggedIn: !!authState.user,
    error: authState.error,
    login,
    register,
    logout,
    updateUser,
    clearError,
  };
}

export default useAuth;
