import { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const API_BASE = import.meta.env.VITE_API_BASE || 'https://family-todoapp-backend-production.up.railway.app/api'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (token) {
      // Chỉ gọi /auth/me nếu chưa có user (trường hợp refresh page)
      if (!user) {
        setIsLoading(true)
        axios
          .get(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => {
            const userData = res.data.user || {}
            console.log('Loaded user from /auth/me:', userData)
            setUser(userData)
            setIsLoading(false)
          })
          .catch(() => {
            setUser(null)
            setToken(null)
            localStorage.removeItem('token')
            setIsLoading(false)
          })
      }
    } else {
      setIsLoading(false)
    }
  }, [token])

  const login = (data) => {
    if (!data || !data.token || !data.user) {
      console.error('Invalid login data:', data)
      return
    }
    console.log('Setting token and user:', { token: data.token, user: data.user })
    const userData = {
      id: data.user.id,
      name: data.user.name || data.user.email?.split('@')[0] || 'User',
      email: data.user.email
    }
    console.log('Setting user data:', userData)
    setUser(userData)
    setToken(data.token)
    localStorage.setItem('token', data.token)
    setIsLoading(false)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
  }

  const refreshUser = async () => {
    if (token) {
      try {
        const res = await axios.get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const userData = res.data.user || {}
        setUser(userData)
        return userData
      } catch (err) {
        console.error('Failed to refresh user:', err)
        return null
      }
    }
    return null
  }

  const updateUser = (userData) => {
    setUser(userData)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    return {
      user: null,
      token: null,
      login: () => {},
      logout: () => {},
      refreshUser: () => {},
      updateUser: () => {},
    }
  }
  return context
}
