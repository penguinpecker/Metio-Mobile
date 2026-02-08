import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, userAPI, setTokens, clearTokens } from '../services/api';

const AuthContext = createContext(null);

const STORAGE_KEYS = {
  ACCESS_TOKEN: '@metio_access_token',
  REFRESH_TOKEN: '@metio_refresh_token',
  USER: '@metio_user',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load stored auth on app start
  useEffect(() => {
    // Check for Google auth callback params first (web only)
    if (Platform.OS === 'web') {
      handleGoogleCallback();
    } else {
      loadStoredAuth();
    }
  }, []);

  const handleGoogleCallback = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('accessToken');
      const refreshToken = urlParams.get('refreshToken');
      const userId = urlParams.get('userId');
      const email = urlParams.get('email');
      const name = urlParams.get('name');
      const error = urlParams.get('error');

      if (error) {
        console.error('Google auth error:', error);
        // Clear URL params
        window.history.replaceState({}, document.title, window.location.pathname);
        loadStoredAuth();
        return;
      }

      if (accessToken && refreshToken && userId) {
        console.log('Google auth success, saving tokens...');
        // Save auth from Google callback
        const userData = { id: userId, email, name };
        const tokens = { accessToken, refreshToken };
        
        await saveAuth(userData, tokens);
        
        // Clear URL params
        window.history.replaceState({}, document.title, window.location.pathname);
        setIsLoading(false);
        return;
      }
      
      // No callback params, load stored auth
      loadStoredAuth();
    } catch (err) {
      console.error('Error handling Google callback:', err);
      loadStoredAuth();
    }
  };

  const loadStoredAuth = async () => {
    try {
      const [accessToken, refreshToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
      ]);

      if (accessToken && refreshToken) {
        setTokens(accessToken, refreshToken);
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }

        // Verify token is still valid
        try {
          const response = await authAPI.me();
          if (response.success) {
            setUser(response.data);
            setIsAuthenticated(true);
          }
        } catch (error) {
          // Token invalid, clear auth
          await clearAuth();
        }
      }
    } catch (error) {
      console.error('Error loading auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAuth = async (userData, tokens) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
        AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData)),
      ]);
      setTokens(tokens.accessToken, tokens.refreshToken);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error saving auth:', error);
    }
  };

  const clearAuth = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
      ]);
      clearTokens();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error clearing auth:', error);
    }
  };

  const login = async (email, password) => {
    const response = await authAPI.login(email, password);
    if (response.success) {
      await saveAuth(response.data.user, response.data.tokens);
    }
    return response;
  };

  const signup = async (email, password, name) => {
    const response = await authAPI.signup(email, password, name);
    if (response.success) {
      await saveAuth(response.data.user, response.data.tokens);
    }
    return response;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Ignore logout errors
    } finally {
      await clearAuth();
    }
  };

  const updateUser = async (data) => {
    const response = await userAPI.updateProfile(data);
    if (response.success) {
      setUser(response.data);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data));
    }
    return response;
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
