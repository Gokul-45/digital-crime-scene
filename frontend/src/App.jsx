import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/shared/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Cases from './pages/Cases'
import CaseDetail from './pages/CaseDetail'
import Evidence from './pages/Evidence'
import Witnesses from './pages/Witnesses'
import Suspects from './pages/Suspects'
import Timeline from './pages/Timeline'
import AiInsights from './pages/AiInsights'
import Reports from './pages/Reports'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-crime-bg">
      <div className="text-center">
        <div className="spinner mx-auto mb-4 w-8 h-8 border-4" />
        <p className="text-crime-muted text-sm">Authenticating...</p>
      </div>
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="cases" element={<Cases />} />
        <Route path="cases/:id" element={<CaseDetail />} />
        <Route path="evidence" element={<Evidence />} />
        <Route path="witnesses" element={<Witnesses />} />
        <Route path="suspects" element={<Suspects />} />
        <Route path="timeline" element={<Timeline />} />
        <Route path="ai-insights" element={<AiInsights />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#111827',
              color: '#e5e7eb',
              border: '1px solid #1f2937',
              borderRadius: '0.75rem',
              fontSize: '0.875rem'
            },
            success: { iconTheme: { primary: '#00ff88', secondary: '#080c18' } },
            error:   { iconTheme: { primary: '#ff3366', secondary: '#080c18' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  )
}
