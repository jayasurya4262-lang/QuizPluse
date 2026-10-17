import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'TEACHER';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  registerStudent: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  registerTeacher: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isTeacher: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('quizpulse_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const initAuth = async () => {
    const savedToken = localStorage.getItem('quizpulse_token');
    const savedUser = localStorage.getItem('quizpulse_user');

    if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
        // Validate with server
        const res = await api.getMe();
        if (res.success && res.data?.user) {
          setUser(res.data.user);
          localStorage.setItem('quizpulse_user', JSON.stringify(res.data.user));
        } else {
          logout();
        }
      } catch (e) {
        logout();
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    if (res.success && res.data) {
      const { user: loggedInUser, token: authToken } = res.data;
      setUser(loggedInUser);
      setToken(authToken);
      localStorage.setItem('quizpulse_token', authToken);
      localStorage.setItem('quizpulse_user', JSON.stringify(loggedInUser));
      return { success: true };
    }
    return { success: false, message: res.message || 'Login failed' };
  };

  const registerStudent = async (name: string, email: string, password: string) => {
    const res = await api.registerStudent({ name, email, password });
    if (res.success && res.data) {
      const { user: registeredUser, token: authToken } = res.data;
      setUser(registeredUser);
      setToken(authToken);
      localStorage.setItem('quizpulse_token', authToken);
      localStorage.setItem('quizpulse_user', JSON.stringify(registeredUser));
      return { success: true };
    }
    return { success: false, message: res.message || 'Registration failed' };
  };

  const registerTeacher = async (name: string, email: string, password: string) => {
    const res = await api.registerTeacher({ name, email, password });
    if (res.success && res.data) {
      const { user: registeredUser, token: authToken } = res.data;
      setUser(registeredUser);
      setToken(authToken);
      localStorage.setItem('quizpulse_token', authToken);
      localStorage.setItem('quizpulse_user', JSON.stringify(registeredUser));
      return { success: true };
    }
    return { success: false, message: res.message || 'Registration failed' };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('quizpulse_token');
    localStorage.removeItem('quizpulse_user');
  };

  const refreshUser = async () => {
    const res = await api.getMe();
    if (res.success && res.data?.user) {
      setUser(res.data.user);
      localStorage.setItem('quizpulse_user', JSON.stringify(res.data.user));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        registerStudent,
        registerTeacher,
        logout,
        refreshUser,
        isTeacher: user?.role === 'TEACHER',
        isStudent: user?.role === 'STUDENT',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
