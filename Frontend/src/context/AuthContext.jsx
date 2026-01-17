import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const savedRole = localStorage.getItem('role');
        const savedUser = localStorage.getItem('user');

        console.log('Initializing auth...', { token: !!token, savedRole, savedUser: !!savedUser });

        if (token && savedRole) {
          // Restore from localStorage first
          setRole(savedRole);
          setIsAuthenticated(true);
          
          if (savedUser) {
            try {
              const parsedUser = JSON.parse(savedUser);
              setUser(parsedUser);
              console.log('User restored from localStorage:', parsedUser.username);
            } catch (error) {
              console.error('Error parsing user data:', error);
              // Clear invalid data
              localStorage.removeItem('user');
            }
          }

          // Try to fetch fresh user data from backend to verify token is still valid
          try {
            const response = await authAPI.getCurrentUser();
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            console.log('User verified from backend:', response.data.user.username);
          } catch (error) {
            console.error('Error fetching user from backend:', error.message);
            // If getCurrentUser fails, the token might be expired, but we keep user logged in
            // with localStorage data. They'll be redirected when trying to access protected routes.
          }
        } else {
          console.log('No token or role found in localStorage');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (userData, token, userRole) => {
    console.log('Logging in user:', userData.username, 'with role:', userRole);
    localStorage.setItem('token', token);
    localStorage.setItem('role', userRole);
    localStorage.setItem('user', JSON.stringify(userData));
    
    setUser(userData);
    setRole(userRole);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    role,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
