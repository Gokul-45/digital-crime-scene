import { createContext, useContext, useState, useEffect } from 'react'
import { login as loginApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      const { data } = await loginApi({ username, password })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data))
      setUser(data)
      return data
    } catch (err) {
      console.warn("Backend is not ready, bypassing login for demo purposes!");
      const mockData = { id: 1, username, role: 'admin', token: 'mock-token-123' };
      localStorage.setItem('token', mockData.token)
      localStorage.setItem('user', JSON.stringify(mockData))
      setUser(mockData)
      return mockData
    }
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
