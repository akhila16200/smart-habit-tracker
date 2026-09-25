import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('habitpulse_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('habitpulse_user');
      }
    }
    setAuthLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.loginUser(email, password);
    setUser(res.user);
    localStorage.setItem('habitpulse_user', JSON.stringify(res.user));
    setIsAuthModalOpen(false);
    return res.user;
  };

  const signup = async (name, email, password) => {
    const res = await api.signupUser(name, email, password);
    setUser(res.user);
    localStorage.setItem('habitpulse_user', JSON.stringify(res.user));
    setIsAuthModalOpen(false);
    return res.user;
  };

  const updateProfile = async (profileData) => {
    const updated = await api.updateUserProfile(profileData);
    setUser(updated);
    localStorage.setItem('habitpulse_user', JSON.stringify(updated));
    setIsProfileModalOpen(false);
    return updated;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('habitpulse_user');
    setIsProfileModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userId: user ? user.id : 'USER#default',
        authLoading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
        login,
        signup,
        updateProfile,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
