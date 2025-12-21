import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const AuthContext = createContext(null);

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:4000/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('token').then((value) => {
      if (value) {
        setToken(value);
        axios
          .get(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${value}` },
          })
          .then((res) => setUser(res.data.user))
          .catch(() => {
            setUser(null);
            setToken(null);
            AsyncStorage.removeItem('token');
          });
      }
    });
  }, []);

  const login = async (data) => {
    setToken(data.token);
    setUser(data.user);
    await AsyncStorage.setItem('token', data.token);
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
