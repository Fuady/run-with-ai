import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, User } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isOnboarded: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  completeOnboarding: (data: User['profile']) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setIsOnboarded(parsed.profile?.weeklyMileage > 0);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user } = await api.login(email, password);
      setUser(user);
      setIsOnboarded(user.profile?.weeklyMileage > 0);
      localStorage.setItem('user', JSON.stringify(user));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const { user } = await api.register({ email, password, name });
      setUser(user);
      setIsOnboarded(false);
      localStorage.setItem('user', JSON.stringify(user));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsOnboarded(false);
    localStorage.removeItem('user');
  };

  const completeOnboarding = async (data: User['profile']) => {
    if (!user) return;
    try {
      const updatedUser = await api.completeOnboarding(user.id, data);
      setUser(updatedUser);
      setIsOnboarded(true);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Onboarding error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isOnboarded, login, register, logout, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
