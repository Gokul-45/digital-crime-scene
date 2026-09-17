import { createContext, useContext, useState, useEffect } from 'react'
import { login as loginApi, getCurrentUser } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const restoreSession = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        if (active) setLoading(false)
        return
      }

      try {
        // Never trust localStorage alone. Ask the backend whether this JWT is still valid.
        const { data } = await getCurrentUser()
        if (!active) return
        localStorage.setItem('user', JSON.stringify(data))
        setUser(data)
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        if (active) setUser(null)
      } finally {
        if (active) setLoading(false)
      }
    }

    restoreSession()
    return () => { active = false }
  }, [])

  const login = async (username, password) => {
    const { data } = await loginApi({ username, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data))
    setUser(data)
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
