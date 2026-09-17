import { createContext, useContext, useState, useEffect } from 'react'
import { login as loginApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      if (stored && token) setUser(JSON.parse(stored))
    } catch {
      localStorage.clear()
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    const { data } = await loginApi({ username, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data))
    setUser(data)
    return data
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
