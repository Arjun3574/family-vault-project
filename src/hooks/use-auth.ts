'use client';
import { useContext } from 'react';
import { AuthContext, type AuthContextType } from '@/contexts/auth-provider';

// This hook is now deprecated in favor of useAuthContext but kept for compatibility.
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
