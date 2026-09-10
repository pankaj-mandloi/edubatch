import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    console.log('🔷 AuthProvider useEffect running...');
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        console.log('✅ User restored from localStorage');
      } catch (error) {
        console.error('Failed to parse user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
    console.log('✅ AuthProvider loading complete');
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔶 Login attempt:', email);
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        setUser(user);
        setIsAuthenticated(true);
        toast.success('Login successful!');
        console.log('✅ Login successful:', user.email);
        return { success: true };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      console.log('🔶 Register attempt:', userData.email);
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        setUser(user);
        setIsAuthenticated(true);
        toast.success('Registration successful!');
        console.log('✅ Registration successful:', user.email);
        return { success: true };
      }
    } catch (error) {
      console.error('❌ Register error:', error);
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
    console.log('✅ Logout successful');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    console.log('✅ User updated');
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};