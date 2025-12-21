import { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const API_BASE = import.meta.env.VITE_API_BASE || 'https://family-todoapp-backend-production.up.railway.app/api'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      axios
        .get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUser(res.data.user))
        .catch(() => {
          setUser(null)
          setToken(null)
          localStorage.removeItem('token')
        })
    }
  }, [token])

  const login = (data) => {
    if (!data || !data.token || !data.user) {
      console.error('Invalid login data:', data)
      return
    }
    console.log('Setting token and user:', { token: data.token, user: data.user })
    setToken(data.token)
    localStorage.setItem('token', data.token)
    setUser(data.user)
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
        setUser(res.data.user)
        return res.data.user
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
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  // Trả về object mặc định nếu context chưa sẵn sàng
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
